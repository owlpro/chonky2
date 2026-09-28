import { CSSProperties } from 'react';

import { DndEntryState } from '../../types/file-list.types';
import { ChonkyIconName } from '../../types/icons.types';
import { Nullable } from '../../types/util.types';
import { getDndOverClasses } from '../../util/styles';

export type FileEntryState = {
    childrenCount: Nullable<number>;
    color: string;
    icon: ChonkyIconName | string;
    thumbnailUrl: Nullable<string>;
    iconSpin: boolean;
    selected: boolean;
    focused: boolean;
    /** On Chonky's clipboard from `CutFiles`, waiting to be pasted. */
    cut: boolean;
};

/**
 * State classes for the root element of a file entry. Styles in `chonky.css` hang
 * selection, thumbnail and drag-and-drop looks off these.
 */
export const getEntryStateClasses = (entryState: FileEntryState, dndState: DndEntryState) => ({
    'chonky-selected': entryState.selected,
    'chonky-focused': entryState.focused,
    'chonky-cut': entryState.cut,
    'chonky-has-thumbnail': !!entryState.thumbnailUrl,
    'chonky-dnd-dragging': dndState.dndIsDragging,
    ...getDndOverClasses(dndState),
});

export const getEntryColorStyle = (entryState: FileEntryState) =>
    ({ '--chonky-entry-color': entryState.color }) as CSSProperties;
