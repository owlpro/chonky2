import { Nullable } from './util.types';

export interface ContextMenuConfig {
    triggerFileId: Nullable<string>;
    mouseX: number;
    mouseY: number;
}
