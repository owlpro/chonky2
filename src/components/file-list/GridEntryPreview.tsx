import React, { CSSProperties, useContext } from 'react';
import { Nullable } from '../../types/util.types';

import { DndEntryState } from '../../types/file-list.types';
import { ChonkyIconName } from '../../types/icons.types';
import { ChonkyIconContext } from '../../util/icon-helper';
import { c } from '../../util/styles';
import { FileThumbnail } from './FileThumbnail';
import { GridEntryDndIndicator } from './GridEntryDndIndicator';

export type FileEntryState = {
    childrenCount: Nullable<number>;
    color: string;
    icon: ChonkyIconName | string;
    thumbnailUrl: Nullable<string>;
    iconSpin: boolean;
    selected: boolean;
    focused: boolean;
};

/**
 * State classes for the root element of a file entry. Styles in `chonky.css` hang
 * selection, focus and thumbnail looks off these.
 */
export const getEntryStateClasses = (entryState: FileEntryState) => ({
    'chonky-selected': entryState.selected,
    'chonky-focused': entryState.focused,
    'chonky-has-thumbnail': !!entryState.thumbnailUrl,
});

export const getEntryColorStyle = (entryState: FileEntryState) =>
    ({ '--chonky-entry-color': entryState.color }) as CSSProperties;

export interface FileEntryPreviewProps {
    className?: string;
    entryState: FileEntryState;
    dndState: DndEntryState;
}

export const GridEntryPreviewFolder: React.FC<FileEntryPreviewProps> = React.memo(props => {
    const { className: externalClassName, entryState, dndState } = props;

    return (
        <div className={c('chonky-gridPreviewFolder', externalClassName)}>
            <div className="chonky-folderBackSideMid">
                <div className="chonky-folderBackSideTop" />
                <div className="chonky-folderFrontSide">
                    <GridEntryDndIndicator dndState={dndState} />
                    <div className="chonky-gridFileIcon">{entryState.childrenCount}</div>
                    <div className="chonky-selectionIndicator"></div>
                    <FileThumbnail className="chonky-gridThumbnail" thumbnailUrl={entryState.thumbnailUrl} />
                </div>
            </div>
        </div>
    );
});
GridEntryPreviewFolder.displayName = 'GridEntryPreviewFolder';

export const GridEntryPreviewFile: React.FC<FileEntryPreviewProps> = React.memo(props => {
    const { className: externalClassName, entryState, dndState } = props;

    const ChonkyIcon = useContext(ChonkyIconContext);
    return (
        <div className={c('chonky-gridPreviewFile', externalClassName)}>
            <GridEntryDndIndicator dndState={dndState} />
            <div className="chonky-gridFileIcon">
                <ChonkyIcon icon={entryState.icon} spin={entryState.iconSpin} />
            </div>
            <div className="chonky-selectionIndicator"></div>
            <FileThumbnail className="chonky-gridThumbnail" thumbnailUrl={entryState.thumbnailUrl} />
        </div>
    );
});
GridEntryPreviewFile.displayName = 'GridEntryPreviewFile';
