import { env } from '@/env.js';
import { Agenda } from 'agenda';

export const agenda = new Agenda({
  db: { address: env.MONGODB_CONNECTION_STRING, collection: 'agenda-jobs' },
});
