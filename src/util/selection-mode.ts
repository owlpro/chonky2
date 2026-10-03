import { useContext } from 'react';
import { useSelector } from 'react-redux';

import { selectSelectionMode } from '../redux/selectors';
import { ChonkyNarrowLayoutContext } from './styles';

/** Whether selection mode is on and shown, which it only is while Chonky is narrow. */
export const useSelectionModeActive = () => {
    const narrow = useContext(ChonkyNarrowLayoutContext);
    const selectionMode = useSelector(selectSelectionMode);
    return narrow && selectionMode;
};
