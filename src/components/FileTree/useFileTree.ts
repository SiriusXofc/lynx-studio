import { useRef, useState } from 'react';
import type { FileNode } from '../../types';

interface ContextMenuState {
  x: number;
  y: number;
  node: FileNode;
}

export function useFileTree() {
  const timerRef = useRef<number | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const startLongPress = (event: React.PointerEvent, node: FileNode) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    const { clientX, clientY } = event;
    timerRef.current = window.setTimeout(() => {
      setContextMenu({ x: clientX, y: clientY, node });
    }, 520);
  };

  const cancelLongPress = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    contextMenu,
    setContextMenu,
    startLongPress,
    cancelLongPress,
  };
}
