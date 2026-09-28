import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Nullable } from '../../types/util.types';

import { reduxActions } from '../../redux/reducers';
import { selectRevealFileIds } from '../../redux/selectors';

/**
 * Scrolls the virtualized list to the first of `revealFileIds` in display order, e.g.
 * to files that were just uploaded or a folder being renamed.
 */
export const useRevealFiles = (displayFileIds: Nullable<string>[], scrollToIndex: (index: number) => void) => {
    const dispatch = useDispatch<any>();
    const revealFileIds = useSelector(selectRevealFileIds);

    useEffect(() => {
        if (!revealFileIds) return;
        const ids = new Set(revealFileIds);
        const index = displayFileIds.findIndex((id) => !!id && ids.has(id));
        // Sorting can lag a render behind the new files, so wait until they are listed
        if (index === -1) return;
        scrollToIndex(index);
        dispatch(reduxActions.clearRevealFileIds());
    }, [dispatch, displayFileIds, revealFileIds, scrollToIndex]);
};
