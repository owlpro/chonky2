import { useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import {
    ChonkyActions,
    ChonkyDndFileEntryItem,
    ChonkyDndFileEntryType,
    ChonkyFileActionData,
    ChonkyIconName,
    defineFileAction,
    FileActionHandler,
    FileData,
    FullFileBrowser,
    ToolbarButton,
    useFolderDropTarget,
} from 'chonky2';

import { HOME_ID, initialFiles, PlaygroundFile, sidebarSections } from './data';
import './playground.css';

type Mode = 'internal' | 'external';

// An app-defined action: `group` puts it in the toolbar's Actions menu and the context menu.
const ShowInfo = defineFileAction({
    id: 'show_info',
    requiresSelection: true,
    button: { name: 'Show info', toolbar: true, contextMenu: true, group: 'Actions', icon: ChonkyIconName.info },
} as const);

const fileActions = [
    ChonkyActions.CreateFolder,
    ChonkyActions.UploadFiles,
    ChonkyActions.DropFiles,
    ChonkyActions.RenameFile,
    ChonkyActions.DownloadFiles,
    ChonkyActions.CopyFiles,
    ChonkyActions.CutFiles,
    ChonkyActions.PasteFiles,
    ChonkyActions.DeleteFiles,
    ShowInfo,
];

// One log line per Chonky event, e.g. `open_files: Documents` or `change_selection: 2 selected`.
const describeAction = (data: ChonkyFileActionData) => {
    const payload = (data.payload ?? {}) as Record<string, any>;
    const details: string[] = [];
    if (payload.clickType) details.push(`${payload.clickType} click`);
    const file = payload.targetFile ?? payload.file ?? payload.draggedFile;
    if (file) details.push(file.name);
    else if (Array.isArray(payload.files)) details.push(payload.files.map((f: FileData) => f.name).join(', '));
    if (payload.selection instanceof Set) details.push(`${payload.selection.size} selected`);
    if (payload.destination) details.push(`→ ${payload.destination.name}`);
    if (typeof payload.name === 'string') details.push(`→ ${payload.name}`);
    if (details.length === 0 && data.state.selectedFilesForAction.length > 0) {
        details.push(data.state.selectedFilesForAction.map((f) => f.name).join(', '));
    }
    return details.length > 0 ? `${data.id}: ${details.join(' ')}` : data.id;
};

// `name`, or `name (2)`, `name (3)`, … before the extension when the name is taken
const getUniqueName = (files: PlaygroundFile[], parentId: string, baseName: string) => {
    const taken = new Set(files.filter((f) => f.parentId === parentId).map((f) => f.name));
    const dot = baseName.lastIndexOf('.');
    const [stem, extension] = dot > 0 ? [baseName.slice(0, dot), baseName.slice(dot)] : [baseName, ''];
    let name = baseName;
    for (let i = 2; taken.has(name); i++) name = `${stem} (${i})${extension}`;
    return name;
};

const getDescendantIds = (files: PlaygroundFile[], rootIds: Set<string>) => {
    const ids = new Set(rootIds);
    let grew = true;
    while (grew) {
        grew = false;
        for (const f of files) {
            if (f.parentId && ids.has(f.parentId) && !ids.has(f.id)) {
                ids.add(f.id);
                grew = true;
            }
        }
    }
    return ids;
};

let nextFileId = 1;

// Files dragged from Chonky can be dropped here when Chonky shares the app's DnD context.
const SidebarItem = ({
    folder,
    label,
    active,
    onOpen,
}: {
    folder: FileData | null;
    label: string;
    active: boolean;
    onOpen: () => void;
}) => {
    const { dropRef, isOver, canDrop } = useFolderDropTarget(folder);
    return (
        <button
            ref={dropRef}
            type="button"
            className={`pg-sidebarItem${active ? ' pg-active' : ''}${isOver && canDrop ? ' pg-dropOver' : ''}`}
            onClick={onOpen}
        >
            {label}
        </button>
    );
};

const Sidebar = ({
    files,
    folderId,
    onOpen,
}: {
    files: PlaygroundFile[];
    folderId: string;
    onOpen: (id: string) => void;
}) => (
    <nav className="pg-sidebar">
        <div className="pg-sidebarTitle">File Explorer</div>
        {sidebarSections.map((section) => (
            <div key={section.title} className="pg-sidebarSection">
                <div className="pg-sidebarSectionTitle">{section.title}</div>
                {section.items.map((item) => (
                    <SidebarItem
                        key={item.folderId}
                        folder={files.find((f) => f.id === item.folderId) ?? null}
                        label={item.label}
                        active={item.folderId === folderId}
                        onOpen={() => onOpen(item.folderId)}
                    />
                ))}
            </div>
        ))}
    </nav>
);

const Explorer = ({ mode, darkMode, onLog }: { mode: Mode; darkMode: boolean; onLog: (line: string) => void }) => {
    const [files, setFiles] = useState(initialFiles);
    const [folderId, setFolderId] = useState(HOME_ID);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    const folderChain = useMemo(() => {
        const chain: PlaygroundFile[] = [];
        let current = files.find((f) => f.id === folderId);
        while (current) {
            chain.unshift(current);
            current = files.find((f) => f.id === current!.parentId);
        }
        return chain;
    }, [files, folderId]);

    const visibleFiles = useMemo(
        () =>
            files
                .filter((f) => f.parentId === folderId)
                .map((f) => (f.isDir ? { ...f, childrenCount: files.filter((c) => c.parentId === f.id).length } : f)),
        [files, folderId]
    );

    const addUploadedFiles = useCallback(
        (uploadedFiles: File[], parentId: string) => {
            const uploaded = uploadedFiles.map<PlaygroundFile>((file) => ({
                id: `upload-${nextFileId++}`,
                name: file.name,
                size: file.size,
                modDate: new Date(file.lastModified),
                parentId,
                thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            }));
            setFiles((prev) => [...prev, ...uploaded]);
            onLog(`uploaded: ${uploaded.map((f) => f.name).join(', ')}`);
        },
        [onLog]
    );

    const handleFileAction = useCallback<FileActionHandler>(
        (data) => {
            onLog(describeAction(data));
            if (data.id === ChonkyActions.OpenFiles.id) {
                const target = data.payload.targetFile ?? data.payload.files[0];
                if (target?.isDir) setFolderId(target.id);
            } else if (data.id === ChonkyActions.MoveFiles.id) {
                const movedIds = new Set(data.payload.files.map((f) => f.id));
                const destinationId = data.payload.destination.id;
                setFiles((prev) => prev.map((f) => (movedIds.has(f.id) ? { ...f, parentId: destinationId } : f)));
            } else if (data.id === ChonkyActions.CreateFolder.id) {
                setFiles((prev) => [
                    ...prev,
                    {
                        id: `new-${nextFileId++}`,
                        name: getUniqueName(prev, folderId, 'New folder'),
                        isDir: true,
                        parentId: folderId,
                        modDate: new Date(),
                    },
                ]);
            } else if (data.id === ChonkyActions.DeleteFiles.id) {
                const deletedIds = new Set(data.state.selectedFilesForAction.map((f) => f.id));
                setFiles((prev) => {
                    const allDeleted = getDescendantIds(prev, deletedIds);
                    return prev.filter((f) => !allDeleted.has(f.id));
                });
            } else if (data.id === ChonkyActions.UploadFiles.id) {
                uploadInputRef.current?.click();
            } else if (data.id === ChonkyActions.CopyFilesTo.id) {
                const destinationId = data.payload.destination.id;
                setFiles((prev) => {
                    // Copies the files and, for folders, everything inside them
                    const copies: PlaygroundFile[] = [];
                    const copyInto = (file: PlaygroundFile, parentId: string, name: string) => {
                        const copy = { ...file, id: `copy-${nextFileId++}`, name, parentId };
                        copies.push(copy);
                        prev.filter((f) => f.parentId === file.id).forEach((child) => copyInto(child, copy.id, child.name));
                    };
                    for (const file of data.payload.files) {
                        const original = prev.find((f) => f.id === file.id);
                        if (original) copyInto(original, destinationId, getUniqueName([...prev, ...copies], destinationId, file.name));
                    }
                    return [...prev, ...copies];
                });
            } else if (data.id === ChonkyActions.ChangeFileName.id) {
                const { file, name } = data.payload;
                setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, name } : f)));
            } else if (data.id === ChonkyActions.DropFiles.id) {
                addUploadedFiles(data.payload.files, data.payload.destination.id);
            }
        },
        [addUploadedFiles, folderId, onLog]
    );

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        addUploadedFiles(Array.from(event.target.files ?? []), folderId);
        event.target.value = '';
    };

    return (
        <div className={`pg-window${darkMode ? ' pg-dark' : ''}`}>
            <Sidebar files={files} folderId={folderId} onOpen={setFolderId} />
            <div className="pg-browser">
                <FullFileBrowser
                    files={visibleFiles}
                    folderChain={folderChain}
                    fileActions={fileActions}
                    onFileAction={handleFileAction}
                    defaultFileViewActionId={ChonkyActions.EnableListView.id}
                    disableDragAndDropProvider={mode === 'external'}
                    darkMode={darkMode}
                    toolbarEnd={
                        <ToolbarButton
                            icon={ChonkyIconName.close}
                            iconOnly
                            text="Close"
                            onClick={() => onLog('close button clicked')}
                        />
                    }
                />
            </div>
            <input ref={uploadInputRef} type="file" multiple hidden onChange={handleUpload} />
        </div>
    );
};

