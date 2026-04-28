import { useRef } from 'react';

interface GestureActions {
  onOpenFileTree: () => void;
  onCloseFileTree: () => void;
  onOpenCommandPalette: () => void;
}

interface GestureStart {
  x: number;
  y: number;
  edge: boolean;
}

export function useGestures(actions: GestureActions) {
  const startRef = useRef<GestureStart | null>(null);

  return {
    onPointerDown: (event: React.PointerEvent) => {
      startRef.current = {
        x: event.clientX,
        y: event.clientY,
        edge: event.clientX <= 24,
      };
    },
    onPointerUp: (event: React.PointerEvent) => {
      const start = startRef.current;
      startRef.current = null;

      if (!start) {
        return;
      }

      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;

      if (start.edge && dx > 54 && Math.abs(dy) < 70) {
        actions.onOpenFileTree();
        return;
      }

      if (dx < -54 && Math.abs(dy) < 70) {
        actions.onCloseFileTree();
        return;
      }

      if (dy > 64 && Math.abs(dx) < 50 && start.y < 120) {
        actions.onOpenCommandPalette();
      }
    },
  };
}
