/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/dist/config';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    server: {
        port: 3000,
    },
    build: {
        outDir: 'build'
    },
    test: {
        globals: true,
        environment: 'jsdom',
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
        viteTsconfigPaths(),
    ],
});
