import { agenda } from '../shared/adapters/agenda.js';
import { createSubscriber } from '../shared/adapters/kafka-event-dispatcher.js';
import { dispatcher } from './adapter/notification-event-dispatcher.js';
import { createRunner } from '@/lib/runner.js';

const documentCreator = createSubscriber(
  'notification.document-created',
  'document',
  ['document-created'],
  async (e: DocumentCreated) => {
  },
);

agenda.define('notification.document-alarm', async () => {
  await documentAlarm();
});

export const bootNotificationModule = createRunner(async () => {
  await dispatcher.connect();
  await agenda.every('1 minute', 'notification.document-alarm');
  return async () => {
    await dispatcher.disconnect();
  };
});
