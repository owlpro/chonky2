import React from 'react';

import { useSelectionModeActive } from '../../util/selection-mode';
import { SelectionStatusBar } from './FileSelectionBars';
import { ToolbarInfo } from './ToolbarInfo';

export interface FileStatusBarProps {}

/**
 * Bottom bar with the number of items, and how many are selected or hidden. In selection
 * mode it makes way for `SelectionStatusBar`, with actions for the selected files.
 */
export const FileStatusBar: React.FC<FileStatusBarProps> = React.memo(() => {
    const selectionModeActive = useSelectionModeActive();
    if (selectionModeActive) return <SelectionStatusBar />;
    return (
        <div className="chonky-statusBar">
            <ToolbarInfo />
        </div>
    );
});
FileStatusBar.displayName = 'FileStatusBar';
