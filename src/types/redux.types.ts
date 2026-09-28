import { Nullable } from './util.types';

import { Action, ThunkAction, ThunkDispatch } from '@reduxjs/toolkit';

import { GenericFileActionHandler } from './action-handler.types';
import { FileActionMenuItem } from './action-menus.types';
import { FileAction, FileActionMap } from './action.types';
import { ContextMenuConfig } from './context-menu.types';
import { FileViewConfig } from './file-view.types';
import { FileArray, FileData, FileIdTrueMap, FileMap } from './file.types';
import { OptionMap } from './options.types';
import { FileSelection } from './selection.types';
import { SortOrder } from './sort.types';
import { ThumbnailGenerator } from './thumbnails.types';

/**
 * Folders the user has visited, for the Back and Forward buttons. `pendingIndex` is
 * set while a Back/Forward navigation waits for the app to update `folderChain`.
 */
export interface NavigationHistory {
    entries: FileData[];
    index: number;
    pendingIndex: Nullable<number>;
}

export type RootState = {
    instanceId: string;

    externalFileActionHandler: Nullable<GenericFileActionHandler<FileAction>>;

    // Raw and sanitized file actions
    rawFileActions: FileAction[] | any;
    fileActionsErrorMessages: string[];
    fileActionMap: FileActionMap;
    fileActionIds: string[];
    toolbarItems: FileActionMenuItem[];
    contextMenuItems: FileActionMenuItem[];

    // Raw and sanitized folder chain
    rawFolderChain: Nullable<FileArray> | any;
    folderChainErrorMessages: string[];
    folderChain: FileArray;

    // Raw and sanitized files
    rawFiles: FileArray | any;
    filesErrorMessages: string[];
    fileMap: FileMap;
    fileIds: Nullable<string>[];
    cleanFileIds: string[];

    // Search
    focusSearchInput: Nullable<() => void>;
    /** Text in the search field. Cleared when the current folder changes. */
    searchString: string;

    // Selection
    selectionMap: FileSelection;
    disableSelection: boolean;

    // File views
    fileViewConfig: FileViewConfig;

    // Sorting
    sortActionId: Nullable<string>;
    sortOrder: SortOrder;

    // Options
    optionMap: OptionMap;

    // Other settings
    thumbnailGenerator: Nullable<ThumbnailGenerator>;
    doubleClickDelay: number;
    disableDragAndDrop: boolean;
    clearSelectionOnOutsideClick: boolean;

    // State to use inside effects
    lastClick: Nullable<{ index: number; fileId: string }>;

    navigationHistory: NavigationHistory;

    // Context menu
    contextMenuMounted: boolean;
    contextMenuConfig: Nullable<ContextMenuConfig>;

    // Inline rename
    renamingFileId: Nullable<string>;
    /**
     * Set when the user asks for new files (`CreateFolder`, `UploadFiles`, `DropFiles`):
     * the folder they were asked for in and the files that were there. When new files
     * show up there they are selected and scrolled to; a new folder is also renamed.
     */
    newFileWatch: Nullable<NewFileWatch>;
    /** Files the file list should scroll to, e.g. new uploads. */
    revealFileIds: Nullable<string[]>;
    /**
     * Files the app asked to reveal (`FileBrowserHandle.revealFiles`) that are not in
     * `files` yet, e.g. while the app loads their folder.
     */
    pendingReveal: Nullable<PendingReveal>;

    /** Files copied or cut with `CopyFiles` / `CutFiles`, for `PasteFiles`. */
    clipboard: Nullable<ChonkyClipboard>;
};

export interface ChonkyClipboard {
    mode: 'copy' | 'cut';
    files: FileData[];
    fileIds: FileIdTrueMap;
    /** The folder the files were copied or cut from. */
    source: Nullable<FileData>;
}

export interface PendingReveal {
    fileIds: string[];
    select: boolean;
}

export interface NewFileWatch {
    kind: 'folder' | 'files';
    parentId: Nullable<string>;
    knownFileIds: FileIdTrueMap;
}

export type ChonkyThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, null, Action<string>>;

export type ChonkyDispatch = ThunkDispatch<RootState, null, Action<string>>;
