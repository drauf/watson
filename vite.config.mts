/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { configDefaults } from 'vitest/config';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/watson/',
    resolve: {
        tsconfigPaths: true,
    },
    server: {
        port: 3000,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test-setup.ts'],
        reporters: ['verbose'],
        exclude: [...configDefaults.exclude, 'e2e/**/*', 'build/**/*'],
        coverage: {
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*'],
            exclude: [],
        }
    },
    plugins: [
        react(),
        viteSingleFile()
    ],
});