// Lives outside Chonky; only receives drops when Chonky shares the app's DnD context.
const ExternalDropZone = ({ onLog }: { onLog: (line: string) => void }) => {
    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: ChonkyDndFileEntryType,
            drop: (item: ChonkyDndFileEntryItem) => {
                onLog(`External drop zone received ${item.payload.draggedFile.name}`);
            },
            collect: (monitor) => ({ isOver: monitor.isOver() }),
        }),
        [onLog]
    );

    return (
        <div
            ref={(node) => {
                drop(node);
            }}
            className={`pg-dropZone${isOver ? ' pg-over' : ''}`}
        >
            External drop zone: drag a file from Chonky here
        </div>
    );
};

const App = () => {
    const [mode, setMode] = useState<Mode>('external');
    const [darkMode, setDarkMode] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const addLog = useCallback((line: string) => setLog((prev) => [line, ...prev].slice(0, 50)), []);

    return (
        <div className={`pg-page${darkMode ? ' pg-dark' : ''}`}>
            <header className="pg-header">
                <h2>Chonky2 Playground</h2>
                <div className="pg-controls">
                    <label>
                        <input type="radio" checked={mode === 'external'} onChange={() => setMode('external')} />{' '}
                        External DndProvider + disableDragAndDropProvider (sidebar takes drops)
                    </label>
                    <label>
                        <input type="radio" checked={mode === 'internal'} onChange={() => setMode('internal')} />{' '}
                        Internal DndProvider
                    </label>
                    <label>
                        <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />{' '}
                        Dark mode
                    </label>
                </div>
            </header>

            {mode === 'internal' ? (
                <Explorer key="internal" mode="internal" darkMode={darkMode} onLog={addLog} />
            ) : (
                <DndProvider key="external" backend={HTML5Backend}>
                    <Explorer mode="external" darkMode={darkMode} onLog={addLog} />
                    <ExternalDropZone onLog={addLog} />
                </DndProvider>
            )}

            <section className="pg-log">
                <div className="pg-logHeader">
                    <h4>Log</h4>
                    <button type="button" onClick={() => setLog([])} disabled={log.length === 0}>
                        Clear
                    </button>
                </div>
                <pre>{log.join('\n') || 'No events yet.'}</pre>
            </section>
        </div>
    );
};

createRoot(document.getElementById('root')!).render(<App />);
