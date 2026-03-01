import { defineConfig, devices } from '@playwright/test';
import { DEV_SERVER_HOST, DEV_SERVER_PORT } from './dev-server.config.ts';

const DEV_SERVER_URL = `http://${DEV_SERVER_HOST}:${DEV_SERVER_PORT}`;

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30_000,
    expect: { timeout: 8_000 },
    fullyParallel: true,
    retries: 1,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: DEV_SERVER_URL,
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                launchOptions: {
                    args: ['--no-sandbox', '--disable-dev-shm-usage']
                }
            },
            workers: 1,
        },
        {
            name: 'edge',
            use: { ...devices['Desktop Edge'], channel: 'msedge' },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
    webServer: {
        command: 'pnpm dev',
        url: DEV_SERVER_URL,
        reuseExistingServer: true,
        timeout: 30_000,
    },
});
