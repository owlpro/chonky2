---
title: API reference
description: Chonky2 v7 browser props, FileData fields, and imperative methods.
---

Import public components and types from `chonky2`. `FullFileBrowser` gives you the complete interface; `FileBrowser` is the provider for a [custom layout](/docs/custom-layout/). Both accept the common props below. Only `files` is required.

## Browser props

<p class="mobile-table-hint">Swipe the tables sideways to see every column.</p>

| Prop | Type | Purpose |
| --- | --- | --- |
| `files` | `(FileData \| null)[]` | Entries in the current folder. `null` displays a loading placeholder. |
| `folderChain` | `(FileData \| null)[]` | Path from the root folder through the current folder. |
| `onFileAction` | `FileActionHandler` | Receives navigation and file actions. |
| `fileActions` | `FileAction[]` | Adds opt-in or custom actions. |
| `loading` | `boolean` | Shows progress while the current folder loads. |
| `thumbnailGenerator` | `(file) => string \| null \| Promise<string \| null>` | Supplies thumbnail URLs instead of `thumbnailUrl`. |
| `defaultFileViewActionId` | `string` | Initial view action ID, such as `ChonkyActions.EnableListView.id`. |
| `defaultSortActionId` | `string \| null` | Initial sort action ID; `null` leaves files unsorted. |
| `disableDefaultFileActions` | `boolean \| string[]` | Disables all default actions or listed action IDs. |
| `disableSelection` | `boolean` | Disables file selection. |
| `disableDragAndDrop` | `boolean` | Disables drag and drop. |
| `disableDragAndDropProvider` | `boolean` | Uses an app-level react-dnd provider. |
| `clearSelectionOnOutsideClick` | `boolean` | Clears selection on outside or empty-space clicks; defaults to `true`. |
| `doubleClickDelay` | `number` | Maximum gap between clicks in milliseconds; defaults to `300`. |
| `darkMode` | `boolean` | Enables the built-in dark theme. |
| `disableAnimations` | `boolean` | Disables UI animations; loading indicators still move. |
| `i18n` | `I18nConfig` | Sets locale, translated messages, and formatters. |
| `iconComponent` | `ElementType<ChonkyIconProps>` | Replaces the icon renderer for this instance. |
| `userState` | `Partial<ChonkyUserState>` | Controls favorites, recent files, and collapsed sidebar sections. |
| `onUserStateChange` | `(state: ChonkyUserState) => void` | Reports user-state changes. |
| `userStateStorageKey` | `string` | Persists uncontrolled user state in `localStorage`. |
| `onScroll` | `(event) => void` | Receives file-list scroll events. |
| `instanceId` | `string` | Stable ID when multiple browser instances need to interact. |

`FullFileBrowser` additionally accepts `sidebar`, `toolbarStart`, and `toolbarEnd` as React content. See [Sidebar and saved state](/docs/sidebar-state/) and [Build your own layout](/docs/custom-layout/). `setChonkyDefaults({ ... })` sets defaults for every instance on a page.

## FileData

A file is a plain object. `id` and `name` are required. IDs should remain stable across updates.

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | `string` | Unique file or folder ID. |
| `name` | `string` | Displayed full name, such as `Report.pdf`. |
| `isDir` | `boolean` | Marks a folder. |
| `size` | `number` | File size in bytes. |
| `modDate` | `Date \| string` | Modified date and time. |
| `childrenCount` | `number` | Number of items inside a folder. |
| `thumbnailUrl` | `string` | Thumbnail URL for the grid view. |
| `color`, `icon` | `string`, icon value | Override the default file appearance. |
| `folderChainIcon` | icon value | Override the breadcrumb icon. |
| `searchText` | `string` | Additional text matched by local search. |
| `isHidden` | `boolean` | Hidden unless the user enables hidden files. |
| `isSymlink`, `isEncrypted` | `boolean` | File metadata flags. |
| `openable`, `selectable`, `draggable` | `boolean` | Control supported interactions for this entry. |
| `droppable`, `dndOpenable` | `boolean` | Control folder drop and drag-hover behavior. |
| `renamable` | `boolean` | Set to `false` to prevent inline renaming. |

You can keep your own fields on `FileData`; Chonky2 returns them in action payloads. See [Core props](/docs/core-props/) for the relationship between `files` and `folderChain`.

## Ref methods

Pass a `ref` typed as `FileBrowserHandle` to either browser component:

```tsx
import { useRef } from 'react';
import { FullFileBrowser, type FileBrowserHandle, type FileData } from 'chonky2';

export function Explorer({ files }: { files: FileData[] }) {
  const browserRef = useRef<FileBrowserHandle>(null);
  return <FullFileBrowser ref={browserRef} files={files} />;
}
```

| Method | Result |
| --- | --- |
| `getFileSelection()` | Returns selected file IDs as a `Set<string>`. |
| `setFileSelection(ids, reset = true)` | Selects IDs present in `files`; set `reset` to `false` to add to the selection. |
| `revealFiles(ids, select = true)` | Scrolls to and optionally selects files, including ones about to arrive from a load. |
| `requestFileAction(action, payload)` | Runs an action through Chonky2. Pass its expected payload, or `undefined` when none is needed. |

The [search guide](/docs/search/) shows `revealFiles` after an API lookup. For action payloads, use [File actions](/docs/file-actions/).
