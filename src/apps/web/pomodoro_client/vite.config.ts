/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import { DEV_SERVER_HOST, DEV_SERVER_PORT } from './dev-server.config.ts'

export default defineConfig({
    server: {
        host: DEV_SERVER_HOST,
        port: DEV_SERVER_PORT,
    },
    plugins: [
        eslint({
            include: ['src/**/*.ts', 'src/**/*.js'],
        }),
    ],
    test: {
        environment: 'jsdom',
        include: ['src/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    },
})
