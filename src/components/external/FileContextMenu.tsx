/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { ReactElement, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { reduxActions } from '../../redux/reducers';
import { selectContextMenuConfig, selectContextMenuItems } from '../../redux/selectors';
import { getI18nId, I18nNamespace, useIntl } from '../../util/i18n';
import { ChonkyMenu } from '../internal/ChonkyMenu';
import { useContextMenuDismisser } from './FileContextMenu-hooks';
import { SmartToolbarDropdownButton } from './ToolbarDropdownButton';

export interface FileContextMenuProps {}

export const FileContextMenu: React.FC<FileContextMenuProps> = React.memo(() => {
    const dispatch = useDispatch<any>();
    useEffect(() => {
        dispatch(reduxActions.setContextMenuMounted(true));
        return () => {
            dispatch(reduxActions.setContextMenuMounted(false));
        };
    }, [dispatch]);

    const intl = useIntl();
    const browserMenuShortcutString = intl.formatMessage(
        {
            id: getI18nId(I18nNamespace.FileContextMenu, 'browserMenuShortcut'),
            defaultMessage: 'Browser menu: {shortcut}',
        },
        { shortcut: <strong key="shortcut">Alt + Right Click</strong> }
    );

    const contextMenuConfig = useSelector(selectContextMenuConfig);
    const contextMenuItems = useSelector(selectContextMenuItems);

    const hideContextMenu = useContextMenuDismisser();
    const contextMenuItemComponents = useMemo(() => {
        const components: ReactElement[] = [];
        for (let i = 0; i < contextMenuItems.length; ++i) {
            const item = contextMenuItems[i];

            if (typeof item === 'string') {
                components.push(
                    <SmartToolbarDropdownButton
                        key={`context-menu-item-${item}`}
                        fileActionId={item}
                        onClickFollowUp={hideContextMenu}
                    />
                );
            } else {
                item?.fileActionIds.map(id =>
                    components.push(
                        <SmartToolbarDropdownButton
                            key={`context-menu-item-${item.name}-${id}`}
                            fileActionId={id}
                            onClickFollowUp={hideContextMenu}
                        />
                    )
                );
            }
        }
        return components;
    }, [contextMenuItems, hideContextMenu]);

    const anchorPosition = useMemo(
        () => (contextMenuConfig ? { top: contextMenuConfig.mouseY, left: contextMenuConfig.mouseX } : undefined),
        [contextMenuConfig]
    );

    return (
        <ChonkyMenu onClose={hideContextMenu} open={!!contextMenuConfig} anchorPosition={anchorPosition}>
            {contextMenuItemComponents}
            <div className="chonky-browserMenuTooltip">{browserMenuShortcutString}</div>
        </ChonkyMenu>
    );
});
