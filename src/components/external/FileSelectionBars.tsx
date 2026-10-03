import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ChonkyActions } from '../../action-definitions/index';
import { reduxActions } from '../../redux/reducers';
import {
    selectContextMenuItems,
    selectFileActionData,
    selectFileActionMap,
    selectFileMap,
    selectors,
    selectSelectionMap,
    selectSelectionSize,
} from '../../redux/selectors';
import { useParamSelector } from '../../redux/store';
import { ChonkyIconName } from '../../types/icons.types';
import { useFileActionProps, useFileActionTrigger } from '../../util/file-actions';
import { FileHelper } from '../../util/file-helper';
import { getI18nId, I18nNamespace, useIntl, useLocalizedFileActionStrings } from '../../util/i18n';
import { ChonkyIconContext } from '../../util/icon-helper';
import { c } from '../../util/styles';
import { ChonkyMenu } from '../internal/ChonkyMenu';
import { ToolbarButton } from './ToolbarButton';
import { SmartToolbarDropdownButton } from './ToolbarDropdownButton';

/** How many actions the selection bar shows as buttons; the rest go into a "More" menu. */
const SELECTION_BAR_BUTTON_COUNT = 4;
/** Actions that get the buttons first, in this order, when they are in the context menu. */
const PREFERRED_ACTION_IDS: string[] = [
    ChonkyActions.CutFiles.id,
    ChonkyActions.CopyFiles.id,
    ChonkyActions.DownloadFiles.id,
    ChonkyActions.DeleteFiles.id,
];
/** The top bar does these already. */
const LEFT_OUT_ACTION_IDS: string[] = [ChonkyActions.SelectAllFiles.id, ChonkyActions.ClearSelection.id];

/** A round checkbox: `ChonkyIconName.checked`, `unchecked` or `checkedSome`. */
export const CheckCircle: React.FC<{ checked: boolean; mixed?: boolean }> = ({ checked, mixed }) => {
    const ChonkyIcon = useContext(ChonkyIconContext);
    let icon = ChonkyIconName.unchecked;
    if (checked) icon = ChonkyIconName.checked;
    else if (mixed) icon = ChonkyIconName.checkedSome;
    return (
        <span className={c('chonky-checkCircle', { 'chonky-checked': checked || !!mixed })} aria-hidden="true">
            <ChonkyIcon icon={icon} />
        </span>
    );
};

/**
 * Takes the navbar's place in selection mode: a checkbox that selects all the files in
 * the list, or none once they all are, and a button that ends selection mode.
 */
export const SelectionNavbar: React.FC = React.memo(() => {
    const dispatch = useDispatch<any>();
    const intl = useIntl();
    const displayFileIds = useSelector(selectors.getDisplayFileIds);
    const fileMap = useSelector(selectFileMap);
    const selectionMap = useSelector(selectSelectionMap);

    const selectableIds = useMemo(
        () => displayFileIds.filter((id): id is string => !!id && FileHelper.isSelectable(fileMap[id] ?? null)),
        [displayFileIds, fileMap]
    );
    const selectedCount = selectableIds.filter((id) => selectionMap[id]).length;
    const allSelected = selectableIds.length > 0 && selectedCount === selectableIds.length;

    const toggleAll = useCallback(() => {
        if (allSelected) dispatch(reduxActions.clearSelection());
        else dispatch(reduxActions.selectFiles({ fileIds: selectableIds, reset: false }));
    }, [allSelected, dispatch, selectableIds]);

    const allLabel = intl.formatMessage({ id: getI18nId(I18nNamespace.Toolbar, 'selectAll'), defaultMessage: 'All' });
    const cancelLabel = intl.formatMessage({
        id: getI18nId(I18nNamespace.Toolbar, 'cancelSelection'),
        defaultMessage: 'Cancel',
    });
    return (
        <div className="chonky-navbar chonky-selectionNavbar">
            <button
                type="button"
                role="checkbox"
                aria-checked={allSelected ? true : selectedCount > 0 ? 'mixed' : false}
                className="chonky-baseButton chonky-selectAllButton"
                onClick={toggleAll}
                disabled={selectableIds.length === 0}
            >
                <CheckCircle checked={allSelected} mixed={selectedCount > 0} />
                <span>{allLabel}</span>
            </button>
            <button
                type="button"
                className="chonky-baseButton chonky-selectionCancelButton"
                onClick={() => dispatch(reduxActions.endSelectionMode())}
            >
                <span>{cancelLabel}</span>
            </button>
        </div>
    );
});
SelectionNavbar.displayName = 'SelectionNavbar';

