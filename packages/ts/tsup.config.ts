import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry point
  entry: ['index.ts'],

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

  // Don't bundle dependencies
  external: [
    // External dependencies that shouldn't be bundled
    '@gomomento/sdk-web',
  ],

  // Minification (disabled for better debugging, enable for production if needed)
  minify: false,

  // Target environment
  target: 'es2017',

  // Platform
  platform: 'neutral', // Works in both node and browser

  // Tree-shaking
  treeshake: true,

  // Output file extensions
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    };
  },
});
