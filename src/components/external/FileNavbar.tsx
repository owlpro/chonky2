/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { ReactElement, useMemo } from 'react';

import { ChonkyActions } from '../../action-definitions/index';
import { useFolderChainItems } from './FileNavbar-hooks';
import { FolderChainButton } from './FolderChainButton';
import { SmartToolbarButton } from './ToolbarButton';

export interface FileNavbarProps {}

export const FileNavbar: React.FC<FileNavbarProps> = React.memo(() => {
    const folderChainItems = useFolderChainItems();

    const folderChainComponents = useMemo(() => {
        const components: ReactElement[] = [];
        for (let i = 0; i < folderChainItems.length; ++i) {
            if (i > 0) {
                components.push(
                    <li key={`folder-chain-separator-${i}`} className="chonky-separator" aria-hidden="true">
                        /
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
    }, [folderChainItems]);

    return (
        <div className="chonky-navbarWrapper">
            <div className="chonky-navbarContainer">
                <SmartToolbarButton fileActionId={ChonkyActions.OpenParentFolder.id} />
                <ol className="chonky-navbarBreadcrumbs" aria-label="breadcrumb">
                    {folderChainComponents}
                </ol>
            </div>
        </div>
    );
});
