/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { selectHiddenFileCount, selectors, selectSelectionSize } from '../../redux/selectors';
import { getI18nId, I18nNamespace, useIntl } from '../../util/i18n';

export interface ToolbarInfoProps {}

export const ToolbarInfo: React.FC<ToolbarInfoProps> = React.memo(() => {
    const displayFileIds = useSelector(selectors.getDisplayFileIds);
    const selectionSize = useSelector(selectSelectionSize);
    const hiddenCount = useSelector(selectHiddenFileCount);

    const intl = useIntl();
    const fileCountString = intl.formatMessage(
        {
            id: getI18nId(I18nNamespace.Toolbar, 'visibleFileCount'),
            defaultMessage: `{fileCount, plural,
                =0 {# items}
                one {# item}
                other {# items}
            }`,
        },
        { fileCount: displayFileIds.length }
    );
    const selectedString = intl.formatMessage(
        {
            id: getI18nId(I18nNamespace.Toolbar, 'selectedFileCount'),
            defaultMessage: `{fileCount, plural,
                =0 {}
                other {# selected}
            }`,
        },
        { fileCount: selectionSize }
    );
    const hiddenString = intl.formatMessage(
        {
            id: getI18nId(I18nNamespace.Toolbar, 'hiddenFileCount'),
            defaultMessage: `{fileCount, plural,
                =0 {}
                other {# hidden}
            }`,
        },
        { fileCount: hiddenCount }
    );

    return (
        <div className="chonky-statusBarInfo">
            <span>{fileCountString}</span>
            {selectedString && <span className="chonky-statusBarSelection">{selectedString}</span>}
            {hiddenString && <span>{hiddenString}</span>}
        </div>
    );
});
