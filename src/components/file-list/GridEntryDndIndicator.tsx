/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { useContext } from 'react';

import { DndEntryState } from '../../types/file-list.types';
import { ChonkyIconContext } from '../../util/icon-helper';
import { c, getDndOverClasses } from '../../util/styles';
import { useDndIcon } from './FileEntry-hooks';

export interface DnDIndicatorProps {
    className?: string;
    dndState: DndEntryState;
}

export const GridEntryDndIndicator: React.FC<DnDIndicatorProps> = React.memo(props => {
    const { className: externalClassName, dndState } = props;
    const dndIconName = useDndIcon(dndState);
    const ChonkyIcon = useContext(ChonkyIconContext);
    if (!dndIconName) return null;
    return (
        <div className={c('chonky-gridDndIndicator', getDndOverClasses(dndState), externalClassName)}>
            <ChonkyIcon icon={dndIconName} />
        </div>
    );
});
