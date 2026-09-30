import React, {
    createContext, ReactNode, Ref, useCallback, useContext, useId, useLayoutEffect, useRef, useState
} from 'react';
import { XYCoord } from 'react-dnd';
import { useDispatch, useSelector, useStore } from 'react-redux';

import { ChonkyActions } from '../../action-definitions/index';
import {
    selectCollapsedSidebarSections, selectFavorites, selectFolderChain, selectInstanceId, selectIsDnDDisabled,
    selectIsSidebarSectionCollapsed
} from '../../redux/selectors';
import { useParamSelector } from '../../redux/store';
import { thunkRequestFileAction } from '../../redux/thunks/dispatchers.thunks';
import {
    thunkAddFavorites, thunkMoveFavorite, thunkRemoveFavorites, thunkToggleSidebarSection
} from '../../redux/thunks/user-state.thunks';
import {
    ChonkyDndFavoriteItem, ChonkyDndFavoriteType, ChonkyDndFileEntryItem, ChonkyDndFileEntryType
} from '../../types/dnd.types';
import { FileData } from '../../types/file.types';
import { ChonkyIconName } from '../../types/icons.types';
import { RootState } from '../../types/redux.types';
import { Nullable } from '../../types/util.types';
import { useAnimationsEnabled } from '../../util/animations';
import { useFileDrop } from '../../util/dnd';
import { useDragIfAvailable, useDropIfAvailable } from '../../util/dnd-fallback';
import { FileHelper } from '../../util/file-helper';
import { getI18nId, I18nNamespace, useIntl } from '../../util/i18n';
import { ChonkyIconContext } from '../../util/icon-helper';
import { c, getDndOverClasses } from '../../util/styles';
import { FileIcon } from '../file-list/FileEntryIcon';

export interface FileSidebarProps {
    className?: string;
    children?: ReactNode;
}

const SLIDE_ANIMATION = { duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1)' };

/** Where a section's title is (the section itself when it has none), to slide it from there. */
const getSectionTop = (section: Element) =>
    (section.querySelector(':scope > .chonky-sidebarSectionTitle') ?? section).getBoundingClientRect().top;

/** Lets a section record where the sections are before it collapses or expands. */
const SidebarLayoutContext = createContext<Nullable<() => void>>(null);

/**
 * Navigation pane on the left of the file list, like File Explorer's. Pass it to
 * `FullFileBrowser`'s `sidebar` prop, filled with `FileSidebarSection`s,
 * `FileSidebarItem`s and a `FileSidebarFavorites`.
 */
export const FileSidebar: React.FC<FileSidebarProps> = React.memo(({ className, children }) => {
    const navRef = useRef<HTMLElement | null>(null);
    const animationsEnabled = useAnimationsEnabled();
    const collapsedSections = useSelector(selectCollapsedSidebarSections);
    const positionsRef = useRef<Nullable<Map<Element, number>>>(null);

    // Records the sections' positions before a section collapses or expands, so each one
    // can slide from there to its new place
    const recordPositions = useCallback(() => {
        if (!animationsEnabled || !navRef.current) return;
        const positions = new Map<Element, number>();
        navRef.current
            .querySelectorAll('.chonky-sidebarSection')
            .forEach((section) => positions.set(section, getSectionTop(section)));
        positionsRef.current = positions;
        // With a controlled `userState` the change may never come
        setTimeout(() => {
            if (positionsRef.current === positions) positionsRef.current = null;
        }, 500);
    }, [animationsEnabled]);

    useLayoutEffect(() => {
        const positions = positionsRef.current;
        positionsRef.current = null;
        positions?.forEach((top, section) => {
            if (!section.isConnected) return;
            const offset = top - getSectionTop(section);
            if (Math.abs(offset) < 1) return;
            section.animate([{ transform: `translateY(${offset}px)` }, { transform: 'none' }], SLIDE_ANIMATION);
        });
    }, [collapsedSections]);

    return (
        <SidebarLayoutContext.Provider value={recordPositions}>
            <nav ref={navRef} className={c('chonky-sidebar', className)}>
                {children}
            </nav>
        </SidebarLayoutContext.Provider>
    );
});
FileSidebar.displayName = 'FileSidebar';

