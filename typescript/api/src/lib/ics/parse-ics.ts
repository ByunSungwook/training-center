import ical, { type CalendarComponent } from 'node-ical';
import crypto from 'crypto';
import { dayjs } from '../dayjs.js';
import type { IcalEvent } from './ical-event.js';

const generateUidHash = (input: string): string =>
  crypto.createHash('sha1').update(input).digest('hex');

export const getValue = (
  str: undefined | null | string | { val: string },
): string | null => {
  if (str === undefined || str === null) return null;
  if (typeof str === 'string') return str;
  if (typeof str.val === 'string') return str.val;
  return null;
};

export const parseICS = async (
  ics: string,
  since: Date,
  until: Date,
  timezone: string,
): Promise<IcalEvent[]> => {
  const data = await ical.async.parseICS(ics);

  const schedules = Object.values(data).flatMap((event: CalendarComponent) => {
    if (event.type !== 'VEVENT') return [];

    const summary = getValue(event.summary) || '제목 없음';
    const description = getValue(event.description);
    const dateOnly = event.datetype === 'date';
    const tz = dateOnly ? 'UTC' : timezone;

    const duration = dayjs(event.end).diff(event.start);

    return (event.rrule ? event.rrule.between(since, until) : [event.start])
      .map((start: Date): IcalEvent => {
        const end = duration
          ? dayjs(start).add(duration, 'milliseconds').toDate()
          : dayjs(start).toDate();

        const uid =
          typeof event.uid === 'string'
            ? event.uid
            : generateUidHash(
                `${summary}|${start.toISOString()}|${end.toISOString()}`,
              );

        const dates = dateOnly
          ? new Array(dayjs(end).diff(dayjs(start), 'day')).fill('').map(
              (_, i) =>
                dayjs(start).tz('UTC').add(i, 'day').format('YYYY-MM-DD'), // DateOnly인 경우 UTC로 계산해야
            )
          : undefined;

        return dateOnly
          ? {
              uid,
              summary,
              description,
              dateOnly: true,
              dates: dates!,
            }
          : {
              uid,
              summary,
              description,
              start: dayjs(start).tz(tz).toDate(),
              end: dayjs(end).tz(tz).toDate(),
              dateOnly: false,
            };
      })
      .filter((event: IcalEvent) => {
        if (event.dateOnly) {
          return event.dates!.some((date) => {
            const dateObj = dayjs(date).tz('UTC').toDate();
            return dateObj >= since && dateObj <= until;
          });
        }
        return event.start >= since && event.start <= until;
      })
      .sort((a: IcalEvent, b: IcalEvent) => {
        if (a.dateOnly && b.dateOnly) {
          return a.dates![0].localeCompare(b.dates![0]);
        }
        if (a.dateOnly) {
          return -1;
        }
        if (b.dateOnly) {
          return 1;
        }
        return a.start.getTime() - b.start.getTime();
      });
  });

  return schedules;
};