/** An action of the selection bar: just its icon, with its name as the tooltip. */
const SelectionBarButton: React.FC<{ fileActionId: string; onDone: () => void }> = ({ fileActionId, onDone }) => {
    const action = useParamSelector(selectFileActionData, fileActionId) ?? null;
    const triggerAction = useFileActionTrigger(fileActionId);
    const { icon, disabled, hidden } = useFileActionProps(fileActionId);
    const { buttonName, buttonTooltip } = useLocalizedFileActionStrings(action);

    if (!action?.button || hidden) return null;
    return (
        <ToolbarButton
            text={buttonName}
            tooltip={buttonTooltip}
            icon={icon ?? ChonkyIconName.fallbackIcon}
            iconOnly={true}
            disabled={disabled}
            onClick={() => {
                triggerAction();
                onDone();
            }}
        />
    );
};

/**
 * Takes the status bar's place in selection mode: how many files are selected and the
 * context menu's actions for them, as icons. Running one ends selection mode.
 */
export const SelectionStatusBar: React.FC = React.memo(() => {
    const dispatch = useDispatch<any>();
    const intl = useIntl();
    const selectionSize = useSelector(selectSelectionSize);
    const contextMenuItems = useSelector(selectContextMenuItems);
    const fileActionMap = useSelector(selectFileActionMap);

    const [buttonIds, menuIds] = useMemo(() => {
        const ids: string[] = [];
        for (const item of contextMenuItems) {
            for (const id of typeof item === 'string' ? [item] : item.fileActionIds) {
                if (fileActionMap[id]?.requiresSelection && !LEFT_OUT_ACTION_IDS.includes(id)) ids.push(id);
            }
        }
        const preferred = PREFERRED_ACTION_IDS.filter((id) => ids.includes(id));
        const ordered = [...preferred, ...ids.filter((id) => !preferred.includes(id))];
        // A "More" menu with a single action would only hide it
        const buttonCount = ordered.length <= SELECTION_BAR_BUTTON_COUNT + 1 ? ordered.length : SELECTION_BAR_BUTTON_COUNT;
        return [ordered.slice(0, buttonCount), ordered.slice(buttonCount)];
    }, [contextMenuItems, fileActionMap]);

    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const closeMenu = useCallback(() => setMenuAnchor(null), []);
    const endSelectionMode = useCallback(() => {
        setMenuAnchor(null);
        dispatch(reduxActions.endSelectionMode());
    }, [dispatch]);

    const countString = intl.formatMessage(
        {
            id: getI18nId(I18nNamespace.Toolbar, 'selectionModeCount'),
            defaultMessage: '{fileCount, plural, other {# selected}}',
        },
        { fileCount: selectionSize }
    );
    const moreLabel = intl.formatMessage({
        id: getI18nId(I18nNamespace.Toolbar, 'moreActions'),
        defaultMessage: 'More',
    });
    return (
        <div className="chonky-statusBar chonky-selectionBar">
            <bdi className="chonky-selectionBarCount" aria-live="polite">
                {countString}
            </bdi>
            {buttonIds.length > 0 && (
                <div className="chonky-selectionBarActions">
                    {buttonIds.map((id) => (
                        <SelectionBarButton key={id} fileActionId={id} onDone={endSelectionMode} />
                    ))}
                    {menuIds.length > 0 && (
                        <>
                            <ToolbarButton
                                text={moreLabel}
                                icon={ChonkyIconName.more}
                                iconOnly={true}
                                active={!!menuAnchor}
                                onClick={(event) => {
                                    const button = event.currentTarget;
                                    setMenuAnchor((current) => (current ? null : button));
                                }}
                            />
                            <ChonkyMenu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
                                {menuIds.map((id) => (
                                    <SmartToolbarDropdownButton key={id} fileActionId={id} onClickFollowUp={endSelectionMode} />
                                ))}
                            </ChonkyMenu>
                        </>
                    )}
                </div>
            )}
        </div>
    );
});
SelectionStatusBar.displayName = 'SelectionStatusBar';
