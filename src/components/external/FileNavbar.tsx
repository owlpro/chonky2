/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { ReactElement, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ChonkyActions } from '../../action-definitions/index';
import { reduxActions } from '../../redux/reducers';
import { selectSidebarMounted, selectSidebarOpen } from '../../redux/selectors';
import { ChonkyIconName } from '../../types/icons.types';
import { getI18nId, I18nNamespace, useIntl } from '../../util/i18n';
import { ChonkyIconContext } from '../../util/icon-helper';
import { ChonkyNarrowLayoutContext } from '../../util/styles';
import { useFolderChainItems } from './FileNavbar-hooks';
import { FolderChainButton } from './FolderChainButton';
import { SmartToolbarButton, ToolbarButton } from './ToolbarButton';
import { ToolbarSearch } from './ToolbarSearch';

export interface FileNavbarProps {}

/** Opens and closes the `FileSidebar`'s drawer while Chonky is narrow. */
const SidebarToggle: React.FC = () => {
    const dispatch = useDispatch<any>();
    const intl = useIntl();
    const open = useSelector(selectSidebarOpen);
    const label = intl.formatMessage({
        id: getI18nId(I18nNamespace.Toolbar, 'toggleSidebar'),
        defaultMessage: 'Sidebar',
    });
    return (
        <ToolbarButton
            className="chonky-sidebarToggle"
            text={label}
            icon={ChonkyIconName.sidebar}
            iconOnly={true}
            active={open}
            onClick={() => dispatch(reduxActions.setSidebarOpen(!open))}
        />
    );
};

/**
 * Navigation bar: Back, Forward and Up buttons, then an address bar with the folder
 * chain and the search field. While Chonky is narrow, e.g. on a phone, a menu button
 * that opens the `FileSidebar` takes the place of Forward.
 */
export const FileNavbar: React.FC<FileNavbarProps> = React.memo(() => {
    const folderChainItems = useFolderChainItems();
    const ChonkyIcon = useContext(ChonkyIconContext);
    const narrow = useContext(ChonkyNarrowLayoutContext);
    const sidebarMounted = useSelector(selectSidebarMounted);

    const folderChainComponents = useMemo(() => {
        const components: ReactElement[] = [];
        for (let i = 0; i < folderChainItems.length; ++i) {
            if (i > 0) {
                components.push(
                    <li key={`folder-chain-separator-${i}`} className="chonky-separator" aria-hidden="true">
                        <ChonkyIcon icon={ChonkyIconName.folderChainSeparator} />
                    </li>
                );
            }
            components.push(
                <li key={`folder-chain-${i}`}>
                    <FolderChainButton
                        first={i === 0}
                        current={i === folderChainItems.length - 1}
                        item={folderChainItems[i]!}
                    />
                </li>
            );
        }
        return components;
    }, [ChonkyIcon, folderChainItems]);

    // Long paths overflow to the left, so the current folder stays visible.
    const breadcrumbsRef = useRef<HTMLOListElement>(null);
    useLayoutEffect(() => {
        const breadcrumbs = breadcrumbsRef.current;
        if (breadcrumbs) breadcrumbs.scrollLeft = breadcrumbs.scrollWidth;
    }, [folderChainItems]);

    return (
        <div className="chonky-navbar">
            <div className="chonky-navbarButtons">
                {narrow && sidebarMounted && <SidebarToggle />}
                <SmartToolbarButton fileActionId={ChonkyActions.GoBack.id} />
                {!narrow && <SmartToolbarButton fileActionId={ChonkyActions.GoForward.id} />}
                <SmartToolbarButton fileActionId={ChonkyActions.OpenParentFolder.id} />
            </div>
            <div className="chonky-addressBar">
                <ol ref={breadcrumbsRef} className="chonky-breadcrumbs" aria-label="breadcrumb">
                    {folderChainComponents}
                </ol>
                <ToolbarSearch />
            </div>
        </div>
    );
});
