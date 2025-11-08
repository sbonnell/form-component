import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setupTests.ts'],
    include: ['tests/unit/**/*.{test,spec}.{js,ts,jsx,tsx}', 'tests/integration/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
})
