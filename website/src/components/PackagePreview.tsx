import { useState } from 'react';
import {
  ChonkyActions,
  FileSidebar,
  FileSidebarItem,
  FileSidebarSection,
  FullFileBrowser,
  type FileActionHandler,
  type FileData,
} from 'chonky2';

const folders: Record<string, FileData[]> = {
  home: [
    { id: 'documents', name: 'Documents', isDir: true, childrenCount: 3, modDate: '2026-09-21' },
    { id: 'pictures', name: 'Pictures', isDir: true, childrenCount: 3, modDate: '2026-09-18' },
    { id: 'projects', name: 'Projects', isDir: true, childrenCount: 2, modDate: '2026-09-27' },
    { id: 'readme', name: 'README.md', size: 2480, modDate: '2026-09-20' },
  ],
  documents: [
    { id: 'invoices', name: 'Invoices', isDir: true, childrenCount: 2, modDate: '2026-09-16' },
    { id: 'proposal', name: 'Project proposal.pdf', size: 480000, modDate: '2026-09-15' },
    { id: 'notes', name: 'Meeting notes.md', size: 6220, modDate: '2026-09-22' },
  ],
  invoices: [
    { id: 'invoice-aug', name: 'August invoice.pdf', size: 145000, modDate: '2026-09-01' },
    { id: 'invoice-sep', name: 'September invoice.pdf', size: 158000, modDate: '2026-09-29' },
  ],
  pictures: [
    { id: 'mountains', name: 'Mountains.jpg', size: 2100000, modDate: '2026-09-18' },
    { id: 'city', name: 'City skyline.png', size: 1680000, modDate: '2026-09-16' },
    { id: 'portrait', name: 'Portrait.webp', size: 920000, modDate: '2026-09-13' },
  ],
  projects: [
    { id: 'website', name: 'Website', isDir: true, childrenCount: 2, modDate: '2026-09-27' },
    { id: 'brief', name: 'Design brief.pdf', size: 804000, modDate: '2026-09-25' },
  ],
  website: [
    { id: 'assets', name: 'Assets', isDir: true, childrenCount: 1, modDate: '2026-09-27' },
    { id: 'index', name: 'index.tsx', size: 8320, modDate: '2026-09-27' },
  ],
  assets: [
    { id: 'logo', name: 'Logo.svg', size: 4220, modDate: '2026-09-27' },
  ],
};

const folderNames: Record<string, string> = {
  home: 'Home',
  documents: 'Documents',
  invoices: 'Invoices',
  pictures: 'Pictures',
  projects: 'Projects',
  website: 'Website',
  assets: 'Assets',
};

const parents: Record<string, string | null> = {
  home: null,
  documents: 'home',
  pictures: 'home',
  projects: 'home',
  invoices: 'documents',
  website: 'projects',
  assets: 'website',
};

function pathTo(folderId: string): string[] {
  const path: string[] = [];
  let id: string | null = folderId;
  while (id) {
    path.unshift(id);
    id = parents[id] ?? null;
  }
  return path;
}

export default function PackagePreview() {
  const [path, setPath] = useState(['home']);
  const [darkMode, setDarkMode] = useState(false);
  const [announcement, setAnnouncement] = useState('Sample files · No backend required');
  const currentFolder = path[path.length - 1] ?? 'home';

  const handleFileAction: FileActionHandler = (data) => {
    if (data.id !== ChonkyActions.OpenFiles.id) return;
    const target = data.payload.targetFile ?? data.payload.files[0];
    if (!target) return;
    if (target.isDir && target.id in folders) {
      setPath(pathTo(target.id));
      setAnnouncement('Opened ' + target.name);
    } else if (!target.isDir) {
      setAnnouncement('Selected sample file: ' + target.name);
    }
  };

  const sidebar = (
    <FileSidebar>
      <FileSidebarSection id="places" title="Places">
        <FileSidebarItem folder={{ id: 'home', name: 'Home', isDir: true }} />
        {folders.home.filter((file) => file.isDir).map((folder) => (
          <FileSidebarItem key={folder.id} folder={folder} />
        ))}
      </FileSidebarSection>
    </FileSidebar>
  );

  return (
    <div className="package-preview" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="package-preview-controls" style={{
        minHeight: 42, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '0 14px', background: darkMode ? '#1d2b3e' : '#f8fbff',
        color: darkMode ? '#cbd9ed' : '#60748f', borderBottom: darkMode ? '1px solid #334760' : '1px solid #e0e9f5',
        fontSize: 11,
      }}>
        <span role="status" aria-live="polite">{announcement}</span>
        <button type="button" onClick={() => setDarkMode((value) => !value)} aria-label={darkMode ? 'Use light mode' : 'Use dark mode'} style={{
          border: darkMode ? '1px solid #526786' : '1px solid #d5e2f2',
          borderRadius: 6, padding: '5px 10px', color: darkMode ? '#d9e7ff' : '#356ba9',
          background: darkMode ? '#293b54' : '#fff', cursor: 'pointer', whiteSpace: 'nowrap',
          fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
        }}>
          {darkMode ? '☀ Light mode' : '◐ Dark mode'}
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <FullFileBrowser
          files={folders[currentFolder] ?? []}
          folderChain={path.map((id) => ({ id, name: folderNames[id] ?? id, isDir: true }))}
          onFileAction={handleFileAction}
          sidebar={sidebar}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}
