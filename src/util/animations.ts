import { useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';

import { selectAnimationsDisabled } from '../redux/selectors';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const subscribeToReducedMotion = (onChange: () => void) => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
};

/**
 * Whether Chonky may animate: the `disableAnimations` prop is off and the user's
 * system doesn't ask for reduced motion.
 */
export const useAnimationsEnabled = () => {
    const disabled = useSelector(selectAnimationsDisabled);
    const reducedMotion = useSyncExternalStore(
        subscribeToReducedMotion,
        () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
        () => false
    );
    return !disabled && !reducedMotion;
};
