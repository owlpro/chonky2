import { Nullable } from '../types/util.types';

import { FileData } from '../types/file.types';
import { Logger } from './logger';

/**
 * Returns the extension of a file including the dot, e.g. `.md`. Uses `file.ext`
 * when set. Names without a dot, and dotfiles such as `.gitignore`, have no extension.
 */
export const getFileExtension = (file: FileData) => {
    if (file.ext !== undefined) return file.ext;
    const dotIndex = file.name.lastIndexOf('.');
    return dotIndex > 0 ? file.name.slice(dotIndex) : '';
};

export class FileHelper {
    public static isDirectory(file: Nullable<FileData>): file is FileData {
        // Not a directory by default
        return !!file && file.isDir === true;
    }

    public static isHidden(file: Nullable<FileData>): file is FileData {
        // Not hidden by default
        return !!file && file.isHidden === true;
    }

    public static isSymlink(file: Nullable<FileData>): file is FileData {
        // Not a symlink by default
        return !!file && file.isSymlink === true;
    }

    public static isEncrypted(file: Nullable<FileData>): file is FileData {
        // Not encrypted by default
        return !!file && file.isEncrypted === true;
    }

    public static isClickable(file: Nullable<FileData>): file is FileData {
        // Clickable by default
        return !!file;
    }

    public static isOpenable(file: Nullable<FileData>): file is FileData {
        // Openable by default
        return !!file && file.openable !== false;
    }

    public static isSelectable(file: Nullable<FileData>): file is FileData {
        // Selectable by default
        return !!file && file.selectable !== false;
    }

    public static isDraggable(file: Nullable<FileData>): file is FileData {
        // File & folders are draggable by default, `null` is not
        return !!file && file.draggable !== false;
    }

    public static isRenamable(file: Nullable<FileData>): file is FileData {
        return !!file && file.renamable !== false;
    }

    public static isDroppable(file: Nullable<FileData>): file is FileData {
        // Folders are droppable by default, files are not
        if (!file) return false;
        if (file.isDir && file.droppable !== false) return true;
        return file.droppable === true;
    }

    public static isDndOpenable(file: Nullable<FileData>): file is FileData {
        // Folders are DnD openable by default, files are not
        if (!FileHelper.isOpenable(file)) return false;
        if (file.isDir && file.dndOpenable !== false) return true;
        return file.dndOpenable === true;
    }

    public static getModDate(file: Nullable<FileData>): Nullable<Date> {
        if (!file || file.modDate === null || file.modDate === undefined) return null;
        return FileHelper.parseDate(file.modDate);
    }

    public static parseDate(maybeDate: Date | string | any): Nullable<Date> {
        if (typeof maybeDate === 'string' || typeof maybeDate === 'number') {
            // We allow users to provide string and numerical representations of dates.
            try {
                return new Date(maybeDate);
            } catch (error: any) {
                Logger.error(
                    `Could not convert provided string/number into a date: ${error.message} `,
                    'Invalid value:',
                    maybeDate
                );
            }
        }
        if (maybeDate instanceof Date && !isNaN(maybeDate.getTime())) {
            // We only allow valid dates objects
            return maybeDate;
        }

        // If we have an invalid date representation, we just return null.
        Logger.warn('Unsupported date representation:', maybeDate);
        return null;
    }

    public static getChildrenCount(file: Nullable<FileData>): Nullable<number> {
        if (!file || typeof file.childrenCount !== 'number') return null;

        return file.childrenCount;
    }
}
