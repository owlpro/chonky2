import { ChonkyUserState } from '../types/user-state.types';
import { Logger } from './logger';

/** Fills in the fields a partial or older saved state lacks. */
export const normalizeUserState = (userState: Partial<ChonkyUserState> | null | undefined): ChonkyUserState => ({
    favorites: Array.isArray(userState?.favorites) ? userState!.favorites.filter((f) => f && f.id) : [],
    collapsedSidebarSections: Array.isArray(userState?.collapsedSidebarSections)
        ? userState!.collapsedSidebarSections
        : [],
});

export const readStoredUserState = (storageKey: string | null): ChonkyUserState => {
    if (!storageKey) return normalizeUserState(null);
    try {
        const stored = window.localStorage.getItem(storageKey);
        return normalizeUserState(stored ? JSON.parse(stored) : null);
    } catch (error) {
        Logger.warn(`Could not read the user state saved under "${storageKey}": ${(error as Error).message}`);
        return normalizeUserState(null);
    }
};

export const writeStoredUserState = (storageKey: string | null, userState: ChonkyUserState) => {
    if (!storageKey) return;
    try {
        window.localStorage.setItem(storageKey, JSON.stringify(userState));
    } catch (error) {
        Logger.warn(`Could not save the user state under "${storageKey}": ${(error as Error).message}`);
    }
};
