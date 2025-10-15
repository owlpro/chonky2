import React from "react";
import {
    Loader2,
    ChevronDown,
    Minus,
    Hand,
    ArrowDown,
    X,
    Box,
    CornerUpLeft,
    Copy,
    ClipboardPaste,
    Share2,
    Search,
    SquareCheck,
    Eraser,
    SortAsc,
    SortDesc,
    ToggleRight,
    ToggleLeft,
    List,
    ListTree,
    Grid2x2,
    Grid3x3,
    Folder,
    FolderPlus,
    FolderOpen,
    ChevronRight,
    Download,
    Upload,
    Trash2,
    AlertTriangle,
    ExternalLink,
    EyeOff,
    File,
    Scale,
    FileCode,
    Cog,
    Boxes,
    Database,
    FileText,
    FileArchive,
    Image,
    Film,
    Info,
    Key,
    Lock,
    Music,
    Terminal,
    Users,
    Github,
    FileType2,
    FileSpreadsheet,
    FileText as FileDoc,
    Cpu,
    Monitor,
} from "lucide-react";

import { ChonkyIconName, ChonkyIconProps } from "../../types/icons.types";

export const IconMap: { [iconName in ChonkyIconName]: any } = {
    // Misc
    [ChonkyIconName.loading]: Loader2,
    [ChonkyIconName.dropdown]: ChevronDown,
    [ChonkyIconName.placeholder]: Minus,

    // File Actions: Drag & drop
    [ChonkyIconName.dndDragging]: Hand,
    [ChonkyIconName.dndCanDrop]: ArrowDown,
    [ChonkyIconName.dndCannotDrop]: X,

    // File Actions: File operations
    [ChonkyIconName.openFiles]: Box,
    [ChonkyIconName.openParentFolder]: CornerUpLeft,
    [ChonkyIconName.copy]: Copy,
    [ChonkyIconName.paste]: ClipboardPaste,
    [ChonkyIconName.share]: Share2,
    [ChonkyIconName.search]: Search,
    [ChonkyIconName.selectAllFiles]: SquareCheck,
    [ChonkyIconName.clearSelection]: Eraser,

    // File Actions: Sorting & options
    [ChonkyIconName.sortAsc]: SortAsc,
    [ChonkyIconName.sortDesc]: SortDesc,
    [ChonkyIconName.toggleOn]: ToggleRight,
    [ChonkyIconName.toggleOff]: ToggleLeft,

    // File Actions: File Views
    [ChonkyIconName.list]: List,
    [ChonkyIconName.compact]: ListTree,
    [ChonkyIconName.smallThumbnail]: Grid2x2,
    [ChonkyIconName.largeThumbnail]: Grid3x3,

    // File Actions: Unsorted
    [ChonkyIconName.folder]: Folder,
    [ChonkyIconName.folderCreate]: FolderPlus,
    [ChonkyIconName.folderOpen]: FolderOpen,
    [ChonkyIconName.folderChainSeparator]: ChevronRight,
    [ChonkyIconName.download]: Download,
    [ChonkyIconName.upload]: Upload,
    [ChonkyIconName.trash]: Trash2,
    [ChonkyIconName.fallbackIcon]: AlertTriangle,

    // File modifiers
    [ChonkyIconName.symlink]: ExternalLink,
    [ChonkyIconName.hidden]: EyeOff,

    // Generic file types
    [ChonkyIconName.file]: File,
    [ChonkyIconName.license]: Scale,
    [ChonkyIconName.code]: FileCode,
    [ChonkyIconName.config]: Cog,
    [ChonkyIconName.model]: Boxes,
    [ChonkyIconName.database]: Database,
    [ChonkyIconName.text]: FileText,
    [ChonkyIconName.archive]: FileArchive,
    [ChonkyIconName.image]: Image,
    [ChonkyIconName.video]: Film,
    [ChonkyIconName.info]: Info,
    [ChonkyIconName.key]: Key,
    [ChonkyIconName.lock]: Lock,
    [ChonkyIconName.music]: Music,
    [ChonkyIconName.terminal]: Terminal,
    [ChonkyIconName.users]: Users,

    // OS file types
    [ChonkyIconName.linux]: Cpu,
    [ChonkyIconName.ubuntu]: Cog,
    [ChonkyIconName.windows]: Monitor,

    // Programming language file types
    [ChonkyIconName.rust]: FileCode,
    [ChonkyIconName.python]: FileCode,
    [ChonkyIconName.nodejs]: FileCode,
    [ChonkyIconName.php]: FileCode,

    // Development tools file types
    [ChonkyIconName.git]: Github,

    // Brands file types
    [ChonkyIconName.adobe]: FileType2,

    // Other program file types
    [ChonkyIconName.pdf]: FileDoc,
    [ChonkyIconName.excel]: FileSpreadsheet,
    [ChonkyIconName.word]: FileDoc,
    [ChonkyIconName.flash]: Film,
} as const;

export const ChonkyIconLucide: React.FC<ChonkyIconProps> = React.memo(
    ({ icon, spin, className, style }) => {
        const LucideIcon =
            IconMap[icon as keyof typeof IconMap] ?? IconMap.fallbackIcon;
        const mergedStyle: React.CSSProperties = {
            ...(style || {}),
            animation: spin ? "spin 1s linear infinite" : undefined,
        };

        return (
            <LucideIcon
                className={className}
                style={mergedStyle}
                size={18}
                strokeWidth={1.75}
            />
        );
    }
);
