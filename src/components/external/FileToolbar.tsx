import React, { ReactElement, ReactNode, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { selectFileActionMap, selectToolbarItems } from '../../redux/selectors';
import { ChonkyIconName } from '../../types/icons.types';
import { getI18nId, I18nNamespace, useIntl } from '../../util/i18n';
import { ChonkyNarrowLayoutContext } from '../../util/styles';
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
 * that are not in a group, with the view mode buttons after a divider. While Chonky is
 * narrow, e.g. on a phone, the buttons other than the view modes go into a "More" menu.
 */
export const FileToolbar: React.FC<FileToolbarProps> = React.memo(({ startContent, endContent }) => {
    const intl = useIntl();
    const toolbarItems = useSelector(selectToolbarItems);
    const fileActionMap = useSelector(selectFileActionMap);
    const narrow = useContext(ChonkyNarrowLayoutContext);

    const moreLabel = intl.formatMessage({
        id: getI18nId(I18nNamespace.Toolbar, 'moreActions'),
        defaultMessage: 'More',
    });
    const [menus, buttons, viewButtons] = useMemo(() => {
        const menuComponents: ReactElement[] = [];
        const buttonIds: string[] = [];
        const viewButtonComponents: ReactElement[] = [];
        for (const item of toolbarItems) {
            if (typeof item === 'string') {
                if (fileActionMap[item]?.fileViewConfig) {
                    viewButtonComponents.push(<SmartToolbarButton key={`toolbar-item-${item}`} fileActionId={item} />);
                } else {
                    buttonIds.push(item);
                }
            } else {
                menuComponents.push(
                    <ToolbarDropdown key={`toolbar-item-${item.name}`} name={item.name} fileActionIds={item.fileActionIds} />
                );
            }
        }
        let buttonComponents: ReactElement[];
        if (narrow && buttonIds.length > 1) {
            buttonComponents = [
                <ToolbarDropdown
                    key="toolbar-more"
                    name="more"
                    label={moreLabel}
                    icon={ChonkyIconName.more}
                    fileActionIds={buttonIds}
                />,
            ];
        } else {
            buttonComponents = buttonIds.map((id) => <SmartToolbarButton key={`toolbar-item-${id}`} fileActionId={id} />);
        }
        return [menuComponents, buttonComponents, viewButtonComponents];
    }, [fileActionMap, toolbarItems, narrow, moreLabel]);

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
