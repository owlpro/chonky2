import { readFileSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));

// Dependencies are installed next to chonky2 by the package manager, so they are left
// out of the bundle. This lets apps share one copy with Chonky (e.g. one react-dnd
// context) instead of shipping a second, bundled copy.
const externalPackages = [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
];
const isExternal = (id: string) =>
    externalPackages.some((name) => id === name || id.startsWith(`${name}/`));

export default defineConfig({
    plugins: [dts({ include: ['src'] })],

    resolve: {
        dedupe: ['react', 'react-dom'],
        preserveSymlinks: true,
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'chonky2',
            fileName: (format) => (format === 'cjs' ? 'index.cjs' : 'index.es.js'),
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: isExternal,
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
                exports: 'named',
            },
        },
        minify: 'esbuild',
        sourcemap: false,
        emptyOutDir: true,
        ssr: false,
    },
});
