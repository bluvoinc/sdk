import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input:
    'https://test.api-bluvo.com/api/v0/openapi',
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './packages/ts/generated',
  },
  parser: {
    transforms: {
      enums: "root"
    }
  },
  plugins: [
    '@hey-api/schemas',
    // {
    //   dates: true,
    //   name: '@hey-api/transformers',
    // },
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
    {
      name: '@hey-api/sdk',
      // transformer: true,
    },
  ],
});
