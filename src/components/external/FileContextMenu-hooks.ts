import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Nullable } from '../../types/util.types';

import { ChonkyActions } from '../../action-definitions/index';
import { reduxActions } from '../../redux/reducers';
import { selectContextMenuMounted, selectDisableSelection, selectSelectionMode } from '../../redux/selectors';
import { thunkRequestFileAction } from '../../redux/thunks/dispatchers.thunks';
import { findElementAmongAncestors } from '../../util/helpers';
import { useInstanceVariable } from '../../util/hooks-helpers';

export const findClosestChonkyFileId = (
    element: HTMLElement | any
): Nullable<string> => {
    const fileEntryWrapperDiv = findElementAmongAncestors(
        element,
        (element: any) =>
            element.tagName &&
            element.tagName.toLowerCase() === 'div' &&
            element.dataset &&
            element.dataset.chonkyFileId
    );
    return fileEntryWrapperDiv ? fileEntryWrapperDiv.dataset.chonkyFileId! : null;
};

/** How long a finger has to rest on Chonky before its context menu opens. */
const LONG_PRESS_DELAY = 500;
/** How far (in px) the finger may move before the long press is cancelled, e.g. by a scroll. */
const LONG_PRESS_SLOP = 10;

/**
 * Handlers for Chonky's root that open the context menu on a right click or, on touch
 * screens, a long press (iOS never sends `contextmenu`). While Chonky is `narrow`, a long
 * press on a file turns on selection mode instead, or adds the file once it is on.
 */
export const useContextMenuTrigger = (narrow: boolean) => {
    const dispatch = useDispatch<any>();
    const contextMenuMountedRef = useInstanceVariable(
        useSelector(selectContextMenuMounted)
    );
    const selectionDisabled = useSelector(selectDisableSelection);
    const selectsOnLongPressRef = useInstanceVariable(narrow && !selectionDisabled);
    const selectionModeRef = useInstanceVariable(useSelector(selectSelectionMode));

    const openContextMenu = useCallback(
        (target: EventTarget | null, clientX: number, clientY: number) => {
            dispatch(
                thunkRequestFileAction(ChonkyActions.OpenFileContextMenu, {
                    clientX,
                    clientY,
                    triggerFileId: findClosestChonkyFileId(target),
                })
            );
        },
        [dispatch]
    );

    const handleLongPress = useCallback(
        (target: EventTarget | null, clientX: number, clientY: number) => {
            const fileId = findClosestChonkyFileId(target);
            if (fileId && selectsOnLongPressRef.current) {
                if (selectionModeRef.current) dispatch(reduxActions.toggleSelection({ fileId, exclusive: false }));
                else dispatch(reduxActions.startSelectionMode(fileId));
                return;
            }
            if (contextMenuMountedRef.current) openContextMenu(target, clientX, clientY);
        },
        [contextMenuMountedRef, dispatch, openContextMenu, selectionModeRef, selectsOnLongPressRef]
    );

    const pressRef = useRef<Nullable<{ timer: number; x: number; y: number }>>(null);
    // Set once a long press opened the menu, so lifting the finger doesn't also click
    const longPressedRef = useRef(false);

    const cancelPress = useCallback(() => {
        if (pressRef.current) clearTimeout(pressRef.current.timer);
        pressRef.current = null;
    }, []);
    useEffect(() => cancelPress, [cancelPress]);

    const onPointerDown = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            cancelPress();
            longPressedRef.current = false;
            const target = event.target as Element;
            if (event.pointerType !== 'touch' || !event.isPrimary) return;
            if (!contextMenuMountedRef.current && !selectsOnLongPressRef.current) return;
            // Menus are in a portal, so their events come here too. Fields keep the
            // system's own menu, e.g. to paste.
            if (!event.currentTarget.contains(target) || target.closest('input, textarea')) return;

            const { clientX, clientY } = event;
            const timer = window.setTimeout(() => {
                pressRef.current = null;
                longPressedRef.current = true;
                handleLongPress(target, clientX, clientY);
            }, LONG_PRESS_DELAY);
            pressRef.current = { timer, x: clientX, y: clientY };
        },
        [cancelPress, contextMenuMountedRef, handleLongPress, selectsOnLongPressRef]
    );

    const onPointerMove = useCallback(
        (event: React.PointerEvent) => {
            const press = pressRef.current;
            if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > LONG_PRESS_SLOP) {
                cancelPress();
            }
        },
        [cancelPress]
    );

    // Without this, the browser follows a long press with mouse events and a click, which
    // would close the menu or open the file
    const onTouchEnd = useCallback((event: React.TouchEvent) => {
        if (longPressedRef.current) event.preventDefault();
    }, []);
    const onClickCapture = useCallback((event: React.MouseEvent) => {
        if (!longPressedRef.current) return;
        longPressedRef.current = false;
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const onContextMenu = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            // Android sends `contextmenu` for a long press as well: handle the press once
            if (longPressedRef.current) {
                event.preventDefault();
                return;
            }
            if (pressRef.current) {
                cancelPress();
                longPressedRef.current = true;
                event.preventDefault();
                handleLongPress(event.target, event.clientX, event.clientY);
                return;
            }

            // Use default browser context menu when Chonky context menu component
            // is not mounted.
            if (!contextMenuMountedRef.current) return;
            // Users can use Alt+Right Click to bring up browser's default
            // context menu instead of Chonky's context menu.
            if (event.altKey) return;

            event.preventDefault();
            openContextMenu(event.target, event.clientX, event.clientY);
        },
        [cancelPress, contextMenuMountedRef, handleLongPress, openContextMenu]
    );

    return {
        onContextMenu,
        onPointerDown,
        onPointerMove,
        onPointerUp: cancelPress,
        onPointerCancel: cancelPress,
        onTouchEnd,
        onClickCapture,
    };
};

export const useContextMenuDismisser = () => {
    const dispatch = useDispatch<any>();
    return useCallback(() => dispatch(reduxActions.hideContextMenu()), [dispatch]);
};
