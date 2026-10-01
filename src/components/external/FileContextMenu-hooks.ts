import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Nullable } from '../../types/util.types';

import { ChonkyActions } from '../../action-definitions/index';
import { reduxActions } from '../../redux/reducers';
import { selectContextMenuMounted } from '../../redux/selectors';
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
 * screens, a long press (iOS never sends `contextmenu`).
 */
export const useContextMenuTrigger = () => {
    const dispatch = useDispatch<any>();
    const contextMenuMountedRef = useInstanceVariable(
        useSelector(selectContextMenuMounted)
    );

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
            if (event.pointerType !== 'touch' || !event.isPrimary || !contextMenuMountedRef.current) return;
            // Menus are in a portal, so their events come here too. Fields keep the
            // system's own menu, e.g. to paste.
            if (!event.currentTarget.contains(target) || target.closest('input, textarea')) return;

            const { clientX, clientY } = event;
            const timer = window.setTimeout(() => {
                pressRef.current = null;
                longPressedRef.current = true;
                openContextMenu(target, clientX, clientY);
            }, LONG_PRESS_DELAY);
            pressRef.current = { timer, x: clientX, y: clientY };
        },
        [cancelPress, contextMenuMountedRef, openContextMenu]
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
            // Use default browser context menu when Chonky context menu component
            // is not mounted.
            if (!contextMenuMountedRef.current) return;
            // Users can use Alt+Right Click to bring up browser's default
            // context menu instead of Chonky's context menu.
            if (event.altKey) return;

            event.preventDefault();

            // Android sends `contextmenu` for a long press as well: open the menu once
            if (longPressedRef.current) return;
            if (pressRef.current) {
                cancelPress();
                longPressedRef.current = true;
            }
            openContextMenu(event.target, event.clientX, event.clientY);
        },
        [cancelPress, contextMenuMountedRef, openContextMenu]
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
