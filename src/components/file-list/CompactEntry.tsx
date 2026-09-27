import React, { useContext } from 'react';

import { FileEntryProps } from '../../types/file-list.types';
import { useLocalizedFileEntryStrings } from '../../util/i18n';
import { ChonkyIconContext } from '../../util/icon-helper';
import { TextPlaceholder } from '../external/TextPlaceholder';
import { useFileEntryHtmlProps, useFileEntryState } from './FileEntry-hooks';
import { FileEntryName } from './FileEntryName';
import { FileEntryState, getEntryColorStyle } from './GridEntryPreview';

export const CompactEntry: React.FC<FileEntryProps> = React.memo(
    ({ file, selected, focused }) => {
        const entryState: FileEntryState = useFileEntryState(file, selected, focused);

        const { fileModDateString, fileSizeString } = useLocalizedFileEntryStrings(
            file
        );

        const ChonkyIcon = useContext(ChonkyIconContext);
        const fileEntryHtmlProps = useFileEntryHtmlProps(file);
        return (
            <div className="chonky-compactFileEntry" style={getEntryColorStyle(entryState)} {...fileEntryHtmlProps}>
                <div className="chonky-compactFileEntryIcon">
                    <ChonkyIcon
                        icon={entryState.icon}
                        spin={entryState.iconSpin}
                        fixedWidth={true}
                    />
                </div>
                <div className="chonky-compactFileEntryDescription">
                    <div
                        className="chonky-compactFileEntryName"
                        title={file ? file.name : undefined}
                    >
                        <FileEntryName file={file} />
                    </div>
                    <div className="chonky-compactFileEntryProperties">
                        <div className="chonky-compactFileEntryProperty">
                            {file ? (
                                fileModDateString ?? <span>—</span>
                            ) : (
                                <TextPlaceholder minLength={5} maxLength={15} />
                            )}
                        </div>
                        <div className="chonky-compactFileEntryProperty">
                            {file ? (
                                fileSizeString ?? <span>—</span>
                            ) : (
                                <TextPlaceholder minLength={10} maxLength={20} />
                            )}
                        </div>
                    </div>
                </div>
                <div className="chonky-file-entry-outline"></div>
                <div className="chonky-file-entry-selection"></div>
            </div>
        );
    }
);
