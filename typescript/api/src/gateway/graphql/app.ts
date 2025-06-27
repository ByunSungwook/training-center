// server.ts
import { createServer } from 'node:http';
import { createYoga, createSchema } from 'graphql-yoga';
import { loadFilesSync } from '@graphql-tools/load-files';
import path from 'node:path';
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { createRunner } from '@/lib/runner.js';
import type { Resolvers } from '@/__generated__/resolvers-types.js';
import { DateTimeResolver } from 'graphql-scalars';

const typeDefsArray = loadFilesSync(path.join(import.meta.dirname, 'schema'), {
  extensions: ['graphql'],
});

const typeDefs = mergeTypeDefs(typeDefsArray);

const resolvers: Resolvers = mergeResolvers([
]);

export const schema = createSchema<Context>({
  typeDefs,
  resolvers,
});

export const yoga = createYoga({
  schema,
  context: createContext,
  cors: true,
});

export const bootGraphQLServer = createRunner(async () => {
  const server = createServer(yoga);
  server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql');
  });
  return async () => {
    server.close();
  };
});
