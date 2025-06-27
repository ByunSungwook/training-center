import {
  documentCreated,
  type DocumentCreated,
} from './document-created.js';
import { isUndefined, omitBy } from 'lodash-es';

export type Document = {
  id: string;

  createdAt: Date;
  updatedAt: Date;

  uncommittedEvents: (
    | DocumentCreated
    | DocumentRemindBeforeMinutesEdited
  )[];
};

export const createDocument = (data: {
  id: string;
  accountId: string;
  blockedProductIds: string[];
  description: string;
  name: string;
  date: string;
  timeRange: ScheduleTimeRange | null;
  remindBeforeMinutes: number | null;
  timestamp: Date;
}): Document => {
  return {
    id: data.id,
    accountId: data.accountId,
    blockedProductIds: data.blockedProductIds,
    description: data.description,
    name: data.name,
    date: data.date,
    remindBeforeMinutes: data.remindBeforeMinutes,
    timeRange: data.timeRange,
    createdAt: data.timestamp,
    updatedAt: data.timestamp,
    uncommittedEvents: [
      documentCreated({
        date: data.date,
        accountId: data.accountId,
        blockedProductIds: data.blockedProductIds,
        description: data.description,
        name: data.name,
        timeRange: data.timeRange,
        createdAt: data.timestamp,
        remindBeforeMinutes: data.remindBeforeMinutes,
        scheduleId: data.id,
      }),
    ],
  };
};

export const editDocument = (
  schedule: Document,
  data: Partial<{
    blockedProductIds: string[];
    description: string;
    name: string;
    date: string;
    timeRange: ScheduleTimeRange | null;
    remindBeforeMinutes: number | null;
  }>,
  timestamp: Date,
): Document => {
  const uncommittedEvents = [...schedule.uncommittedEvents];
  if (
    !isUndefined(data.remindBeforeMinutes) &&
    schedule.remindBeforeMinutes !== data.remindBeforeMinutes
  ) {
    uncommittedEvents.push(
      documentRemindedBeforeMinutesEdited(data.remindBeforeMinutes),
    );
  }
  return {
    ...schedule,
    ...omitBy(
      {
        remindBeforeMinutes:
          data.remindBeforeMinutes ?? schedule.remindBeforeMinutes,
        blockedProductIds: data.blockedProductIds,
        description: data.description,
        name: data.name,
        date: data.date,
        timeRange: data.timeRange,
        updatedAt: timestamp,
      },
      isUndefined,
    ),
  };
};
