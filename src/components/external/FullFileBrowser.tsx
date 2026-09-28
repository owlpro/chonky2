import React, { ReactNode } from 'react';

import { FileBrowserHandle, FileBrowserProps } from '../../types/file-browser.types';
import { FileList } from '../file-list/FileList';
import { NoSsr } from '../internal/NoSsr';
import { FileBrowser } from './FileBrowser';
import { FileContextMenu } from './FileContextMenu';
import { FileNavbar } from './FileNavbar';
import { FileStatusBar } from './FileStatusBar';
import { FileToolbar } from './FileToolbar';

export interface FullFileBrowserProps extends FileBrowserProps {
    /** Rendered at the start of the toolbar, see `FileToolbar`'s `startContent`. */
    toolbarStart?: ReactNode;
    /** Rendered at the end of the toolbar, see `FileToolbar`'s `endContent`. */
    toolbarEnd?: ReactNode;
}

export const FullFileBrowser = React.memo(
    React.forwardRef<FileBrowserHandle, FullFileBrowserProps>((props, ref) => {
        const { onScroll, toolbarStart, toolbarEnd, ...fileBrowserProps } = props;
        return (
            <NoSsr>
                <FileBrowser ref={ref} {...fileBrowserProps} onScroll={onScroll}>
                    <FileToolbar startContent={toolbarStart} endContent={toolbarEnd} />
                    <FileNavbar />
                    <FileList onScroll={onScroll} />
                    <FileStatusBar />
                    <FileContextMenu />
                </FileBrowser>
            </NoSsr>
        );
    })
);
FullFileBrowser.displayName = 'FullFileBrowser';
