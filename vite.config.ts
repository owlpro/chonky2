import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [dts({ include: ['src'] })],

    resolve: {
        dedupe: [
            'react',
            'react-dom',
            '@mui/material',
            '@emotion/react',
            '@emotion/styled',
        ],
        alias: {
            '@mui/styled-engine': '@mui/styled-engine-sc',
        },
        preserveSymlinks: true,
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'chonky2',
            fileName: (format) => `index.${format}.js`,
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                'react-dom/client',
                '@emotion/react',
                '@emotion/styled',
                '@mui/icons-material',
                '@mui/material',
                '@mui/styled-engine-sc',
                'styled-components',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
                exports: 'named',
            },
        },
        sourcemap: true,
        emptyOutDir: true,
        ssr: false,
    },
});
