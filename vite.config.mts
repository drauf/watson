/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { configDefaults } from 'vitest/config';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { getBuildProvenance } from './src/build/buildProvenance.mjs';

const buildProvenancePlugin = (): Plugin => ({
    name: 'watson-build-provenance',
    apply: 'build',
    transformIndexHtml: () => {
        const provenance = getBuildProvenance();

        return [
            {
                tag: 'meta',
                attrs: { name: 'watson-revision', content: provenance.revision },
                injectTo: 'head',
            },
            {
                tag: 'meta',
                attrs: { name: 'watson-commit-time', content: provenance.commitTime },
                injectTo: 'head',
            },
            {
                tag: 'meta',
                attrs: { name: 'watson-build-time', content: provenance.buildTime },
                injectTo: 'head',
            },
        ];
    },
});

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
            exclude: [
                'src/**/*.css',
                'src/**/*.d.ts',
                'src/**/*.story.tsx',
                'src/test-fixtures/**',
                'src/test-setup.ts',
            ],
        }
    },
    plugins: [
        react({ compiler: true }),
        buildProvenancePlugin(),
        viteSingleFile()
    ],
});
