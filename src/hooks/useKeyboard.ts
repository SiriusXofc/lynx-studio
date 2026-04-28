import { useEffect } from 'react';

export function useKeyboardHeight() {
  useEffect(() => {
    const updateKeyboardHeight = () => {
      const viewport = window.visualViewport;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const keyboardHeight = Math.max(0, window.innerHeight - viewportHeight - (viewport?.offsetTop ?? 0));

      document.documentElement.style.setProperty('--app-viewport-height', `${viewportHeight}px`);
      document.documentElement.style.setProperty('--app-viewport-width', `${viewportWidth}px`);
      document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
    };

    updateKeyboardHeight();
    window.visualViewport?.addEventListener('scroll', updateKeyboardHeight);
    window.visualViewport?.addEventListener('resize', updateKeyboardHeight);
    window.addEventListener('resize', updateKeyboardHeight);
    window.addEventListener('orientationchange', updateKeyboardHeight);

    return () => {
      window.visualViewport?.removeEventListener('scroll', updateKeyboardHeight);
      window.visualViewport?.removeEventListener('resize', updateKeyboardHeight);
      window.removeEventListener('resize', updateKeyboardHeight);
      window.removeEventListener('orientationchange', updateKeyboardHeight);
    };
  }, []);
}
