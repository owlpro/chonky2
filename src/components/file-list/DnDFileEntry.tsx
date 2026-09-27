import React from 'react';
import { Nullable } from '../../types/util.types';

import { DndEntryState } from '../../types/file-list.types';
import { FileData } from '../../types/file.types';
import { useDndHoverOpen, useFileEntryDnD } from '../../util/dnd';

export interface DnDFileEntryProps {
    file: Nullable<FileData>;
    children: (dndState: DndEntryState) => React.ReactElement;
}

export const DnDFileEntry = React.memo(({ file, children }: DnDFileEntryProps) => {
    const { ref, dndState } = useFileEntryDnD(file);

    useDndHoverOpen(file, dndState);

    return (
        <div ref={ref} className="chonky-fillParent">
            {children(dndState)}
        </div>
    );
});
