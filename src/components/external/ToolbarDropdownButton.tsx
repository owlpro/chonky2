/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { useCallback, useContext } from 'react';
import { Nullable } from '../../types/util.types';

import { selectFileActionData } from '../../redux/selectors';
import { useParamSelector } from '../../redux/store';
import { ChonkyIconName } from '../../types/icons.types';
import { useFileActionProps, useFileActionTrigger } from '../../util/file-actions';
import { useLocalizedFileActionStrings } from '../../util/i18n';
import { ChonkyIconContext } from '../../util/icon-helper';
import { c } from '../../util/styles';

export interface ToolbarDropdownButtonProps {
    text: string;
    active?: boolean;
    icon?: Nullable<ChonkyIconName | string>;
    onClick?: () => void;
    disabled?: boolean;
}

export const ToolbarDropdownButton = React.forwardRef(
    (props: ToolbarDropdownButtonProps, ref: React.Ref<HTMLButtonElement>) => {
        const { text, active, icon, onClick, disabled } = props;
        const ChonkyIcon = useContext(ChonkyIconContext);

        return (
            <button
                ref={ref}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={c('chonky-menuItem', { 'chonky-activeButton': active })}
                onClick={onClick}
                disabled={disabled}
            >
                {icon && (
                    <span className="chonky-menuItemIcon">
                        <ChonkyIcon icon={icon} fixedWidth={true} />
                    </span>
                )}
                <span>{text}</span>
            </button>
        );
    }
);

export interface SmartToolbarDropdownButtonProps {
    fileActionId: string;
    onClickFollowUp?: () => void;
}

export const SmartToolbarDropdownButton = React.forwardRef(
    (props: SmartToolbarDropdownButtonProps, ref: React.Ref<HTMLButtonElement>) => {
        const { fileActionId, onClickFollowUp } = props;

        const action = useParamSelector(selectFileActionData, fileActionId) ?? null;
        const triggerAction = useFileActionTrigger(fileActionId);
        const { icon, active, disabled, hidden } = useFileActionProps(fileActionId);
        const { buttonName } = useLocalizedFileActionStrings(action);

        // Combine external click handler with internal one
        const handleClick = useCallback(() => {
            triggerAction();
            if (onClickFollowUp) onClickFollowUp();
        }, [onClickFollowUp, triggerAction]);

        if (!action) return null;
        const { button } = action;
        if (!button) return null;
        if (hidden) return null;

        return (
            <ToolbarDropdownButton
                ref={ref}
                text={buttonName}
                icon={icon}
                onClick={handleClick}
                active={active}
                disabled={disabled}
            />
        );
    }
);
