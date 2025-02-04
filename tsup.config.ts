import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/**/*.ts'],
  outDir: './dist',
  dts: true,
  splitting: false,
  minify: true,
  format: ['esm'],
  bundle: false,
  platform: 'browser',
  publicDir: './public',
});
