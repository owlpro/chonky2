/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { useMemo, useRef } from 'react';

import { DndEntryState } from '../../types/file-list.types';
import { ChonkyIconName } from '../../types/icons.types';
import { useFileDrop } from '../../util/dnd';
import { c, getDndOverClasses } from '../../util/styles';
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
        // No hover-to-open here: opening an ancestor makes it the current folder, which
        // no longer accepts the drop the user was aiming at.
        const className = c('chonky-breadcrumbButton', getDndOverClasses(dndState), {
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
            <div className="chonky-breadcrumb" ref={file ? dropRef : null}>
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
