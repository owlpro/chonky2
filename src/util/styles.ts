import { Theme, useMediaQuery, useTheme } from '@mui/material';

import * as classNames from 'classnames';
import { useMemo } from 'react';
import { DeepPartial } from 'tsdef';

export const lightTheme = {
    colors: {
        debugRed: '#fabdbd',
        debugBlue: '#bdd8fa',
        debugGreen: '#d2fabd',
        debugPurple: '#d2bdfa',
        debugYellow: '#fae9bd',

        textActive: '#09f',
    },

    fontSizes: {
        rootPrimary: 15,
    },

    margins: {
        rootLayoutMargin: 8,
    },

    toolbar: {
        size: 30,
        lineHeight: '30px', // `px` suffix is required for `line-height` fields to work
        fontSize: 15,
        buttonRadius: 4,
    },

    dnd: {
        canDropColor: 'green',
        cannotDropColor: 'red',
        canDropMask: 'rgba(180, 235, 180, 0.75)',
        cannotDropMask: 'rgba(235, 180, 180, 0.75)',
        fileListCanDropMaskOne: 'rgba(180, 235, 180, 0.1)',
        fileListCanDropMaskTwo: 'rgba(180, 235, 180, 0.2)',
        fileListCannotDropMaskOne: 'rgba(235, 180, 180, 0.1)',
        fileListCannotDropMaskTwo: 'rgba(235, 180, 180, 0.2)',
    },

    dragLayer: {
        border: 'solid 2px #09f',
        padding: '7px 10px',
        borderRadius: 2,
    },

    fileList: {
        desktopGridGutter: 8,
        mobileGridGutter: 5,
    },

    gridFileEntry: {
        childrenCountSize: '1.6em',
        iconColorFocused: '#000',
        iconSize: '2.4em',
        iconColor: '#fff',
        borderRadius: 5,
        fontSize: 14,

        fileColorTint: 'rgba(255, 255, 255, 0.4)',
        folderBackColorTint: 'rgba(255, 255, 255, 0.1)',
        folderFrontColorTint: 'rgba(255, 255, 255, 0.4)',
    },

    listFileEntry: {
        propertyFontSize: 14,
        iconFontSize: '1.1em',
        iconBorderRadius: 5,
        fontSize: 14,
    },
};

export type ChonkyTheme = typeof lightTheme;

export const darkThemeOverride: DeepPartial<ChonkyTheme> = {
    gridFileEntry: {
        fileColorTint: 'rgba(50, 50, 50, 0.4)',
        folderBackColorTint: 'rgba(50, 50, 50, 0.4)',
        folderFrontColorTint: 'rgba(50, 50, 50, 0.15)',
    },
};

export const mobileThemeOverride: DeepPartial<ChonkyTheme> = {
    fontSizes: {
        rootPrimary: 13,
    },
    margins: {
        rootLayoutMargin: 4,
    },
    toolbar: {
        size: 28,
        lineHeight: '28px',
        fontSize: 13,
    },
    gridFileEntry: {
        fontSize: 13,
    },
    listFileEntry: {
        propertyFontSize: 12,
        iconFontSize: '1em',
        fontSize: 13,
    },
};

/**
 * Hook: detect mobile breakpoint
 */
export const useIsMobileBreakpoint = () => {
    return useMediaQuery('(max-width:480px)');
};

/**
 * Utility: generate repeating stripe gradient
 */
export const getStripeGradient = (colorOne: string, colorTwo: string) =>
    `repeating-linear-gradient(
    45deg,
    ${colorOne},
    ${colorOne} 10px,
    ${colorTwo} 0,
    ${colorTwo} 20px
  )`;

/**
 * Replacement for makeLocalChonkyStyles (using MUI styled API)
 *
 * Example:
 * const MyBox = makeLocalChonkyStyles('div')(({ theme }) => ({
 *   backgroundColor: theme.palette.background.paper,
 * }));
 */
export function makeLocalChonkyStyles(styles: (theme: Theme) => Record<string, any>) {
    return function useLocalChonkyStyles() {
        const theme = useTheme();
        return useMemo(() => styles(theme), [theme]);
    };
}

export const makeGlobalChonkyStyles = (
    styles: (theme: Theme) => Record<string, any>
) => {
    const useGlobalChonkyStyles = () => {
        const theme = useTheme();
        return useMemo(() => styles(theme), [theme]);
    };
    return useGlobalChonkyStyles;
};

export function important<T>(value: T): string {
    return `${value} !important`;
}
/**
 * Alias for classnames
 */
export const c: any = classNames;
