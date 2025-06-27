export type DocumentCreated = {
  type: 'document-created';
  payload: {
    scheduleId: string;
    accountId: string;
    blockedProductIds: string[];
    description: string | null;
    name: string | null;
    date: string;
    timeRange: {
      start: string;
      end: string;
    } | null;
    createdAt: Date;
    remindBeforeMinutes: number | null;
  };
};

export const documentCreated = (data: {
  scheduleId: string;
  accountId: string;
  blockedProductIds: string[];
  description: string | null;
  name: string | null;
  date: string;
  timeRange: {
    start: string;
    end: string;
  } | null;
  createdAt: Date;
  remindBeforeMinutes: number | null;
}): DocumentCreated => ({
  type: 'document-created',
  payload: {
    ...data,
  },
});
