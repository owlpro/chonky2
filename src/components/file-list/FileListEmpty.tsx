/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { CSSProperties, useContext } from 'react';

import { ChonkyIconName } from '../../types/icons.types';
import { getI18nId, I18nNamespace, useIntl } from '../../util/i18n';
import { ChonkyIconContext } from '../../util/icon-helper';

export interface FileListEmptyProps {
    width: number;
    height: number;
}

export const FileListEmpty: React.FC<FileListEmptyProps> = props => {
    const { width, height } = props;
    const ChonkyIcon = useContext(ChonkyIconContext);
    const style: CSSProperties = {
        width,
        height,
    };

    const intl = useIntl();
    const emptyString = intl.formatMessage({
        id: getI18nId(I18nNamespace.FileList, 'nothingToShow'),
        defaultMessage: 'Nothing to show',
    });

    return (
        <div className="chonky-fileListEmpty" style={style}>
            <div className="chonky-fileListEmptyContent">
                <ChonkyIcon icon={ChonkyIconName.folderOpen} />
                &nbsp; {emptyString}
            </div>
        </div>
    );
};
