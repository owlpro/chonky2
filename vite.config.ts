import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import packageJson from './package.json' assert { type: 'json' };

export default defineConfig({
    plugins: [react()],

    resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
            // react: path.resolve(__dirname, '../develop-package/node_modules/react'),
            // 'react-dom': path.resolve(
            //     __dirname,
            //     '../develop-package/node_modules/react-dom'
            // ),
            // '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material'),
            // '@mui/icons-material': path.resolve(
            //     __dirname,
            //     'node_modules/@mui/icons-material'
            // ),
            '@mui/styled-engine': '@mui/styled-engine-sc',
        },
        preserveSymlinks: true,
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'chonky2',
            fileName: (format) => `chonky2.${format}.js`,
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                'react-dom/client',
                ...Object.keys(packageJson.peerDependencies),
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
        sourcemap: true,
        emptyOutDir: true,
        ssr: false,
    },
});
