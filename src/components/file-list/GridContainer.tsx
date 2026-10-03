/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { VariableSizeGrid } from 'react-window';

import { selectFileViewConfig, selectors } from '../../redux/selectors';
import { FileViewConfigGrid } from '../../types/file-view.types';
import { useInstanceVariable } from '../../util/hooks-helpers';
import { useIsMobileBreakpoint } from '../../util/styles';
import { SmartFileEntry } from './FileEntry';
import { useRevealFiles } from './FileList-hooks';

export interface FileListGridProps {
    width: number;
    height: number;
}

interface GridConfig {
    rowCount: number;
    columnCount: number;
    gutter: number;
    rowHeight: number;
    columnWidth: number;
}

export const isMobileDevice = () => {
    // noinspection JSDeprecatedSymbols
    return typeof window.orientation !== 'undefined' || navigator.userAgent.indexOf('IEMobile') !== -1;
};

/**
 * Lays the grid out like a desktop file manager: `entryWidth` is the smallest column
 * width, as many columns as fit are used, and they stretch to share the leftover space.
 * Room for a scrollbar is only kept when the rows don't fit in `height`.
 */
export const getGridConfig = (
    width: number,
    height: number,
    fileCount: number,
    viewConfig: FileViewConfigGrid,
    isMobileBreakpoint: boolean,
    /** The grid's own scrollbar width once it has one, see `GridContainer`. */
    measuredScrollbarWidth?: number
): GridConfig => {
    const gutter = isMobileBreakpoint ? 5 : 8;
    const rowHeight = viewConfig.entryHeight;

    const layout = (availableWidth: number) => {
        const columnCount = isMobileBreakpoint
            ? 2
            : Math.max(1, Math.floor((availableWidth + gutter) / (viewConfig.entryWidth + gutter)));
        // Whole pixels, so rounding never makes the columns wider than the grid
        const columnWidth = Math.max(0, Math.floor((availableWidth - gutter * (columnCount - 1)) / columnCount));
        return { columnCount, columnWidth, rowCount: Math.ceil(fileCount / columnCount) };
    };

    let { columnCount, columnWidth, rowCount } = layout(width);
    const contentHeight = rowCount * rowHeight + Math.max(0, rowCount - 1) * gutter;
    if (contentHeight > height && !isMobileDevice()) {
        ({ columnCount, columnWidth, rowCount } = layout(width - (measuredScrollbarWidth ?? getScrollbarWidth())));
    }

    return {
        rowCount,
        columnCount,
        gutter,
        rowHeight,
        columnWidth,
    };
};

let scrollbarWidth: number | undefined;

/**
 * Width of a classic (non-overlay) vertical scrollbar; 0 with overlay scrollbars. Only a
 * first guess: the app's CSS can give the grid a wider one, which the grid then measures.
 */
const getScrollbarWidth = () => {
    if (scrollbarWidth === undefined) {
        const probe = document.createElement('div');
        // Thin, like the scrollbars chonky.css gives the file list
        probe.style.cssText = 'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;scrollbar-width:thin';
        document.body.appendChild(probe);
        scrollbarWidth = probe.offsetWidth - probe.clientWidth;
        probe.remove();
    }
    return scrollbarWidth;
};

