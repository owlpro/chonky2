import React from 'react';

import { FileEntryProps } from '../../types/file-list.types';
import { FileHelper } from '../../util/file-helper';
import { c } from '../../util/styles';
import { useFileEntryHtmlProps, useFileEntryState } from './FileEntry-hooks';
import { FileEntryName } from './FileEntryName';
import {
    getEntryColorStyle,
    getEntryStateClasses,
    GridEntryPreviewFile,
    GridEntryPreviewFolder,
} from './GridEntryPreview';

export const GridEntry: React.FC<FileEntryProps> = React.memo(({ file, selected, focused, dndState }) => {
    const isDirectory = FileHelper.isDirectory(file);
    const entryState = useFileEntryState(file, selected, focused);

    const fileEntryHtmlProps = useFileEntryHtmlProps(file);
    return (
        <div
            className={c('chonky-gridFileEntry', getEntryStateClasses(entryState))}
            style={getEntryColorStyle(entryState)}
            {...fileEntryHtmlProps}
        >
            {isDirectory ? (
                <GridEntryPreviewFolder
                    className="chonky-gridFileEntryPreview"
                    entryState={entryState}
                    dndState={dndState}
                />
            ) : (
                <GridEntryPreviewFile
                    className="chonky-gridFileEntryPreview"
                    entryState={entryState}
                    dndState={dndState}
                />
            )}
            <div className="chonky-gridFileEntryNameContainer">
                <FileEntryName className="chonky-gridFileEntryName" file={file} />
            </div>
        </div>
    );
});
GridEntry.displayName = 'GridEntry';
