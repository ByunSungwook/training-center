import { Kafka, type Message } from 'kafkajs';
import { stringify, parse } from 'superjson';

const createClient = (clientId: string): Kafka => {
  const kafka = new Kafka({
    clientId,
    brokers: ['localhost:9092'],
  });
  return kafka;
};

export type Event<T> = {
  aggregateType: string;
  aggregateId: string;
  type: string;
  payload: T;
};

export const createDispatcher = (module: string) => {
  const kafka = createClient(module);
  const producer = kafka.producer();
  const dispatch = async (...events: Event<unknown>[]) => {
    for (const aggregateType of new Set(events.map((e) => e.aggregateType))) {
      const aggregateEvents = events.filter(
        (e) => e.aggregateType === aggregateType,
      );
      const messages: Message[] = aggregateEvents.map((event) => ({
        key: event.aggregateId,
        value: stringify({
          type: event.type,
          payload: event.payload,
        }),
      }));
      await producer.send({
        topic: `${module}.${aggregateType}`,
        messages,
      });
    }
  };
  const connect = () => producer.connect();
  const disconnect = () => producer.disconnect();
  return {
    dispatch,
    connect,
    disconnect,
  };
};

export type Handler<
  E extends {
    type: string;
    payload: unknown;
  },
> = (
  event: {
    aggregateType: string;
    aggregateId: string;
  } & E,
) => Promise<unknown>;

export const createSubscriber = <
  E extends {
    type: string;
    payload: unknown;
  },
>(
  identifier: `${string}.${string}`,
  aggregateType: `${string}.${string}`,
  listenTo: E['type'][],
  handler: Handler<E>,
) => {
  const module = identifier.split('.')[0];
  const kafka = createClient(module);
  const consumer = kafka.consumer({ groupId: identifier });
  const connect = async (
    options: { fromBeginning: boolean } = {
      fromBeginning: false,
    },
  ) => {
    await consumer.connect();
    await consumer.subscribe({
      topic: aggregateType,
      fromBeginning: options.fromBeginning,
    });
    consumer
      .run({
        eachMessage: async (payload) => {
          try {
            const event = {
              aggregateType: payload.topic.split('.')[1],
              aggregateId: payload.message.key?.toString() ?? '',
              ...parse<E>(payload.message.value!.toString()),
            };
            if (!listenTo.includes(event.type)) return;
            await handler(event);
          } catch (e) {
            console.error('Error handling event:', e);
          }
        },
      })
      .catch((e) => {
        console.error('Error in consumer run:', e);
      });
  };
  const disconnect = () => consumer.disconnect();
  return {
    connect,
    disconnect,
  };
};
