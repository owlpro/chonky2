import React from 'react';

export interface FileTypeIconProps {
    kind: 'folder' | 'file';
    /** Folder colour, or the accent colour of a file's label. */
    color: string;
    /** Extension without the dot, shown on large file icons, e.g. `pdf`. */
    extension?: string;
    /** Width and height in pixels. */
    size: number;
}

/** Below this size the extension label is unreadable, so files show coloured lines instead. */
const LABEL_MIN_SIZE = 40;

/**
 * Two-tone icons for files and folders in the default look. Paper colours come from
 * CSS variables (`--chonky-icon-paper*`) so they follow the theme.
 */
export const FileTypeIcon: React.FC<FileTypeIconProps> = React.memo(({ kind, color, extension, size }) => {
    if (kind === 'folder') {
        return (
            <svg className="chonky-fileTypeIcon" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
                <path
                    d="M5 12.5A3.5 3.5 0 0 1 8.5 9h10.3c.9 0 1.8.4 2.5 1l2.4 2.3c.6.6 1.5 1 2.5 1h13.3a3.5 3.5 0 0 1 3.5 3.5V36a3.5 3.5 0 0 1-3.5 3.5h-31A3.5 3.5 0 0 1 5 36Z"
                    fill={color}
                />
                <path
                    d="M5 12.5A3.5 3.5 0 0 1 8.5 9h10.3c.9 0 1.8.4 2.5 1l2.4 2.3c.6.6 1.5 1 2.5 1h13.3a3.5 3.5 0 0 1 3.5 3.5V36a3.5 3.5 0 0 1-3.5 3.5h-31A3.5 3.5 0 0 1 5 36Z"
                    fill="#000"
                    fillOpacity={0.14}
                />
                <path
                    d="M5 19.5A3.5 3.5 0 0 1 8.5 16h31a3.5 3.5 0 0 1 3.5 3.5V36a3.5 3.5 0 0 1-3.5 3.5h-31A3.5 3.5 0 0 1 5 36Z"
                    fill={color}
                />
            </svg>
        );
    }

    const label = extension ? extension.slice(0, 4).toUpperCase() : '';
    const showLabel = size >= LABEL_MIN_SIZE && label.length > 0;
    const labelWidth = 6 + label.length * 6.4;
    return (
        <svg className="chonky-fileTypeIcon" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
            <path
                className="chonky-fileTypeIconPaper"
                d="M12 4.5h17.3l10.2 10.2V41a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3Z"
            />
            <path className="chonky-fileTypeIconFold" d="M29.3 4.5v7.7a2.5 2.5 0 0 0 2.5 2.5h7.7" />
            {showLabel ? (
                <>
                    <rect x={5} y={25} width={labelWidth} height={13} rx={2.5} fill={color} />
                    <text
                        x={5 + labelWidth / 2}
                        y={34.3}
                        fill="#fff"
                        fontSize={8.5}
                        fontWeight={700}
                        textAnchor="middle"
                        fontFamily="system-ui, sans-serif"
                    >
                        {label}
                    </text>
                </>
            ) : (
                <g fill={color}>
                    <rect x={14} y={21} width={20} height={3} rx={1.5} />
                    <rect x={14} y={27} width={20} height={3} rx={1.5} />
                    <rect x={14} y={33} width={13} height={3} rx={1.5} />
                </g>
            )}
        </svg>
    );
});
FileTypeIcon.displayName = 'FileTypeIcon';
