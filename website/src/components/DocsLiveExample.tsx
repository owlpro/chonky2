import { useRef, useState } from 'react';
import {
  ChonkyActions,
  ChonkyIconName,
  FileBrowser,
  FileContextMenu,
  FileList,
  FileNavbar,
  FileSidebar,
  FileSidebarFavorites,
  FileSidebarItem,
  FileSidebarRecent,
  FileSidebarSection,
  FileStatusBar,
  FullFileBrowser,
  ToolbarButton,
  defineFileAction,
  type ChonkyUserState,
  type FileActionHandler,
  type FileBrowserHandle,
  type FileData,
} from 'chonky2';

type Example =
  | 'basic' | 'navigation' | 'interactions' | 'loading' | 'files' | 'path'
  | 'actions' | 'clipboard' | 'search' | 'reveal' | 'sidebar' | 'theme'
  | 'translation' | 'layout' | 'toolbar' | 'defaults' | 'ref' | 'storage' | 'accent';

const seed: Record<string, FileData[]> = {
  home: [
    { id: 'documents', name: 'Documents', isDir: true, childrenCount: 2 },
    { id: 'pictures', name: 'Pictures', isDir: true, childrenCount: 2 },
    { id: 'readme', name: 'README.md', size: 2048, modDate: '2026-09-20', searchText: 'guide intro' },
  ],
  documents: [
    { id: 'report', name: 'Report.pdf', size: 480000, modDate: '2026-09-21', searchText: 'budget 2026' },
    { id: 'notes', name: 'Notes.md', size: 6200, modDate: '2026-09-22', searchText: 'meeting' },
  ],
  pictures: [
    { id: 'sunrise', name: 'Sunrise.jpg', size: 2100000, searchText: 'summer album beach' },
    { id: 'portrait', name: 'Portrait.png', size: 920000 },
  ],
};
const names: Record<string, string> = { home: 'Home', documents: 'Documents', pictures: 'Pictures' };
const parents: Record<string, string | null> = { home: null, documents: 'home', pictures: 'home' };
const sampleState: ChonkyUserState = {
  favorites: [{ id: 'documents', name: 'Documents', isDir: true }, { id: 'pictures', name: 'Pictures', isDir: true }],
  recent: [{ id: 'report', name: 'Report.pdf', size: 480000 }, { id: 'sunrise', name: 'Sunrise.jpg', size: 2100000 }],
  collapsedSidebarSections: ['folders'],
};
const ShowInfo = defineFileAction({
  id: 'docs_show_info',
  requiresSelection: true,
  button: { name: 'Show info', toolbar: true, contextMenu: true, group: 'Actions', icon: ChonkyIconName.info },
});

function getPath(id: string, parentMap: Record<string, string | null>): string[] {
  const result: string[] = [];
  let current: string | null = id;
  while (current) {
    result.unshift(current);
    current = parentMap[current] ?? null;
  }
  return result;
}

