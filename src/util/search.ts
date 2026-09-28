import { Nullable } from '../types/util.types';

import { FileData } from '../types/file.types';

/**
 * Splits the search field text into lowercase terms. No terms means no search.
 */
export const getSearchTerms = (searchString: string): string[] =>
    searchString.toLocaleLowerCase().split(/\s+/).filter(Boolean);

/**
 * Whether every term appears in the file's name or its `searchText`.
 */
export const isSearchMatch = (file: Nullable<FileData>, terms: string[]): boolean => {
    if (terms.length === 0) return true;
    if (!file) return false;
    const name = typeof file.name === 'string' ? file.name : '';
    const searchText = typeof file.searchText === 'string' ? file.searchText : '';
    // The line break keeps a term from matching across the two fields
    const text = `${name}\n${searchText}`.toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
};
