/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { CSSProperties } from 'react';

import { getI18nId, I18nNamespace, useIntl } from '../../util/i18n';
import { FolderIcon } from './FileEntryIcon';

export interface FileListEmptyProps {
    width: number;
    height: number;
}

export const FileListEmpty: React.FC<FileListEmptyProps> = (props) => {
    const { width, height } = props;
    const style: CSSProperties = { width, height };

    const intl = useIntl();
    const emptyString = intl.formatMessage({
        id: getI18nId(I18nNamespace.FileList, 'nothingToShow'),
        defaultMessage: 'Nothing to show',
    });

    return (
        <div className="chonky-fileListEmpty" style={style}>
            <FolderIcon size={48} />
            <span>{emptyString}</span>
        </div>
    );
};
