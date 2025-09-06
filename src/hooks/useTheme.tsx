import { useState, useEffect } from 'react';

const THEME_KEY = 'theme-preference';

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem(THEME_KEY, JSON.stringify(newTheme));
  };

  // Apply theme to document root for potential CSS variable usage
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return { isDarkMode, toggleTheme };
};
