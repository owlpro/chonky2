/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */
import React, { ReactNode, useCallback, useContext, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { reduxActions } from '../../redux/reducers';
import {
    selectClearSelectionOnOutsideClick,
    selectFileActionIds,
    selectIsDnDDisabled,
} from '../../redux/selectors';
import { useNativeFileDrop } from '../../util/dnd';
import { useDndContextAvailable } from '../../util/dnd-fallback';
import { elementIsInsideButton } from '../../util/helpers';
import { c, ChonkyDarkModeContext, getThemeClassName } from '../../util/styles';
import { useContextMenuTrigger } from '../external/FileContextMenu-hooks';
import { DnDFileListDragLayer } from '../file-list/DnDFileListDragLayer';
import { ClickAwayListener } from './ClickAwayListener';
import { HotkeyListener } from './HotkeyListener';

export interface ChonkyPresentationLayerProps {
    children: ReactNode
}

export const ChonkyPresentationLayer: React.FC<ChonkyPresentationLayerProps> = ({
    children,
}) => {
    const dispatch = useDispatch<any>();
    const fileActionIds = useSelector(selectFileActionIds);
    const dndDisabled = useSelector(selectIsDnDDisabled);
    const clearSelectionOnOutsideClick = useSelector(
        selectClearSelectionOnOutsideClick
    );

    // Deal with clicks outside of Chonky
    const handleClickAway = useCallback(
        (event: MouseEvent | TouchEvent) => {
            if (!clearSelectionOnOutsideClick || elementIsInsideButton(event.target)) {
                // We only clear out the selection on outside click if the click target
                // was not a button. We don't want to clear out the selection when a
                // button is clicked because Chonky users might want to trigger some
                // selection-related action on that button click.
                return;
            }
            dispatch(reduxActions.clearSelection());
        },
        [dispatch, clearSelectionOnOutsideClick]
    );

    // Generate necessary components
    const hotkeyListenerComponents = useMemo(
        () =>
            fileActionIds.map(actionId => (
                <HotkeyListener
                    key={`file-action-listener-${actionId}`}
                    fileActionId={actionId}
                />
            )),
        [fileActionIds]
    );

    const dndContextAvailable = useDndContextAvailable();
    const showContextMenu = useContextMenuTrigger();

    const { nativeFileDropIsOver, nativeFileDrop } = useNativeFileDrop();
    const rootRef = useRef<HTMLDivElement | null>(null);
    nativeFileDrop(rootRef);

    const darkMode = useContext(ChonkyDarkModeContext);
    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <div
                ref={rootRef}
                className={c('chonky-chonkyRoot', getThemeClassName(darkMode), {
                    'chonky-nativeFileDropOver': nativeFileDropIsOver,
                })}
                onContextMenu={showContextMenu}
            >
                {!dndDisabled && dndContextAvailable && <DnDFileListDragLayer />}
                {hotkeyListenerComponents}
                {children ? children : null}
            </div>
        </ClickAwayListener>
    );
};
