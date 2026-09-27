/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React from 'react';
import { Nullable } from '../../types/util.types';

import { FileData } from '../../types/file.types';
import { useFileNameComponent, useModifierIconComponents } from './FileEntry-hooks';

export interface FileEntryNameProps {
    file: Nullable<FileData>;
    className?: string;
}

export const FileEntryName: React.FC<FileEntryNameProps> = React.memo(({ file, className }) => {
    const modifierIconComponents = useModifierIconComponents(file);
    const fileNameComponent = useFileNameComponent(file);

    return (
        <span className={className} title={file ? file.name : undefined}>
            {modifierIconComponents.length > 0 && (
                <span className="chonky-modifierIcons">{modifierIconComponents}</span>
            )}
            {fileNameComponent}
        </span>
    );
});
FileEntryName.displayName = 'FileEntryName';
