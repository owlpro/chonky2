import React, { useContext } from 'react';

import { FileEntryProps } from '../../types/file-list.types';
import { useLocalizedFileEntryStrings } from '../../util/i18n';
import { ChonkyIconContext } from '../../util/icon-helper';
import { c, getDndOverClasses } from '../../util/styles';
import { TextPlaceholder } from '../external/TextPlaceholder';
import {
    useDndIcon,
    useFileEntryHtmlProps,
    useFileEntryState,
} from './FileEntry-hooks';
import { FileEntryName } from './FileEntryName';
import { FileEntryState, getEntryColorStyle, getEntryStateClasses } from './GridEntryPreview';

export const ListEntry: React.FC<FileEntryProps> = React.memo(
    ({ file, selected, focused, dndState }) => {
        const entryState: FileEntryState = useFileEntryState(file, selected, focused);
        const dndIconName = useDndIcon(dndState);

        const { fileModDateString, fileSizeString } = useLocalizedFileEntryStrings(
            file
        );
        const ChonkyIcon = useContext(ChonkyIconContext);
        const fileEntryHtmlProps = useFileEntryHtmlProps(file);
        return (
            <div
                className={c('chonky-listFileEntry', getEntryStateClasses(entryState), getDndOverClasses(dndState))}
                style={getEntryColorStyle(entryState)}
                {...fileEntryHtmlProps}
            >
                <div className="chonky-focusIndicator"></div>
                <div className="chonky-selectionIndicator"></div>
                <div className="chonky-listFileEntryIcon">
                    <ChonkyIcon
                        icon={dndIconName ?? entryState.icon}
                        spin={dndIconName ? false : entryState.iconSpin}
                        fixedWidth={true}
                    />
                </div>
                <div
                    className="chonky-listFileEntryName"
                    title={file ? file.name : undefined}
                >
                    <FileEntryName file={file} />
                </div>
                <div className="chonky-listFileEntryProperty">
                    {file ? (
                        fileModDateString ?? <span>—</span>
                    ) : (
                        <TextPlaceholder minLength={5} maxLength={15} />
                    )}
                </div>
                <div className="chonky-listFileEntryProperty">
                    {file ? (
                        fileSizeString ?? <span>—</span>
                    ) : (
                        <TextPlaceholder minLength={10} maxLength={20} />
                    )}
                </div>
            </div>
        );
    }
);
