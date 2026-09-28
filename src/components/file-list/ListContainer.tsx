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
import { c } from '../../util/styles';
import { SmartFileEntry } from './FileEntry';
import { useRevealFiles } from './FileList-hooks';

export interface FileListListProps {
    width: number;
    height: number;
}

/** Keep in sync with `.chonky-listHeader` in chonky.css. */
const LIST_HEADER_HEIGHT = 32;

const listColumns = [
    { className: 'chonky-listCellName', stringId: 'nameColumn', label: 'Name', sortActionId: ChonkyActions.SortFilesByName.id },
    { className: 'chonky-listColumnType', stringId: 'typeColumn', label: 'Type', sortActionId: null },
    { className: 'chonky-listColumnSize', stringId: 'sizeColumn', label: 'Size', sortActionId: ChonkyActions.SortFilesBySize.id },
    { className: 'chonky-listColumnDate', stringId: 'dateColumn', label: 'Date modified', sortActionId: ChonkyActions.SortFilesByDate.id },
];

/**
 * Column headings for the list view. Clicking a heading sorts by that column, or
 * flips the order when it is already the sort column.
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
                itemSize={viewConfig.entryHeight}
                height={Math.max(0, height - LIST_HEADER_HEIGHT)}
                itemCount={displayFileIds.length}
                width={width}
                itemKey={getItemKey}
            >
                {rowRenderer}
            </FixedSizeList>
        );
    }, [viewConfig.entryHeight, height, displayFileIds, width, getItemKey]);

    return (
        <div className="chonky-listView" style={{ width }}>
            <ListHeader />
            {listComponent}
        </div>
    );
});
