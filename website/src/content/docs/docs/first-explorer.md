---
title: Your first explorer
description: Build a working Chonky2 file explorer with local React state.
---

This example stores two folders in memory. Paste it into a React component, render it in your app, and double-click **Documents**. Breadcrumbs, Up, Back, and Forward use the same open-folder handler.

```tsx
import { useState } from 'react';
import {
  ChonkyActions,
  FullFileBrowser,
  type FileActionHandler,
  type FileData,
} from 'chonky2';

const folders: Record<string, FileData[]> = {
  home: [
    { id: 'documents', name: 'Documents', isDir: true },
    { id: 'photo', name: 'Photo.png', size: 2_100_000 },
  ],
  documents: [
    { id: 'report', name: 'Report.pdf', size: 480_000 },
  ],
};

const names: Record<string, string> = {
  home: 'Home',
  documents: 'Documents',
};

export default function Explorer() {
  const [path, setPath] = useState(['home']);

  const handleFileAction: FileActionHandler = (data) => {
    if (data.id !== ChonkyActions.OpenFiles.id) return;

    const target = data.payload.targetFile ?? data.payload.files[0];
    if (!target?.isDir) return;

    setPath((currentPath) => {
      const existingIndex = currentPath.indexOf(target.id);
      return existingIndex >= 0
        ? currentPath.slice(0, existingIndex + 1)
        : [...currentPath, target.id];
    });
  };

  const currentFolderId = path[path.length - 1] ?? 'home';

  return (
    <div style={{ height: 500 }}>
      <FullFileBrowser
        files={folders[currentFolderId] ?? []}
        folderChain={path.map((id) => ({
          id,
          name: names[id] ?? id,
          isDir: true,
        }))}
        onFileAction={handleFileAction}
      />
    </div>
  );
}
```

## What the component receives

- `files` is the current folder's contents. Folder entries need `isDir: true`.
- `folderChain` starts with Home and ends with the current folder. Chonky2 uses it for breadcrumbs and Up.
- `onFileAction` receives `OpenFiles` when the user navigates. The handler updates React state, then the new `files` and `folderChain` render.

The parent `div` has a height because the explorer fills its container. You can change `500` to a height that fits your layout.

## Try the built-in interactions

Select files, search within the current folder, sort the list, and switch between list and grid views. These interactions work without extra handlers. Opening a regular file, downloading, renaming, or changing stored data requires your app to decide what happens.

When files live on a server, replace the in-memory map with the pattern in [Connect a backend](/docs/connect-backend/). The [core props](/docs/core-props/) page explains the contract in more detail.
