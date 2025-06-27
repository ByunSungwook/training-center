import { createRunner } from '@/lib/runner.js';
import { mongodb } from './adapters/mongodb.js';
import { agenda } from './adapters/agenda.js';

export const bootSharedModule = createRunner(async () => {
  await mongodb.connect();
  await agenda.start();
  return async () => {
    await mongodb.close();
    await agenda.stop();
  };
});