export const GridContainer: React.FC<FileListGridProps> = React.memo(props => {
    const { width, height } = props;

    const viewConfig = useSelector(selectFileViewConfig) as FileViewConfigGrid;
    const displayFileIds = useSelector(selectors.getDisplayFileIds);
    const fileCount = useMemo(() => displayFileIds.length, [displayFileIds]);

    const gridRef = useRef<VariableSizeGrid>(null);
    const outerRef = useRef<HTMLDivElement>(null);
    const isMobileBreakpoint = useIsMobileBreakpoint();
    const [measuredScrollbarWidth, setMeasuredScrollbarWidth] = useState<number | undefined>(undefined);

    // Whenever the grid config changes at runtime, we call a method on the
    // `VariableSizeGrid` handle to reset column width/row height cache.
    // !!! Note that we deliberately update the `gridRef` firsts and update the React
    //     state AFTER that. This is needed to avoid file entries jumping up/down.
    const [gridConfig, setGridConfig] = useState(() =>
        getGridConfig(width, height, fileCount, viewConfig, isMobileBreakpoint, measuredScrollbarWidth)
    );
    const gridConfigRef = useRef(gridConfig);
    useEffect(() => {
        const oldConf = gridConfigRef.current;
        const newConf = getGridConfig(width, height, fileCount, viewConfig, isMobileBreakpoint, measuredScrollbarWidth);

        gridConfigRef.current = newConf;
        if (gridRef.current) {
            if (oldConf.rowCount !== newConf.rowCount) {
                gridRef.current.resetAfterRowIndex(Math.min(oldConf.rowCount, newConf.rowCount) - 1);
            }
            if (oldConf.columnCount !== newConf.columnCount) {
                gridRef.current.resetAfterColumnIndex(Math.min(oldConf.columnCount, newConf.rowCount) - 1);
            }
            if (oldConf.columnWidth !== newConf.columnWidth) {
                gridRef.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
            }
        }

        setGridConfig(newConf);
    }, [setGridConfig, gridConfigRef, isMobileBreakpoint, width, height, viewConfig, fileCount, measuredScrollbarWidth]);

    // The scrollbar the grid really has, e.g. a full-width one when the app's CSS turns off
    // Chonky's thin scrollbars, so the columns never get wider than the room beside it
    useLayoutEffect(() => {
        const outer = outerRef.current;
        if (!outer || outer.scrollHeight <= outer.clientHeight) return;
        const actual = outer.offsetWidth - outer.clientWidth;
        if (actual !== (measuredScrollbarWidth ?? getScrollbarWidth())) setMeasuredScrollbarWidth(actual);
    }, [gridConfig, measuredScrollbarWidth]);

    const scrollToIndex = useCallback((index: number) => {
        const columnCount = gridConfigRef.current.columnCount;
        gridRef.current?.scrollToItem({
            rowIndex: Math.floor(index / columnCount),
            columnIndex: index % columnCount,
            align: 'smart',
        });
    }, []);
    useRevealFiles(displayFileIds, scrollToIndex);

    const sizers = useMemo(() => {
        const gc = gridConfigRef;
        return {
            getColumnWidth: (index: number) =>
                gc.current.columnWidth! + (index === gc.current.columnCount - 1 ? 0 : gc.current.gutter),
            getRowHeight: (index: number) =>
                gc.current.rowHeight + (index === gc.current.rowCount - 1 ? 0 : gc.current.gutter),
        };
    }, [gridConfigRef]);

    const displayFileIdsRef = useInstanceVariable(useSelector(selectors.getDisplayFileIds));
    const getItemKey = useCallback(
        (data: { columnIndex: number; rowIndex: number; data: any }) => {
            const index = data.rowIndex * gridConfigRef.current.columnCount + data.columnIndex;

            return displayFileIdsRef.current[index] ?? `loading-file-${index}`;
        },
        [gridConfigRef, displayFileIdsRef]
    );

    const cellRenderer = useCallback(
        (data: { rowIndex: number; columnIndex: number; style: CSSProperties }) => {
            const gc = gridConfigRef;
            const index = data.rowIndex * gc.current.columnCount + data.columnIndex;
            const fileId = displayFileIds[index];
            if (displayFileIds[index] === undefined) return null;

            const styleWithGutter: CSSProperties = {
                ...data.style,
                paddingRight: data.columnIndex === gc.current.columnCount - 1 ? 0 : gc.current.gutter,
                paddingBottom: data.rowIndex === gc.current.rowCount - 1 ? 0 : gc.current.gutter,
                boxSizing: 'border-box',
            };

            return (
                <div style={styleWithGutter}>
                    <SmartFileEntry fileId={fileId ?? null} displayIndex={index} fileViewMode={viewConfig.mode} />
                </div>
            );
        },
        [displayFileIds, viewConfig.mode]
    );

    const gridComponent = useMemo(() => {
        return (
            <VariableSizeGrid
                ref={gridRef as any}
                outerRef={outerRef}
                className="chonky-gridContainer"
                estimatedRowHeight={gridConfig.rowHeight + gridConfig.gutter}
                rowHeight={sizers.getRowHeight}
                estimatedColumnWidth={gridConfig.columnWidth + gridConfig.gutter}
                columnWidth={sizers.getColumnWidth}
                columnCount={gridConfig.columnCount}
                height={height}
                rowCount={gridConfig.rowCount}
                width={width}
                itemKey={getItemKey}
            >
                {cellRenderer}
            </VariableSizeGrid>
        );
    }, [
        gridConfig.rowHeight,
        gridConfig.gutter,
        gridConfig.columnWidth,
        gridConfig.columnCount,
        gridConfig.rowCount,
        sizers.getRowHeight,
        sizers.getColumnWidth,
        height,
        width,
        getItemKey,
        cellRenderer,
    ]);

    return gridComponent;
});
