import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['algorithm-game/src/__tests__/**/*.spec.js'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
