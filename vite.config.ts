import { defineConfig } from 'vitest/config';

export default defineConfig({
  // относительный base нужен, чтобы сайт работал из подпапки GitHub Pages
  base: './',
  build: { outDir: 'dist' },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
