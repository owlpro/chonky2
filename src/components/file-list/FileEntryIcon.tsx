import React, { CSSProperties, useContext } from 'react';

import { FileData } from '../../types/file.types';
import { ChonkyIconName } from '../../types/icons.types';
import { Nullable } from '../../types/util.types';
import { FileHelper, getFileExtension } from '../../util/file-helper';
import { ChonkyIconContext, getFileTypeColor, useIconData } from '../../util/icon-helper';
import { ChonkyIconLucide } from '../internal/ChonkyIcons';
import { FileTypeIcon } from '../internal/FileTypeIcon';
import { FileEntryState } from './GridEntryPreview';

export interface FileIconProps {
    file: Nullable<FileData>;
    /** Width and height in pixels. */
    size: number;
    /** State from `useFileEntryState`; when missing, the icon is derived from `file`. */
    entryState?: FileEntryState;
}

/**
 * Icon for a file or folder. Uses the built-in two-tone art unless the app supplies
 * its own `iconComponent` or the file sets `icon`, in which case that icon is drawn
 * in the file's colour.
 */
export const FileIcon: React.FC<FileIconProps> = React.memo(({ file, size, entryState }) => {
    const ChonkyIcon = useContext(ChonkyIconContext);
    const iconData = useIconData(file);
    const icon = entryState?.icon ?? file?.icon ?? iconData.icon;
    const color = entryState?.color ?? file?.color ?? getFileTypeColor(iconData.icon);
    const spin = entryState?.iconSpin ?? !file;

    const boxStyle: CSSProperties = { width: size, height: size };
    const useBuiltInArt = ChonkyIcon === ChonkyIconLucide && file?.icon === undefined && !spin && !!file;
    if (!useBuiltInArt) {
        return (
            <span className="chonky-fileIcon" style={{ ...boxStyle, fontSize: size * 0.8, color }}>
                <ChonkyIcon icon={icon} spin={spin} />
            </span>
        );
    }

    const isDir = FileHelper.isDirectory(file);
    return (
        <span className="chonky-fileIcon" style={boxStyle}>
            <FileTypeIcon
                kind={isDir ? 'folder' : 'file'}
                color={color}
                extension={isDir ? undefined : getFileExtension(file).slice(1)}
                size={size}
            />
        </span>
    );
});
FileIcon.displayName = 'FileIcon';

/**
 * Plain folder icon, e.g. for the current folder's title.
 */
export const FolderIcon: React.FC<{ size: number }> = ({ size }) => {
    const ChonkyIcon = useContext(ChonkyIconContext);
    if (ChonkyIcon !== ChonkyIconLucide) {
        return (
            <span className="chonky-fileIcon" style={{ width: size, height: size, fontSize: size * 0.8 }}>
                <ChonkyIcon icon={ChonkyIconName.folder} />
            </span>
        );
    }
    return (
        <span className="chonky-fileIcon" style={{ width: size, height: size }}>
            <FileTypeIcon kind="folder" color={getFileTypeColor(ChonkyIconName.folder)} size={size} />
        </span>
    );
};
