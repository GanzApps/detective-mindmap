'use client';

import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'shell-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Sync from DOM on mount — the no-flash script may have already set it
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light') setThemeState('light');
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
