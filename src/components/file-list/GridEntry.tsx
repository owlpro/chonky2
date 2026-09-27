import React from 'react';

import { FileEntryProps } from '../../types/file-list.types';
import { c } from '../../util/styles';
import { useFileEntryHtmlProps, useFileEntryState } from './FileEntry-hooks';
import { FileIcon } from './FileEntryIcon';
import { FileEntryName } from './FileEntryName';
import { FileThumbnail } from './FileThumbnail';
import { getEntryColorStyle, getEntryStateClasses } from './GridEntryPreview';

const GRID_ICON_SIZE = 64;

export const GridEntry: React.FC<FileEntryProps> = React.memo(({ file, selected, focused, dndState }) => {
    const entryState = useFileEntryState(file, selected, focused);
    const fileEntryHtmlProps = useFileEntryHtmlProps(file);
    return (
        <div
            className={c('chonky-gridFileEntry', getEntryStateClasses(entryState, dndState))}
            style={getEntryColorStyle(entryState)}
            {...fileEntryHtmlProps}
        >
            <div className="chonky-gridFileEntryPreview">
                {entryState.thumbnailUrl ? (
                    <FileThumbnail className="chonky-gridThumbnail" thumbnailUrl={entryState.thumbnailUrl} />
                ) : (
                    <FileIcon file={file} entryState={entryState} size={GRID_ICON_SIZE} />
                )}
            </div>
            <FileEntryName className="chonky-gridFileEntryName" file={file} />
        </div>
    );
});
GridEntry.displayName = 'GridEntry';
