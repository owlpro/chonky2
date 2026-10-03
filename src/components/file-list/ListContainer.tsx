/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { CSSProperties, useCallback, useContext, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FixedSizeList } from 'react-window';

import { ChonkyActions } from '../../action-definitions/index';
import {
    selectFileActionMap,
    selectFileViewConfig,
    selectors,
    selectSortActionId,
    selectSortOrder,
} from '../../redux/selectors';
import { thunkRequestFileAction } from '../../redux/thunks/dispatchers.thunks';
import { FileViewMode } from '../../types/file-view.types';
import { ChonkyIconName } from '../../types/icons.types';
import { SortOrder } from '../../types/sort.types';
import { useInstanceVariable } from '../../util/hooks-helpers';
import { getI18nId, I18nNamespace, useIntl } from '../../util/i18n';
import { ChonkyIconContext } from '../../util/icon-helper';
import { c, ChonkyNarrowLayoutContext, useIsCoarsePointer } from '../../util/styles';
import { SmartFileEntry } from './FileEntry';
import { useRevealFiles } from './FileList-hooks';

export interface FileListListProps {
    width: number;
    height: number;
}

/** Keep in sync with `.chonky-listHeader` in chonky.css. */
const LIST_HEADER_HEIGHT = 32;
/** The least row height for fingers, e.g. on a phone. */
const TOUCH_ROW_HEIGHT = 44;
/** Rows while Chonky is narrow, see `NarrowListEntry`. Keep in sync with chonky.css. */
const NARROW_ROW_HEIGHT = 72;

const listColumns = [
    { className: 'chonky-listCellName', stringId: 'nameColumn', label: 'Name', sortActionId: ChonkyActions.SortFilesByName.id },
    { className: 'chonky-listColumnType', stringId: 'typeColumn', label: 'Type', sortActionId: null },
    { className: 'chonky-listColumnSize', stringId: 'sizeColumn', label: 'Size', sortActionId: ChonkyActions.SortFilesBySize.id },
    { className: 'chonky-listColumnDate', stringId: 'dateColumn', label: 'Date modified', sortActionId: ChonkyActions.SortFilesByDate.id },
];

/**
 * Column headings for the list view. Clicking a heading sorts by that column, a second
 * click reverses the order, and a third one goes back to the order of `files`.
 */
const ListHeader: React.FC = React.memo(() => {
    const intl = useIntl();
    const dispatch = useDispatch<any>();
    const fileActionMap = useSelector(selectFileActionMap);
    const sortActionId = useSelector(selectSortActionId);
    const sortOrder = useSelector(selectSortOrder);
    const ChonkyIcon = useContext(ChonkyIconContext);

    return (
        <div className="chonky-listHeader" role="row">
            {listColumns.map((column) => {
                const label = intl.formatMessage({
                    id: getI18nId(I18nNamespace.FileList, column.stringId),
                    defaultMessage: column.label,
                });
                const sortAction = column.sortActionId ? fileActionMap[column.sortActionId] : undefined;
                const className = c('chonky-listCell', 'chonky-listHeaderCell', column.className);
                if (!sortAction) {
                    return (
                        <div key={column.stringId} className={className} role="columnheader">
                            {label}
                        </div>
                    );
                }

                const isSorted = sortActionId === sortAction.id;
                return (
                    <button
                        key={column.stringId}
                        type="button"
                        role="columnheader"
                        aria-sort={isSorted ? (sortOrder === SortOrder.ASC ? 'ascending' : 'descending') : 'none'}
                        className={c(className, 'chonky-listHeaderButton', { 'chonky-sorted': isSorted })}
                        onClick={() => dispatch(thunkRequestFileAction(sortAction, undefined))}
                    >
                        <span className="chonky-listHeaderLabel">{label}</span>
                        {isSorted && (
                            <span className="chonky-listHeaderSortIcon">
                                <ChonkyIcon
                                    icon={sortOrder === SortOrder.ASC ? ChonkyIconName.sortAsc : ChonkyIconName.sortDesc}
                                />
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
});
ListHeader.displayName = 'ListHeader';

export const ListContainer: React.FC<FileListListProps> = React.memo((props) => {
    const { width, height } = props;

    const viewConfig = useSelector(selectFileViewConfig);
    const coarsePointer = useIsCoarsePointer();
    // While narrow there are no column headings; sorting is in the Options menu
    const narrow = useContext(ChonkyNarrowLayoutContext);
    const headerHeight = narrow ? 0 : LIST_HEADER_HEIGHT;
    let rowHeight = viewConfig.entryHeight;
    if (narrow) rowHeight = NARROW_ROW_HEIGHT;
    else if (coarsePointer) rowHeight = Math.max(viewConfig.entryHeight, TOUCH_ROW_HEIGHT);

    const listRef = useRef<FixedSizeList>(null);

    const displayFileIds = useSelector(selectors.getDisplayFileIds);
    const displayFileIdsRef = useInstanceVariable(displayFileIds);
    const getItemKey = useCallback(
        (index: number) => displayFileIdsRef.current[index] ?? `loading-file-${index}`,
        [displayFileIdsRef]
    );

    const scrollToIndex = useCallback((index: number) => listRef.current?.scrollToItem(index, 'smart'), []);
    useRevealFiles(displayFileIds, scrollToIndex);

    const listComponent = useMemo(() => {
        // When entry size is null, we use List view
        const rowRenderer = (data: { index: number; style: CSSProperties }) => {
            return (
                <div className="chonky-listRow" style={data.style}>
                    <SmartFileEntry
                        fileId={displayFileIds[data.index] ?? null}
                        displayIndex={data.index}
                        fileViewMode={FileViewMode.List}
                    />
                </div>
            );
        };

        return (
            <FixedSizeList
                ref={listRef as any}
                className="chonky-listContainer"
                itemSize={rowHeight}
                height={Math.max(0, height - headerHeight)}
                itemCount={displayFileIds.length}
                width={width}
                itemKey={getItemKey}
            >
                {rowRenderer}
            </FixedSizeList>
        );
    }, [rowHeight, height, headerHeight, displayFileIds, width, getItemKey]);

    return (
        <div className="chonky-listView" style={{ width }}>
            {!narrow && <ListHeader />}
            {listComponent}
        </div>
    );
});
