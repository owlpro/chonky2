import React from 'react';

import { ToolbarInfo } from './ToolbarInfo';

export interface FileStatusBarProps {}

/**
 * Bottom bar with the number of items, and how many are selected or hidden.
 */
export const FileStatusBar: React.FC<FileStatusBarProps> = React.memo(() => (
    <div className="chonky-statusBar">
        <ToolbarInfo />
    </div>
));
FileStatusBar.displayName = 'FileStatusBar';
