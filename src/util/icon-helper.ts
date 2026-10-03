/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2019
 * @license MIT
 */

import { createContext, ElementType, useMemo } from 'react';

import { Nullable } from '../types/util.types';

import { ChonkyIconPlaceholder } from '../components/internal/ChonkyIconPlaceholder';
import { ChonkyGroupIcons } from '../types/file-browser.types';
import { FileData } from '../types/file.types';
import { ChonkyIconName, ChonkyIconProps, FileIconData } from '../types/icons.types';

export const ChonkyIconContext = createContext<ElementType<ChonkyIconProps>>(ChonkyIconPlaceholder);

/** The `groupIcons` of the current Chonky instance, see FileBrowser. */
export const ChonkyGroupIconsContext = createContext<ChonkyGroupIcons>({});

export const VideoExtensions: string[] = [
    '3g2',
    '3gp',
    '3gpp',
    'asf',
    'asx',
    'avi',
    'dvb',
    'f4v',
    'fli',
    'flv',
    'fvt',
    'h261',
    'h263',
    'h264',
    'jpgm',
    'jpgv',
    'jpm',
    'm1v',
    'm2v',
    'm4u',
    'm4v',
    'mj2',
    'mjp2',
    'mk3d',
    'mks',
    'mkv',
    'mng',
    'mov',
    'movie',
    'mp4',
    'mp4v',
    'mpe',
    'mpeg',
    'mpg',
    'mpg4',
    'mxu',
    'ogv',
    'pyv',
    'qt',
    'smv',
    'ts',
    'uvh',
    'uvm',
    'uvp',
    'uvs',
    'uvu',
    'uvv',
    'uvvh',
    'uvvm',
    'uvvp',
    'uvvs',
    'uvvu',
    'uvvv',
    'viv',
    'vob',
    'webm',
    'wm',
    'wmv',
    'wmx',
    'wvx',
];
export const ImageExtensions: string[] = [
    '3ds',
    'apng',
    'azv',
    'bmp',
    'bmp',
    'btif',
    'cgm',
    'cmx',
    'djv',
    'djvu',
    'drle',
    'dwg',
    'dxf',
    'emf',
    'exr',
    'fbs',
    'fh',
    'fh4',
    'fh5',
    'fh7',
    'fhc',
    'fits',
    'fpx',
    'fst',
    'g3',
    'gif',
    'heic',
    'heics',
    'heif',
    'heifs',
    'ico',
    'ico',
    'ief',
    'jls',
    'jng',
    'jp2',
    'jpe',
    'jpeg',
    'jpf',
    'jpg',
    'jpg2',
    'jpm',
    'jpx',
    'jxr',
    'ktx',
    'mdi',
    'mmr',
    'npx',
    'pbm',
    'pct',
    'pcx',
    'pcx',
    'pgm',
    'pic',
    'png',
    'pnm',
    'ppm',
    'psd',
    'pti',
    'ras',
    'rgb',
    'rlc',
    'sgi',
    'sid',
    'sub',
    'svg',
    'svgz',
    't38',
    'tap',
    'tfx',
    'tga',
    'tif',
    'tiff',
    'uvg',
    'uvi',
    'uvvg',
    'uvvi',
    'vtf',
    'wbmp',
    'wdp',
    'webp',
    'wmf',
    'xbm',
    'xif',
    'xpm',
    'xwd',
];
export const AudioExtensions: string[] = [
    '3gpp',
    'aac',
    'adp',
    'aif',
    'aifc',
    'aiff',
    'au',
    'caf',
    'dra',
    'dts',
    'dtshd',
    'ecelp4800',
    'ecelp7470',
    'ecelp9600',
    'eol',
    'flac',
    'kar',
    'lvp',
    'm2a',
    'm3a',
    'm3u',
    'm4a',
    'm4a',
    'mid',
    'midi',
    'mka',
    'mp2',
    'mp2a',
    'mp3',
    'mp3',
    'mp4a',
    'mpga',
    'oga',
    'ogg',
    'pya',
    'ra',
    'ra',
    'ram',
    'rip',
    'rmi',
    'rmp',
    's3m',
    'sil',
    'snd',
    'spx',
    'uva',
    'uvva',
    'wav',
    'wav',
    'wav',
    'wax',
    'weba',
    'wma',
    'xm',
];
const getIconMap = () => {
    const IconsToExtensions = [
        // Generic file types
        [ChonkyIconName.license, ['license']],
        [ChonkyIconName.config, ['sfk', 'ini', 'yml', 'toml', 'iml']],
        [ChonkyIconName.model, ['3ds', 'obj', 'ply', 'fbx']],
        [ChonkyIconName.database, ['csv', 'json', 'sql', 'sqlite', 'sqlite3', 'npy', 'npz', 'rec', 'idx', 'hdf5']],
        [ChonkyIconName.text, ['txt', 'md', 'mdx']],
        [ChonkyIconName.archive, ['zip', 'rar', 'tar', 'tar.gz', '7z']],
        [ChonkyIconName.image, ImageExtensions],
        [ChonkyIconName.video, VideoExtensions],
        [ChonkyIconName.code, ['html', 'php', 'css', 'sass', 'scss', 'less', 'cpp', 'h', 'hpp', 'c', 'xml']],
        [ChonkyIconName.info, ['bib', 'readme', 'nfo']],
        [ChonkyIconName.key, ['pem', 'pub']],
        [ChonkyIconName.lock, ['lock', 'lock.json', 'shrinkwrap.json']],
        [ChonkyIconName.music, AudioExtensions],
        [ChonkyIconName.terminal, ['run', 'sh']],
        [ChonkyIconName.trash, ['.Trashes']],
        [ChonkyIconName.users, ['authors', 'contributors']],

        // OS file types
        [ChonkyIconName.linux, ['AppImage']],
        [ChonkyIconName.ubuntu, ['deb']],
        [ChonkyIconName.windows, ['exe']],

        // Programming language file types
        [ChonkyIconName.rust, ['rs', 'rlib']],
        [ChonkyIconName.python, ['py', 'ipynb']],
        [ChonkyIconName.nodejs, ['js', 'jsx', 'ts', 'tsx', 'd.ts']],
        [ChonkyIconName.php, ['php']],

        // Development tools file types
        [ChonkyIconName.git, ['.gitignore']],

        // Brands file types
        [ChonkyIconName.adobe, ['psd']],

        // Other program file types
        [ChonkyIconName.pdf, ['pdf']],
        [ChonkyIconName.excel, ['xls', 'xlsx']],
        [ChonkyIconName.word, ['doc', 'docx', 'odt']],
        [ChonkyIconName.flash, ['swf']],
    ] as const;

    const iconMap = new Map<string, FileIconData>();
    for (const [icon, extensions] of IconsToExtensions) {
        for (const extension of extensions) {
            iconMap.set(extension.toLowerCase(), { icon });
        }
    }

    return iconMap;
};

