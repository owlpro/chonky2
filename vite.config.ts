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
const isPackageIn = (names: string[]) => (id: string) =>
    names.some((name) => id === name || id.startsWith(`${name}/`));

// `--mode linked` builds `dist-linked/` for trying Chonky inside an app through a Vite
// alias. Only React is left out, so the app's own copies of Chonky's other dependencies
// (e.g. an older Redux Toolkit) can't replace them. Not minified, with source maps and
// type declarations, so the app's editor can be pointed at them too.
export default defineConfig(({ mode }) => {
    const linked = mode === 'linked';
    return {
        plugins: [dts({ include: ['src'] })],
        // Bundled dependencies read process.env.NODE_ENV, which browsers don't have
        define: linked ? { 'process.env.NODE_ENV': JSON.stringify('development') } : {},

        resolve: {
            dedupe: ['react', 'react-dom'],
            preserveSymlinks: true,
        },
        build: {
            lib: {
                entry: path.resolve(__dirname, 'src/index.ts'),
                name: 'chonky2',
                fileName: (format) => (format === 'cjs' ? 'index.cjs' : 'index.es.js'),
                formats: linked ? ['es'] : ['es', 'cjs'],
            },
            outDir: linked ? 'dist-linked' : 'dist',
            rollupOptions: {
                external: isPackageIn(linked ? Object.keys(pkg.peerDependencies) : externalPackages),
                output: {
                    globals: {
                        react: 'React',
                        'react-dom': 'ReactDOM',
                    },
                    exports: 'named',
                },
            },
            minify: linked ? false : 'esbuild',
            sourcemap: linked,
            // Rewriting the files in place keeps the app's dev server from seeing them deleted
            emptyOutDir: !linked,
            ssr: false,
        },
    };
});
