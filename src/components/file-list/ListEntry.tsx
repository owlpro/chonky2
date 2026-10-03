import React from 'react';

import { FileEntryProps } from '../../types/file-list.types';
import { useLocalizedFileEntryStrings } from '../../util/i18n';
import { c } from '../../util/styles';
import { TextPlaceholder } from '../external/TextPlaceholder';
import { useFileEntryHtmlProps, useFileEntryState } from './FileEntry-hooks';
import { FileIcon } from './FileEntryIcon';
import { FileEntryName } from './FileEntryName';
import { FileThumbnail } from './FileThumbnail';
import { getEntryColorStyle, getEntryStateClasses } from './GridEntryPreview';

const LIST_ICON_SIZE = 20;
const NARROW_LIST_ICON_SIZE = 40;

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

/**
 * List row while Chonky is narrow, e.g. on a phone: the thumbnail or icon, then the name
 * with the modification date and the size (or item count) on a second line.
 */
export const NarrowListEntry: React.FC<FileEntryProps> = React.memo(({ file, selected, focused, dndState }) => {
    const entryState = useFileEntryState(file, selected, focused);
    const { fileModDateString, fileModTimeString, fileSizeString } = useLocalizedFileEntryStrings(file);
    const fileEntryHtmlProps = useFileEntryHtmlProps(file);
    const modified = [fileModDateString, fileModTimeString].filter(Boolean).join(' ');

    return (
        <div
            className={c('chonky-narrowFileEntry', getEntryStateClasses(entryState, dndState))}
            style={getEntryColorStyle(entryState)}
            {...fileEntryHtmlProps}
        >
            <div className="chonky-narrowFileEntryPreview">
                {entryState.thumbnailUrl ? (
                    <FileThumbnail
                        key={entryState.thumbnailUrl}
                        className="chonky-narrowThumbnail"
                        thumbnailUrl={entryState.thumbnailUrl}
                    />
                ) : (
                    <FileIcon file={file} entryState={entryState} size={NARROW_LIST_ICON_SIZE} />
                )}
            </div>
            <div className="chonky-narrowFileEntryText">
                <FileEntryName className="chonky-narrowFileEntryName" file={file} />
                <div className="chonky-narrowFileEntryDetails">
                    {file ? (
                        <>
                            <span className="chonky-narrowFileEntryDate">{modified}</span>
                            {fileSizeString && <span className="chonky-narrowFileEntrySize">{fileSizeString}</span>}
                        </>
                    ) : (
                        <TextPlaceholder minLength={10} maxLength={18} />
                    )}
                </div>
            </div>
        </div>
    );
});
NarrowListEntry.displayName = 'NarrowListEntry';
