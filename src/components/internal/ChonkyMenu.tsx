import React, { ReactNode, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Nullable } from '../../types/util.types';
import { useAnimationsEnabled } from '../../util/animations';
import { c, ChonkyDarkModeContext, getThemeClassName } from '../../util/styles';

export interface MenuAnchorPosition {
    top: number;
    left: number;
}

export interface ChonkyMenuProps {
    open: boolean;
    onClose: () => void;
    /** Element the menu drops down from. */
    anchorEl?: Nullable<HTMLElement>;
    /** Viewport point the menu opens at, e.g. the cursor position for a context menu. */
    anchorPosition?: MenuAnchorPosition;
    className?: string;
    children?: ReactNode;
}

export const ChonkyMenu: React.FC<ChonkyMenuProps> = (props) => {
    if (!props.open || typeof document === 'undefined') return null;
    return <MenuSurface {...props} />;
};

const VIEWPORT_MARGIN = 16;

const getMenuItems = (menu: HTMLElement) =>
    Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)'));

const MenuSurface: React.FC<ChonkyMenuProps> = ({ onClose, anchorEl, anchorPosition, className, children }) => {
    const darkMode = useContext(ChonkyDarkModeContext);
    const animationsEnabled = useAnimationsEnabled();
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<Nullable<MenuAnchorPosition>>(null);

    // Measure the menu before paint and keep it inside the viewport.
    useLayoutEffect(() => {
        const menu = menuRef.current;
        if (!menu) return;
        const { width, height } = menu.getBoundingClientRect();
        let top: number;
        let left: number;
        if (anchorEl) {
            const anchorRect = anchorEl.getBoundingClientRect();
            top = anchorRect.bottom;
            left = anchorRect.left;
            if (top + height > window.innerHeight - VIEWPORT_MARGIN) top = anchorRect.top - height;
        } else if (anchorPosition) {
            top = anchorPosition.top;
            left = anchorPosition.left;
        } else {
            return;
        }
        const maxTop = window.innerHeight - height - VIEWPORT_MARGIN;
        const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
        setPosition({
            top: Math.max(VIEWPORT_MARGIN, Math.min(top, maxTop)),
            left: Math.max(VIEWPORT_MARGIN, Math.min(left, maxLeft)),
        });
    }, [anchorEl, anchorPosition]);

    // Take focus once the menu is visible (hidden elements can't be focused) so
    // keyboard navigation works, and hand focus back on close.
    const positioned = position !== null;
    useLayoutEffect(() => {
        if (positioned) menuRef.current?.focus({ preventScroll: true });
    }, [positioned]);
    useLayoutEffect(() => {
        const menu = menuRef.current;
        const previouslyFocused = document.activeElement as Nullable<HTMLElement>;
        return () => {
            if (menu && menu.contains(document.activeElement)) {
                (anchorEl ?? previouslyFocused)?.focus({ preventScroll: true });
            }
        };
    }, [anchorEl]);

    // Close when the user interacts with anything outside the menu.
    useEffect(() => {
        const isOutside = (target: EventTarget | null) =>
            target instanceof Node && !menuRef.current?.contains(target) && !anchorEl?.contains(target);
        const handlePointerDown = (event: Event) => {
            if (isOutside(event.target)) onClose();
        };
        const handleScroll = (event: Event) => {
            if (event.target instanceof Node && !menuRef.current?.contains(event.target)) onClose();
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('mousedown', handlePointerDown, true);
        document.addEventListener('touchstart', handlePointerDown, true);
        document.addEventListener('scroll', handleScroll, true);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', onClose);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown, true);
            document.removeEventListener('touchstart', handlePointerDown, true);
            document.removeEventListener('scroll', handleScroll, true);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', onClose);
        };
    }, [anchorEl, onClose]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            // Keep Chonky's file hotkeys from firing while the menu has focus.
            event.stopPropagation();
            const menu = menuRef.current;
            if (!menu) return;

            if (event.key === 'Escape' || event.key === 'Tab') {
                event.preventDefault();
                onClose();
                return;
            }

            const items = getMenuItems(menu);
            if (items.length === 0) return;
            const currentIndex = items.indexOf(document.activeElement as HTMLElement);
            let nextIndex: Nullable<number> = null;
            if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length;
            else if (event.key === 'ArrowUp') nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
            else if (event.key === 'Home') nextIndex = 0;
            else if (event.key === 'End') nextIndex = items.length - 1;
            if (nextIndex === null) return;

            event.preventDefault();
            items[nextIndex]!.focus();
        },
        [onClose]
    );

    const handleContextMenu = useCallback((event: React.MouseEvent) => {
        // Don't let a right click inside the menu reopen Chonky's context menu.
        event.preventDefault();
        event.stopPropagation();
    }, []);

    return createPortal(
        <div className={getThemeClassName(darkMode, !animationsEnabled)}>
            <div
                ref={menuRef}
                role="menu"
                tabIndex={-1}
                className={c('chonky-menu', className)}
                style={position ?? { top: 0, left: 0, visibility: 'hidden' }}
                onKeyDown={handleKeyDown}
                onContextMenu={handleContextMenu}
            >
                {children}
            </div>
        </div>,
        document.body
    );
};
