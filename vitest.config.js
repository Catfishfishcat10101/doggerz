import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.js',
    include: ['src/**/*.test.{js,jsx,mjs,mts}','src/**/__tests__/**/*.{js,jsx}','tests/**/*.test.{js,jsx}'],
  },
});
