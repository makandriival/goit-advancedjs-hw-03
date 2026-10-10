import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:4174/goit-advancedjs-hw-03/',
    browserName: 'chromium',
  },
  webServer: {
    command:
      'npm run build && npm run preview -- --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174/goit-advancedjs-hw-03/',
    env: { VITE_PIXABAY_API_KEY: 'test-key-not-a-real-credential' },
    reuseExistingServer: false,
  },
});
