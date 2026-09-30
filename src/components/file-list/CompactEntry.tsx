import React from 'react';

import { FileEntryProps } from '../../types/file-list.types';
import { useLocalizedFileEntryStrings } from '../../util/i18n';
import { c } from '../../util/styles';
import { TextPlaceholder } from '../external/TextPlaceholder';
import { useFileEntryHtmlProps, useFileEntryState } from './FileEntry-hooks';
import { FileIcon } from './FileEntryIcon';
import { FileEntryName } from './FileEntryName';
import { getEntryColorStyle, getEntryStateClasses } from './GridEntryPreview';

const COMPACT_ICON_SIZE = 32;

export const CompactEntry: React.FC<FileEntryProps> = React.memo(({ file, selected, focused, dndState }) => {
    const entryState = useFileEntryState(file, selected, focused);
    const { fileModDateString, fileModTimeString, fileSizeString } = useLocalizedFileEntryStrings(file);
    const fileEntryHtmlProps = useFileEntryHtmlProps(file);
    const modified = [fileModDateString, fileModTimeString].filter(Boolean).join(' ');
    const details = [fileSizeString, modified].filter(Boolean).join(' · ');

    return (
        <div
            className={c('chonky-compactFileEntry', getEntryStateClasses(entryState, dndState))}
            style={getEntryColorStyle(entryState)}
            {...fileEntryHtmlProps}
        >
            <FileIcon file={file} entryState={entryState} size={COMPACT_ICON_SIZE} />
            <div className="chonky-compactFileEntryText">
                <FileEntryName className="chonky-compactFileEntryName" file={file} />
                <span className="chonky-compactFileEntryDetails">
                    {file ? details : <TextPlaceholder minLength={10} maxLength={20} />}
                </span>
            </div>
        </div>
    );
});
CompactEntry.displayName = 'CompactEntry';
