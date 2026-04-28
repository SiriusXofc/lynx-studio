import { useState } from 'react';
import { platform } from '@tauri-apps/plugin-os';

export function usePlatform() {
  const [isMobile] = useState(() => {
    try {
      const value = platform();
      return value === 'android' || value === 'ios';
    } catch {
      return false;
    }
  });

  return { isMobile };
}
