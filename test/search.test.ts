import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';

// Loaded before the action definitions, like `src/index.ts` does, to avoid an import cycle
import { reduxActions, rootReducer } from '../src/redux/reducers';
import { ChonkyActions, EssentialFileActions } from '../src/action-definitions';
import { OptionIds } from '../src/action-definitions/option-ids';
import { selectors } from '../src/redux/selectors';
import { initialRootState } from '../src/redux/state';
import { subscribeStoreWatchers } from '../src/redux/watchers';
import { FileActionData } from '../src/types/action-handler.types';
import { FileArray } from '../src/types/file.types';
import { RootState } from '../src/types/redux.types';

const makeStore = () =>
    configureStore({
        preloadedState: { ...initialRootState, instanceId: 'test' } as any,
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
    });

const files: FileArray = [
    { id: 'a1', name: 'Report 2024.pdf', searchText: 'https://cdn.example.com/media/9f3c2e' },
    { id: 'b2', name: 'profile_draft.png' },
    { id: 'c3', name: 'Photos', isDir: true },
    { id: 'd4', name: '.env', isHidden: true },
];

const displayed = (state: RootState) => selectors.getDisplayFileIds(state);

describe('search', () => {
    it('matches every term as a substring of the name, ignoring case and spaces around', () => {
        const store = makeStore();
        store.dispatch(reduxActions.setRawFiles(files));

        store.dispatch(reduxActions.setSearchString('  REPORT '));
        expect(displayed(store.getState())).toEqual(['a1']);

        store.dispatch(reduxActions.setSearchString('report 2024'));
        expect(displayed(store.getState())).toEqual(['a1']);

        // Not a subsequence match: "pdf" is not in "profile_draft.png"
        store.dispatch(reduxActions.setSearchString('pdf'));
        expect(displayed(store.getState())).toEqual(['a1']);

        store.dispatch(reduxActions.setSearchString('   '));
        expect(displayed(store.getState())).toEqual(['a1', 'b2', 'c3']);
    });

    it('matches searchText, but not a term spanning name and searchText', () => {
        const store = makeStore();
        store.dispatch(reduxActions.setRawFiles(files));

        store.dispatch(reduxActions.setSearchString('9f3c2e'));
        expect(displayed(store.getState())).toEqual(['a1']);

        store.dispatch(reduxActions.setSearchString('https://cdn.example.com/media/9f3c2e'));
        expect(displayed(store.getState())).toEqual(['a1']);

        store.dispatch(reduxActions.setSearchString('pdfhttps'));
        expect(displayed(store.getState())).toEqual([]);
    });

    it('reports files hidden by the search or the hidden-files option', () => {
        const store = makeStore();
        store.dispatch(reduxActions.setRawFiles(files));
        store.dispatch(reduxActions.setSearchString('report'));

        expect(Object.keys(selectors.getHiddenFileIdMap(store.getState())).sort()).toEqual(['b2', 'c3', 'd4']);

        store.dispatch(reduxActions.setOptionDefaults({ [OptionIds.ShowHiddenFiles]: true }));
        store.dispatch(reduxActions.setSearchString(''));
        expect(Object.keys(selectors.getHiddenFileIdMap(store.getState()))).toEqual([]);
    });

    it('is cleared when the current folder changes, but not when the same folder refreshes', () => {
        const store = makeStore();
        const home = { id: 'home', name: 'Home', isDir: true };
        store.dispatch(reduxActions.setRawFolderChain([home]));
        store.dispatch(reduxActions.setSearchString('doc'));

        store.dispatch(reduxActions.setRawFolderChain([{ ...home, name: 'Home (renamed)' }]));
        expect(store.getState().searchString).toBe('doc');

        store.dispatch(reduxActions.setRawFolderChain([home, { id: 'docs', name: 'Docs', isDir: true }]));
        expect(store.getState().searchString).toBe('');
    });

    it('validates the last click against the displayed files', () => {
        const store = makeStore();
        store.dispatch(reduxActions.setRawFiles(files));
        store.dispatch(reduxActions.setSearchString('p'));
        // Displayed: Report 2024.pdf, profile_draft.png, Photos
        store.dispatch(reduxActions.setLastClickIndex({ index: 2, fileId: 'c3' }));
        expect(selectors.getLastClickIndex(store.getState())).toBe(2);
    });

    it('is cleared when a new folder would be hidden by it', () => {
        const store = makeStore();
        store.dispatch(reduxActions.setRawFiles(files));
        store.dispatch(reduxActions.setSearchString('report'));
        store.dispatch(reduxActions.watchForNewFiles('folder'));
        store.dispatch(reduxActions.setRawFiles([...files, { id: 'new', name: 'New folder', isDir: true }]));

        const state = store.getState();
        expect(state.searchString).toBe('');
        expect(state.renamingFileId).toBe('new');
        expect(Object.keys(state.selectionMap)).toEqual(['new']);
    });
});

