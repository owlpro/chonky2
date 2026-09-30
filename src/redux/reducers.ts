import { Nilable, Nullable } from '../types/util.types';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { GenericFileActionHandler } from '../types/action-handler.types';
import { FileActionMenuItem } from '../types/action-menus.types';
import { FileAction, FileActionMap } from '../types/action.types';
import { ContextMenuConfig } from '../types/context-menu.types';
import { FileViewConfig } from '../types/file-view.types';
import { FileArray, FileData, FileIdTrueMap, FileMap } from '../types/file.types';
import { OptionMap } from '../types/options.types';
import { ChonkyClipboard, NavigationHistory, NewFileWatch, RootState } from '../types/redux.types';
import { SortOrder } from '../types/sort.types';
import { ThumbnailGenerator } from '../types/thumbnails.types';
import { ChonkyUserState, UserStateConfig } from '../types/user-state.types';
import { FileHelper } from '../util/file-helper';
import { getSearchTerms, isSearchMatch } from '../util/search';
import { sanitizeInputArray } from './files-transforms';
import { initialRootState } from './state';

const MAX_HISTORY_ENTRIES = 100;

/**
 * Records a visit to `folder`: moves through history on Back/Forward, otherwise
 * drops the forward entries and appends the folder.
 */
const recordNavigation = (history: NavigationHistory, folder: FileData) => {
    const { entries, index, pendingIndex } = history;
    history.pendingIndex = null;

    if (entries[index]?.id === folder.id) {
        entries[index] = folder;
    } else if (pendingIndex !== null && entries[pendingIndex]?.id === folder.id) {
        entries[pendingIndex] = folder;
        history.index = pendingIndex;
    } else {
        const kept = entries.slice(Math.max(0, index + 2 - MAX_HISTORY_ENTRIES), index + 1);
        history.entries = [...kept, folder];
        history.index = history.entries.length - 1;
    }
};

/**
 * Scrolls to `fileIds` and, if `select` is set, selects them. Clears the search if it
 * hides any of them.
 */
const showFiles = (state: RootState, fileIds: string[], select: boolean) => {
    const terms = getSearchTerms(state.searchString);
    if (!fileIds.every((id) => isSearchMatch(state.fileMap[id] ?? null, terms))) state.searchString = '';

    state.revealFileIds = fileIds;
    if (select && !state.disableSelection) {
        state.selectionMap = {};
        fileIds
            .filter((id) => FileHelper.isSelectable(state.fileMap[id] ?? null))
            .forEach((id) => (state.selectionMap[id] = true));
    }
};

/**
 * Reveals the files of `pendingReveal` once they are in `files`. After a files update,
 * gives up if the list has finished loading without them: it isn't empty, has no `null`
 * placeholders and the `loading` prop is off. (Apps often clear the list while they load.)
 */
const applyPendingReveal = (state: RootState, afterFilesUpdate: boolean) => {
    const pending = state.pendingReveal;
    if (!pending) return;

    const presentIds = pending.fileIds.filter((id) => state.fileMap[id]);
    if (presentIds.length > 0) {
        state.pendingReveal = null;
        showFiles(state, presentIds, pending.select);
    } else if (afterFilesUpdate && !state.loading && state.fileIds.length > 0 && !state.fileIds.includes(null)) {
        state.pendingReveal = null;
    }
};

