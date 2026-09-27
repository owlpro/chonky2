import React, { UIEvent, useCallback, useContext, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { reduxActions } from '../../redux/reducers';
import {
    selectClearSelectionOnOutsideClick,
    selectCurrentFolder,
    selectFileViewConfig,
    selectors,
} from '../../redux/selectors';
import { FileViewMode } from '../../types/file-view.types';
import { ChonkyIconName } from '../../types/icons.types';
import { useFileDrop } from '../../util/dnd';
import { useElementSize } from '../../util/hooks-helpers';
import { ChonkyIconContext } from '../../util/icon-helper';
import { c, getDndOverClasses } from '../../util/styles';
import { findClosestChonkyFileId } from '../external/FileContextMenu-hooks';
import { FileListEmpty } from './FileListEmpty';
import { GridContainer } from './GridContainer';
import { ListContainer } from './ListContainer';

export interface FileListProps {
    onScroll?: (e: UIEvent<HTMLDivElement>) => void;
}

export const FileList: React.FC<FileListProps> = React.memo((props: FileListProps) => {
    const displayFileIds = useSelector(selectors.getDisplayFileIds);
    const viewConfig = useSelector(selectFileViewConfig);

    const currentFolder = useSelector(selectCurrentFolder);
    const { drop, dndCanDrop, dndIsOver: dndIsOverCurrent } = useFileDrop({ file: currentFolder! });
    const { onScroll } = props;

    const ChonkyIcon = useContext(ChonkyIconContext);
    const dropRef = useRef<HTMLDivElement | null>(null);
    drop(dropRef);

    // Clicking empty space in the list (not a file) clears the selection, like in a
    // desktop file manager. Modifier clicks keep it so they can't wipe a selection by accident.
    const dispatch = useDispatch<any>();
    const clearSelectionOnOutsideClick = useSelector(selectClearSelectionOnOutsideClick);
    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            if (!clearSelectionOnOutsideClick || event.ctrlKey || event.metaKey || event.shiftKey) return;
            if (findClosestChonkyFileId(event.target)) return;
            dispatch(reduxActions.clearSelection());
        },
        [clearSelectionOnOutsideClick, dispatch]
    );

    // The list fills the wrapper. Users can wrap Chonky in their own `div` if they
    // want finer control over the height.
    const { width, height } = useElementSize(dropRef);
    let list: React.ReactNode = null;
    if (width > 0 && height > 0) {
        if (displayFileIds.length === 0) {
            list = <FileListEmpty width={width} height={viewConfig.entryHeight} />;
        } else if (viewConfig.mode === FileViewMode.List) {
            list = <ListContainer width={width} height={height} />;
        } else {
            list = <GridContainer width={width} height={height} />;
        }
    }

    return (
        <div onScroll={onScroll} onClick={handleClick} ref={dropRef} className={c('chonky-fileListWrapper', getDndOverClasses({ dndIsOver: dndIsOverCurrent, dndCanDrop }))} role="list">
            <div className="chonky-dndDropZone">
                <div className="chonky-dndDropZoneIcon">
                    <ChonkyIcon icon={dndCanDrop ? ChonkyIconName.dndCanDrop : ChonkyIconName.dndCannotDrop} />
                </div>
            </div>
            {/* Zero-size box so the list doesn't affect the size it is measured from */}
            <div style={{ overflow: 'visible', width: 0, height: 0 }}>{list}</div>
        </div>
    );
});
FileList.displayName = 'FileList';
