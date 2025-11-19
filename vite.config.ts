import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
    plugins: [
        // Only enable the Laravel plugin for production builds. Disable during dev
        // so the Vite dev server serves the SPA `index.html` directly.
        ...(process.env.NODE_ENV === 'production'
            ? [
                  laravel({
                      input: 'index.html',
                      refresh: ['resources/js/**', 'resources/views/**'],
                  }),
              ]
            : []),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        {
            name: 'copy-index-html',
            writeBundle() {
                const src = path.resolve(__dirname, 'index.html');
                const dest = path.resolve(__dirname, 'public/build/index.html');
                fs.copyFileSync(src, dest);
            },
        },
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    build: {
        // Ensure index.html is generated at the root of the output directory (public/build)
        outDir: 'public/build',
        emptyOutDir: true,
    },
    server: {
        host: '0.0.0.0',
        port: 8383,
        strictPort: true,
        middlewareMode: false,
        fs: {
            strict: false,
        },
    },
});