/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';


import { reduxActions } from '../../redux/reducers';
import { selectSearchString } from '../../redux/selectors';
import { ChonkyIconName } from '../../types/icons.types';
import { useDebounce } from '../../util/hooks-helpers';
import { getI18nId, I18nNamespace, useIntl } from '../../util/i18n';
import { ChonkyIconContext } from '../../util/icon-helper';
import { c } from '../../util/styles';

export interface ToolbarSearchProps { }

export const ToolbarSearch: React.FC<ToolbarSearchProps> = React.memo(() => {
    const intl = useIntl();
    const searchPlaceholderString = intl.formatMessage({
        id: getI18nId(I18nNamespace.Toolbar, 'searchPlaceholder'),
        defaultMessage: 'Search',
    });
    const clearSearchString = intl.formatMessage({
        id: getI18nId(I18nNamespace.Toolbar, 'clearSearch'),
        defaultMessage: 'Clear search',
    });

    const ChonkyIcon = useContext(ChonkyIconContext);

    const searchInputRef = useRef<HTMLInputElement>(null);

    const dispatch = useDispatch<any>();
    const reduxSearchString = useSelector(selectSearchString);

    const [localSearchString, setLocalSearchString] = useState(reduxSearchString);
    const [debouncedLocalSearchString, setDebouncedLocalSearchString] = useDebounce(localSearchString, 300);
    const showLoadingIndicator = localSearchString !== debouncedLocalSearchString;

    useEffect(() => {
        dispatch(
            reduxActions.setFocusSearchInput(() => {
                if (searchInputRef.current) searchInputRef.current.focus();
            })
        );
        return () => {
            dispatch(reduxActions.setFocusSearchInput(null));
        };
    }, [dispatch]);

    const dispatchedSearchStringRef = useRef(reduxSearchString);
    useEffect(() => {
        dispatchedSearchStringRef.current = debouncedLocalSearchString;
        dispatch(reduxActions.setSearchString(debouncedLocalSearchString));
    }, [debouncedLocalSearchString, dispatch]);

    // Follow changes made outside the field, e.g. the search being cleared on navigation
    useEffect(() => {
        if (reduxSearchString === dispatchedSearchStringRef.current) return;
        dispatchedSearchStringRef.current = reduxSearchString;
        setLocalSearchString(reduxSearchString);
        setDebouncedLocalSearchString(reduxSearchString);
    }, [reduxSearchString, setDebouncedLocalSearchString]);

    const handleChange = useCallback((event: React.FormEvent<HTMLInputElement>) => {
        setLocalSearchString(event.currentTarget.value);
    }, []);
    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            // Search right away instead of waiting for the debounce
            if (event.key === 'Enter') setDebouncedLocalSearchString(event.currentTarget.value);
        },
        [setDebouncedLocalSearchString]
    );
    const handleKeyUp = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            // Remove focus from the search input field when user presses escape.
            // Note: We use KeyUp instead of KeyPress because some browser plugins can
            //       intercept KeyPress events with Escape key.
            //       @see https://stackoverflow.com/a/37461974
            if (event.key === 'Escape') {
                setLocalSearchString('');
                setDebouncedLocalSearchString('');
                if (searchInputRef.current) searchInputRef.current.blur();
            }
        },
        [setDebouncedLocalSearchString]
    );

    const handleClear = useCallback(() => {
        setLocalSearchString('');
        setDebouncedLocalSearchString('');
        if (searchInputRef.current) searchInputRef.current.focus();
    }, [setDebouncedLocalSearchString]);

    return (
        // While Chonky is narrow, the field is only an icon until it has focus or text
        <label className={c('chonky-search', { 'chonky-searchFilled': !!localSearchString })}>
            <span className="chonky-searchIcon">
                <ChonkyIcon
                    icon={showLoadingIndicator ? ChonkyIconName.loading : ChonkyIconName.search}
                    spin={showLoadingIndicator}
                />
            </span>
            <input
                ref={searchInputRef}
                type="text"
                className="chonky-searchInput"
                value={localSearchString}
                placeholder={searchPlaceholderString}
                aria-label={searchPlaceholderString}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
            />
            {localSearchString && (
                <button
                    type="button"
                    className="chonky-searchClear"
                    title={clearSearchString}
                    aria-label={clearSearchString}
                    onClick={handleClear}
                >
                    <ChonkyIcon icon={ChonkyIconName.close} />
                </button>
            )}
        </label>
    );
});
