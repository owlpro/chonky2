<p align="center">
    <img src="./images/chonky-logo-v7.png" alt="Chonky v7 Logo" width="500" />
    <br />
    <a href="https://www.npmjs.com/package/chonky2">
        <img alt="NPM package" src="https://img.shields.io/npm/v/chonky2.svg?style=flat&colorB=ffac5c" />
    </a>
    <a href="https://tldrlegal.com/license/mit-license">
        <img alt="MIT license" src="https://img.shields.io/npm/l/chonky2?style=flat&colorB=dcd67a" />
    </a>
    <a href="https://www.npmjs.com/package/chonky2">
        <img alt="NPM downloads" src="https://img.shields.io/npm/dt/chonky2?style=flat&colorB=aef498" />
    </a>
    <a href="https://github.com/owlpro/chonky2">
        <img alt="GitHub stars" src="https://img.shields.io/github/stars/owlpro/chonky2?style=flat&colorB=50f4cc" />
    </a>
    <br /><br />
</p>

# Chonky2

**Chonky2** is a modernized and optimized fork of [Chonky](https://github.com/TimboKZ/Chonky) —
a React file browser component that recreates the native file explorer experience in the browser.

Users can **drag & drop**, **select multiple files**, **switch between list and grid views**,
**navigate back and forward**, and use **keyboard shortcuts**. Chonky only renders the UI: your
app supplies the files and decides what each action does, so it works with any backend or API.

<p align="center">
    <img src="./images/preview-light.png" alt="Chonky2 in light mode, list view" width="800" />
</p>

<p align="center">
    <img src="./images/preview-dark.png" alt="Chonky2 in dark mode, grid view with thumbnails" width="800" />
</p>

---

## 🚀 What's New in v7

### 🪟 Fluent Design
- A new look modelled on the Windows 11 File Explorer: folder title and menu bar, an address bar with **Back**, **Forward** and **Up**, a list view with **sortable columns**, and a status bar.
- Colour-coded file icons, image thumbnails in the grid view, and a built-in dark theme.

### 🎨 No UI Framework Required
- Material UI, Emotion, styled-components and JSS are no longer needed.
- Styles are plain CSS, injected automatically, and themed with CSS variables.

### 🪶 Light Dependencies
- The only peer dependencies are `react` and `react-dom`.
- `react-intl` was replaced by a small formatter built on the browser's `Intl` APIs.
- Chonky's cost in an app bundle dropped from about 139 KB to 55 KB (minified + brotli, all dependencies included).

### 📦 Package Modernization
- Works with **Vite**, **ESM** and **CommonJS** (`require('chonky2')`).
- Dependencies are not bundled into the package, so apps that use the same libraries share one copy.

Upgrading from 6.x? See **Upgrading from 6.x** below and the [changelog](./CHANGELOG.md).

---

## 📦 Installation

```bash
npm install chonky2
```

The only peer dependencies are `react` and `react-dom` (19 or newer).

---

## ⚙️ Quick Start

Chonky is a controlled component: pass it the files of the current folder and the path
to that folder, and handle `OpenFiles` to navigate.

```tsx
import { useState } from 'react';
import { ChonkyActions, FileActionHandler, FileData, FullFileBrowser } from 'chonky2';

const folders: Record<string, FileData[]> = {
  root: [
    { id: 'docs', name: 'Documents', isDir: true },
    { id: 'photo', name: 'Photo.png', size: 2_100_000, modDate: new Date() },
  ],
  docs: [{ id: 'report', name: 'Report.pdf', size: 480_000 }],
};
const names: Record<string, string> = { root: 'Home', docs: 'Documents' };

export default function Explorer() {
  const [path, setPath] = useState(['root']);

  const handleFileAction: FileActionHandler = (data) => {
    if (data.id === ChonkyActions.OpenFiles.id) {
      const target = data.payload.targetFile ?? data.payload.files[0];
      if (!target?.isDir) return;
      // Opening a folder that is already in the path (breadcrumbs, Up, Back) goes back to it.
      const index = path.indexOf(target.id);
      setPath(index >= 0 ? path.slice(0, index + 1) : [...path, target.id]);
    }
  };

  const currentId = path[path.length - 1] ?? 'root';
  return (
    <div style={{ height: 500 }}>
      <FullFileBrowser
        files={folders[currentId] ?? []}
        folderChain={path.map((id) => ({ id, name: names[id] ?? id, isDir: true }))}
        onFileAction={handleFileAction}
      />
    </div>
  );
}
```

No need to import icons or stylesheets — they are included automatically. **Back** and
**Forward** work without extra code: Chonky remembers the visited folders and reopens them
through the same `OpenFiles` action.

### Building your own layout

`FullFileBrowser` is a shortcut for the parts below. Use them directly to leave some out
or to place your own layout, such as a sidebar, around them:

```tsx
import {
  FileBrowser, FileContextMenu, FileList, FileNavbar, FileStatusBar, FileToolbar,
} from 'chonky2';

<FileBrowser files={files} folderChain={folderChain} onFileAction={handleFileAction}>
  <FileToolbar />     {/* folder title, one menu per action group, action buttons */}
  <FileNavbar />      {/* Back, Forward, Up, breadcrumbs and search */}
  <FileList />        {/* list, grid or compact view */}
  <FileStatusBar />   {/* item, selection and hidden-file counts */}
  <FileContextMenu /> {/* right-click menu */}
</FileBrowser>
```

---

## 🧰 Actions

Everything the user does is an action, delivered to `onFileAction`. Built-in actions such
as selection, sorting and view switching work on their own; the ones that change your data
(open, move, delete, …) only tell you what the user wants.

| Action | When it fires | Payload / state |
|---|---|---|
| `OpenFiles` | Double click, Enter, breadcrumbs, Up, Back, Forward | `payload.targetFile`, `payload.files` |
| `MoveFiles` | Files dropped onto a folder, or cut files pasted | `payload.files`, `payload.destination` |
| `CopyFilesTo` | Copied files pasted | `payload.files`, `payload.destination` |
| `ChangeFileName` | A new name confirmed in the inline rename field | `payload.file`, `payload.name` |
| `ChangeSelection` | Selection changed | `payload.selection` (a `Set` of IDs) |
| `ChangeSearch` | Search text changed (after typing stops, Enter, Esc, or cleared by navigating) | `payload.searchString` (trimmed) |
| `DropFiles` | Files dragged in from the computer are dropped | `payload.files` (`File[]`), `payload.destination` |
| `CreateFolder`, `UploadFiles`, `DownloadFiles`, `CopyFiles`, `CutFiles`, `DeleteFiles` | Their button, menu item or hotkey | `state.selectedFilesForAction` |

`CreateFolder`, `UploadFiles`, `DownloadFiles`, `CopyFiles`, `CutFiles`, `PasteFiles`,
`RenameFile`, `DeleteFiles` and `DropFiles` are opt-in. Add the ones you support, and they
appear in the toolbar, menus and context menu.

- **Create and rename.** `RenameFile` (F2) turns the selected file's name into a text field.
  After `CreateFolder`, the first folder that shows up in the current folder gets the same
  field, with its name selected. Enter or clicking elsewhere confirms, Esc cancels. A
  changed name reaches you as `ChangeFileName`.
- **Copy, cut and paste.** `CopyFiles` (Ctrl+C) and `CutFiles` (Ctrl+X) put the selection
  on Chonky's clipboard; cut files are shown faded. `PasteFiles` (Ctrl+V) pastes into the
  current folder, or into the folder its context menu was opened on: copies arrive as
  `CopyFilesTo`, cut files as `MoveFiles`.
- **Upload by drag and drop.** `DropFiles` has no button: it makes the whole file browser a
  drop target for files from the user's computer. They go to the current folder, or to the
  folder entry or breadcrumb they are dropped on (`payload.destination`).
- New files that show up in the current folder after `UploadFiles`, `DropFiles` or
  `PasteFiles` are selected and scrolled into view.
- **Search.** The search field filters the current folder: a file is shown when every word
  typed is part of its `name` or its `searchText`. The search is cleared when the folder
  changes, and files it hides are deselected. To find files outside the current folder,
  handle `ChangeSearch`, open the folder the file is in, and reveal it with the ref:

```tsx
const browserRef = useRef<FileBrowserHandle>(null);

const handleAction: FileActionHandler = async (data) => {
  if (data.id === ChonkyActions.ChangeSearch.id) {
    const media = await findMediaById(data.payload.searchString); // your API
    if (!media) return;
    openFolder(media.folderId);                 // update folderChain and files
    browserRef.current?.revealFiles([media.id]); // selected and scrolled to once listed
  }
};
```

```tsx
<FullFileBrowser
  files={files}
  folderChain={folderChain}
  fileActions={[ChonkyActions.CreateFolder, ChonkyActions.RenameFile, ChonkyActions.DropFiles, ChonkyActions.DeleteFiles]}
  onFileAction={(data) => {
    if (data.id === ChonkyActions.CreateFolder.id) {
      api.createFolder(currentFolderId, 'New folder'); // the user renames it in place
    } else if (data.id === ChonkyActions.ChangeFileName.id) {
      api.rename(data.payload.file.id, data.payload.name);
    } else if (data.id === ChonkyActions.DeleteFiles.id) {
      api.delete(data.state.selectedFilesForAction.map((file) => file.id));
    } else if (data.id === ChonkyActions.DropFiles.id) {
      api.upload(data.payload.files, data.payload.destination.id);
    }
  }}
/>
```

Custom actions are created with `defineFileAction`. Actions with a `button.group` appear
in that group's menu in the toolbar (e.g. `Actions`, `Options`) and, with
`button.contextMenu`, in the context menu; actions without a group get their own toolbar
button:

```tsx
const ShowInfo = defineFileAction({
  id: 'show_info',
  requiresSelection: true,
  button: { name: 'Show info', toolbar: true, contextMenu: true, group: 'Actions', icon: ChonkyIconName.info },
});
```

### Toolbar content

`FullFileBrowser` takes `toolbarStart` (before the menus) and `toolbarEnd` (after the view
buttons, behind a divider) for your own elements. `ToolbarButton` looks like Chonky's
buttons, and its `icon` can be a `ChonkyIconName` or any element:

```tsx
<FullFileBrowser
  {...props}
  toolbarEnd={<ToolbarButton icon={ChonkyIconName.close} iconOnly text="Close" onClick={closeDialog} />}
/>
```

With your own layout, pass the same content to `FileToolbar` as `startContent` and `endContent`.

### Dropping onto your own elements

`useFolderDropTarget(folder)` makes an element outside Chonky, such as a sidebar entry, a
drop target for files dragged from Chonky; a drop there arrives as `MoveFiles`. It needs
Chonky and your app to share one react-dnd context:

```tsx
<DndProvider backend={HTML5Backend}>
  <Sidebar />
  <FullFileBrowser {...props} disableDragAndDropProvider />
</DndProvider>

const SidebarItem = ({ folder }: { folder: FileData }) => {
  const { dropRef, isOver, canDrop } = useFolderDropTarget(folder);
  return <button ref={dropRef} className={isOver && canDrop ? 'drop-over' : ''}>{folder.name}</button>;
};
```

### Keyboard shortcuts

| Keys | Action |
|---|---|
| Enter | Open the selection |
| Ctrl+A | Select all files |
| Esc | Clear the selection |
| Backspace | Go up a folder |
| Alt+← / Alt+→ | Back / Forward |
| Ctrl+F | Focus the search field |
| Ctrl+H | Show or hide hidden files |
| F2 | Rename the selected file (`RenameFile`, when added) |
| Ctrl+C, Ctrl+X, Ctrl+V, Delete | `CopyFiles`, `CutFiles`, `PasteFiles`, `DeleteFiles` (when added) |

---

## 🗂️ Files

Each file is a plain object. Only `id` and `name` are required:

```ts
{
  id: 'report',
  name: 'Report.pdf',
  isDir: false,
  size: 480_000,              // bytes, shown in the Size column
  modDate: new Date(),        // Date modified column
  childrenCount: 3,           // folders: shown as "3 items"
  thumbnailUrl: '/thumbs/report.png', // shown in the grid view
  isHidden: false,            // hidden unless "Show hidden files" is on
  color: '#e53935',           // overrides the icon colour
  searchText: 'https://cdn.example.com/f/9f3c2e', // also matched by the search field
}
```

For thumbnails that have to be fetched, pass `thumbnailGenerator`, a function that takes a
file and returns a URL (or a promise of one).

---

## 🎨 Theming

Pass `darkMode` for the built-in dark theme. To change colours, fonts or sizes, override the
CSS variables on `.chonky-theme` from your own stylesheet:

```css
.chonky-theme {
    --chonky-accent: #7b1fa2;
    --chonky-font: 'Vazirmatn', sans-serif;
    --chonky-control-height: 36px;
}

/* Dark theme values */
.chonky-theme.chonky-dark {
    --chonky-accent: #ce93d8;
}
```

| Variable | Controls |
|---|---|
| `--chonky-accent` | Selection, focus ring, active buttons |
| `--chonky-font`, `--chonky-font-size` | Text |
| `--chonky-bg`, `--chonky-chrome-bg` | File list and toolbar backgrounds |
| `--chonky-text`, `--chonky-text-secondary` | Text colours |
| `--chonky-selected-bg`, `--chonky-hover` | Row and tile states |
| `--chonky-radius`, `--chonky-control-height` | Corners and button height |
| `--chonky-list-type-width`, `--chonky-list-size-width`, `--chonky-list-date-width` | List column widths |

The full list is at the top of [`src/styles/chonky.css`](./src/styles/chonky.css). The root
element also has a border and rounded corners; remove them with
`.chonky-chonkyRoot { border: 0; border-radius: 0; }` when Chonky fills a window of your own.

### Custom icons

File icons are drawn by Chonky: a folder, or a page labelled with the file's extension in
a colour per file type. Toolbar and menu icons come from [Lucide](https://lucide.dev/).
To use your own icon set everywhere, pass `iconComponent`, a component that receives
`{ icon, spin, className, style }` where `icon` is a `ChonkyIconName`.

---

## 🌍 Translations

Pass a locale and translated messages through `i18n`. Messages use ICU syntax
(`{arg}`, `plural`, `select`, `selectordinal`, `#`); numbers, dates and plural rules come
from the browser's `Intl` APIs.

```tsx
<FullFileBrowser
  files={files}
  i18n={{
    locale: 'fa',
    messages: {
      'chonky.toolbar.searchPlaceholder': 'جست‌وجو',
      'chonky.toolbar.visibleFileCount': '{fileCount, plural, other {# مورد}}',
      'chonky.fileList.nameColumn': 'نام',
      'chonky.actions.open_files.button.name': 'باز کردن',
    },
  }}
/>
```

Message IDs follow the pattern `chonky.<area>.<name>`:

| Area | IDs |
|---|---|
| `toolbar` | `searchPlaceholder`, `clearSearch`, `visibleFileCount`, `selectedFileCount`, `hiddenFileCount` |
| `fileList` | `nothingToShow`, `nameColumn`, `typeColumn`, `sizeColumn`, `dateColumn` |
| `fileEntry` | `folderType`, `fileType`, `genericFileType`, `folderItemCount` |
| `contextMenu` | `browserMenuShortcut` |
| `actions` | `<actionId>.button.name`, `<actionId>.button.tooltip` |
| `actionGroups` | `<group name>`, e.g. `Actions`, `Options` |

To change how dates, sizes or file types are written, pass `i18n.formatters` with any of
`formatFileModDate`, `formatFileSize` and `formatFileType`.

---

## ⬆️ Upgrading from 6.x

- Uninstall `@mui/material`, `@mui/styled-engine-sc`, `@emotion/react`, `@emotion/styled` and `styled-components` if your app doesn't use them itself.
- Style overrides that target MUI classes or the old `chonky-*` class names need to move to the new CSS variables.
- The search field is now part of `FileNavbar`, and the item count moved to `FileStatusBar`. If you compose the parts yourself, add them.
- `react-intl` options other than `locale`, `defaultLocale`, `messages` and `timeZone` are ignored, and custom formatters receive a `ChonkyIntl` object instead of `IntlShape`.

The full list is in the [changelog](./CHANGELOG.md).

## 🔁 Migration from Original Chonky

1️⃣ Uninstall the old package:
```bash
npm uninstall chonky chonky-icon-fontawesome
```

2️⃣ Install Chonky2:
```bash
npm install chonky2
```

3️⃣ Update your imports:
```diff
- import { FileBrowser } from 'chonky';
+ import { FileBrowser } from 'chonky2';
```

4️⃣ Remove `setChonkyDefaults({ iconComponent: ChonkyIconFA })` and other FontAwesome setup — icons are built in.

---

## 🧩 Compatibility

| Library | Version |
|----------|----------|
| React | 19 or newer |
| TypeScript | Supported (types included) |
| Browsers | Current Chrome, Edge, Firefox and Safari |

---

## 🛠️ Development

```bash
yarn install
yarn dev     # playground at http://localhost:5173, rebuilds the library on change
yarn build   # builds dist/
yarn size    # checks the bundle size limit
```

The playground (`playground/`) is a full explorer window with a sidebar, sample folders,
working create, upload and delete actions, a dark mode toggle and a log of every event.

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md).

---

## 🧾 License

MIT © [Tim Kuzhagaliyev](https://github.com/TimboKZ)  
Maintained and upgraded by [Mahdi Amiri](https://github.com/owlpro)

---

## 🔗 Useful Links

- NPM: https://www.npmjs.com/package/chonky2  
- GitHub: https://github.com/owlpro/chonky2  
- Issues: https://github.com/owlpro/chonky2/issues

---

## 💎 Sponsored by

<p align="center">
  <a href="https://vahdatoptic.com" target="_blank" style="text-decoration:none;">
    <img style="background-color: #fff;border-radius: 8px;" src="./images/logo-vahdat.svg" alt="Vahdat Optic Logo" width="160" /><br/>
    <b>Developed and enhanced with the support of</b><br/>
    <span style="font-size:1.2em; font-weight:600; color:#0073e6;">Vahdat Optic</span><br/>
    <a href="https://vahdatoptic.com" target="_blank" style="color:#ffac5c; font-weight:500;">https://vahdatoptic.com</a>
  </a>
</p>
