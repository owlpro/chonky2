import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { reduxActions } from '../redux/reducers';
import { selectFavorites, selectFileMap, selectFolderChain, selectRecent } from '../redux/selectors';
import { thunkUpdateUserState } from '../redux/thunks/user-state.thunks';
import { FileData } from '../types/file.types';
import { ChonkyUserState } from '../types/user-state.types';
import { Nullable } from '../types/util.types';
import { normalizeUserState, readStoredUserState } from './user-state';

/** Puts the `userState`, `onUserStateChange` and `userStateStorageKey` props into Redux. */
export const useUserStateProps = (
    userState: Nullable<Partial<ChonkyUserState>> | undefined,
    onUserStateChange: Nullable<(userState: ChonkyUserState) => void> | undefined,
    userStateStorageKey: Nullable<string> | undefined
) => {
    const dispatch = useDispatch<any>();
    const controlled = userState != null;
    const storageKey = userStateStorageKey ?? null;

    useEffect(() => {
        dispatch(reduxActions.setUserStateConfig({ controlled, storageKey, onChange: onUserStateChange ?? null }));
    }, [dispatch, controlled, storageKey, onUserStateChange]);

    useEffect(() => {
        dispatch(reduxActions.setUserState(controlled ? normalizeUserState(userState) : readStoredUserState(storageKey)));
    }, [dispatch, controlled, userState, storageKey]);
};

/**
 * Favorites and recent files are saved copies of the files, so a renamed file would
 * keep its old name in the sidebar. This updates a saved copy whenever its file shows
 * up in `files` or `folderChain` with a different name.
 */
export const useSavedFileRefresh = () => {
    const dispatch = useDispatch<any>();
    const favorites = useSelector(selectFavorites);
    const recent = useSelector(selectRecent);
    const fileMap = useSelector(selectFileMap);
    const folderChain = useSelector(selectFolderChain);

    useEffect(() => {
        const findChanged = (saved: FileData) => {
            const current = fileMap[saved.id] ?? folderChain.find((f) => f?.id === saved.id);
            return current && current.name !== saved.name ? current : null;
        };
        if (!favorites.some(findChanged) && !recent.some(findChanged)) return;
        dispatch(
            thunkUpdateUserState((state) => ({
                ...state,
                favorites: state.favorites.map((saved) => findChanged(saved) ?? saved),
                recent: state.recent.map((saved) => findChanged(saved) ?? saved),
            }))
        );
    }, [dispatch, favorites, recent, fileMap, folderChain]);
};