export interface FileSidebarSectionProps {
    /**
     * Identifies the section in the user state (`ChonkyUserState.collapsedSidebarSections`),
     * so it stays collapsed. Defaults to `title` when that is a string.
     */
    id?: string;
    title?: ReactNode;
    /** Shown before the title: a `ChonkyIconName`, an icon name the `iconComponent` knows, or any element. */
    icon?: Nullable<ChonkyIconName | string | React.ReactElement>;
    /**
     * Whether clicking the title collapses the section. A collapsed section shows only
     * its title: at the top of the sidebar when no open section comes before it,
     * otherwise at the bottom, like VS Code's views. Defaults to `true` for sections
     * with a title and an ID.
     */
    collapsible?: boolean;
    children?: ReactNode;
}

interface SidebarSectionFrameProps extends FileSidebarSectionProps {
    className?: string;
    rootRef?: Ref<HTMLElement>;
    /** Shown under the title while the section is collapsed. */
    collapsedContent?: ReactNode;
}

const SidebarSectionFrame: React.FC<SidebarSectionFrameProps> = (props) => {
    const { id, title, icon, collapsible, className, rootRef, collapsedContent, children } = props;
    const dispatch = useDispatch<any>();
    const ChonkyIcon = useContext(ChonkyIconContext);
    const bodyId = useId();
    const recordPositions = useContext(SidebarLayoutContext);
    const animationsEnabled = useAnimationsEnabled();
    const sectionRef = useRef<HTMLElement | null>(null);
    const bodyRef = useRef<HTMLDivElement | null>(null);
    // Set by a click, so only the user's toggles animate (not the saved state loading)
    const fadeInBodyRef = useRef(false);
    const [turningArrow, setTurningArrow] = useState(false);

    const sectionId = id ?? (typeof title === 'string' ? title : null);
    const canCollapse = !!title && !!sectionId && (collapsible ?? true);
    const collapsed = useParamSelector(selectIsSidebarSectionCollapsed, sectionId) && canCollapse;

    const toggle = useCallback(() => {
        if (!sectionId) return;
        recordPositions?.();
        fadeInBodyRef.current = animationsEnabled && collapsed;
        setTurningArrow(animationsEnabled);
        dispatch(thunkToggleSidebarSection(sectionId));
    }, [dispatch, sectionId, collapsed, animationsEnabled, recordPositions]);

    useLayoutEffect(() => {
        if (!fadeInBodyRef.current || collapsed) return;
        fadeInBodyRef.current = false;
        bodyRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], SLIDE_ANIMATION);
    }, [collapsed]);

    const setSectionRef = useCallback(
        (node: HTMLElement | null) => {
            sectionRef.current = node;
            if (typeof rootRef === 'function') rootRef(node);
            else if (rootRef) (rootRef as React.MutableRefObject<HTMLElement | null>).current = node;
        },
        [rootRef]
    );

    let iconComponent: ReactNode = null;
    if (React.isValidElement(icon)) iconComponent = icon;
    else if (icon) iconComponent = <ChonkyIcon icon={icon} />;
    const titleContent = (
        <>
            {iconComponent && <span className="chonky-sidebarSectionIcon">{iconComponent}</span>}
            <span className="chonky-sidebarSectionTitleText">{title}</span>
        </>
    );

    let header: ReactNode = null;
    if (title && canCollapse) {
        header = (
            <button
                type="button"
                className="chonky-sidebarSectionTitle chonky-sidebarSectionToggle"
                aria-expanded={!collapsed}
                aria-controls={collapsed ? undefined : bodyId}
                onClick={toggle}
            >
                <span
                    className={c('chonky-sidebarSectionArrow', { 'chonky-sidebarSectionArrowTurning': turningArrow })}
                    onTransitionEnd={() => setTurningArrow(false)}
                >
                    <ChonkyIcon icon={ChonkyIconName.sectionToggle} />
                </span>
                {titleContent}
            </button>
        );
    } else if (title) {
        header = <div className="chonky-sidebarSectionTitle">{titleContent}</div>;
    }

    return (
        <section
            ref={setSectionRef}
            className={c('chonky-sidebarSection', className, { 'chonky-sidebarSectionCollapsed': collapsed })}
        >
            {header}
            {collapsed ? (
                collapsedContent
            ) : (
                <div ref={bodyRef} id={bodyId} className="chonky-sidebarSectionBody">
                    {children}
                </div>
            )}
        </section>
    );
};

