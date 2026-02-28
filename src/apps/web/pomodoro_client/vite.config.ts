/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'

export default defineConfig({
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
