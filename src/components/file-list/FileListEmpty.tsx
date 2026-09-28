/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { CSSProperties, useContext } from 'react';

import { ChonkyIconName } from '../../types/icons.types';
import { getI18nId, I18nNamespace, useIntl } from '../../util/i18n';
import { ChonkyIconContext } from '../../util/icon-helper';
import { FolderIcon } from './FileEntryIcon';

export interface FileListEmptyProps {
    width: number;
    height: number;
    /** The folder is still loading, so a spinner is shown instead of "Nothing to show". */
    loading?: boolean;
}

export const FileListEmpty: React.FC<FileListEmptyProps> = (props) => {
    const { width, height, loading } = props;
    const style: CSSProperties = { width, height };
    const ChonkyIcon = useContext(ChonkyIconContext);

    const intl = useIntl();
    const message = loading
        ? intl.formatMessage({ id: getI18nId(I18nNamespace.FileList, 'loading'), defaultMessage: 'Loading…' })
        : intl.formatMessage({ id: getI18nId(I18nNamespace.FileList, 'nothingToShow'), defaultMessage: 'Nothing to show' });

    return (
        <div className="chonky-fileListEmpty" style={style}>
            {loading ? <ChonkyIcon icon={ChonkyIconName.loading} spin style={{ fontSize: 28 }} /> : <FolderIcon size={48} />}
            <span>{message}</span>
        </div>
    );
};
