/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */
import React, { ReactNode, useCallback, useContext, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ChonkyActions } from '../../action-definitions/index';
import { reduxActions } from '../../redux/reducers';
import {
    selectClearSelectionOnOutsideClick,
    selectFileActionIds,
    selectIsDnDDisabled,
} from '../../redux/selectors';
import { thunkRequestFileAction } from '../../redux/thunks/dispatchers.thunks';
import { useNativeFileDrop } from '../../util/dnd';
import { useAnimationsEnabled } from '../../util/animations';
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

    const rootRef = useRef<HTMLDivElement | null>(null);

    // The mouse's back and forward buttons go through Chonky's folder history, like in
    // File Explorer. Cancelling both events keeps the browser (or the app's router) from
    // leaving the page.
    const handleMouseDown = useCallback((event: React.MouseEvent) => {
        if (event.button === 3 || event.button === 4) event.preventDefault();
    }, []);
    const handleMouseUp = useCallback(
        (event: React.MouseEvent) => {
            if (event.button !== 3 && event.button !== 4) return;
            event.preventDefault();
            dispatch(thunkRequestFileAction(event.button === 3 ? ChonkyActions.GoBack : ChonkyActions.GoForward, undefined));
        },
        [dispatch]
    );

    // Generate necessary components
    const hotkeyListenerComponents = useMemo(
        () =>
            fileActionIds.map(actionId => (
                <HotkeyListener
                    key={`file-action-listener-${actionId}`}
                    fileActionId={actionId}
                    rootRef={rootRef}
                />
            )),
        [fileActionIds]
    );

    const dndContextAvailable = useDndContextAvailable();
    const showContextMenu = useContextMenuTrigger();

    const { nativeFileDropIsOver, nativeFileDrop } = useNativeFileDrop();
    nativeFileDrop(rootRef);

    const darkMode = useContext(ChonkyDarkModeContext);
    const animationsEnabled = useAnimationsEnabled();
    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <div
                ref={rootRef}
                className={c('chonky-chonkyRoot', getThemeClassName(darkMode, !animationsEnabled), {
                    'chonky-nativeFileDropOver': nativeFileDropIsOver,
                })}
                onContextMenu={showContextMenu}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                // Focusable, so a click anywhere in Chonky (e.g. empty list space) puts focus
                // inside it and its keyboard shortcuts apply
                tabIndex={-1}
            >
                {!dndDisabled && dndContextAvailable && <DnDFileListDragLayer />}
                {hotkeyListenerComponents}
                {children ? children : null}
            </div>
        </ClickAwayListener>
    );
};