const reducers = {
    setExternalFileActionHandler(
        state: RootState,
        action: PayloadAction<Nilable<GenericFileActionHandler<FileAction>>>
    ) {
        state.externalFileActionHandler = action.payload ?? null;
    },
    setRawFileActions(state: RootState, action: PayloadAction<FileAction[] | any>) {
        state.rawFileActions = action.payload;
    },
    setFileActionsErrorMessages(state: RootState, action: PayloadAction<string[]>) {
        state.fileActionsErrorMessages = action.payload;
    },
    setFileActions(state: RootState, action: PayloadAction<FileAction[]>) {
        const fileActionMap: FileActionMap = {};
        action.payload.map(a => (fileActionMap[a.id] = a));
        const fileIds = action.payload.map(a => a.id);

        state.fileActionMap = fileActionMap as FileMap;
        state.fileActionIds = fileIds;
    },
    updateFileActionMenuItems(state: RootState, action: PayloadAction<[FileActionMenuItem[], FileActionMenuItem[]]>) {
        [state.toolbarItems, state.contextMenuItems] = action.payload;
    },
    setRawFolderChain(state: RootState, action: PayloadAction<FileArray | any>) {
        const rawFolderChain = action.payload;
        const { sanitizedArray: folderChain, errorMessages } = sanitizeInputArray('folderChain', rawFolderChain);
        const previousChain = state.folderChain;
        const previousFolderId = previousChain[previousChain.length - 1]?.id ?? null;
        state.rawFolderChain = rawFolderChain;
        state.folderChain = folderChain;
        state.folderChainErrorMessages = errorMessages;

        const currentFolder = folderChain.length > 0 ? folderChain[folderChain.length - 1] : null;
        if (currentFolder) recordNavigation(state.navigationHistory, currentFolder);

        // A search only applies to the folder it was typed in
        if ((currentFolder?.id ?? null) !== previousFolderId) state.searchString = '';

        // Files created before navigating away are not picked up in the new folder
        if (state.newFileWatch && state.newFileWatch.parentId !== (currentFolder?.id ?? null)) {
            state.newFileWatch = null;
        }

        // Going up to an ancestor (Back, Up, a breadcrumb) selects the folder the user came
        // out of, like File Explorer, once it shows up in the list
        const cameFrom = previousChain[folderChain.length];
        const isAncestor = folderChain.length > 0 && folderChain.every((f, i) => f?.id === previousChain[i]?.id);
        if (cameFrom && isAncestor) {
            state.pendingReveal = { fileIds: [cameFrom.id], select: true };
            applyPendingReveal(state, false);
        }
    },
    setNavigationHistoryPendingIndex(state: RootState, action: PayloadAction<Nullable<number>>) {
        state.navigationHistory.pendingIndex = action.payload;
    },
    setRawFiles(state: RootState, action: PayloadAction<FileArray | any>) {
        const rawFiles = action.payload;
        const { sanitizedArray: files, errorMessages } = sanitizeInputArray('files', rawFiles);
        state.rawFiles = rawFiles;
        state.filesErrorMessages = errorMessages;

        const fileMap: FileMap = {};
        files.forEach(f => {
            if (f) fileMap[f.id] = f;
        });
        const fileIds = files.map(f => (f ? f.id : null));
        const cleanFileIds = fileIds.filter(f => !!f) as string[];

        state.fileMap = fileMap;
        state.fileIds = fileIds;
        state.cleanFileIds = cleanFileIds;

        // Cleanup selection
        for (const selectedFileId of Object.keys(state.selectionMap)) {
            if (!fileMap[selectedFileId]) {
                delete state.selectionMap[selectedFileId];
            }
        }

        if (state.renamingFileId && !fileMap[state.renamingFileId]) state.renamingFileId = null;
        if (state.revealFileIds && !state.revealFileIds.some((id) => fileMap[id])) state.revealFileIds = null;

        // Select and reveal the files the user just created or uploaded, and put a new
        // folder into rename mode, like a desktop file manager does
        const watch = state.newFileWatch;
        if (watch) {
            const newFileIds = cleanFileIds.filter(
                (id) => !watch.knownFileIds[id] && (watch.kind === 'files' || fileMap[id]?.isDir)
            );
            if (newFileIds.length > 0) {
                const shownIds = watch.kind === 'folder' ? newFileIds.slice(0, 1) : newFileIds;
                state.newFileWatch = null;
                if (watch.kind === 'folder') state.renamingFileId = shownIds[0]!;
                showFiles(state, shownIds, true);
            }
        }

        applyPendingReveal(state, true);
    },
    revealFiles(state: RootState, action: PayloadAction<{ fileIds: string[]; select: boolean }>) {
        state.pendingReveal = { fileIds: action.payload.fileIds, select: action.payload.select };
        applyPendingReveal(state, false);
    },
    watchForNewFiles(state: RootState, action: PayloadAction<NewFileWatch['kind']>) {
        const currentFolder = state.folderChain.length > 0 ? state.folderChain[state.folderChain.length - 1] : null;
        const knownFileIds: FileIdTrueMap = {};
        state.cleanFileIds.forEach((id) => (knownFileIds[id] = true));
        state.newFileWatch = { kind: action.payload, parentId: currentFolder?.id ?? null, knownFileIds };
    },
    clearRevealFileIds(state: RootState) {
        state.revealFileIds = null;
    },
    setClipboard(state: RootState, action: PayloadAction<Nullable<Omit<ChonkyClipboard, 'fileIds'>>>) {
        if (!action.payload) {
            state.clipboard = null;
            return;
        }
        const fileIds: FileIdTrueMap = {};
        action.payload.files.forEach((file) => (fileIds[file.id] = true));
        state.clipboard = { ...action.payload, fileIds };
    },
    startRename(state: RootState, action: PayloadAction<string>) {
        if (!state.fileMap[action.payload]) return;
        state.renamingFileId = action.payload;
        state.revealFileIds = [action.payload];
        if (!state.disableSelection) state.selectionMap = { [action.payload]: true };
    },
    endRename(state: RootState) {
        state.renamingFileId = null;
    },
    setFocusSearchInput(state: RootState, action: PayloadAction<Nullable<() => void>>) {
        state.focusSearchInput = action.payload;
    },
    setSearchString(state: RootState, action: PayloadAction<string>) {
        state.searchString = action.payload;
    },
    selectAllFiles(state: RootState) {
        state.fileIds
            .filter(id => id && FileHelper.isSelectable(state.fileMap[id] ?? null))
            .map(id => (id ? (state.selectionMap[id] = true) : null));
    },
    selectFiles(state: RootState, action: PayloadAction<{ fileIds: string[]; reset: boolean }>) {
        if (state.disableSelection) return;
        if (action.payload.reset) state.selectionMap = {};
        action.payload.fileIds
            .filter(id => id && FileHelper.isSelectable(state.fileMap[id] ?? null))
            .map(id => (state.selectionMap[id] = true));
    },
    toggleSelection(state: RootState, action: PayloadAction<{ fileId: string; exclusive: boolean }>) {
        if (state.disableSelection) return;
        const oldValue = !!state.selectionMap[action.payload.fileId];
        if (action.payload.exclusive) state.selectionMap = {};
        if (oldValue) delete state.selectionMap[action.payload.fileId];
        else if (FileHelper.isSelectable(state.fileMap[action.payload.fileId] ?? null)) {
            state.selectionMap[action.payload.fileId] = true;
        }
    },
    deselectFiles(state: RootState, action: PayloadAction<string[]>) {
        action.payload.forEach((id) => delete state.selectionMap[id]);
    },
    clearSelection(state: RootState) {
        if (state.disableSelection) return;
        if (Object.keys(state.selectionMap).length !== 0) state.selectionMap = {};
    },
    setSelectionDisabled(state: RootState, action: PayloadAction<boolean>) {
        state.disableSelection = action.payload;
        if (Object.keys(state.selectionMap).length !== 0) state.selectionMap = {};
    },
    setFileViewConfig(state: RootState, action: PayloadAction<FileViewConfig>) {
        state.fileViewConfig = action.payload;
    },
    setSort(state: RootState, action: PayloadAction<{ actionId: Nullable<string>; order: SortOrder }>) {
        state.sortActionId = action.payload.actionId;
        state.sortOrder = action.payload.order;
    },
    setOptionDefaults(state: RootState, action: PayloadAction<OptionMap>) {
        for (const optionId of Object.keys(action.payload)) {
            if (optionId in state.optionMap) continue;
            state.optionMap[optionId] = action.payload[optionId];
        }
    },
    toggleOption(state: RootState, action: PayloadAction<string>) {
        state.optionMap[action.payload] = !state.optionMap[action.payload];
    },
    setThumbnailGenerator(state: RootState, action: PayloadAction<Nullable<ThumbnailGenerator>>) {
        state.thumbnailGenerator = action.payload;
    },
    setDoubleClickDelay(state: RootState, action: PayloadAction<number>) {
        state.doubleClickDelay = action.payload;
    },
    setDisableDragAndDrop(state: RootState, action: PayloadAction<boolean>) {
        state.disableDragAndDrop = action.payload;
    },
    setClearSelectionOnOutsideClick(state: RootState, action: PayloadAction<boolean>) {
        state.clearSelectionOnOutsideClick = action.payload;
    },
    setDisableAnimations(state: RootState, action: PayloadAction<boolean>) {
        state.disableAnimations = action.payload;
    },
    setLoading(state: RootState, action: PayloadAction<boolean>) {
        state.loading = action.payload;
    },
    setLastClickIndex(state: RootState, action: PayloadAction<Nullable<{ index: number; fileId: string }>>) {
        state.lastClick = action.payload;
    },
    setContextMenuMounted(state: RootState, action: PayloadAction<boolean>) {
        state.contextMenuMounted = action.payload;
    },
    showContextMenu(state: RootState, action: PayloadAction<ContextMenuConfig>) {
        state.contextMenuConfig = action.payload;
    },
    setUserState(state: RootState, action: PayloadAction<ChonkyUserState>) {
        state.userState = action.payload;
    },
    setUserStateConfig(state: RootState, action: PayloadAction<UserStateConfig>) {
        state.userStateConfig = action.payload;
    },
    setRecentLimit(state: RootState, action: PayloadAction<number>) {
        state.recentLimit = action.payload;
    },
    hideContextMenu(state: RootState) {
        if (!state.contextMenuConfig) return;
        state.contextMenuConfig = null;
    },
};

export const { actions: reduxActions, reducer: rootReducer } = createSlice({
    name: 'root',
    initialState: initialRootState,
    reducers,
});
