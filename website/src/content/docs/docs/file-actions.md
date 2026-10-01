---
title: File actions
description: Connect Chonky2 file actions to your storage and add your own commands.
---

Chonky2 reports user intent through `onFileAction`. It handles selection, sorting, and switching views inside the component. Your app handles actions that change stored files, then passes the updated `files` back to Chonky2.

## Enable the actions your app supports

File operations are opt-in. Pass the actions you support through `fileActions`:

```tsx
import { ChonkyActions, FullFileBrowser } from 'chonky2';

<FullFileBrowser
  files={files}
  folderChain={folderChain}
  fileActions={[
    ChonkyActions.CreateFolder,
    ChonkyActions.UploadFiles,
    ChonkyActions.RenameFile,
    ChonkyActions.DeleteFiles,
  ]}
  onFileAction={handleFileAction}
/>
```

The snippet assumes `files`, `folderChain`, and `handleFileAction` come from your React component. The [first explorer](/docs/first-explorer/) shows the navigation handler; the [backend guide](/docs/connect-backend/) shows how to reload files from an API.

| Action | What your app receives |
| --- | --- |
| `OpenFiles` | `payload.targetFile` and `payload.files` for navigation or opening a file. |
| `CreateFolder` | A request to create a folder in the current folder. |
| `ChangeFileName` | `payload.file` and the confirmed `payload.name`. |
| `DeleteFiles` | Files in `state.selectedFilesForAction`. |
| `DropFiles` | Browser `File` objects in `payload.files` and the destination folder in `payload.destination`. |
| `MoveFiles` | Files to move in `payload.files` and their `payload.destination`. |
| `CopyFilesTo` | Files to copy in `payload.files` and their `payload.destination`. |
| `ChangeSearch` | The trimmed `payload.searchString` if you want server-side search. |

`RenameFile` starts the inline editor; `ChangeFileName` fires when its new name is confirmed. `UploadFiles` is a command for your app to open an upload dialog. Enabling it also lets users drop files from their computer, which fires `DropFiles`. Copy, cut, and paste use Chonky2's clipboard; your app receives `MoveFiles` or `CopyFilesTo` when a paste needs a storage change.

## Persist changes

Compare `data.id` with an action's ID, call your API, and refresh the current folder. For example:

```tsx
import { ChonkyActions, type FileActionHandler } from 'chonky2';

const handleFileAction: FileActionHandler = async (data) => {
  if (data.id === ChonkyActions.CreateFolder.id) {
    await api.createFolder(currentFolderId, 'New folder');
  } else if (data.id === ChonkyActions.ChangeFileName.id) {
    await api.renameFile(data.payload.file.id, data.payload.name);
  } else if (data.id === ChonkyActions.DeleteFiles.id) {
    await api.deleteFiles(data.state.selectedFilesForAction.map((file) => file.id));
  } else {
    return;
  }

  await reloadCurrentFolder();
};
```

Here `api`, `currentFolderId`, and `reloadCurrentFolder` are functions and state from your app. Add error handling appropriate to your API. When a new folder appears in the refreshed `files`, Chonky2 can select it and start inline rename. The component never writes to your backend by itself.

## Copy, paste, and drag and drop

Add `CopyFiles`, `CutFiles`, and `PasteFiles` when your storage supports these operations. Chonky2 keeps the clipboard state and fades cut files. On paste, your app receives `CopyFilesTo` for copied files or `MoveFiles` for cut files. Both carry `payload.files` and `payload.destination`; perform the operation in your storage, then reload affected folders.

Drag files onto a folder in the list, breadcrumbs, or sidebar to receive `MoveFiles`. When `UploadFiles` is enabled, files dropped from the user's computer arrive as `DropFiles`: `payload.files` are browser `File` objects and `payload.destination` is the target folder. Handle these separately from moves between folders.

| Keys | Built-in or opt-in action |
| --- | --- |
| Enter | Open selected files. |
| Ctrl+A / Cmd+A | Select all files. |
| Backspace | Go up one folder. |
| Ctrl+F / Cmd+F | Focus search. |
| F2 | Start inline rename when `RenameFile` is enabled. |
| Ctrl+C, Ctrl+X, Ctrl+V / Cmd equivalents | Copy, cut, and paste when those actions are enabled. |
| Delete | Request deletion when `DeleteFiles` is enabled. |

Shortcuts work while focus is in Chonky2 and the relevant action is registered. Your app still decides how file operations affect stored data.

## Add a custom action

Use `defineFileAction` to place an app-specific command in the toolbar or context menu:

```tsx
import { ChonkyIconName, defineFileAction } from 'chonky2';

const ShowInfo = defineFileAction({
  id: 'show_info',
  requiresSelection: true,
  button: {
    name: 'Show info',
    toolbar: true,
    contextMenu: true,
    group: 'Actions',
    icon: ChonkyIconName.info,
  },
});

// Add ShowInfo to fileActions, then handle its ID in onFileAction.
```

For the complete action list and payloads, see the [version 7 README](https://github.com/owlpro/chonky2#actions).
