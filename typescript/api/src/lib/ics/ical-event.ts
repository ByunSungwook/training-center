export type IcalEvent = {
  uid: string;
  summary: string;
  description: string | null;
} & (
  | {
      dateOnly: false;
      start: Date;
      end: Date;
    }
  | {
      dateOnly: true;
      dates: string[]; // Only for dateOnly events
    }
);
