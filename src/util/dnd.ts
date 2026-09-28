import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend';
import { Nullable } from '../types/util.types';

import { EssentialActions } from '../action-definitions/essential';
import { ChonkyActions } from '../action-definitions/index';
import {
    selectCurrentFolder,
    selectFileActionMap,
    selectFolderChain,
    selectInstanceId,
    selectIsDnDDisabled,
    selectRenamingFileId,
    selectSelectedFiles,
} from '../redux/selectors';
import { thunkRequestFileAction } from '../redux/thunks/dispatchers.thunks';
import { StartDragNDropPayload } from '../types/action-payloads.types';
import {
    ChonkyDndDropResult,
    ChonkyDndFileEntryItem,
    ChonkyDndFileEntryType,
} from '../types/dnd.types';
import { DndEntryState } from '../types/file-list.types';
import { FileData } from '../types/file.types';
import { FileHelper } from './file-helper';
import { useDropIfAvailable } from './dnd-fallback';
import { useInstanceVariable } from './hooks-helpers';
import { RootState } from '../types/redux.types';

type NativeFileItem = { files: File[] };

/** Files dragged in from the OS are accepted only when the app registered `DropFiles`. */
const selectCanDropNativeFiles = (state: RootState) =>
    !selectIsDnDDisabled(state) && !!selectFileActionMap(state)[ChonkyActions.DropFiles.id];

