import React from 'react';

export enum ChonkyIconName {
    // Misc
    loading = 'loading',
    dropdown = 'dropdown',
    placeholder = 'placeholder',

    // File Actions: Drag & drop
    dndDragging = 'dndDragging',
    dndCanDrop = 'dndCanDrop',
    dndCannotDrop = 'dndCannotDrop',

    // File Actions: File operations
    openFiles = 'openFiles',
    openParentFolder = 'openParentFolder',
    goBack = 'goBack',
    goForward = 'goForward',
    copy = 'copy',
    paste = 'paste',
    cut = 'cut',
    share = 'share',
    search = 'search',
    selectAllFiles = 'selectAllFiles',
    clearSelection = 'clearSelection',

    // File Actions: Sorting & options
    sortAsc = 'sortAsc',
    sortDesc = 'sortDesc',
    toggleOn = 'toggleOn',
    toggleOff = 'toggleOff',

    // File Actions: File Views
    list = 'list',
    compact = 'compact',
    smallThumbnail = 'smallThumbnail',
    largeThumbnail = 'largeThumbnail',

    // File Actions: Unsorted
    folder = 'folder',
    folderCreate = 'folderCreate',
    folderOpen = 'folderOpen',
    folderChainSeparator = 'folderChainSeparator',
    rename = 'rename',
    close = 'close',
    favorite = 'favorite',
    unfavorite = 'unfavorite',
    recent = 'recent',
    /** The arrow of a collapsible sidebar section; points right, and down when open */
    sectionToggle = 'sectionToggle',
    download = 'download',
    upload = 'upload',
    trash = 'trash',
    fallbackIcon = 'fallbackIcon',

    // File modifiers
    symlink = 'symlink',
    hidden = 'hidden',

    // Generic file types
    file = 'file',
    license = 'license',
    code = 'code',
    config = 'config',
    model = 'model',
    database = 'database',
    text = 'text',
    archive = 'archive',
    image = 'image',
    home = 'home',
    refresh = 'refresh',
    /** Shown in place of a thumbnail that failed to load */
    imageBroken = 'imageBroken',
    video = 'video',
    info = 'info',
    key = 'key',
    lock = 'lock',
    music = 'music',
    terminal = 'terminal',
    users = 'users',

    // OS file types
    linux = 'linux',
    ubuntu = 'ubuntu',
    windows = 'windows',

    // Programming language file types
    rust = 'rust',
    python = 'python',
    nodejs = 'nodejs',
    php = 'php',

    // Development tools file types
    git = 'git',

    // Brands file types
    adobe = 'adobe',

    // Other program file types
    pdf = 'pdf',
    excel = 'excel',
    word = 'word',
    flash = 'flash',
}

export interface FileIconData {
    icon: ChonkyIconName | string;
}

export interface ChonkyIconProps {
    icon: ChonkyIconName | string;
    spin?: boolean;
    className?: string;
    fixedWidth?: boolean;
    style?: React.CSSProperties;
}
