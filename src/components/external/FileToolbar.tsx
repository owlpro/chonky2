import React, { ReactElement, ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { selectFileActionMap, selectToolbarItems } from '../../redux/selectors';
import { SmartToolbarButton } from './ToolbarButton';
import { ToolbarDropdown } from './ToolbarDropdown';

const ToolbarDivider = () => <div className="chonky-toolbarDivider" role="separator" aria-orientation="vertical" />;

export interface FileToolbarProps {
    /** Rendered at the start of the toolbar, before the menus. */
    startContent?: ReactNode;
    /**
     * Rendered at the end of the toolbar, after the view mode buttons and a divider,
     * e.g. a button that closes the dialog Chonky is shown in. `ToolbarButton` matches
     * the look of Chonky's own buttons.
     */
    endContent?: ReactNode;
}

/**
 * Top bar: a menu bar with one menu per action group, then buttons for the actions
 * that are not in a group, with the view mode buttons after a divider.
 */
export const FileToolbar: React.FC<FileToolbarProps> = React.memo(({ startContent, endContent }) => {
    const toolbarItems = useSelector(selectToolbarItems);
    const fileActionMap = useSelector(selectFileActionMap);

    const [menus, buttons, viewButtons] = useMemo(() => {
        const menuComponents: ReactElement[] = [];
        const buttonComponents: ReactElement[] = [];
        const viewButtonComponents: ReactElement[] = [];
        for (const item of toolbarItems) {
            if (typeof item === 'string') {
                const button = <SmartToolbarButton key={`toolbar-item-${item}`} fileActionId={item} />;
                if (fileActionMap[item]?.fileViewConfig) viewButtonComponents.push(button);
                else buttonComponents.push(button);
            } else {
                menuComponents.push(
                    <ToolbarDropdown key={`toolbar-item-${item.name}`} name={item.name} fileActionIds={item.fileActionIds} />
                );
            }
        }
        return [menuComponents, buttonComponents, viewButtonComponents];
    }, [fileActionMap, toolbarItems]);

    const hasButtons = buttons.length > 0 || viewButtons.length > 0;
    return (
        <div className="chonky-toolbar">
            {startContent}
            {menus.length > 0 && (
                <div className="chonky-menuBar" role="menubar">
                    {menus}
                </div>
            )}
            <div className="chonky-toolbarActions">
                {buttons}
                {buttons.length > 0 && viewButtons.length > 0 && <ToolbarDivider />}
                {viewButtons}
                {hasButtons && !!endContent && <ToolbarDivider />}
                {endContent}
            </div>
        </div>
    );
});
