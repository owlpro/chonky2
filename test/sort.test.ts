import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';

// Loaded before the action definitions, like `src/index.ts` does, to avoid an import cycle
import { reduxActions, rootReducer } from '../src/redux/reducers';
import { ChonkyActions } from '../src/action-definitions';
import { initialRootState } from '../src/redux/state';
import { thunkActivateSortAction } from '../src/redux/thunks/file-actions.thunks';
import { SortOrder } from '../src/types/sort.types';

describe('sorting', () => {
    it('goes ascending, descending, then back to the order of files', () => {
        const store = configureStore({
            reducer: rootReducer,
            preloadedState: initialRootState as any,
            middleware: (getDefault) => getDefault({ serializableCheck: false }),
        });
        store.dispatch(reduxActions.setFileActions([ChonkyActions.SortFilesByName, ChonkyActions.SortFilesByDate]));
        const dispatch = store.dispatch as (thunk: any) => void;
        const sort = () => [store.getState().sortActionId, store.getState().sortOrder];
        const byDate = ChonkyActions.SortFilesByDate.id;

        dispatch(thunkActivateSortAction(byDate));
        expect(sort()).toEqual([byDate, SortOrder.ASC]);
        dispatch(thunkActivateSortAction(byDate));
        expect(sort()).toEqual([byDate, SortOrder.DESC]);
        dispatch(thunkActivateSortAction(byDate));
        expect(sort()).toEqual([null, SortOrder.ASC]);
        dispatch(thunkActivateSortAction(byDate));
        expect(sort()).toEqual([byDate, SortOrder.ASC]);
    });
});
