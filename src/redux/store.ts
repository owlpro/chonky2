import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';

import { RootState } from '../types/redux.types';
import { ChonkyUserState } from '../types/user-state.types';
import { useStaticValue } from '../util/hooks-helpers';
import { rootReducer } from './reducers';
import { initialRootState } from './state';
import { useStoreWatchers } from './watchers';

/**
 * @param getUserState Returns the user state to start with, so saved favorites and
 * collapsed sections show from the first render instead of popping in after it.
 */
export const useChonkyStore = (chonkyInstanceId: string, getUserState?: () => ChonkyUserState) => {
    const store = useStaticValue(() => {
        const preloadedState: RootState = {
            ...initialRootState,
            instanceId: chonkyInstanceId,
            userState: getUserState?.() ?? initialRootState.userState,
        };

        return configureStore({
            preloadedState: preloadedState as any,
            reducer: rootReducer,
            middleware: getDefaultMiddleware =>
                getDefaultMiddleware({
                    serializableCheck: false,
                }),
            devTools: { name: `chonky_${chonkyInstanceId}` },
        });
    });
    useStoreWatchers(store);
    return store;
};

/**
 * Hook that can be used with parametrized selectors.
 */
export const useParamSelector = <Args extends Array<any>, Value>(
    parametrizedSelector: (...args: Args) => (state: RootState) => Value,
    ...selectorParams: Args
) => {
    const selector = useCallback(
        (state: RootState) => parametrizedSelector(...selectorParams)(state),
        // eslint-disable-next-line
        [parametrizedSelector, ...selectorParams]
    );
    return useSelector(selector);
};

/**
 * DTE - DispatchThunkEffect. This method is used to decrease code duplication in
 * main Chonky method.
 */
export const useDTE = <Args extends Array<any>>(actionCreator: (...args: Args) => any, ...selectorParams: Args) => {
    const dispatch = useDispatch<any>();
    useEffect(
        () => {
            dispatch(actionCreator(...selectorParams));
        },
        // eslint-disable-next-line
        [dispatch, actionCreator, ...selectorParams]
    );
};

export const usePropReduxUpdate = <Payload extends any>(actionCreator: (payload: Payload) => any, payload: Payload) => {
    const dispatch = useDispatch<any>();
    useEffect(() => {
        dispatch(actionCreator(payload));
    }, [dispatch, actionCreator, payload]);
};
