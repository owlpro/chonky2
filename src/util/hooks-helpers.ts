import React, { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

export const useDebounce = <T>(
    value: T,
    delay: number
): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return [debouncedValue, setDebouncedValue];
};

/**
 * `value`, but it only turns `true` once it has stayed `true` for `delay` ms; it turns
 * `false` right away. Keeps a drop zone that encloses other drop targets from lighting
 * up for an instant while the pointer crosses the gap between two of them.
 */
export const useDelayedTrue = (value: boolean, delay: number) => {
    const [delayedValue, setDelayedValue] = useState(false);

    useEffect(() => {
        if (!value) {
            setDelayedValue(false);
            return;
        }
        const handler = setTimeout(() => setDelayedValue(true), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return value && delayedValue;
};

const UNINITIALIZED_SENTINEL = {};
export const useStaticValue = <T>(factory: () => T): T => {
    const valueRef = useRef<T>(UNINITIALIZED_SENTINEL as T);
    if (valueRef.current === UNINITIALIZED_SENTINEL) valueRef.current = factory();
    return valueRef.current;
};

export const useInstanceVariable = <T>(value: T) => {
    const ref = useRef(value);
    useEffect(() => {
        ref.current = value;
    }, [ref, value]);
    return ref;
};

export interface ElementSize {
    width: number;
    height: number;
}

const toPixels = (value: string) => parseFloat(value) || 0;

/**
 * Tracks the content-box size of an element (its size without padding and border).
 */
export const useElementSize = (ref: RefObject<HTMLElement | null>): ElementSize => {
    const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        const measure = () => {
            const style = window.getComputedStyle(element);
            const width =
                element.offsetWidth -
                toPixels(style.paddingLeft) -
                toPixels(style.paddingRight) -
                toPixels(style.borderLeftWidth) -
                toPixels(style.borderRightWidth);
            const height =
                element.offsetHeight -
                toPixels(style.paddingTop) -
                toPixels(style.paddingBottom) -
                toPixels(style.borderTopWidth) -
                toPixels(style.borderBottomWidth);
            setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
        };

        measure();
        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', measure);
            return () => window.removeEventListener('resize', measure);
        }
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref]);

    return size;
};
