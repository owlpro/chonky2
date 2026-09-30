import React from 'react';

import { FileEntryProps } from '../../types/file-list.types';
import { useLocalizedFileEntryStrings } from '../../util/i18n';
import { c } from '../../util/styles';
import { TextPlaceholder } from '../external/TextPlaceholder';
import { useFileEntryHtmlProps, useFileEntryState } from './FileEntry-hooks';
import { FileIcon } from './FileEntryIcon';
import { FileEntryName } from './FileEntryName';
import { getEntryColorStyle, getEntryStateClasses } from './GridEntryPreview';

const LIST_ICON_SIZE = 20;

export const ListEntry: React.FC<FileEntryProps> = React.memo(({ file, selected, focused, dndState }) => {
    const entryState = useFileEntryState(file, selected, focused);
    const { fileModDateString, fileModTimeString, fileSizeString, fileTypeString } = useLocalizedFileEntryStrings(file);
    const fileEntryHtmlProps = useFileEntryHtmlProps(file);

    const renderProperty = (value: string | null, placeholderLength: [number, number]) =>
        file ? (value ?? '') : <TextPlaceholder minLength={placeholderLength[0]} maxLength={placeholderLength[1]} />;

    return (
        <div
            className={c('chonky-listFileEntry', getEntryStateClasses(entryState, dndState))}
            style={getEntryColorStyle(entryState)}
            {...fileEntryHtmlProps}
        >
            <div className="chonky-listCell chonky-listCellName">
                <FileIcon file={file} entryState={entryState} size={LIST_ICON_SIZE} />
                <FileEntryName className="chonky-listFileEntryName" file={file} />
            </div>
            <div className="chonky-listCell chonky-listColumnType">{renderProperty(fileTypeString, [5, 10])}</div>
            <div className="chonky-listCell chonky-listColumnSize">{renderProperty(fileSizeString, [4, 8])}</div>
            <div className="chonky-listCell chonky-listColumnDate">
                {file ? (
                    <>
                        <span className="chonky-listDate">{fileModDateString ?? ''}</span>
                        {fileModTimeString && <span className="chonky-listTime">{fileModTimeString}</span>}
                    </>
                ) : (
                    <TextPlaceholder minLength={10} maxLength={18} />
                )}
            </div>
        </div>
    );
});
ListEntry.displayName = 'ListEntry';
