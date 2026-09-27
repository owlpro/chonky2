/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { ReactElement, useContext, useLayoutEffect, useMemo, useRef } from 'react';

import { ChonkyActions } from '../../action-definitions/index';
import { ChonkyIconName } from '../../types/icons.types';
import { ChonkyIconContext } from '../../util/icon-helper';
import { useFolderChainItems } from './FileNavbar-hooks';
import { FolderChainButton } from './FolderChainButton';
import { SmartToolbarButton } from './ToolbarButton';
import { ToolbarSearch } from './ToolbarSearch';

export interface FileNavbarProps {}

/**
 * Navigation bar: Back, Forward and Up buttons, then an address bar with the folder
 * chain and the search field.
 */
export const FileNavbar: React.FC<FileNavbarProps> = React.memo(() => {
    const folderChainItems = useFolderChainItems();
    const ChonkyIcon = useContext(ChonkyIconContext);

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
                <SmartToolbarButton fileActionId={ChonkyActions.GoBack.id} />
                <SmartToolbarButton fileActionId={ChonkyActions.GoForward.id} />
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
