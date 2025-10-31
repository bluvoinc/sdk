import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true
  },
  resolve: {
    alias: {
      '@bluvo/sdk-ts': path.resolve(__dirname, '../ts/index.ts')
    }
  }
});