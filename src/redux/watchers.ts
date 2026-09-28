import { useEffect } from 'react';

import { Store } from '@reduxjs/toolkit';

import { ChonkyActions } from '../action-definitions';
import { RootState } from '../types/redux.types';
import { FileSelection } from '../types/selection.types';
import { reduxActions } from './reducers';
import { selectHiddenFileIdMap, selectSearchString, selectSelectedFileIds, selectSelectionMap } from './selectors';
import { thunkRequestFileAction } from './thunks/dispatchers.thunks';

const watchSelection = (store: Store<RootState>) => {
    let oldSelection: FileSelection = selectSelectionMap(store.getState());
    const onStoreChange = () => {
        // We don't check for deep equality here as we expect the
        // reducers to prevent all unnecessary updates.
        const newSelection = selectSelectionMap(store.getState());
        if (newSelection === oldSelection) return;
        oldSelection = newSelection;

        // Notify users the selection has changed.
        const selectedFilesIds = selectSelectedFileIds(store.getState());
        const selection = new Set<string>(selectedFilesIds);
        store.dispatch(
            thunkRequestFileAction(ChonkyActions.ChangeSelection, {
                selection,
            }) as any
        );
    };

    return store.subscribe(onStoreChange);
};

const watchHiddenSelection = (store: Store<RootState>) => {
    let oldHiddenFileIdMap = selectHiddenFileIdMap(store.getState());
    let oldSelection: FileSelection = selectSelectionMap(store.getState());
    const onStoreChange = () => {
        const hiddenFileIdMap = selectHiddenFileIdMap(store.getState());
        const selection = selectSelectionMap(store.getState());
        if (hiddenFileIdMap === oldHiddenFileIdMap && selection === oldSelection) return;
        oldHiddenFileIdMap = hiddenFileIdMap;
        oldSelection = selection;

        // Files the user can't see must not be selected, or actions would apply to them
        const hiddenSelectedIds = Object.keys(selection).filter((id) => hiddenFileIdMap[id]);
        if (hiddenSelectedIds.length > 0) store.dispatch(reduxActions.deselectFiles(hiddenSelectedIds));
    };

    return store.subscribe(onStoreChange);
};

const watchSearch = (store: Store<RootState>) => {
    let oldSearchString = selectSearchString(store.getState()).trim();
    const onStoreChange = () => {
        const searchString = selectSearchString(store.getState()).trim();
        if (searchString === oldSearchString) return;
        oldSearchString = searchString;

        store.dispatch(thunkRequestFileAction(ChonkyActions.ChangeSearch, { searchString }) as any);
    };

    return store.subscribe(onStoreChange);
};

/**
 * Subscribes to the store to notify the app of selection and search changes and to
 * deselect files that get hidden. Returns a function that unsubscribes.
 */
export const subscribeStoreWatchers = (store: Store<RootState>) => {
    const unsubscribers = [watchSelection(store), watchHiddenSelection(store), watchSearch(store)];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
};

export const useStoreWatchers = (store: Store<RootState>) => {
    useEffect(() => subscribeStoreWatchers(store), [store]);
};
