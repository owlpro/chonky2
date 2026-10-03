/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { useCallback, useMemo } from 'react';

import { FileActionGroup } from '../../types/action-menus.types';
import { ChonkyIconName } from '../../types/icons.types';
import { useLocalizedFileActionGroup } from '../../util/i18n';
import { ChonkyMenu } from '../internal/ChonkyMenu';
import { ToolbarButton } from './ToolbarButton';
import { SmartToolbarDropdownButton } from './ToolbarDropdownButton';

export type ToolbarDropdownProps = FileActionGroup & {
    /** Shown instead of the group's localized name. */
    label?: string;
    /**
     * Makes the button show only this icon, with the name as its tooltip: a
     * `ChonkyIconName`, an icon name the `iconComponent` knows, or any element.
     */
    icon?: ChonkyIconName | string | React.ReactElement;
};

export const ToolbarDropdown: React.FC<ToolbarDropdownProps> = React.memo(props => {
    const { name, fileActionIds, label, icon } = props;
    const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            const button = event.currentTarget;
            setAnchor((current) => (current ? null : button));
        },
        [setAnchor]
    );
    const handleClose = useCallback(() => setAnchor(null), [setAnchor]);

    const menuItemComponents = useMemo(
        () =>
            fileActionIds.map(id => (
                <SmartToolbarDropdownButton
                    key={`menu-item-${id}`}
                    fileActionId={id}
                    onClickFollowUp={handleClose}
                />
            )),
        [fileActionIds, handleClose]
    );

    const localizedName = useLocalizedFileActionGroup(name);
    return (
        <>
            <ToolbarButton
                className="chonky-menuBarButton"
                text={label ?? localizedName}
                icon={icon}
                iconOnly={!!icon}
                onClick={handleClick}
                active={Boolean(anchor)}
            />
            <ChonkyMenu anchorEl={anchor} onClose={handleClose} open={Boolean(anchor)}>
                {menuItemComponents}
            </ChonkyMenu>
        </>
    );
});
