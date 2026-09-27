import React, { ReactNode, useLayoutEffect, useState } from 'react';

/**
 * Renders `children` only on the client, after the first mount.
 */
export const NoSsr: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    useLayoutEffect(() => setMounted(true), []);
    return mounted ? <>{children}</> : null;
};
