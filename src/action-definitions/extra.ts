import { reduxActions } from '../redux/reducers';
import { selectClipboard, selectCurrentFolder, selectInstanceId } from '../redux/selectors';
import { thunkRequestFileAction } from '../redux/thunks/dispatchers.thunks';
import { DropFilesPayload } from '../types/action-payloads.types';
import { FileActionEffect } from '../types/action.types';
import { ChonkyIconName } from '../types/icons.types';
import { FileHelper } from '../util/file-helper';
import { defineFileAction } from '../util/helpers';
import { ChonkyActions } from './index';

/** Puts the files the action applies to on Chonky's clipboard, for `PasteFiles`. */
const clipboardEffect =
    (mode: 'copy' | 'cut'): FileActionEffect =>
    ({ state, reduxDispatch, getReduxState }) => {
        const files = state.selectedFilesForAction;
        if (files.length === 0) return;
        reduxDispatch(reduxActions.setClipboard({ mode, files, source: selectCurrentFolder(getReduxState()) ?? null }));
    };

export const ExtraActions = {
    /**
     * Action that adds a button and the Ctrl+C shortcut to copy files. The files are
     * also put on Chonky's clipboard, so `PasteFiles` can paste copies of them.
     */
    CopyFiles: defineFileAction(
        {
            id: 'copy_files',
            requiresSelection: true,
            hotkeys: ['ctrl+c', 'command+c'],
            button: {
                name: 'Copy selection',
                toolbar: true,
                contextMenu: true,
                group: 'Actions',
                icon: ChonkyIconName.copy,
            },
        } as const,
        clipboardEffect('copy')
    ),
    /**
     * Action that adds a button and the Ctrl+X shortcut to cut files: `PasteFiles`
     * then moves them. Cut files are shown faded until they are pasted.
     */
    CutFiles: defineFileAction(
        {
            id: 'cut_files',
            requiresSelection: true,
            hotkeys: ['ctrl+x', 'command+x'],
            button: {
                name: 'Cut selection',
                toolbar: true,
                contextMenu: true,
                group: 'Actions',
                icon: ChonkyIconName.cut,
            },
        } as const,
        clipboardEffect('cut')
    ),
    /**
     * Action that adds a button and the Ctrl+V shortcut to paste the files copied with
     * `CopyFiles` or cut with `CutFiles`. It pastes into the current folder, or into
     * the folder the context menu was opened on. The app receives `CopyFilesTo` for
     * copies and `MoveFiles` for cut files; the pasted files are then selected.
     */
    PasteFiles: defineFileAction(
        {
            id: 'paste_files',
            hotkeys: ['ctrl+v', 'command+v'],
            button: {
                name: 'Paste',
                toolbar: true,
                contextMenu: true,
                group: 'Actions',
                icon: ChonkyIconName.paste,
            },
        } as const,
        ({ state, reduxDispatch, getReduxState }) => {
            const reduxState = getReduxState();
            const clipboard = selectClipboard(reduxState);
            const currentFolder = selectCurrentFolder(reduxState) ?? null;
            const trigger = state.contextMenuTriggerFile;
            const destination = trigger?.isDir && FileHelper.isDroppable(trigger) ? trigger : currentFolder;
            if (!clipboard || !FileHelper.isDroppable(destination)) return true;

            // A folder can't be pasted into itself
            const files = clipboard.files.filter((file) => file.id !== destination.id);
            if (files.length === 0) return true;
            if (clipboard.mode === 'cut' && clipboard.source?.id === destination.id) {
                reduxDispatch(reduxActions.setClipboard(null));
                return true;
            }

            if (destination.id === currentFolder?.id) reduxDispatch(reduxActions.watchForNewFiles('files'));
            if (clipboard.mode === 'cut') {
                reduxDispatch(reduxActions.setClipboard(null));
                reduxDispatch(
                    thunkRequestFileAction(ChonkyActions.MoveFiles, {
                        sourceInstanceId: selectInstanceId(reduxState),
                        source: clipboard.source,
                        draggedFile: files[0]!,
                        selectedFiles: files,
                        destination,
                        copy: false,
                        files,
                    })
                );
            } else {
                reduxDispatch(
                    thunkRequestFileAction(ChonkyActions.CopyFilesTo, {
                        files,
                        source: clipboard.source,
                        destination,
                    })
                );
            }
            return true;
        }
    ),
    /**
     * Action that adds a button to create a new folder. The first folder that then
     * shows up in the current folder is selected and put into rename mode (see
     * `ChangeFileName`).
     */
    CreateFolder: defineFileAction(
        {
            id: 'create_folder',
            button: {
                name: 'Create folder',
                toolbar: true,
                tooltip: 'Create a folder',
                icon: ChonkyIconName.folderCreate,
                iconOnly: true,
            },
        } as const,
        ({ reduxDispatch }) => {
            reduxDispatch(reduxActions.watchForNewFiles('folder'));
        }
    ),
    /**
     * Action that adds a button to upload files. Files that then show up in the current
     * folder are selected and scrolled to.
     */
    UploadFiles: defineFileAction(
        {
            id: 'upload_files',
            button: {
                name: 'Upload files',
                toolbar: true,
                tooltip: 'Upload files',
                icon: ChonkyIconName.upload,
                iconOnly: true,
            },
        } as const,
        ({ reduxDispatch }) => {
            reduxDispatch(reduxActions.watchForNewFiles('files'));
        }
    ),
    /**
     * Action that adds a button and the F2 shortcut to rename the selected file inline.
     * It is handled by Chonky; the app receives `ChangeFileName` when the user confirms
     * a new name.
     */
    RenameFile: defineFileAction(
        {
            id: 'rename_file',
            requiresSelection: true,
            hotkeys: ['f2'],
            button: {
                name: 'Rename',
                toolbar: true,
                contextMenu: true,
                group: 'Actions',
                icon: ChonkyIconName.rename,
            },
        } as const,
        ({ state, reduxDispatch }) => {
            const files = state.selectedFilesForAction;
            if (files.length === 1 && FileHelper.isRenamable(files[0]!)) {
                reduxDispatch(reduxActions.startRename(files[0]!.id));
            }
            return true;
        }
    ),
    /**
     * Action that is dispatched when the user drops files from their computer onto
     * Chonky, so the app can upload them. Registering it turns the whole file browser
     * into a drop zone; dropping onto a folder entry or a breadcrumb uploads into that
     * folder instead of the current one. Files that then show up in the current folder
     * are selected and scrolled to.
     */
    DropFiles: defineFileAction(
        {
            id: 'drop_files',
            __payloadType: {} as DropFilesPayload,
        } as const,
        ({ payload, reduxDispatch, getReduxState }) => {
            if (payload.destination.id === selectCurrentFolder(getReduxState())?.id) {
                reduxDispatch(reduxActions.watchForNewFiles('files'));
            }
        }
    ),
    /**
     * Action that adds a button to download files.
     */
    DownloadFiles: defineFileAction({
        id: 'download_files',
        requiresSelection: true,
        button: {
            name: 'Download files',
            toolbar: true,
            contextMenu: true,
            group: 'Actions',
            icon: ChonkyIconName.download,
        },
    } as const),
    /**
     * Action that adds a button and shortcut to delete files.
     */
    DeleteFiles: defineFileAction({
        id: 'delete_files',
        requiresSelection: true,
        hotkeys: ['delete'],
        button: {
            name: 'Delete files',
            toolbar: true,
            contextMenu: true,
            group: 'Actions',
            icon: ChonkyIconName.trash,
        },
    } as const),
};
