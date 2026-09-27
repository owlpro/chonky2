/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React from 'react';
import { Nullable } from '../../types/util.types';
import { c } from '../../util/styles';

export interface FileThumbnailProps {
    className: string;
    thumbnailUrl: Nullable<string>;
}

export const FileThumbnail: React.FC<FileThumbnailProps> = React.memo(props => {
    const { className, thumbnailUrl } = props;

    const thumbnailStyle: React.CSSProperties = thumbnailUrl ? { backgroundImage: `url('${thumbnailUrl}')` } : {};

    return <div className={c(className, 'chonky-fileThumbnail')} style={thumbnailStyle} />;
});
FileThumbnail.displayName = 'FileThumbnail';
