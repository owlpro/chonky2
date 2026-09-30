import { createContext, useContext, useMemo } from 'react';
import { Nullable, Undefinable } from '../types/util.types';

import { FileAction } from '../types/action.types';
import { FileData } from '../types/file.types';
import { ChonkyFormatters } from '../types/i18n.types';
import { FileHelper, getFileExtension } from './file-helper';
import { ChonkyIntl, createChonkyIntl } from './intl';

export const ChonkyIntlContext = createContext<ChonkyIntl>(createChonkyIntl());

export const useIntl = () => useContext(ChonkyIntlContext);

export enum I18nNamespace {
    Toolbar = 'toolbar',
    FileList = 'fileList',
    FileEntry = 'fileEntry',
    FileContextMenu = 'contextMenu',
    Sidebar = 'sidebar',

    FileActions = 'actions',
    FileActionGroups = 'actionGroups',
}

export const getI18nId = (namespace: I18nNamespace, stringId: string): string =>
    `chonky.${namespace}.${stringId}`;

export const getActionI18nId = (actionId: string, stringId: string): string =>
    `chonky.${I18nNamespace.FileActions}.${actionId}.${stringId}`;

export const useLocalizedFileActionGroup = (groupName: string) => {
    const intl = useIntl();
    return useMemo(() => {
        return intl.formatMessage({
            id: getI18nId(I18nNamespace.FileActionGroups, groupName),
            defaultMessage: groupName,
        });
    }, [groupName, intl]);
};

export const useLocalizedFileActionStrings = (action: Nullable<FileAction>) => {
    const intl = useIntl();
    return useMemo(() => {
        if (!action) {
            return {
                buttonName: '',
                buttonTooltip: undefined,
            };
        }

        const buttonName = intl.formatMessage({
            id: getActionI18nId(action.id, 'button.name'),
            defaultMessage: action.button?.name,
        });

        let buttonTooltip: Undefinable<string> = undefined;
        if (action.button?.tooltip) {
            // We only translate the tooltip if the original action has a tooltip.
            buttonTooltip = intl.formatMessage({
                id: getActionI18nId(action.id, 'button.tooltip'),
                defaultMessage: action.button?.tooltip,
            });
        }

        return {
            buttonName,
            buttonTooltip,
        };
    }, [action, intl]);
};

export const useLocalizedFileEntryStrings = (file: Nullable<FileData>) => {
    const intl = useIntl();
    const formatters = useContext(ChonkyFormattersContext);
    return useMemo(() => {
        let fileSizeString = formatters.formatFileSize(intl, file);
        const childrenCount = FileHelper.getChildrenCount(file);
        if (fileSizeString === null && FileHelper.isDirectory(file) && typeof childrenCount === 'number') {
            fileSizeString = intl.formatMessage(
                {
                    id: getI18nId(I18nNamespace.FileEntry, 'folderItemCount'),
                    defaultMessage: '{count, plural, one {# item} other {# items}}',
                },
                { count: childrenCount }
            );
        }
        return {
            fileModDateString: formatters.formatFileModDate(intl, file),
            fileModTimeString: formatters.formatFileModTime(intl, file),
            fileSizeString,
            fileTypeString: formatters.formatFileType(intl, file),
        };
    }, [file, formatters, intl]);
};

export const defaultFormatters: ChonkyFormatters = {
    formatFileType: (intl: ChonkyIntl, file: Nullable<FileData>): Nullable<string> => {
        if (!file) return null;
        if (FileHelper.isDirectory(file)) {
            return intl.formatMessage({
                id: getI18nId(I18nNamespace.FileEntry, 'folderType'),
                defaultMessage: 'Folder',
            });
        }
        const extension = getFileExtension(file).slice(1).toUpperCase();
        if (!extension) {
            return intl.formatMessage({
                id: getI18nId(I18nNamespace.FileEntry, 'genericFileType'),
                defaultMessage: 'File',
            });
        }
        return intl.formatMessage(
            { id: getI18nId(I18nNamespace.FileEntry, 'fileType'), defaultMessage: '{extension} File' },
            { extension }
        );
    },
    formatFileModDate: (
        intl: ChonkyIntl,
        file: Nullable<FileData>
    ): Nullable<string> => {
        const safeModDate = FileHelper.getModDate(file);
        return safeModDate ? intl.formatDate(safeModDate, { dateStyle: 'medium' }) : null;
    },
    formatFileModTime: (intl: ChonkyIntl, file: Nullable<FileData>): Nullable<string> => {
        const safeModDate = FileHelper.getModDate(file);
        return safeModDate ? intl.formatDate(safeModDate, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) : null;
    },
    formatFileSize: (_intl: ChonkyIntl, file: Nullable<FileData>): Nullable<string> => {
        if (!file || typeof file.size !== 'number') return null;

        const { value, symbol } = getFileSizeParts(file.size);
        if (symbol === 'B') {
            return `${Math.round(value / 10) / 100.0} KB`;
        }
        return `${value} ${symbol}`;
    },
};

const FILE_SIZE_SYMBOLS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

/**
 * Splits a byte count into a value (at most 2 decimals) and a decimal (SI) unit.
 */
const getFileSizeParts = (size: number) => {
    const maxExponent = FILE_SIZE_SYMBOLS.length - 1;
    let exponent = size > 0 ? Math.min(Math.floor(Math.log10(size) / 3), maxExponent) : 0;
    let value = Math.round((size / 1000 ** exponent) * 100) / 100;
    if (value === 1000 && exponent < maxExponent) {
        value = 1;
        exponent++;
    }
    return { value, symbol: FILE_SIZE_SYMBOLS[exponent]! };
};

export const ChonkyFormattersContext = createContext(defaultFormatters);
