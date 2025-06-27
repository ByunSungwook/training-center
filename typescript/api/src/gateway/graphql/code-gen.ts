import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/gateway/schema/*.graphql',
  generates: {
    './src/__generated__/resolvers-types.ts': {
      config: {
        useTypeImports: true,
      },
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
};
export default config;
