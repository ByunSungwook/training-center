import { dayjs } from '../dayjs.js';
import type { IcalEvent } from './ical-event.js';

export function generateICS(
  events: IcalEvent[],
  productIdentifier: {
    companyName: string;
    appName: string;
    language: string;
  },
): string {
  const now = dayjs().utc().format('YYYYMMDDTHHmmss[Z]');

  const escapeText = (text: string) =>
    text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${productIdentifier.companyName}//${productIdentifier.appName}//${productIdentifier.language}`,
  ];

  for (const event of events) {
    const dtStart = event.dateOnly
      ? `DTSTART;VALUE=DATE:${event.dates[0].replace(/-/g, '')}`
      : `DTSTART:${dayjs(event.start).format('YYYYMMDDTHHmmss[Z]')}`;

    const dtEnd = event.dateOnly
      ? `DTEND;VALUE=DATE:${event.dates[event.dates.length - 1].replace(
          /-/g,
          '',
        )}`
      : `DTEND:${dayjs(event.end).format('YYYYMMDDTHHmmss[Z]')}`;

    lines.push(
      ...([
        'BEGIN:VEVENT',
        `UID:${event.uid}`,
        `DTSTAMP:${now}`,
        `SUMMARY:${escapeText(event.summary)}`,
        event.description
          ? `DESCRIPTION:${escapeText(event.description)}`
          : undefined,
        dtStart,
        dtEnd,
        'END:VEVENT',
      ].filter((v) => v !== undefined) as string[]),
    );
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

// console.log(
//   generateICS(
//     [
//       {
//         uid: 'e4928aff-334b-3d33-9ff8-cbe74b0ea009-1',
//         summary: '새해',
//         description: null,
//         start: new Date('2024-01-01T00:00:00.000Z'),
//         end: new Date('2024-01-02T00:00:00.000Z'),
//         date: '2024-01-01',
//         dateOnly: true,
//       },
//       {
//         uid: 'e4928aff-334b-3d33-9ff8-cbe74b0ea009-2',
//         summary: '새해',
//         description: null,
//         start: new Date('2025-01-01T00:00:00.000Z'),
//         end: new Date('2025-01-02T00:00:00.000Z'),
//         date: '2025-01-01',
//         dateOnly: true,
//       },
//     ],
//     {
//       companyName: 'Starshell, Inc.',
//       appName: 'Scramble v1.0',
//       language: 'KO',
//     },
//   ),
// );
