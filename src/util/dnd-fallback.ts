import { useCallback, useContext } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { DndContext as CoreDndContext } from 'react-dnd/dist/core/DndContext.js';

const DndContext: React.Context<any> = (CoreDndContext ?? ({} as any));

export const useDndContextAvailable = () => {
  try {
    const dndContext = useContext(DndContext);
    const dragDropManager = dndContext?.dragDropManager;
    return !!dragDropManager;
  } catch {
    return false;
  }
};

export const useDragIfAvailable: typeof useDrag = (...args) => {
  const dndContextAvailable = useDndContextAvailable();
  const mockHook = useCallback(() => [{} as any, () => null, () => null], []);
  // @ts-ignore
  const useHook: typeof useDrag = dndContextAvailable ? useDrag : mockHook;
  return useHook(...args);
};

export const useDropIfAvailable: typeof useDrop = (...args) => {
  const dndContextAvailable = useDndContextAvailable();
  const mockHook = useCallback(() => [{} as any, () => null], []);
  // @ts-ignore
  const useHook: typeof useDrop = dndContextAvailable ? useDrop : mockHook;
  return useHook(...args);
};
