import { createDispatcher } from '@/modules/shared/adapters/kafka-event-dispatcher.js';

export const dispatcher = createDispatcher('document');