describe('revealFiles', () => {
    it('selects and reveals a file that is already listed, clearing a search that hides it', () => {
        const store = makeStore();
        store.dispatch(reduxActions.setRawFiles(files));
        store.dispatch(reduxActions.setSearchString('report'));
        store.dispatch(reduxActions.revealFiles({ fileIds: ['b2'], select: true }));

        const state = store.getState();
        expect(state.searchString).toBe('');
        expect(state.revealFileIds).toEqual(['b2']);
        expect(Object.keys(state.selectionMap)).toEqual(['b2']);
        expect(state.pendingReveal).toBeNull();
    });

    it('waits through placeholders for the file to arrive', () => {
        const store = makeStore();
        store.dispatch(reduxActions.setRawFiles(files));
        store.dispatch(reduxActions.revealFiles({ fileIds: ['x9'], select: true }));
        expect(store.getState().pendingReveal).not.toBeNull();

        store.dispatch(reduxActions.setRawFiles([null, null]));
        expect(store.getState().pendingReveal).not.toBeNull();

        store.dispatch(reduxActions.setRawFiles([{ id: 'x9', name: 'found.jpg' }, { id: 'y8', name: 'other.jpg' }]));
        const state = store.getState();
        expect(state.pendingReveal).toBeNull();
        expect(state.revealFileIds).toEqual(['x9']);
        expect(Object.keys(state.selectionMap)).toEqual(['x9']);
    });

    it('gives up when the files finish loading without the file', () => {
        const store = makeStore();
        store.dispatch(reduxActions.revealFiles({ fileIds: ['x9'], select: true }));
        store.dispatch(reduxActions.setRawFiles(files));
        expect(store.getState().pendingReveal).toBeNull();

        store.dispatch(reduxActions.setRawFiles([{ id: 'x9', name: 'found.jpg' }]));
        expect(store.getState().revealFileIds).toBeNull();
    });

    it('keeps the selection when select is false', () => {
        const store = makeStore();
        store.dispatch(reduxActions.setRawFiles(files));
        store.dispatch(reduxActions.selectFiles({ fileIds: ['a1'], reset: true }));
        store.dispatch(reduxActions.revealFiles({ fileIds: ['b2'], select: false }));

        const state = store.getState();
        expect(state.revealFileIds).toEqual(['b2']);
        expect(Object.keys(state.selectionMap)).toEqual(['a1']);
    });
});

describe('going up a folder', () => {
    const home = { id: 'home', name: 'Home', isDir: true };
    const photos = { id: 'c3', name: 'Photos', isDir: true };
    const selected = (state: RootState) => Object.keys(state.selectionMap);

    it('selects the folder the user came out of once it is listed', () => {
        const store = makeStore();
        store.dispatch(reduxActions.setRawFolderChain([home, photos]));
        store.dispatch(reduxActions.setRawFiles([{ id: 'p1', name: 'beach.jpg' }]));

        store.dispatch(reduxActions.setRawFolderChain([home]));
        // The app clears the list while it loads the parent folder
        store.dispatch(reduxActions.setLoading(true));
        store.dispatch(reduxActions.setRawFiles([]));
        expect(selected(store.getState())).toEqual([]);

        store.dispatch(reduxActions.setLoading(false));
        store.dispatch(reduxActions.setRawFiles(files));
        expect(selected(store.getState())).toEqual(['c3']);
        expect(store.getState().revealFileIds).toEqual(['c3']);
    });

    it('does not select anything when opening a subfolder', () => {
        const store = makeStore();
        store.dispatch(reduxActions.setRawFolderChain([home]));
        store.dispatch(reduxActions.setRawFiles(files));
        store.dispatch(reduxActions.setRawFolderChain([home, photos]));
        store.dispatch(reduxActions.setRawFiles([{ id: 'p1', name: 'beach.jpg' }]));
        expect(selected(store.getState())).toEqual([]);
    });
});

describe('store watchers', () => {
    const makeWatchedStore = () => {
        const store = makeStore();
        const handled: FileActionData<any>[] = [];
        store.dispatch(reduxActions.setFileActions(EssentialFileActions));
        store.dispatch(reduxActions.setExternalFileActionHandler((data) => void handled.push(data)));
        subscribeStoreWatchers(store);
        return { store, handled };
    };

    it('deselects files the search hides', () => {
        const { store } = makeWatchedStore();
        store.dispatch(reduxActions.setRawFiles(files));
        store.dispatch(reduxActions.selectFiles({ fileIds: ['a1', 'b2'], reset: true }));
        store.dispatch(reduxActions.setSearchString('report'));
        expect(Object.keys(store.getState().selectionMap)).toEqual(['a1']);
    });

    it('does not keep hidden files selected by the app', () => {
        const { store } = makeWatchedStore();
        store.dispatch(reduxActions.setRawFiles(files));
        store.dispatch(reduxActions.selectFiles({ fileIds: ['a1', 'd4'], reset: true }));
        expect(Object.keys(store.getState().selectionMap)).toEqual(['a1']);
    });

    it('dispatches ChangeSearch with the trimmed text when it changes', async () => {
        const { store, handled } = makeWatchedStore();
        const searches = () =>
            handled.filter((data) => data.id === ChonkyActions.ChangeSearch.id).map((data) => data.payload.searchString);

        store.dispatch(reduxActions.setSearchString('9f3c'));
        store.dispatch(reduxActions.setSearchString('9f3c '));
        store.dispatch(reduxActions.setSearchString(''));
        // File actions reach the app's handler asynchronously
        await new Promise((resolve) => setTimeout(resolve));
        expect(searches()).toEqual(['9f3c', '']);
    });
});
