import type { ChonkyIntl, ChonkyIntlConfig } from '../util/intl';
import { FileData } from './file.types';
import { Nullable } from './util.types';

export type { ChonkyIntl };

export interface I18nConfig extends ChonkyIntlConfig {
    formatters?: Partial<ChonkyFormatters>;
}

export interface ChonkyFormatters {
    formatFileModDate: (intl: ChonkyIntl, file: Nullable<FileData>) => Nullable<string>;
    /**
     * The time of `modDate`, shown after the date. Defaults to 24-hour `HH:mm`. When an
     * app passes its own `formatFileModDate` but not this one, no separate time is shown.
     */
    formatFileModTime: (intl: ChonkyIntl, file: Nullable<FileData>) => Nullable<string>;
    formatFileSize: (intl: ChonkyIntl, file: Nullable<FileData>) => Nullable<string>;
    formatFileType: (intl: ChonkyIntl, file: Nullable<FileData>) => Nullable<string>;
}
