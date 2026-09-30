---
title: Get started
description: Start using the Chonky2 React file explorer with the version 7 guides.
---

Chonky2 gives a React app a desktop-style file explorer. It draws files and folders, handles browsing interactions, and tells your app when a user requests an action. Your app decides where the files come from and how they are stored.

## Follow the short path

1. [Install Chonky2](/docs/installation/) in a React 19+ project. Styles, icons, and TypeScript types come with the package.
2. [Build your first explorer](/docs/first-explorer/) with two folders in memory. The example is ready to paste into a React app.
3. [Connect a backend](/docs/connect-backend/) when your files come from an API. The guide covers loading, navigation history, and errors.
4. [Learn the three core props](/docs/core-props/) so you can adapt the examples to your own data.

## How the data flows

Your app passes the current folder's `files` and its `folderChain` to `FullFileBrowser`. When someone opens a folder, Chonky2 calls `onFileAction`. Your app changes the current folder, fetches its files if needed, and passes the new props back.

The component handles selection, sorting, the current folder's search, and list or grid view changes internally. File storage and server requests remain in your app.

Want to see the actual component first? [Try the live demo](/#demo). For the broader version 7 API, the [repository README](https://github.com/owlpro/chonky2#readme) covers additional actions and customization.
