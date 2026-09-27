import React, { ReactElement, useEffect, useRef } from 'react';

export interface ClickAwayListenerProps {
    onClickAway: (event: MouseEvent | TouchEvent) => void;
    children: ReactElement<React.HTMLAttributes<HTMLElement>>;
}

/**
 * Calls `onClickAway` for clicks outside of `children`. Clicks inside portals rendered
 * by `children` (e.g. menus) count as inside, because React events bubble through the
 * React tree rather than the DOM tree.
 */
export const ClickAwayListener: React.FC<ClickAwayListenerProps> = ({ onClickAway, children }) => {
    const insideRef = useRef(false);

    useEffect(() => {
        const handleEvent = (event: MouseEvent | TouchEvent) => {
            if (insideRef.current) {
                insideRef.current = false;
                return;
            }
            onClickAway(event);
        };
        document.addEventListener('click', handleEvent);
        document.addEventListener('touchend', handleEvent);
        return () => {
            document.removeEventListener('click', handleEvent);
            document.removeEventListener('touchend', handleEvent);
        };
    }, [onClickAway]);

    const markInside = () => {
        insideRef.current = true;
    };
    return React.cloneElement(children, { onClickCapture: markInside, onTouchEndCapture: markInside });
};
