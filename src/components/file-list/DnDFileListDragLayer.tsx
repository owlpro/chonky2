/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React from 'react';
import { useDragLayer } from 'react-dnd';
import { Nullable } from '../../types/util.types';

import { ChonkyDndFileEntryItem, ChonkyDndFileEntryType } from '../../types/dnd.types';
import { FileIcon } from './FileEntryIcon';

export interface DnDFileListDragLayerProps {}

const layerStyles: React.CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
};
const getItemStyles = (
    initialCursorOffset: Nullable<{ x: number; y: number }>,
    initialFileOffset: Nullable<{ x: number; y: number }>,
    currentFileOffset: Nullable<{ x: number; y: number }>
) => {
    if (!initialCursorOffset || !initialFileOffset || !currentFileOffset) {
        return {
            display: 'none',
        };
    }
    const x = initialCursorOffset.x + (currentFileOffset.x - initialFileOffset.x);
    const y = initialCursorOffset.y + (currentFileOffset.y - initialFileOffset.y);
    const transform = `translate(${x}px, ${y}px)`;
    return {
        transform,
        WebkitTransform: transform,
    };
};

export const DnDFileListDragLayer: React.FC<DnDFileListDragLayerProps> = () => {
    const {
        itemType,
        item,
        initialCursorOffset,
        initialFileOffset,
        currentFileOffset,
        isDragging,
    } = useDragLayer(monitor => ({
        item: monitor.getItem() as ChonkyDndFileEntryItem,
        itemType: monitor.getItemType(),
        initialCursorOffset: monitor.getInitialClientOffset(),
        initialFileOffset: monitor.getInitialSourceClientOffset(),
        currentFileOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));
    if (!isDragging || itemType !== ChonkyDndFileEntryType || !item.payload) {
        return null;
    }

    const selectionSize = item.payload.selectedFiles.length;
    return (
        <div style={layerStyles}>
            <div
                style={getItemStyles(
                    initialCursorOffset,
                    initialFileOffset,
                    currentFileOffset
                )}
            >
                <div className="chonky-fileDragPreview">
                    <FileIcon file={item.payload.draggedFile} size={20} />
                    <span className="chonky-fileDragPreviewName">{item.payload.draggedFile.name}</span>
                    {selectionSize > 1 && <span className="chonky-fileDragPreviewCount">{selectionSize}</span>}
                </div>
            </div>
        </div>
    );
};
