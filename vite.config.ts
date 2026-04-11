import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 3002,
        host: true
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true
    }
});
