import React from "react";
import {
    Loader2,
    ChevronDown,
    Hand,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Check,
    X,
    Box,
    Copy,
    ClipboardPaste,
    Share2,
    Search,
    SquareCheck,
    Eraser,
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
    House,
    RotateCw,
    ImageOff,
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
    PencilLine,
    Scissors,
    Star,
    StarOff,
} from "lucide-react";

import { ChonkyIconName, ChonkyIconProps } from "../../types/icons.types";
import { c } from "../../util/styles";

/**
 * Keeps the layout of an icon slot without drawing anything, e.g. for menu items
 * whose option is off.
 */
const BlankIcon: React.FC<{ className?: string; style?: React.CSSProperties; size?: string }> = ({
    className,
    style,
    size,
}) => <span className={className} style={{ display: 'inline-block', width: size, height: size, ...style }} />;

export const IconMap: { [iconName in ChonkyIconName]: any } = {
    // Misc
    [ChonkyIconName.loading]: Loader2,
    [ChonkyIconName.dropdown]: ChevronDown,
    [ChonkyIconName.placeholder]: BlankIcon,

    // File Actions: Drag & drop
    [ChonkyIconName.dndDragging]: Hand,
    [ChonkyIconName.dndCanDrop]: ArrowDown,
    [ChonkyIconName.dndCannotDrop]: X,

    // File Actions: File operations
    [ChonkyIconName.openFiles]: Box,
    [ChonkyIconName.openParentFolder]: ArrowUp,
    [ChonkyIconName.goBack]: ArrowLeft,
    [ChonkyIconName.goForward]: ArrowRight,
    [ChonkyIconName.copy]: Copy,
    [ChonkyIconName.paste]: ClipboardPaste,
    [ChonkyIconName.cut]: Scissors,
    [ChonkyIconName.share]: Share2,
    [ChonkyIconName.search]: Search,
    [ChonkyIconName.selectAllFiles]: SquareCheck,
    [ChonkyIconName.clearSelection]: Eraser,

    // File Actions: Sorting & options
    [ChonkyIconName.sortAsc]: ArrowUp,
    [ChonkyIconName.sortDesc]: ArrowDown,
    [ChonkyIconName.toggleOn]: Check,
    [ChonkyIconName.toggleOff]: BlankIcon,

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
    [ChonkyIconName.rename]: PencilLine,
    [ChonkyIconName.close]: X,
    [ChonkyIconName.favorite]: Star,
    [ChonkyIconName.unfavorite]: StarOff,
    [ChonkyIconName.sectionToggle]: ChevronRight,
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
    [ChonkyIconName.home]: House,
    [ChonkyIconName.refresh]: RotateCw,
    [ChonkyIconName.imageBroken]: ImageOff,
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
        return (
            <LucideIcon
                className={c(className, { "chonky-spin": spin })}
                style={style}
                size="1.15em"
                strokeWidth={1.75}
            />
        );
    }
);
