import { FileData } from '../../types/file.types';
import { ChonkyThunk } from '../../types/redux.types';
import { ChonkyUserState } from '../../types/user-state.types';
import { writeStoredUserState } from '../../util/user-state';
import { reduxActions } from '../reducers';

/**
 * Applies a change the user made, e.g. a new favorite. With a controlled `userState`
 * the app only gets `onUserStateChange` and passes the new state back; otherwise
 * Chonky keeps it, saves it under `userStateStorageKey` and reports it too.
 */
export const thunkUpdateUserState =
    (update: (userState: ChonkyUserState) => ChonkyUserState): ChonkyThunk =>
    (dispatch, getState) => {
        const { userState, userStateConfig } = getState();
        const next = update(userState);
        if (next === userState) return;

        if (!userStateConfig.controlled) {
            dispatch(reduxActions.setUserState(next));
            writeStoredUserState(userStateConfig.storageKey, next);
        }
        userStateConfig.onChange?.(next);
    };

/** Adds the folders to the favorites, before the favorite at `index` or at the end. */
export const thunkAddFavorites = (folders: FileData[], index?: number): ChonkyThunk =>
    thunkUpdateUserState((userState) => {
        const favorites = userState.favorites;
        const known = new Set(favorites.map((f) => f.id));
        const added = folders.filter((f, i) => !known.has(f.id) && folders.findIndex((o) => o.id === f.id) === i);
        if (added.length === 0) return userState;
        const at = index ?? favorites.length;
        return { ...userState, favorites: [...favorites.slice(0, at), ...added, ...favorites.slice(at)] };
    });

export const thunkRemoveFavorites = (folderIds: string[]): ChonkyThunk =>
    thunkUpdateUserState((userState) => {
        const favorites = userState.favorites.filter((f) => !folderIds.includes(f.id));
        return favorites.length === userState.favorites.length ? userState : { ...userState, favorites };
    });

/** Moves a favorite so it ends up before the favorite at `index` (the end for `favorites.length`). */
export const thunkMoveFavorite = (folderId: string, index: number): ChonkyThunk =>
    thunkUpdateUserState((userState) => {
        const from = userState.favorites.findIndex((f) => f.id === folderId);
        if (from === -1 || index === from || index === from + 1) return userState;
        const favorites = [...userState.favorites];
        const [moved] = favorites.splice(from, 1);
        favorites.splice(index > from ? index - 1 : index, 0, moved!);
        return { ...userState, favorites };
    });

/**
 * Puts opened files (not folders) at the top of the recent ones, keeping `recentLimit`
 * of them. Does nothing while no `FileSidebarRecent` is shown.
 */
export const thunkRecordRecent =
    (openedFiles: FileData[]): ChonkyThunk =>
    (dispatch, getState) => {
        const limit = getState().recentLimit;
        const files = openedFiles.filter((f) => !f.isDir);
        if (limit <= 0 || files.length === 0) return;
        dispatch(
            thunkUpdateUserState((userState) => {
                const openedIds = new Set(files.map((f) => f.id));
                const opened = files.filter((f, i) => files.findIndex((o) => o.id === f.id) === i);
                const recent = [...opened, ...userState.recent.filter((f) => !openedIds.has(f.id))].slice(0, limit);
                const unchanged =
                    recent.length === userState.recent.length &&
                    recent.every((f, i) => f === userState.recent[i]);
                return unchanged ? userState : { ...userState, recent };
            })
        );
    };

export const thunkRemoveRecent = (fileIds: string[]): ChonkyThunk =>
    thunkUpdateUserState((userState) => {
        const recent = userState.recent.filter((f) => !fileIds.includes(f.id));
        return recent.length === userState.recent.length ? userState : { ...userState, recent };
    });

export const thunkToggleSidebarSection = (sectionId: string): ChonkyThunk =>
    thunkUpdateUserState((userState) => {
        const collapsed = userState.collapsedSidebarSections;
        return {
            ...userState,
            collapsedSidebarSections: collapsed.includes(sectionId)
                ? collapsed.filter((id) => id !== sectionId)
                : [...collapsed, sectionId],
        };
    });
