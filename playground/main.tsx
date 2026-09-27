import { useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import {
    ChonkyActions,
    ChonkyDndFileEntryItem,
    ChonkyFileActionData,
    ChonkyDndFileEntryType,
    FileActionHandler,
    FileData,
    FullFileBrowser,
} from 'chonky2';

type Mode = 'internal' | 'external';
type PlaygroundFile = FileData & { parentId: string | null };

const initialFiles: PlaygroundFile[] = [
    { id: 'root', name: 'Root', isDir: true, parentId: null },
    { id: 'docs', name: 'Documents', isDir: true, parentId: 'root' },
    { id: 'photos', name: 'Photos', isDir: true, parentId: 'root' },
    { id: 'readme', name: 'README.md', parentId: 'root', size: 2_480, modDate: new Date('2026-09-20T10:30:00') },
    { id: 'report', name: 'Report.pdf', parentId: 'root', size: 1_845_000, modDate: new Date('2026-08-02T16:05:00') },
    { id: 'notes', name: 'Notes.txt', parentId: 'root', size: 312 },
    { id: 'invoice', name: 'Invoice.xlsx', parentId: 'docs' },
    { id: 'beach', name: 'Beach.png', parentId: 'photos' },
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
    return details.length > 0 ? `${data.id}: ${details.join(' ')}` : data.id;
};

const FileBrowserDemo = ({
    mode,
    darkMode,
    onLog,
}: {
    mode: Mode;
    darkMode: boolean;
    onLog: (line: string) => void;
}) => {
    const [files, setFiles] = useState(initialFiles);
    const [folderId, setFolderId] = useState('root');

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
            }
        },
        [onLog]
    );

    return (
        <div style={{ height: 420 }}>
            <FullFileBrowser
                files={visibleFiles}
                folderChain={folderChain}
                onFileAction={handleFileAction}
                disableDragAndDropProvider={mode === 'external'}
                darkMode={darkMode}
            />
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
            style={{
                marginTop: 12,
                padding: 24,
                border: '2px dashed #888',
                borderRadius: 8,
                textAlign: 'center',
                background: isOver ? '#d8f5d8' : '#fff',
            }}
        >
            External drop zone: drag a file from Chonky here
        </div>
    );
};

const App = () => {
    const [mode, setMode] = useState<Mode>('internal');
    const [darkMode, setDarkMode] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const addLog = useCallback((line: string) => setLog((prev) => [line, ...prev].slice(0, 50)), []);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
            <h2>Chonky2 Playground</h2>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                <label>
                    <input type="radio" checked={mode === 'internal'} onChange={() => setMode('internal')} /> Internal
                    DndProvider (default)
                </label>
                <label>
                    <input type="radio" checked={mode === 'external'} onChange={() => setMode('external')} /> External
                    DndProvider + disableDragAndDropProvider
                </label>
                <label>
                    <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} /> Dark
                    mode
                </label>
            </div>

            {mode === 'internal' ? (
                <FileBrowserDemo key="internal" mode="internal" darkMode={darkMode} onLog={addLog} />
            ) : (
                <DndProvider key="external" backend={HTML5Backend}>
                    <FileBrowserDemo mode="external" darkMode={darkMode} onLog={addLog} />
                    <ExternalDropZone onLog={addLog} />
                </DndProvider>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h4>Log</h4>
                <button type="button" onClick={() => setLog([])} disabled={log.length === 0}>
                    Clear
                </button>
            </div>
            <pre style={{ background: '#fff', padding: 12, minHeight: 80, maxHeight: 240, overflow: 'auto' }}>{log.join('\n') || 'No events yet.'}</pre>
        </div>
    );
};

createRoot(document.getElementById('root')!).render(<App />);
