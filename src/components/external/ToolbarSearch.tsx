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

export interface ToolbarSearchProps { }

export const ToolbarSearch: React.FC<ToolbarSearchProps> = React.memo(() => {
    const intl = useIntl();
    const searchPlaceholderString = intl.formatMessage({
        id: getI18nId(I18nNamespace.Toolbar, 'searchPlaceholder'),
        defaultMessage: 'Search',
    });

    const ChonkyIcon = useContext(ChonkyIconContext);

    const searchInputRef = useRef<HTMLInputElement>(null);

    const dispatch = useDispatch<any>();
    const reduxSearchString = useSelector(selectSearchString);

    const [localSearchString, setLocalSearchString] = useState(reduxSearchString);
    const [debouncedLocalSearchString] = useDebounce(localSearchString, 300);
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);

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

    useEffect(() => {
        setShowLoadingIndicator(false);
        dispatch(reduxActions.setSearchString(debouncedLocalSearchString));
    }, [debouncedLocalSearchString, dispatch]);

    const handleChange = useCallback((event: React.FormEvent<HTMLInputElement>) => {
        setShowLoadingIndicator(true);
        setLocalSearchString(event.currentTarget.value);
    }, []);
    const handleKeyUp = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            // Remove focus from the search input field when user presses escape.
            // Note: We use KeyUp instead of KeyPress because some browser plugins can
            //       intercept KeyPress events with Escape key.
            //       @see https://stackoverflow.com/a/37461974
            if (event.key === 'Escape') {
                setLocalSearchString('');
                dispatch(reduxActions.setSearchString(''));
                if (searchInputRef.current) searchInputRef.current.blur();
            }
        },
        [dispatch]
    );

    return (
        <label className="chonky-searchFieldContainer">
            <span className="chonky-searchIcon">
                <ChonkyIcon
                    icon={showLoadingIndicator ? ChonkyIconName.loading : ChonkyIconName.search}
                    spin={showLoadingIndicator}
                />
            </span>
            <input
                ref={searchInputRef}
                type="text"
                className="chonky-searchFieldInputInner"
                value={localSearchString}
                placeholder={searchPlaceholderString}
                aria-label={searchPlaceholderString}
                onChange={handleChange}
                onKeyUp={handleKeyUp}
            />
        </label>
    );
});
