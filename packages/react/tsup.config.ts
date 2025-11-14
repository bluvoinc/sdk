import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry point
  entry: ['src/index.ts'],

  // Output formats: CommonJS and ESM
  format: ['cjs', 'esm'],

  // Generate TypeScript declaration files
  dts: true,

  // Enable source maps for debugging
  sourcemap: true,

  // Clean output directory before build
  clean: true,

  // Split output into chunks for better tree-shaking
  splitting: false,

  // External dependencies (don't bundle these)
  external: [
    'react',
    'react-dom',
    '@bluvo/sdk-ts',
  ],

  // Minification (disabled for better debugging)
  minify: false,

  // Target environment
  target: 'es2020',

  // Platform
  platform: 'browser',

  // Tree-shaking
  treeshake: true,

  // esbuild options for ESM compatibility
  esbuildOptions(options) {
    // Ensure proper JSX handling
    options.jsx = 'automatic';
  },

  // Output file extensions
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    };
  },
});