export const useFileDrag = (file: Nullable<FileData>) => {
    const store = useStore<RootState>();
    const fileRef = useInstanceVariable(file);
    const dispatch = useDispatch<any>();

    const getDndStartPayload = useCallback<() => StartDragNDropPayload>(() => {
        const reduxState = store.getState();
        return {
            sourceInstanceId: selectInstanceId(reduxState),
            source: selectCurrentFolder(reduxState) ?? null,
            draggedFile: fileRef.current!,
            selectedFiles: selectSelectedFiles(reduxState).filter(Boolean) as FileData[],
        };
    }, [store, fileRef]);

    const canDrag = useCallback(
        () => !!fileRef.current && FileHelper.isDraggable(fileRef.current),
        [fileRef]
    );

    const onDragStart = useCallback((): ChonkyDndFileEntryItem => {
        const item: ChonkyDndFileEntryItem = {
            type: ChonkyDndFileEntryType,
            payload: getDndStartPayload(),
        };
        dispatch(thunkRequestFileAction(ChonkyActions.StartDragNDrop, item.payload));
        return item;
    }, [dispatch, getDndStartPayload]);

    const onDragEnd = useCallback(
        (item: ChonkyDndFileEntryItem, monitor: any) => {
            const dropResult = monitor.getDropResult() as ChonkyDndDropResult;
            if (
                !item?.payload?.draggedFile ||
                !FileHelper.isDraggable(item.payload.draggedFile) ||
                !dropResult ||
                !dropResult.dropTarget
            )
                return;

            dispatch(
                thunkRequestFileAction(ChonkyActions.EndDragNDrop, {
                    ...item.payload,
                    destination: dropResult.dropTarget,
                    copy: dropResult.dropEffect === 'copy',
                })
            );
        },
        [dispatch]
    );

    // The deps make react-dnd pick up new callbacks; without them the spec keeps the
    // callbacks from the first render.
    const [{ isDragging: dndIsDragging }, drag, preview] = useDrag(
        () => ({
            type: ChonkyDndFileEntryType,
            canDrag,
            item: () => onDragStart(),
            end: onDragEnd,
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [canDrag, onDragStart, onDragEnd]
    );

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    return { dndIsDragging, drag };
};

interface UseFileDropParams {
    file: Nullable<FileData>;
    forceDisableDrop?: boolean;
    includeChildrenDrops?: boolean;
}

export const useFileDrop = ({
    file,
    forceDisableDrop,
    includeChildrenDrops,
}: UseFileDropParams) => {
    const dispatch = useDispatch<any>();
    const folderChainRef = useInstanceVariable(useSelector(selectFolderChain));
    // Only other folders take OS files. Drops on files or on the current folder (the
    // file list, its breadcrumb) fall through to the zone on the Chonky root, see
    // `useNativeFileDrop`.
    const currentFolderId = useSelector(selectCurrentFolder)?.id;
    const acceptNativeFiles =
        useSelector(selectCanDropNativeFiles) &&
        !forceDisableDrop &&
        FileHelper.isDroppable(file) &&
        file.id !== currentFolderId;

    const onDrop = useCallback(
        (item: ChonkyDndFileEntryItem | NativeFileItem, monitor: any) => {
            if (!monitor.canDrop()) return;
            if (monitor.getItemType() === NativeTypes.FILE) {
                dispatch(
                    thunkRequestFileAction(ChonkyActions.DropFiles, {
                        files: (item as NativeFileItem).files,
                        destination: file!,
                    })
                );
            }
            const result: Omit<ChonkyDndDropResult, 'dropEffect'> = {
                dropTarget: file,
            };
            return result;
        },
        [dispatch, file]
    );

    const canDrop = useCallback(
        (item: ChonkyDndFileEntryItem, monitor: any) => {
            if (
                forceDisableDrop ||
                !FileHelper.isDroppable(file) ||
                (!monitor.isOver({ shallow: true }) && !includeChildrenDrops)
            ) {
                return false;
            }
            if (monitor.getItemType() === NativeTypes.FILE) return true;

            const { source, draggedFile, selectedFiles } = item.payload;
            const prohibitedFileIds = new Set<string>();
            if (file) prohibitedFileIds.add(file.id);
            folderChainRef.current.forEach((folder) => {
                if (folder) prohibitedFileIds.add(folder.id);
            });

            const movedFiles: FileData[] = [draggedFile, ...selectedFiles];
            for (const currFile of movedFiles) {
                if (prohibitedFileIds.has(currFile.id)) return false;
            }

            return file?.id !== source?.id;
        },
        [forceDisableDrop, file, includeChildrenDrops, folderChainRef]
    );

    // Without deps react-dnd would keep the first render's `file` and `forceDisableDrop`,
    // e.g. a breadcrumb that started out as the current folder would never accept drops.
    const [{ isOver, canDrop: dndCanDrop }, drop] = useDrop(
        () => ({
            accept: acceptNativeFiles ? [ChonkyDndFileEntryType, NativeTypes.FILE] : ChonkyDndFileEntryType,
            drop: onDrop,
            canDrop,
            collect: (monitor) => ({
                isOver: monitor.isOver({ shallow: true }),
                canDrop: monitor.canDrop(),
            }),
        }),
        [acceptNativeFiles, onDrop, canDrop]
    );

    return {
        dndIsOver: isOver,
        dndCanDrop,
        drop,
    };
};

/**
 * Makes an element (the Chonky root) a drop zone for files dragged in from the OS.
 * They are uploaded to the current folder, unless a folder entry or breadcrumb inside
 * the element takes the drop first.
 */
export const useNativeFileDrop = () => {
    const store = useStore<RootState>();
    const dispatch = useDispatch<any>();
    const enabled = useSelector(selectCanDropNativeFiles);

    const [{ isOver }, drop] = useDropIfAvailable(
        () => ({
            accept: enabled ? NativeTypes.FILE : [],
            canDrop: () => !!selectCurrentFolder(store.getState()),
            drop: (item: NativeFileItem, monitor) => {
                const currentFolder = selectCurrentFolder(store.getState());
                if (monitor.didDrop() || !currentFolder) return;
                dispatch(
                    thunkRequestFileAction(ChonkyActions.DropFiles, {
                        files: item.files,
                        destination: currentFolder,
                    })
                );
            },
            collect: (monitor) => ({
                isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
            }),
        }),
        [enabled, store, dispatch]
    );

    return { nativeFileDropIsOver: !!isOver, nativeFileDrop: drop };
};

/**
 * Makes an element outside Chonky, such as an app's sidebar entry, a drop target for
 * files dragged from Chonky. A drop there makes Chonky dispatch `MoveFiles` with
 * `folder` as the destination, the same as a drop onto a folder in the file list.
 *
 * The element must share Chonky's drag-and-drop context: wrap the app in react-dnd's
 * `DndProvider` with `HTML5Backend` and pass `disableDragAndDropProvider` to Chonky.
 * Without a `DndProvider` the hook does nothing. Chonky doesn't know the app's folder
 * tree, so moving a folder into one of its own subfolders has to be rejected by the app.
 */
export const useFolderDropTarget = (folder: Nullable<FileData>) => {
    const [{ isOver, canDrop }, drop] = useDropIfAvailable(
        () => ({
            accept: ChonkyDndFileEntryType,
            canDrop: (item: ChonkyDndFileEntryItem) => {
                if (!FileHelper.isDroppable(folder)) return false;
                const { source, draggedFile, selectedFiles } = item.payload;
                if (source?.id === folder.id) return false;
                return ![draggedFile, ...selectedFiles].some((file) => file.id === folder.id);
            },
            drop: (_item: ChonkyDndFileEntryItem, monitor) => {
                if (monitor.didDrop()) return;
                const result: Omit<ChonkyDndDropResult, 'dropEffect'> = { dropTarget: folder };
                return result;
            },
            collect: (monitor) => ({
                isOver: monitor.isOver({ shallow: true }),
                canDrop: monitor.canDrop(),
            }),
        }),
        [folder]
    );

    return {
        /** Ref callback for the drop target element. */
        dropRef: drop as (node: Nullable<Element>) => void,
        /** A Chonky file is being dragged over the element. */
        isOver: !!isOver,
        /** The file being dragged can be dropped into `folder`. */
        canDrop: !!canDrop,
    };
};

export const useFileEntryDnD = (file: Nullable<FileData>) => {
    const { dndIsDragging, drag } = useFileDrag(file);
    const { dndIsOver, dndCanDrop, drop } = useFileDrop({ file });

    // While the name is being edited, mouse drags select text in the field instead
    const renaming = useSelector(selectRenamingFileId) === file?.id && !!file;

    const combinedRef = (node: HTMLDivElement | null) => {
        if (!node) return;
        drop(node);
        drag(renaming ? null : node);
    };

    const dndState = useMemo<DndEntryState>(
        () => ({
            dndIsDragging,
            dndIsOver,
            dndCanDrop,
        }),
        [dndCanDrop, dndIsDragging, dndIsOver]
    );

    return { ref: combinedRef, dndState };
};

export const useDndHoverOpen = (
    file: Nullable<FileData>,
    dndState: DndEntryState
) => {
    const dispatch = useDispatch<any>();
    const currentFolderRef = useInstanceVariable(useSelector(selectCurrentFolder));

    useEffect(() => {
        if (
            !dndState.dndIsOver ||
            !FileHelper.isDndOpenable(file) ||
            file?.id === currentFolderRef.current?.id
        )
            return;

        const timeout = setTimeout(() => {
            dispatch(
                thunkRequestFileAction(EssentialActions.OpenFiles, {
                    targetFile: file,
                    files: [file],
                })
            );
        }, 1500);

        return () => clearTimeout(timeout);
    }, [dispatch, file, dndState.dndIsOver, currentFolderRef]);
};
