import { useState, useEffect } from 'react';

const THEME_KEY = 'theme-preference';

const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (!saved) return false;
    const parsed = JSON.parse(saved);
    return typeof parsed === 'boolean' ? parsed : false;
  } catch {
    return false;
  }
};

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  const toggleTheme = () => {
    setIsDarkMode((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(THEME_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage write failures so theme toggling never crashes app.
      }
      return next;
    });
  };

  // Apply theme to document root for potential CSS variable usage
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return { isDarkMode, toggleTheme };
};
