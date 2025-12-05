/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        react(),
        dts({
            include: ['src'],
            exclude: ['**/*.test.ts', '**/*.test.tsx', '**/test/**'],
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'ReactElegantTable',
            fileName: 'index',
        },
        rollupOptions: {
            external: ['react', 'react-dom', '@tanstack/react-table'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    '@tanstack/react-table': 'ReactTable',
                },
            },
        },
        sourcemap: true,
        minify: 'esbuild',
        target: 'esnext',
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: true,
    },
});
