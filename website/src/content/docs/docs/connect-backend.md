---
title: Connect a backend
description: Load Chonky2 folders from an API with navigation, loading, and error handling.
---

Chonky2 does not read a disk or call an API by itself. Your app supplies the current folder's data. This example uses a REST endpoint and keeps the current path in React state.

## Example API response

The example expects `GET /api/folders/:id` to return JSON in this shape:

```json
{
  "files": [
    { "id": "documents", "name": "Documents", "isDir": true },
    { "id": "report", "name": "Report.pdf", "size": 480000 }
  ]
}
```

Use stable, unique file IDs. Change the URL and response mapping to match your own API. The `home` ID below is the starting folder ID in that API.

## Load and navigate

```tsx
import { useEffect, useRef, useState } from 'react';
import {
  ChonkyActions,
  FullFileBrowser,
  type FileActionHandler,
  type FileData,
} from 'chonky2';

type FolderResponse = { files: FileData[] };

const home: FileData = { id: 'home', name: 'Home', isDir: true };

export default function ApiExplorer() {
  const [folderChain, setFolderChain] = useState<FileData[]>([home]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Remember paths so Back and Forward can reopen folders already visited.
  const knownPaths = useRef(
    new Map<string, FileData[]>([[home.id, [home]]])
  );
  const currentId = folderChain[folderChain.length - 1]?.id ?? home.id;

  useEffect(() => {
    const controller = new AbortController();
    setFiles([]);
    setLoading(true);
    setError(null);

    async function loadFolder() {
      try {
        const response = await fetch(
          '/api/folders/' + encodeURIComponent(currentId),
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error('Could not load folder (' + response.status + ')');
        }
        const result = (await response.json()) as FolderResponse;
        if (!controller.signal.aborted) setFiles(result.files);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setFiles([]);
        setError(cause instanceof Error ? cause.message : 'Could not load folder');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadFolder();
    return () => controller.abort();
  }, [currentId, reloadKey]);

  const handleFileAction: FileActionHandler = (data) => {
    if (data.id !== ChonkyActions.OpenFiles.id) return;

    const target = data.payload.targetFile ?? data.payload.files[0];
    if (!target?.isDir) return;

    setFolderChain((current) => {
      const ancestorIndex = current.findIndex((folder) => folder.id === target.id);
      const next = ancestorIndex >= 0
        ? current.slice(0, ancestorIndex + 1)
        : knownPaths.current.get(target.id) ?? [...current, target];
      knownPaths.current.set(target.id, next);
      return next;
    });
  };

  return (
    <div>
      {error && (
        <p role="alert">
          {error}{' '}
          <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
            Retry
          </button>
        </p>
      )}
      <div style={{ height: 500 }}>
        <FullFileBrowser
          files={files}
          folderChain={folderChain}
          loading={loading}
          onFileAction={handleFileAction}
        />
      </div>
    </div>
  );
}
```

The effect fetches the starting folder and each folder the user opens. `AbortController` cancels the previous request when navigation changes, so a slower old response cannot replace a newer folder's files. The `loading` prop shows Chonky2's loading state, and the Retry button fetches the current folder again after an error.

The path cache covers folders visited in this explorer. If your app opens a folder directly from a URL or a separate sidebar, ask your API for that folder's full ancestor path and set `folderChain` from the response.

This example handles navigation only. Chonky2 reports actions that change files, but your app must call its API and refresh `files` for those changes. The [core props](/docs/core-props/) page explains the data contract.
