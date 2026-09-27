/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { useContext, useMemo, useRef } from 'react';

import { DndEntryState } from '../../types/file-list.types';
import { ChonkyIconName } from '../../types/icons.types';
import { useDndHoverOpen, useFileDrop } from '../../util/dnd';
import { ChonkyIconContext } from '../../util/icon-helper';
import { c, getDndOverClasses } from '../../util/styles';
import { useDndIcon } from '../file-list/FileEntry-hooks';
import { FolderChainItem } from './FileNavbar-hooks';
import { ToolbarButton } from './ToolbarButton';

export interface FolderChainButtonProps {
    first: boolean;
    current: boolean;
    item: FolderChainItem;
}

export const FolderChainButton: React.FC<FolderChainButtonProps> = React.memo(
    ({ first, current, item }) => {
        const { file, disabled, onClick } = item;
        const { dndIsOver, dndCanDrop, drop } = useFileDrop({
            file,
            forceDisableDrop: !file || current,
        });
        const dndState = useMemo<DndEntryState>(
            () => ({
                dndIsOver,
                dndCanDrop,
                dndIsDragging: false,
            }),
            [dndCanDrop, dndIsOver]
        );
        useDndHoverOpen(file, dndState);
        const dndIconName = useDndIcon(dndState);
        const ChonkyIcon = useContext(ChonkyIconContext);

        const className = c('chonky-baseBreadcrumb', getDndOverClasses(dndState), {
            'chonky-disabledBreadcrumb': disabled,
            'chonky-currentBreadcrumb': current,
        });
        const text = file ? file.name : 'Loading...';
        const icon =
            first && file?.folderChainIcon === undefined
                ? ChonkyIconName.folder
                : file?.folderChainIcon;

        const dropRef = useRef<HTMLDivElement | null>(null);
        drop(dropRef);

        return (
            <div className="chonky-folderChainButton" ref={file ? dropRef : null}>
                {file && dndIconName && (
                    <div className={c('chonky-folderChainDndIndicator', { 'chonky-can-drop': dndCanDrop })}>
                        <ChonkyIcon icon={dndIconName} fixedWidth={true} />
                    </div>
                )}
                <ToolbarButton
                    icon={icon}
                    className={className}
                    text={text}
                    disabled={disabled}
                    onClick={onClick}
                />
            </div>
        );
    }
);
