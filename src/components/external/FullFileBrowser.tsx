import React from 'react';

import { FileBrowserHandle, FileBrowserProps } from '../../types/file-browser.types';
import { FileList } from '../file-list/FileList';
import { NoSsr } from '../internal/NoSsr';
import { FileBrowser } from './FileBrowser';
import { FileContextMenu } from './FileContextMenu';
import { FileNavbar } from './FileNavbar';
import { FileToolbar } from './FileToolbar';

export const FullFileBrowser = React.memo(
    React.forwardRef<FileBrowserHandle, FileBrowserProps>((props, ref) => {
        const { onScroll } = props
        return (
            <NoSsr>
                <FileBrowser ref={ref} {...props}>
                    <FileNavbar />
                    <FileToolbar />
                    <FileList onScroll={onScroll} />
                    <FileContextMenu />
                </FileBrowser>
            </NoSsr>
        );
    })
);
FullFileBrowser.displayName = 'FullFileBrowser';
