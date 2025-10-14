import React, { useRef } from 'react';
import { Nullable } from 'tsdef';

import { DndEntryState } from '../../types/file-list.types';
import { FileData } from '../../types/file.types';
import { useDndHoverOpen, useFileEntryDnD } from '../../util/dnd';
import { FileHelper } from '../../util/file-helper';
import { makeLocalChonkyStyles } from '../../util/styles';

export interface DnDFileEntryProps {
    file: Nullable<FileData>;
    children: (dndState: DndEntryState) => React.ReactElement;
}

export const DnDFileEntry = React.memo(({ file, children }: DnDFileEntryProps) => {
    const { drop, drag, dndState } = useFileEntryDnD(file);

    useDndHoverOpen(file, dndState);
    const classes = useStyles();
    const dropRef = useRef<HTMLDivElement | null>(null);
    const dragRef = useRef<HTMLDivElement | null>(null);
    drop(dropRef);
    drag(dragRef);
    
    return (
        <div ref={dropRef} className={classes.fillParent}>
            <div
                ref={FileHelper.isDraggable(file) ? dragRef : null}
                className={classes.fillParent}
            >
                {children(dndState)}
            </div>
        </div>
    );
});

export const useStyles = makeLocalChonkyStyles(() => ({
    fillParent: {
        height: '100%',
    },
}));
