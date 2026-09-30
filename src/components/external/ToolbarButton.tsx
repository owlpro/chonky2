/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { useContext } from 'react';
import { Nullable } from '../../types/util.types';

import { selectFileActionData } from '../../redux/selectors';
import { useParamSelector } from '../../redux/store';
import { ChonkyIconName } from '../../types/icons.types';
import { useFileActionProps, useFileActionTrigger } from '../../util/file-actions';
import { useLocalizedFileActionStrings } from '../../util/i18n';
import { ChonkyIconContext } from '../../util/icon-helper';
import { c } from '../../util/styles';

export interface ToolbarButtonProps {
    className?: string;
    text: string;
    tooltip?: string;
    active?: boolean;
    /** A `ChonkyIconName`, an icon name the `iconComponent` knows, or any element. */
    icon?: Nullable<ChonkyIconName | string | React.ReactElement>;
    iconOnly?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    dropdown?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = React.memo(props => {
    const {
        className: externalClassName,
        text,
        tooltip,
        active,
        icon,
        iconOnly,
        onClick,
        disabled,
        dropdown,
    } = props;
    const ChonkyIcon = useContext(ChonkyIconContext);

    const iconComponent = React.isValidElement(icon) ? (
        <div className="chonky-iconWithText">{icon}</div>
    ) : icon || iconOnly ? (
            iconOnly ? (
                <ChonkyIcon
                    icon={(icon as string) || ChonkyIconName.fallbackIcon}
                    size={18}
                    style={{ minWidth: 18, minHeight: 18 }}
                    fixedWidth={true}
                />
            ) : (
                <div className="chonky-iconWithText">
                    <ChonkyIcon
                        icon={(icon as string) || ChonkyIconName.fallbackIcon}
                        fixedWidth={true}
                    />
                </div>
            )

        ) : null;

    const className = c(externalClassName, 'chonky-baseButton', {
        'chonky-iconOnlyButton': iconOnly,
        'chonky-activeButton': !!active,
    });
    return (
        <button
            type="button"
            className={className}
            onClick={onClick}
            title={tooltip ? tooltip : text}
            disabled={disabled || !onClick}
        >
            {iconComponent}
            {text && !iconOnly && <span>{text}</span>}
            {dropdown && (
                <div className="chonky-iconDropdown">
                    <ChonkyIcon
                        icon={(icon as string) || ChonkyIconName.dropdown}
                        fixedWidth={true}
                    />
                </div>
            )}
        </button>
    );
});

export interface SmartToolbarButtonProps {
    fileActionId: string;
}

export const SmartToolbarButton: React.FC<SmartToolbarButtonProps> = React.memo(
    props => {
        const { fileActionId } = props;

        const action = useParamSelector(selectFileActionData, fileActionId) ?? null;
        const triggerAction = useFileActionTrigger(fileActionId);
        const { icon, active, disabled, hidden } = useFileActionProps(fileActionId);
        const { buttonName, buttonTooltip } = useLocalizedFileActionStrings(action);

        if (!action) return null;
        const { button } = action;
        if (!button) return null;
        if (hidden) return null;

        return (
            <ToolbarButton
                text={buttonName}
                tooltip={buttonTooltip}
                icon={icon}
                iconOnly={button.iconOnly}
                active={active}
                onClick={triggerAction}
                disabled={disabled}
            />
        );
    }
);
