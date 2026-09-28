/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Nullable } from '../../types/util.types';

import { ChonkyActions } from '../../action-definitions/index';
import { reduxActions } from '../../redux/reducers';
import { selectRenamingFileId } from '../../redux/selectors';
import { thunkRequestFileAction } from '../../redux/thunks/dispatchers.thunks';
import { FileData } from '../../types/file.types';
import { c } from '../../util/styles';
import { useFileNameComponent, useModifierIconComponents } from './FileEntry-hooks';

export interface FileEntryNameProps {
    file: Nullable<FileData>;
    className?: string;
}

const stopPropagation = (event: React.SyntheticEvent) => event.stopPropagation();

let measureContext: Nullable<CanvasRenderingContext2D> | undefined;

/**
 * File names are centered on their cap height (`text-box` in chonky.css), but an input
 * centers its text on the font's ascent and descent. Pads the input by the difference,
 * so the text doesn't jump when the name turns into the field.
 */
const alignInputTextWithLabel = (input: HTMLInputElement) => {
    if (measureContext === undefined) measureContext = document.createElement('canvas').getContext('2d');
    if (!measureContext) return;
    const style = getComputedStyle(input);
    measureContext.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics = measureContext.measureText('H');
    const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent, actualBoundingBoxAscent: capHeight } = metrics;
    if (!ascent || !capHeight) return;
    // How far the input puts the middle of the capitals below the middle of the field
    const offset = (ascent - descent - capHeight) / 2;
    input.style.paddingTop = `${Math.max(0, -2 * offset)}px`;
    input.style.paddingBottom = `${Math.max(0, 2 * offset)}px`;
};

/**
 * Inline rename field. Enter or leaving the field confirms, Escape cancels. Folders
 * start with the whole name selected, files with the name before the extension.
 */
const FileRenameInput: React.FC<{ file: FileData }> = ({ file }) => {
    const dispatch = useDispatch<any>();
    const inputRef = useRef<HTMLInputElement>(null);
    const doneRef = useRef(false);

    useLayoutEffect(() => {
        const input = inputRef.current;
        if (!input) return;
        alignInputTextWithLabel(input);
        input.focus({ preventScroll: true });
        const extensionStart = file.isDir ? -1 : file.name.lastIndexOf('.');
        input.setSelectionRange(0, extensionStart > 0 ? extensionStart : file.name.length);
    }, [file.isDir, file.name]);

    const finish = useCallback(
        (confirm: boolean) => {
            if (doneRef.current) return;
            doneRef.current = true;
            const name = inputRef.current?.value.trim() ?? '';
            dispatch(reduxActions.endRename());
            if (confirm && name && name !== file.name) {
                dispatch(thunkRequestFileAction(ChonkyActions.ChangeFileName, { file, name }));
            }
        },
        [dispatch, file]
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            event.stopPropagation();
            if (event.key === 'Enter') {
                event.preventDefault();
                finish(true);
            } else if (event.key === 'Escape') {
                event.preventDefault();
                finish(false);
            }
        },
        [finish]
    );

    return (
        <input
            ref={inputRef}
            className="chonky-renameInput"
            defaultValue={file.name}
            spellCheck={false}
            aria-label="Name"
            onKeyDown={handleKeyDown}
            onBlur={(event) => {
                // The window losing focus (e.g. the OS input language switcher) keeps the
                // field focused inside the page, so editing goes on when the user returns.
                if (document.activeElement === event.currentTarget) return;
                finish(true);
            }}
            onClick={stopPropagation}
            onDoubleClick={stopPropagation}
            onMouseDown={stopPropagation}
            onContextMenu={stopPropagation}
        />
    );
};

export const FileEntryName: React.FC<FileEntryNameProps> = React.memo(({ file, className }) => {
    const modifierIconComponents = useModifierIconComponents(file);
    const fileNameComponent = useFileNameComponent(file);
    const renaming = useSelector(selectRenamingFileId) === file?.id && !!file;

    if (renaming) {
        return (
            <span className={c(className, 'chonky-renaming')}>
                <FileRenameInput file={file!} />
            </span>
        );
    }

    return (
        <span className={className} title={file ? file.name : undefined}>
            {modifierIconComponents.length > 0 && (
                <span className="chonky-modifierIcons">{modifierIconComponents}</span>
            )}
            {fileNameComponent}
        </span>
    );
});
FileEntryName.displayName = 'FileEntryName';
