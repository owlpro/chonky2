import { FileData } from 'chonky2';

export type PlaygroundFile = FileData & { parentId: string | null };

export const HOME_ID = 'home';

// A small landscape picture as a data URL, so image files have thumbnails offline.
const makeThumbnail = (skyHue: number, landHue: number) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">
        <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="hsl(${skyHue} 70% 72%)"/><stop offset="1" stop-color="hsl(${skyHue} 60% 90%)"/>
        </linearGradient></defs>
        <rect width="160" height="120" fill="url(#s)"/>
        <circle cx="118" cy="34" r="14" fill="hsl(45 95% 70%)"/>
        <path d="M0 86 L40 58 L72 80 L108 50 L160 84 V120 H0Z" fill="hsl(${landHue} 35% 42%)"/>
        <path d="M0 100 Q60 84 160 98 V120 H0Z" fill="hsl(${landHue} 40% 30%)"/>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const date = (value: string) => new Date(value);

export const initialFiles: PlaygroundFile[] = [
    { id: HOME_ID, name: 'Home', isDir: true, parentId: null },

    { id: 'desktop', name: 'Desktop', isDir: true, parentId: HOME_ID, modDate: date('2026-09-25T09:12:00') },
    { id: 'downloads', name: 'Downloads', isDir: true, parentId: HOME_ID, modDate: date('2026-09-26T18:40:00') },
    { id: 'documents', name: 'Documents', isDir: true, parentId: HOME_ID, modDate: date('2026-09-21T11:05:00') },
    { id: 'pictures', name: 'Pictures', isDir: true, parentId: HOME_ID, modDate: date('2026-09-18T15:30:00') },
    { id: 'videos', name: 'Videos', isDir: true, parentId: HOME_ID, modDate: date('2026-08-30T20:15:00') },
    { id: 'projects', name: 'Projects', isDir: true, parentId: HOME_ID, modDate: date('2026-09-27T08:00:00') },
    { id: 'readme', name: 'README.md', parentId: HOME_ID, size: 2_480, modDate: date('2026-09-20T10:30:00') },
    { id: 'dotfile', name: '.profile', parentId: HOME_ID, size: 807, isHidden: true, modDate: date('2026-01-04T08:00:00') },

    { id: 'plan', name: 'Project plan.docx', parentId: 'desktop', size: 48_200, modDate: date('2026-09-24T14:02:00') },
    { id: 'shot', name: 'Screenshot 2026-09-25.png', parentId: 'desktop', size: 824_000, modDate: date('2026-09-25T09:12:00'), thumbnailUrl: makeThumbnail(210, 150) },

    { id: 'textures', name: 'Holographic Textures', isDir: true, parentId: 'downloads', modDate: date('2026-02-28T12:40:00') },
    { id: 'setup', name: 'setup-2.4.1.zip', parentId: 'downloads', size: 58_400_000, modDate: date('2026-09-26T18:40:00') },
    { id: 'song', name: 'Morning Walk.mp3', parentId: 'downloads', size: 6_100_000, modDate: date('2026-07-11T07:25:00') },
    { id: 'photo', name: '894300.jpg', parentId: 'downloads', size: 2_100_000, modDate: date('2026-02-16T17:23:00'), thumbnailUrl: makeThumbnail(190, 30) },
    // Its thumbnail doesn't exist, to show the broken image icon
    { id: 'broken', name: 'Missing preview.jpg', parentId: 'downloads', size: 1_300_000, modDate: date('2026-07-20T09:30:00'), thumbnailUrl: '/missing-thumbnail.jpg' },
    { id: 'holo1', name: 'holo-01.png', parentId: 'textures', size: 3_400_000, modDate: date('2026-02-28T12:40:00'), thumbnailUrl: makeThumbnail(280, 300) },
    { id: 'holo2', name: 'holo-02.png', parentId: 'textures', size: 3_100_000, modDate: date('2026-02-28T12:41:00'), thumbnailUrl: makeThumbnail(320, 260) },

    { id: 'invoice', name: 'Invoice 0042.xlsx', parentId: 'documents', size: 21_300, modDate: date('2026-09-03T10:00:00') },
    { id: 'budget', name: 'Budget 2026.xlsx', parentId: 'documents', size: 64_900, modDate: date('2026-06-14T16:45:00') },
    { id: 'resume', name: 'Resume.docx', parentId: 'documents', size: 38_700, modDate: date('2026-05-02T09:30:00') },
    { id: 'report', name: 'Quarterly report.pdf', parentId: 'documents', size: 1_845_000, modDate: date('2026-08-02T16:05:00') },
    { id: 'notes', name: 'Notes.txt', parentId: 'documents', size: 312, modDate: date('2026-09-21T11:05:00') },

    { id: 'beach', name: 'Beach.jpg', parentId: 'pictures', size: 4_200_000, modDate: date('2026-07-19T18:10:00'), thumbnailUrl: makeThumbnail(200, 45) },
    { id: 'mountains', name: 'Mountains.jpg', parentId: 'pictures', size: 5_600_000, modDate: date('2026-08-08T06:55:00'), thumbnailUrl: makeThumbnail(215, 120) },
    { id: 'city', name: 'City at night.png', parentId: 'pictures', size: 3_900_000, modDate: date('2026-09-18T15:30:00'), thumbnailUrl: makeThumbnail(250, 230) },

    { id: 'trip', name: 'Road trip.mp4', parentId: 'videos', size: 734_000_000, modDate: date('2026-08-30T20:15:00') },

    { id: 'chonky', name: 'chonky2', isDir: true, parentId: 'projects', modDate: date('2026-09-27T08:00:00') },
    { id: 'pkg', name: 'package.json', parentId: 'chonky', size: 2_100, modDate: date('2026-09-27T08:00:00') },
    { id: 'index', name: 'index.tsx', parentId: 'chonky', size: 5_600, modDate: date('2026-09-26T22:14:00') },
    { id: 'styles', name: 'styles.css', parentId: 'chonky', size: 18_300, modDate: date('2026-09-27T07:48:00') },
];

// The sidebar's Folders section
export const sidebarFolders: { folderId: string; label: string }[] = [
    { folderId: HOME_ID, label: 'Home' },
    { folderId: 'desktop', label: 'Desktop' },
    { folderId: 'downloads', label: 'Downloads' },
    { folderId: 'documents', label: 'Documents' },
    { folderId: 'pictures', label: 'Pictures' },
    { folderId: 'projects', label: 'Projects' },
];

// Each one has its own favorites and collapsed sections, saved in localStorage
export const users = ['Alice', 'Bob'];
