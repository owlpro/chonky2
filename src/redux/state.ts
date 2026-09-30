import { ChonkyActions } from '../action-definitions/index';
import { RootState } from '../types/redux.types';
import { SortOrder } from '../types/sort.types';

export const initialRootState: RootState = {
    instanceId: 'CHONKY_INVALID_ID', // should be overwritten by preloaded state

    externalFileActionHandler: null,

    rawFileActions: [],
    fileActionsErrorMessages: [],
    fileActionMap: {},
    fileActionIds: [],
    toolbarItems: [],
    contextMenuItems: [],

    rawFolderChain: null,
    folderChainErrorMessages: [],
    folderChain: [],

    rawFiles: [],
    filesErrorMessages: [],
    fileMap: {},
    fileIds: [],
    cleanFileIds: [],

    focusSearchInput: null,
    searchString: '',

    selectionMap: {},
    disableSelection: false,

    fileViewConfig: ChonkyActions.EnableGridView.fileViewConfig,

    sortActionId: null,
    sortOrder: SortOrder.ASC,

    optionMap: {},

    thumbnailGenerator: null,
    doubleClickDelay: 300,
    disableDragAndDrop: false,
    clearSelectionOnOutsideClick: true,
    disableAnimations: false,
    loading: false,

    lastClick: null,

    navigationHistory: { entries: [], index: -1, pendingIndex: null },

    contextMenuMounted: false,
    contextMenuConfig: null,

    renamingFileId: null,
    newFileWatch: null,
    revealFileIds: null,
    pendingReveal: null,

    clipboard: null,

    userState: { favorites: [], recent: [], collapsedSidebarSections: [] },
    recentLimit: 0,
    userStateConfig: { controlled: false, storageKey: null, onChange: null },
};
