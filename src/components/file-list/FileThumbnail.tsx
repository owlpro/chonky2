/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { useContext, useState } from 'react';
import { Nullable } from '../../types/util.types';

import { ChonkyIconName } from '../../types/icons.types';
import { ChonkyIconContext } from '../../util/icon-helper';
import { c } from '../../util/styles';

export interface FileThumbnailProps {
    className: string;
    thumbnailUrl: Nullable<string>;
}

/**
 * Thumbnail image. Pulses while it loads, and shows a broken image icon if it fails.
 * Give it `key={thumbnailUrl}` so a new URL starts over from loading.
 */
export const FileThumbnail: React.FC<FileThumbnailProps> = React.memo(props => {
    const { className, thumbnailUrl } = props;
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const ChonkyIcon = useContext(ChonkyIconContext);

    if (!thumbnailUrl || status === 'error') {
        return (
            <div className={c(className, 'chonky-fileThumbnail', 'chonky-thumbnailError')}>
                <ChonkyIcon icon={ChonkyIconName.imageBroken} />
            </div>
        );
    }

    return (
        <div className={c(className, 'chonky-fileThumbnail', { 'chonky-thumbnailLoading': status === 'loading' })}>
            <img
                src={thumbnailUrl}
                alt=""
                draggable={false}
                decoding="async"
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
            />
        </div>
    );
});
FileThumbnail.displayName = 'FileThumbnail';
