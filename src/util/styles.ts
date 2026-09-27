import { createContext, useInsertionEffect, useSyncExternalStore } from 'react';

import chonkyCss from '../styles/chonky.css?inline';
import { DndEntryState } from '../types/file-list.types';

const STYLE_ELEMENT_ID = 'chonky2-styles';

/**
 * Injects Chonky's stylesheet into `document.head` once. It is prepended so that
 * rules from the host app win over Chonky's rules of the same specificity.
 */
export const useChonkyStyles = () => {
    useInsertionEffect(() => {
        if (document.getElementById(STYLE_ELEMENT_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ELEMENT_ID;
        style.textContent = chonkyCss;
        document.head.prepend(style);
    }, []);
};

export const getThemeClassName = (darkMode: boolean) => c('chonky-theme', { 'chonky-dark': darkMode });

/**
 * Lets content rendered outside the Chonky root (menus in a portal) pick up the theme.
 */
export const ChonkyDarkModeContext = createContext(false);

const MOBILE_QUERY = '(max-width:480px)';

const subscribeToMobileQuery = (onChange: () => void) => {
    const query = window.matchMedia(MOBILE_QUERY);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
};

/**
 * Hook: detect mobile breakpoint
 */
export const useIsMobileBreakpoint = () =>
    useSyncExternalStore(
        subscribeToMobileQuery,
        () => window.matchMedia(MOBILE_QUERY).matches,
        () => false
    );

/**
 * Classes that colour an element while a file is dragged over it.
 */
export const getDndOverClasses = (dndState: Pick<DndEntryState, 'dndIsOver' | 'dndCanDrop'>) => ({
    'chonky-dnd-over-can': dndState.dndIsOver && dndState.dndCanDrop,
    'chonky-dnd-over-cannot': dndState.dndIsOver && !dndState.dndCanDrop,
});

type ClassValue = string | number | boolean | undefined | null | Record<string, any> | ClassValue[];

/**
 * Joins class names, like the `classnames` package: strings and numbers are kept,
 * object keys are kept when their value is truthy, arrays are flattened.
 */
export const c = (...args: ClassValue[]): string => {
    const classes: string[] = [];
    for (const arg of args) {
        if (!arg || arg === true) continue;
        if (typeof arg === 'string' || typeof arg === 'number') {
            classes.push(String(arg));
        } else if (Array.isArray(arg)) {
            const nested = c(...arg);
            if (nested) classes.push(nested);
        } else {
            for (const key in arg) if (arg[key]) classes.push(key);
        }
    }
    return classes.join(' ');
};