export default function DocsLiveExample({ example, caption }: { example: Example; caption: string }) {
  const [folderMap, setFolderMap] = useState(seed);
  const [parentMap, setParentMap] = useState(parents);
  const [folderNames, setFolderNames] = useState(names);
  const [path, setPath] = useState(example === 'search' ? ['home', 'pictures'] : ['files', 'path'].includes(example) ? ['home', 'documents'] : ['home']);
  const [userState, setUserState] = useState<ChonkyUserState>(sampleState);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(example === 'storage' ? 'Select a folder, add it to Favorites, then reload this page.' : 'Try the explorer below.');
  const browserRef = useRef<FileBrowserHandle>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const currentId = path[path.length - 1] ?? 'home';
  const isStatic = example === 'basic';
  const isSidebar = example === 'sidebar' || example === 'storage';
  const isActions = example === 'actions' || example === 'clipboard';
  const folderChain = isStatic ? undefined : path.map((id) => ({ id, name: folderNames[id] ?? id, isDir: true }));
  const files = isStatic ? [seed.home[2]!] : folderMap[currentId] ?? [];

  const handleAction: FileActionHandler = (data) => {
    if (data.id === ChonkyActions.OpenFiles.id) {
      const target = data.payload.targetFile ?? data.payload.files[0];
      if (target?.isDir && target.id in folderMap) {
        setPath(getPath(target.id, parentMap));
        setMessage(`Opened ${target.name}`);
      } else if (target) {
        setMessage(`Opened ${target.name} — your app can handle this event.`);
      }
    } else if (data.id === ChonkyActions.UploadFiles.id && example === 'actions') {
      uploadRef.current?.click();
    } else if (data.id === ChonkyActions.DropFiles.id && example === 'actions') {
      const { destination, files: dropped } = data.payload;
      setFolderMap((previous) => ({ ...previous, [destination.id]: [...(previous[destination.id] ?? []), ...dropped.map((file) => ({ id: `upload-${Date.now()}-${file.name}`, name: file.name, size: file.size }))] }));
      setMessage(`Added ${dropped.length} uploaded file(s) to ${destination.name}.`);
    } else if (data.id === ChonkyActions.CreateFolder.id && isActions) {
      const id = `new-${Date.now()}`;
      const name = 'New folder';
      setFolderMap((previous) => ({ ...previous, [currentId]: [...(previous[currentId] ?? []), { id, name, isDir: true }], [id]: [] }));
      setParentMap((previous) => ({ ...previous, [id]: currentId }));
      setFolderNames((previous) => ({ ...previous, [id]: name }));
      setMessage('Created New folder in local sample data.');
    } else if (data.id === ChonkyActions.ChangeFileName.id && isActions) {
      const { file, name } = data.payload;
      setFolderMap((previous) => ({ ...previous, [currentId]: (previous[currentId] ?? []).map((entry) => entry.id === file.id ? { ...entry, name } : entry) }));
      setFolderNames((previous) => ({ ...previous, [file.id]: name }));
      setMessage(`Renamed ${file.name} to ${name}.`);
    } else if (data.id === ChonkyActions.DeleteFiles.id && isActions) {
      const ids = new Set(data.state.selectedFilesForAction.map((file) => file.id));
      setFolderMap((previous) => ({ ...previous, [currentId]: (previous[currentId] ?? []).filter((file) => !ids.has(file.id)) }));
      setMessage(`Deleted ${ids.size} item(s) from local sample data.`);
    } else if (data.id === ChonkyActions.CopyFilesTo.id && example === 'clipboard') {
      const { destination, files: copied } = data.payload;
      setFolderMap((previous) => ({ ...previous, [destination.id]: [...(previous[destination.id] ?? []), ...copied.map((file) => ({ ...file, id: `${file.id}-copy-${Date.now()}` }))] }));
      setMessage(`Copied ${copied.length} item(s) to ${destination.name}.`);
    } else if (data.id === ChonkyActions.MoveFiles.id && example === 'clipboard') {
      const { destination, files: moved } = data.payload;
      const ids = new Set(moved.map((file) => file.id));
      setFolderMap((previous) => {
        const next = { ...previous };
        for (const id of Object.keys(next)) next[id] = (next[id] ?? []).filter((file) => !ids.has(file.id));
        next[destination.id] = [...(next[destination.id] ?? []), ...moved];
        return next;
      });
      setMessage(`Moved ${moved.length} item(s) to ${destination.name}.`);
    } else if (data.id === ShowInfo.id) {
      setMessage(data.state.selectedFilesForAction.map((file) => `${file.name} (${file.id})`).join(', ') || 'Select a file first.');
    } else if (data.id === ChonkyActions.ChangeSearch.id && example === 'search') {
      setMessage(data.payload.searchString ? `Search query: ${data.payload.searchString}` : 'Search cleared.');
    }
  };

  const sidebar = isSidebar ? (
    <FileSidebar>
      <FileSidebarFavorites />
      <FileSidebarRecent limit={5} />
      <FileSidebarSection id="folders" title="Folders" icon={ChonkyIconName.folder}>
        <FileSidebarItem folder={{ id: 'home', name: 'Home', isDir: true }} icon={ChonkyIconName.home} />
        {seed.home.filter((file) => file.isDir).map((folder) => <FileSidebarItem key={folder.id} folder={folder} />)}
      </FileSidebarSection>
    </FileSidebar>
  ) : undefined;
  const extraActions = isActions
    ? [ChonkyActions.CreateFolder, ChonkyActions.UploadFiles, ChonkyActions.RenameFile, ChonkyActions.DeleteFiles,
       ...(example === 'clipboard' ? [ChonkyActions.CopyFiles, ChonkyActions.CutFiles, ChonkyActions.PasteFiles] : []), ShowInfo]
    : isSidebar ? [ChonkyActions.AddToFavorites, ChonkyActions.RemoveFromFavorites] : undefined;
  const browserProps = {
    files,
    folderChain,
    onFileAction: handleAction,
    loading,
    fileActions: extraActions,
    darkMode: dark,
    ...(isSidebar ? { sidebar, ...(example === 'storage' ? { userStateStorageKey: 'chonky2-docs-live-example' } : { userState, onUserStateChange: setUserState }) } : {}),
    ...(example === 'translation' ? { i18n: { locale: 'fa', messages: {
      'chonky.toolbar.searchPlaceholder': 'جست‌وجو',
      'chonky.fileList.nameColumn': 'نام',
      'chonky.actions.open_files.button.name': 'باز کردن',
    } } } : {}),
    ...(example === 'defaults' ? {
      defaultFileViewActionId: ChonkyActions.EnableListView.id,
      defaultSortActionId: ChonkyActions.SortFilesBySize.id,
    } : {}),
    ...(example === 'toolbar' ? {
      toolbarEnd: <ToolbarButton icon={ChonkyIconName.refresh} text="Refresh" onClick={() => setMessage('Refreshed sample data.')} />,
    } : {}),
  };

  return (
    <figure className="docs-example not-content">
      {example === 'actions' && <input ref={uploadRef} type="file" multiple hidden onChange={(event) => {
        const uploaded = Array.from(event.currentTarget.files ?? []);
        setFolderMap((previous) => ({ ...previous, [currentId]: [...(previous[currentId] ?? []), ...uploaded.map((file) => ({ id: `upload-${Date.now()}-${file.name}`, name: file.name, size: file.size }))] }));
        setMessage(`Added ${uploaded.length} uploaded file(s) to local sample data.`);
        event.currentTarget.value = '';
      }} />}
      <figcaption><span className="docs-example-dot" aria-hidden="true" />{caption}<small>Live example · sample data in memory</small></figcaption>
      {(example === 'loading' || example === 'theme' || example === 'reveal' || example === 'ref') && (
        <div className="docs-example-controls">
          {example === 'loading' && <button type="button" onClick={() => { setLoading(true); setMessage('Loading sample folder…'); window.setTimeout(() => { setLoading(false); setMessage('Sample folder loaded.'); }, 1100); }}>Simulate load</button>}
          {example === 'theme' && <button type="button" onClick={() => setDark((value) => !value)}>{dark ? 'Use light theme' : 'Use dark theme'}</button>}
          {example === 'reveal' && <button type="button" onClick={() => { browserRef.current?.revealFiles(['sunrise']); setPath(['home', 'pictures']); setMessage('Revealed Sunrise.jpg in Pictures.'); }}>Reveal Sunrise.jpg in Pictures</button>}
          {example === 'ref' && <><button type="button" onClick={() => { browserRef.current?.setFileSelection(new Set(['documents'])); setMessage('Selected Documents with the browser ref.'); }}>Select Documents</button><button type="button" onClick={() => setMessage(`Selected IDs: ${[...(browserRef.current?.getFileSelection() ?? [])].join(', ') || 'none'}`)}>Read selection</button></>}
        </div>
      )}
      <div className={`docs-example-browser${example === 'accent' ? ' docs-example-accent' : ''}`}>
        {example === 'layout' ? (
          <FileBrowser {...browserProps} ref={browserRef}>
            <FileNavbar />
            <FileList />
            <FileStatusBar />
            <FileContextMenu />
          </FileBrowser>
        ) : <FullFileBrowser {...browserProps} ref={browserRef} />}
      </div>
      <p className="docs-example-status" role="status" aria-live="polite">{message}</p>
    </figure>
  );
}
