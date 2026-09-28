import { Nullable } from './util.types';

import { FileData } from './file.types';

export interface MouseClickFilePayload {
    file: FileData;
    fileDisplayIndex: number;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    clickType: 'single' | 'double';
}

export interface KeyboardClickFilePayload {
    file: FileData;
    fileDisplayIndex: number;
    enterKey: boolean;
    spaceKey: boolean;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
}

export interface StartDragNDropPayload {
    sourceInstanceId: string;
    source: Nullable<FileData>;
    draggedFile: FileData;
    selectedFiles: FileData[];
}

export type EndDragNDropPayload = StartDragNDropPayload & {
    destination: FileData;
    copy: boolean;
};

export type MoveFilesPayload = EndDragNDropPayload & { files: FileData[] };

export type ChangeSelectionPayload = { selection: Set<string> };

export interface ChangeSearchPayload {
    /** The search field text, trimmed. Empty when the search was cleared. */
    searchString: string;
}

export interface OpenFilesPayload {
    targetFile?: FileData;
    files: FileData[];
}

export interface OpenFileContextMenuPayload {
    clientX: number;
    clientY: number;
    triggerFileId: Nullable<string>;
}

export interface CopyFilesToPayload {
    /** The copied files. */
    files: FileData[];
    /** The folder they were copied from. */
    source: Nullable<FileData>;
    /** The folder to put the copies in. */
    destination: FileData;
}

export interface ChangeFileNamePayload {
    /** The file as it was before the rename. */
    file: FileData;
    /** The new name, trimmed. Never empty and never equal to `file.name`. */
    name: string;
}

export interface DropFilesPayload {
    /** Files dropped from outside the browser, e.g. from the OS file manager. */
    files: File[];
    /** Folder the files were dropped into: a folder entry, a breadcrumb or the current folder. */
    destination: FileData;
}
