import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it, vi } from 'vitest';

import { reduxActions, rootReducer } from '../src/redux/reducers';
import { selectIsFavoriteActionHidden } from '../src/redux/selectors';
import { initialRootState } from '../src/redux/state';
import {
    thunkAddFavorites, thunkMoveFavorite, thunkRemoveFavorites, thunkToggleSidebarSection
} from '../src/redux/thunks/user-state.thunks';
import { FileData } from '../src/types/file.types';
import { ChonkyUserState } from '../src/types/user-state.types';
import { normalizeUserState } from '../src/util/user-state';

const folder = (id: string): FileData => ({ id, name: id.toUpperCase(), isDir: true });

const createStore = (controlled = false) => {
    const onChange = vi.fn<(state: ChonkyUserState) => void>();
    const store = configureStore({
        reducer: rootReducer,
        preloadedState: initialRootState as any,
        middleware: (getDefault) => getDefault({ serializableCheck: false }),
    });
    store.dispatch(reduxActions.setUserStateConfig({ controlled, storageKey: null, onChange }));
    const dispatch = store.dispatch as (thunk: any) => void;
    return { store, dispatch, onChange, favoriteIds: () => store.getState().userState.favorites.map((f) => f.id) };
};

describe('user state', () => {
    it('adds favorites once each, at the end or at an index', () => {
        const { dispatch, favoriteIds, onChange } = createStore();
        dispatch(thunkAddFavorites([folder('a'), folder('b'), folder('a')]));
        dispatch(thunkAddFavorites([folder('b'), folder('c')], 1));
        expect(favoriteIds()).toEqual(['a', 'c', 'b']);
        expect(onChange).toHaveBeenCalledTimes(2);

        // Nothing new: no change reported
        dispatch(thunkAddFavorites([folder('a')]));
        expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('moves a favorite before the one at the index', () => {
        const { dispatch, favoriteIds } = createStore();
        dispatch(thunkAddFavorites(['a', 'b', 'c', 'd'].map(folder)));
        dispatch(thunkMoveFavorite('a', 3));
        expect(favoriteIds()).toEqual(['b', 'c', 'a', 'd']);
        dispatch(thunkMoveFavorite('d', 0));
        expect(favoriteIds()).toEqual(['d', 'b', 'c', 'a']);
        dispatch(thunkMoveFavorite('b', 4));
        expect(favoriteIds()).toEqual(['d', 'c', 'a', 'b']);
    });

    it('removes favorites and toggles collapsed sections', () => {
        const { store, dispatch, favoriteIds } = createStore();
        dispatch(thunkAddFavorites(['a', 'b'].map(folder)));
        dispatch(thunkRemoveFavorites(['a']));
        expect(favoriteIds()).toEqual(['b']);

        dispatch(thunkToggleSidebarSection('folders'));
        expect(store.getState().userState.collapsedSidebarSections).toEqual(['folders']);
        dispatch(thunkToggleSidebarSection('folders'));
        expect(store.getState().userState.collapsedSidebarSections).toEqual([]);
    });

    it('only reports changes when controlled', () => {
        const { dispatch, favoriteIds, onChange } = createStore(true);
        dispatch(thunkAddFavorites([folder('a')]));
        expect(favoriteIds()).toEqual([]);
        expect(onChange.mock.calls[0]![0].favorites.map((f) => f.id)).toEqual(['a']);
    });

    it('hides the favorite action that does not apply to the selection', () => {
        const { store, dispatch } = createStore();
        store.dispatch(reduxActions.setFileActions([
            { id: 'add_to_favorites', requiresSelection: true, fileFilter: (f) => !!f?.isDir },
            { id: 'remove_from_favorites', requiresSelection: true, fileFilter: (f) => !!f?.isDir },
        ]));
        store.dispatch(reduxActions.setRawFiles([folder('a'), folder('b')]));
        store.dispatch(reduxActions.selectFiles({ fileIds: ['a'], reset: true }));
        const hidden = (id: string) => selectIsFavoriteActionHidden(id)(store.getState());

        expect([hidden('add_to_favorites'), hidden('remove_from_favorites')]).toEqual([false, true]);
        dispatch(thunkAddFavorites([folder('a')]));
        expect([hidden('add_to_favorites'), hidden('remove_from_favorites')]).toEqual([true, false]);
    });

    it('fills in missing fields of a saved state', () => {
        expect(normalizeUserState({ favorites: [folder('a')] })).toEqual({
            favorites: [folder('a')],
            collapsedSidebarSections: [],
        });
        expect(normalizeUserState(null)).toEqual({ favorites: [], collapsedSidebarSections: [] });
    });
});
