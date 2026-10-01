---
title: Build your own layout
description: Compose Chonky2's navigation, toolbar, file list, and status bar.
---

`FullFileBrowser` is the quickest choice for a complete explorer. Use `FileBrowser` and its child components when your product needs a different arrangement or only some of the built-in UI.

## Compose the parts

```tsx
import {
  FileBrowser,
  FileContextMenu,
  FileList,
  FileNavbar,
  FileStatusBar,
  FileToolbar,
} from 'chonky2';

<div style={{ height: 500 }}>
  <FileBrowser
    files={files}
    folderChain={folderChain}
    onFileAction={handleFileAction}
  >
    <FileToolbar />
    <FileNavbar />
    <FileList />
    <FileStatusBar />
    <FileContextMenu />
  </FileBrowser>
</div>
```

The snippet assumes `files`, `folderChain`, and `handleFileAction` come from your React component. `FileBrowser` supplies the context and state the children need. Keep the parent height, as with `FullFileBrowser`. Leave out a visual part you do not want, or put your own React content between the parts. Include `FileContextMenu` if users need the built-in right-click menu.

## Add toolbar content

For the complete browser, use `toolbarStart` and `toolbarEnd`. A `ToolbarButton` matches the built-in controls:

```tsx
import { ChonkyIconName, FullFileBrowser, ToolbarButton } from 'chonky2';

<FullFileBrowser
  files={files}
  toolbarEnd={
    <ToolbarButton
      icon={ChonkyIconName.refresh}
      iconOnly
      text="Refresh"
      onClick={reloadCurrentFolder}
    />
  }
/>
```

With your own layout, `FileToolbar` takes `startContent` and `endContent` instead. `reloadCurrentFolder` is your app's function.

## Change defaults

Keep built-in selection, views, and sorting unless your product has a reason to replace them. Use `defaultFileViewActionId` and `defaultSortActionId` to choose the initial view and sort action. `disableDefaultFileActions` can turn off all defaults or selected action IDs. See the [API reference](/docs/api-reference/) for the other props.
