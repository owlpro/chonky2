import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ExcludeKeys, Nullable } from 'tsdef';

import { EssentialActions } from '../action-definitions/essential';
import { ChonkyActions } from '../action-definitions/index';
import {
    selectCurrentFolder,
    selectFolderChain,
    selectInstanceId,
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
import { useInstanceVariable } from './hooks-helpers';
import { RootState } from '../types/redux.types';

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

    const [{ isDragging: dndIsDragging }, drag, preview] = useDrag(() => ({
        type: ChonkyDndFileEntryType,
        canDrag,
        item: () => onDragStart(),
        end: onDragEnd,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

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
    const folderChainRef = useInstanceVariable(useSelector(selectFolderChain));

    const onDrop = useCallback(
        (_item: ChonkyDndFileEntryItem, monitor: any) => {
            if (!monitor.canDrop()) return;
            const result: ExcludeKeys<ChonkyDndDropResult, 'dropEffect'> = {
                dropTarget: file,
            };
            return result;
        },
        [file]
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

    const [{ isOver, canDrop: dndCanDrop }, drop] = useDrop(() => ({
        accept: ChonkyDndFileEntryType,
        drop: onDrop,
        canDrop,
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }),
            canDrop: monitor.canDrop(),
        }),
    }));

    return {
        dndIsOver: isOver,
        dndCanDrop,
        drop,
    };
};

export const useFileEntryDnD = (file: Nullable<FileData>) => {
    const { dndIsDragging, drag } = useFileDrag(file);
    const { dndIsOver, dndCanDrop, drop } = useFileDrop({ file });

    const combinedRef = (node: HTMLDivElement | null) => {
        if (!node) return;
        drop(node);
        drag(node);
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
