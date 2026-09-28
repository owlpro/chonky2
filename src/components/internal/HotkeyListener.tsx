/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import hotkeys from 'hotkeys-js';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { selectFileActionData } from '../../redux/selectors';
import { useParamSelector } from '../../redux/store';
import { thunkRequestFileAction } from '../../redux/thunks/dispatchers.thunks';

const isVisible = (element: Element) =>
    typeof element.checkVisibility === 'function'
        ? element.checkVisibility({ visibilityProperty: true, checkVisibilityCSS: true } as CheckVisibilityOptions)
        : element.getClientRects().length > 0;

/**
 * Whether a key pressed on `target` is meant for the Chonky at `root`. It is when focus is
 * inside Chonky, or on an element around it, e.g. the page body or a dialog that just
 * opened with Chonky in it, as long as Chonky is visible (not in a closed dialog that
 * stays mounted), is the only Chonky there, and the user hasn't selected some other text
 * on the page (so Ctrl+C copies that text).
 */
const isKeyForChonky = (root: HTMLElement, target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    if (root.contains(target)) return true;
    if (!target.contains(root) || !isVisible(root)) return false;

    const visibleRoots = Array.from(target.querySelectorAll('.chonky-chonkyRoot')).filter(isVisible);
    if (visibleRoots.length !== 1) return false;

    const selection = document.getSelection();
    if (selection && !selection.isCollapsed && !selection.containsNode(root, true)) return false;
    return true;
};

export interface HotkeyListenerProps {
    fileActionId: string;
    /** The Chonky root, see `isKeyForChonky` for when its shortcuts apply. */
    rootRef: React.RefObject<HTMLElement | null>;
}

export const HotkeyListener: React.FC<HotkeyListenerProps> = React.memo(props => {
    const { fileActionId, rootRef } = props;

    const dispatch = useDispatch<any>();
    const fileAction = useParamSelector(selectFileActionData, fileActionId);

    useEffect(() => {
        if (!fileAction || !fileAction.hotkeys || fileAction.hotkeys.length === 0) {
            return;
        }

        const hotkeysStr = fileAction.hotkeys.join(',');
        const hotkeyCallback = (event: KeyboardEvent) => {
            // hotkeys-js listens on the whole document. Leave keys meant for the rest of the
            // page (or another Chonky) alone, so e.g. Ctrl+A and Ctrl+C keep working there.
            if (!rootRef.current || !isKeyForChonky(rootRef.current, event.target)) return;
            event.preventDefault();
            dispatch(thunkRequestFileAction(fileAction, undefined));
        };
        hotkeys(hotkeysStr, hotkeyCallback);
        return () => hotkeys.unbind(hotkeysStr, hotkeyCallback);
    }, [dispatch, fileAction, rootRef]);

    return null;
});
