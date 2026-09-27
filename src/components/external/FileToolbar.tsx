import React, { ReactElement, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { selectCurrentFolder, selectToolbarItems } from '../../redux/selectors';
import { FolderIcon } from '../file-list/FileEntryIcon';
import { SmartToolbarButton } from './ToolbarButton';
import { ToolbarDropdown } from './ToolbarDropdown';

export interface FileToolbarProps {}

/**
 * Top bar: the current folder's name, a menu bar with one menu per action group,
 * and buttons for the actions that are not in a group.
 */
export const FileToolbar: React.FC<FileToolbarProps> = React.memo(() => {
    const toolbarItems = useSelector(selectToolbarItems);
    const currentFolder = useSelector(selectCurrentFolder);

    const [menus, buttons] = useMemo(() => {
        const menuComponents: ReactElement[] = [];
        const buttonComponents: ReactElement[] = [];
        for (const item of toolbarItems) {
            if (typeof item === 'string') {
                buttonComponents.push(<SmartToolbarButton key={`toolbar-item-${item}`} fileActionId={item} />);
            } else {
                menuComponents.push(
                    <ToolbarDropdown key={`toolbar-item-${item.name}`} name={item.name} fileActionIds={item.fileActionIds} />
                );
            }
        }
        return [menuComponents, buttonComponents];
    }, [toolbarItems]);

    return (
        <div className="chonky-toolbar">
            {currentFolder && (
                <div className="chonky-toolbarTitle" title={currentFolder.name}>
                    <FolderIcon size={20} />
                    <span className="chonky-toolbarTitleText">{currentFolder.name}</span>
                </div>
            )}
            {menus.length > 0 && (
                <div className="chonky-menuBar" role="menubar">
                    {menus}
                </div>
            )}
            <div className="chonky-toolbarActions">{buttons}</div>
        </div>
    );
});
