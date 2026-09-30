import { FileData } from './file.types';

/**
 * What Chonky remembers for the user, such as their favorite folders. Pass it with
 * `userState` and `onUserStateChange` to keep it per user (e.g. on the app's server),
 * or give `userStateStorageKey` to keep it in the browser's `localStorage`.
 */
export interface ChonkyUserState {
    /** Folders in the sidebar's Favorites section (`FileSidebarFavorites`), in order. */
    favorites: FileData[];
    /**
     * Files the user opened last (not folders), newest first, for the sidebar's Recent
     * section (`FileSidebarRecent`). Only kept while that section is shown.
     */
    recent: FileData[];
    /** IDs of the sidebar sections the user collapsed. */
    collapsedSidebarSections: string[];
}

export interface UserStateConfig {
    /** `userState` is passed, so Chonky only reports changes and waits for the prop. */
    controlled: boolean;
    storageKey: string | null;
    onChange: ((userState: ChonkyUserState) => void) | null;
}
