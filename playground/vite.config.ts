import path from 'path';
import { build, defineConfig, type Plugin, type Rollup } from 'vite';

const libRoot = path.resolve(__dirname, '..');

// Builds the library in watch mode before the dev server starts, so the
// playground runs against dist/ (the same bundle consumers install) instead of src/.
const buildLibrary = (): Plugin => ({
    name: 'chonky2-playground-build-library',
    apply: 'serve',
    async configureServer() {
        const watcher = (await build({
            root: libRoot,
            configFile: path.join(libRoot, 'vite.config.ts'),
            logLevel: 'warn',
            build: { watch: {} },
        })) as Rollup.RollupWatcher;

        await new Promise<void>((resolve) => {
            watcher.on('event', (event) => {
                if (event.code === 'END' || event.code === 'ERROR') resolve();
            });
        });
    },
});

export default defineConfig({
    root: __dirname,
    plugins: [buildLibrary()],
    esbuild: { jsx: 'automatic' },
    resolve: {
        alias: [{ find: /^chonky2$/, replacement: path.join(libRoot, 'dist/index.es.js') }],
        dedupe: ['react', 'react-dom', 'react-dnd'],
    },
    server: {
        fs: { allow: [libRoot] },
    },
});
