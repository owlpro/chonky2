import { useEffect } from 'react';

import { Store } from '@reduxjs/toolkit';

import { ChonkyActions } from '../action-definitions';
import { RootState } from '../types/redux.types';
import { FileSelection } from '../types/selection.types';
import { selectSelectedFileIds, selectSelectionMap } from './selectors';
import { thunkRequestFileAction } from './thunks/dispatchers.thunks';

export const useStoreWatchers = (store: Store<RootState>) => {
    useEffect(() => {
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
    }, [store]);
};