const iconMap = getIconMap();

/**
 * Finds the icon for the longest known extension of a file name, e.g. `d.ts` before `ts`.
 */
const findIconData = (fileName: string) => {
    const name = fileName.toLowerCase();
    let match = iconMap.get(name);
    for (let i = name.indexOf('.'); !match && i !== -1; i = name.indexOf('.', i + 1)) {
        match = iconMap.get(name.slice(i + 1));
    }
    return match;
};

export const useIconData = (file: Nullable<FileData>): FileIconData => {
    return useMemo(() => {
        if (!file) return { icon: ChonkyIconName.loading };
        if (file.isDir === true) return { icon: ChonkyIconName.folder };

        const match = findIconData(file.name);
        return match ? match : { icon: ChonkyIconName.file };
    }, [file]);
};

const DEFAULT_FILE_TYPE_COLOR = '#78909c';

/**
 * Accent colour for each file type, used for icons in the default look.
 */
const FileTypeColors: { [icon: string]: string } = {
    [ChonkyIconName.folder]: '#ffc83d',
    [ChonkyIconName.image]: '#1e88e5',
    [ChonkyIconName.video]: '#8e24aa',
    [ChonkyIconName.music]: '#d81b60',
    [ChonkyIconName.archive]: '#8d6e63',
    [ChonkyIconName.pdf]: '#e53935',
    [ChonkyIconName.flash]: '#e53935',
    [ChonkyIconName.word]: '#2b5eb8',
    [ChonkyIconName.excel]: '#1e8449',
    [ChonkyIconName.text]: '#546e7a',
    [ChonkyIconName.code]: '#00897b',
    [ChonkyIconName.nodejs]: '#3c873a',
    [ChonkyIconName.python]: '#3776ab',
    [ChonkyIconName.rust]: '#ce422b',
    [ChonkyIconName.php]: '#777bb4',
    [ChonkyIconName.terminal]: '#37474f',
    [ChonkyIconName.config]: '#607d8b',
    [ChonkyIconName.database]: '#f4511e',
    [ChonkyIconName.model]: '#5e35b1',
    [ChonkyIconName.adobe]: '#31a8ff',
    [ChonkyIconName.git]: '#f05032',
    [ChonkyIconName.license]: '#6d4c41',
    [ChonkyIconName.info]: '#0288d1',
    [ChonkyIconName.key]: '#f9a825',
    [ChonkyIconName.lock]: '#f9a825',
    [ChonkyIconName.users]: '#3949ab',
};

export const getFileTypeColor = (icon: ChonkyIconName | string) =>
    FileTypeColors[icon] ?? DEFAULT_FILE_TYPE_COLOR;
