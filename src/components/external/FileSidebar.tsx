import React, { ReactNode, useCallback, useContext, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ChonkyActions } from '../../action-definitions/index';
import { selectFolderChain } from '../../redux/selectors';
import { thunkRequestFileAction } from '../../redux/thunks/dispatchers.thunks';
import { FileData } from '../../types/file.types';
import { ChonkyIconName } from '../../types/icons.types';
import { Nullable } from '../../types/util.types';
import { useFileDrop } from '../../util/dnd';
import { FileHelper } from '../../util/file-helper';
import { ChonkyIconContext } from '../../util/icon-helper';
import { c, getDndOverClasses } from '../../util/styles';
import { FileIcon } from '../file-list/FileEntryIcon';

export interface FileSidebarProps {
    className?: string;
    children?: ReactNode;
}

/**
 * Navigation pane on the left of the file list, like File Explorer's. Pass it to
 * `FullFileBrowser`'s `sidebar` prop, filled with `FileSidebarSection`s and
 * `FileSidebarItem`s.
 */
export const FileSidebar: React.FC<FileSidebarProps> = React.memo(({ className, children }) => (
    <nav className={c('chonky-sidebar', className)}>{children}</nav>
));
FileSidebar.displayName = 'FileSidebar';

export interface FileSidebarSectionProps {
    title?: ReactNode;
    children?: ReactNode;
}

/** A group of sidebar items under an optional title. */
export const FileSidebarSection: React.FC<FileSidebarSectionProps> = React.memo(({ title, children }) => (
    <div className="chonky-sidebarSection">
        {title && <div className="chonky-sidebarSectionTitle">{title}</div>}
        {children}
    </div>
));
FileSidebarSection.displayName = 'FileSidebarSection';

export interface FileSidebarItemProps {
    /**
     * The folder the item stands for. Clicking the item opens it with `OpenFiles`, and
     * files dragged onto it are moved (`MoveFiles`) or, from the computer, uploaded
     * (`DropFiles`) into it.
     */
    folder?: Nullable<FileData>;
    /** Defaults to the folder's name. */
    label?: ReactNode;
    /** A `ChonkyIconName`, an icon name the `iconComponent` knows, or any element. Defaults to the folder's icon. */
    icon?: Nullable<ChonkyIconName | string | React.ReactElement>;
    /**
     * Highlights the item. By default an item is active when its folder is the current
     * folder, or an ancestor of it other than the root of the folder chain.
     */
    active?: boolean;
    /** Runs instead of opening the folder. */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/** A sidebar entry, usually a folder. */
export const FileSidebarItem: React.FC<FileSidebarItemProps> = React.memo((props) => {
    const { folder, label, icon, active, onClick } = props;
    const dispatch = useDispatch<any>();
    const ChonkyIcon = useContext(ChonkyIconContext);

    const folderChain = useSelector(selectFolderChain);
    const chainIndex = folder ? folderChain.findIndex((f) => f?.id === folder.id) : -1;
    const isActive = active ?? (chainIndex === folderChain.length - 1 || chainIndex > 0);

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            if (onClick) return onClick(event);
            if (!folder || !FileHelper.isOpenable(folder)) return;
            dispatch(thunkRequestFileAction(ChonkyActions.OpenFiles, { targetFile: folder, files: [folder] }));
        },
        [dispatch, folder, onClick]
    );

    const { drop, dndIsOver, dndCanDrop } = useFileDrop({ file: folder ?? null });
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    drop(buttonRef);

    let iconComponent: ReactNode;
    if (React.isValidElement(icon)) iconComponent = icon;
    else if (icon) iconComponent = <ChonkyIcon icon={icon} />;
    else if (folder) iconComponent = <FileIcon file={folder} size={18} />;

    const text = label ?? folder?.name;
    return (
        <button
            ref={buttonRef}
            type="button"
            className={c('chonky-sidebarItem', { 'chonky-sidebarItemActive': isActive }, getDndOverClasses({ dndIsOver, dndCanDrop }))}
            title={typeof text === 'string' ? text : undefined}
            aria-current={isActive ? 'page' : undefined}
            onClick={handleClick}
        >
            {iconComponent && <span className="chonky-sidebarItemIcon">{iconComponent}</span>}
            <span className="chonky-sidebarItemLabel">{text}</span>
        </button>
    );
});
FileSidebarItem.displayName = 'FileSidebarItem';