/**
 * A group of sidebar items under an optional title. Clicking the title collapses the
 * section, and the user state remembers it (see `FileBrowserProps.userState`).
 */
export const FileSidebarSection: React.FC<FileSidebarSectionProps> = React.memo((props) => (
    <SidebarSectionFrame {...props} />
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

/** The folders a drag from the file list carries, like `EndDragNDrop` computes them. */
const getDraggedFolders = (item: ChonkyDndFileEntryItem) => {
    const { draggedFile, selectedFiles } = item.payload;
    return (selectedFiles.length > 0 ? selectedFiles : [draggedFile]).filter(FileHelper.isDirectory);
};

const canAddFavorites = (state: RootState, item: ChonkyDndFileEntryItem) => {
    const favoriteIds = new Set(selectFavorites(state).map((f) => f.id));
    return getDraggedFolders(item).some((f) => !favoriteIds.has(f.id));
};

/** Whether the pointer is in the top or the bottom half of an element. */
const getDropSide = (element: Nullable<HTMLElement>, offset: Nullable<XYCoord>) => {
    if (!element || !offset) return null;
    const rect = element.getBoundingClientRect();
    return offset.y < rect.top + rect.height / 2 ? 'before' : 'after';
};

const FavoriteItem: React.FC<{ folder: FileData; index: number }> = React.memo(({ folder, index }) => {
    const dispatch = useDispatch<any>();
    const intl = useIntl();
    const ChonkyIcon = useContext(ChonkyIconContext);
    const instanceId = useSelector(selectInstanceId);
    const dndDisabled = useSelector(selectIsDnDDisabled);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [dropSide, setDropSide] = useState<'before' | 'after' | null>(null);

    const [{ isDragging }, drag] = useDragIfAvailable(
        () => ({
            type: ChonkyDndFavoriteType,
            item: (): ChonkyDndFavoriteItem => ({ type: ChonkyDndFavoriteType, instanceId, fileId: folder.id }),
            canDrag: () => !dndDisabled,
            collect: (monitor) => ({ isDragging: monitor.isDragging() }),
        }),
        [instanceId, folder.id, dndDisabled]
    );

    const [{ isOver }, drop] = useDropIfAvailable(
        () => ({
            accept: ChonkyDndFavoriteType,
            canDrop: (item: ChonkyDndFavoriteItem) => item.instanceId === instanceId && item.fileId !== folder.id,
            hover: (_item, monitor) => {
                setDropSide(monitor.canDrop() ? getDropSide(rootRef.current, monitor.getClientOffset()) : null);
            },
            drop: (item: ChonkyDndFavoriteItem, monitor) => {
                const side = getDropSide(rootRef.current, monitor.getClientOffset());
                dispatch(thunkMoveFavorite(item.fileId, side === 'before' ? index : index + 1));
                return {};
            },
            collect: (monitor) => ({ isOver: monitor.isOver() && monitor.canDrop() }),
        }),
        [instanceId, folder.id, index, dispatch]
    );

    const setRootRef = (node: HTMLDivElement | null) => {
        rootRef.current = node;
        drag(drop(node));
    };

    const removeLabel = intl.formatMessage({
        id: getI18nId(I18nNamespace.Sidebar, 'removeFavorite'),
        defaultMessage: 'Remove from Favorites',
    });
    const side = isOver ? dropSide : null;
    return (
        <div
            ref={setRootRef}
            className={c('chonky-sidebarFavorite', {
                'chonky-sidebarFavoriteDragging': isDragging,
                'chonky-sidebarFavoriteDropBefore': side === 'before',
                'chonky-sidebarFavoriteDropAfter': side === 'after',
            })}
        >
            <FileSidebarItem folder={folder} />
            <button
                type="button"
                className="chonky-sidebarFavoriteRemove"
                title={removeLabel}
                aria-label={removeLabel}
                onClick={() => dispatch(thunkRemoveFavorites([folder.id]))}
            >
                <ChonkyIcon icon={ChonkyIconName.close} />
            </button>
        </div>
    );
});
FavoriteItem.displayName = 'FavoriteItem';

export interface FileSidebarFavoritesProps {
    /** Defaults to the `chonky.sidebar.favorites` message, "Favorites". */
    title?: ReactNode;
    /** Identifies the section in the user state, see `FileSidebarSection`. Defaults to `favorites`. */
    id?: string;
    /** Shown before the title, see `FileSidebarSection`. Defaults to a star; `null` hides it. */
    icon?: Nullable<ChonkyIconName | string | React.ReactElement>;
}

/**
 * A sidebar section with the user's favorite folders, kept in the user state (see
 * `FileBrowserProps.userState`). Folders are added by dropping them onto the section
 * or with `ChonkyActions.AddToFavorites`, reordered by dragging, and removed with the
 * ✕ button or `ChonkyActions.RemoveFromFavorites`. Clicking a favorite opens it.
 */
export const FileSidebarFavorites: React.FC<FileSidebarFavoritesProps> = React.memo((props) => {
    const { id = 'favorites', icon = ChonkyIconName.favorite } = props;
    const dispatch = useDispatch<any>();
    const store = useStore<RootState>();
    const intl = useIntl();
    const ChonkyIcon = useContext(ChonkyIconContext);
    const favorites = useSelector(selectFavorites);
    const instanceId = useSelector(selectInstanceId);
    const dndDisabled = useSelector(selectIsDnDDisabled);
    const collapsed = useParamSelector(selectIsSidebarSectionCollapsed, id);

    // Folders dragged from the list are added, favorites dragged here go to the end
    const [{ isOver, canDrop, isFolderDrag }, drop] = useDropIfAvailable(
        () => ({
            accept: [ChonkyDndFileEntryType, ChonkyDndFavoriteType],
            canDrop: (item: ChonkyDndFileEntryItem | ChonkyDndFavoriteItem, monitor) => {
                if (dndDisabled) return false;
                if (monitor.getItemType() === ChonkyDndFavoriteType) {
                    return (item as ChonkyDndFavoriteItem).instanceId === instanceId;
                }
                return canAddFavorites(store.getState(), item as ChonkyDndFileEntryItem);
            },
            drop: (item: ChonkyDndFileEntryItem | ChonkyDndFavoriteItem, monitor) => {
                // A favorite took the drop: a move into its folder, or a reorder
                if (monitor.didDrop()) return;
                if (monitor.getItemType() === ChonkyDndFavoriteType) {
                    const favoriteCount = selectFavorites(store.getState()).length;
                    dispatch(thunkMoveFavorite((item as ChonkyDndFavoriteItem).fileId, favoriteCount));
                } else {
                    dispatch(thunkAddFavorites(getDraggedFolders(item as ChonkyDndFileEntryItem)));
                }
                // No `dropTarget`, so the files aren't moved anywhere
                return {};
            },
            collect: (monitor) => ({
                isOver: monitor.isOver({ shallow: true }),
                canDrop: monitor.canDrop(),
                isFolderDrag: monitor.getItemType() === ChonkyDndFileEntryType,
            }),
        }),
        [dndDisabled, instanceId, store, dispatch]
    );

    const title =
        props.title ??
        intl.formatMessage({ id: getI18nId(I18nNamespace.Sidebar, 'favorites'), defaultMessage: 'Favorites' });
    const dropHint = (
        <div className="chonky-sidebarDropHint">
            <ChonkyIcon icon={ChonkyIconName.favorite} />
            <span>
                {intl.formatMessage({
                    id: getI18nId(I18nNamespace.Sidebar, 'favoritesDropHint'),
                    defaultMessage: 'Drop folders here',
                })}
            </span>
        </div>
    );

    return (
        <SidebarSectionFrame
            id={id}
            title={title}
            icon={icon}
            rootRef={drop as unknown as Ref<HTMLElement>}
            className={c('chonky-sidebarFavorites', { 'chonky-sidebarFavoritesDropping': isOver && canDrop })}
            // While collapsed, the hint shows up when a folder that can be added is dragged
            collapsedContent={collapsed && canDrop && isFolderDrag ? dropHint : null}
        >
            {favorites.map((folder, index) => (
                <FavoriteItem key={folder.id} folder={folder} index={index} />
            ))}
            {/* Favorites take drops into their folder, so the hint gives adding a place of its own */}
            {(favorites.length === 0 || (canDrop && isFolderDrag)) && dropHint}
        </SidebarSectionFrame>
    );
});
FileSidebarFavorites.displayName = 'FileSidebarFavorites';
