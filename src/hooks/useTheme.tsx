import { useState, useEffect } from 'react';

const THEME_KEY = 'color-palette-preference';

export type ColorPalette = 
  | 'midnight-abyss'
  | 'shadow-depths' 
  | 'void-eclipse'
  | 'storm-harbor'
  | 'deep-sky'
  | 'obsidian-grey';

export const COLOR_PALETTES: { name: string; value: ColorPalette; description: string }[] = [
  { name: 'Midnight Abyss', value: 'midnight-abyss', description: '#0B1215' },
  { name: 'Shadow Depths', value: 'shadow-depths', description: '#0F171F' },
  { name: 'Void Eclipse', value: 'void-eclipse', description: '#0B0B0B' },
  { name: 'Storm Harbor', value: 'storm-harbor', description: '#020C1A' },
  { name: 'Deep Sky', value: 'deep-sky', description: '#011122' },
  { name: 'Obsidian Grey', value: 'obsidian-grey', description: '#161616' },
];

export const useTheme = () => {
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? (saved as ColorPalette) : 'midnight-abyss';
  });

  const changePalette = (palette: ColorPalette) => {
    setCurrentPalette(palette);
    localStorage.setItem(THEME_KEY, palette);
  };

  // Apply theme to document root
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all palette classes
    COLOR_PALETTES.forEach(({ value }) => {
      root.classList.remove(value);
    });
    
    // Add current palette class
    root.classList.add(currentPalette);
  }, [currentPalette]);

  // Legacy support for isDarkMode (all palettes are dark)
  const isDarkMode = true;
  const toggleTheme = () => {
    // Cycle through palettes
    const currentIndex = COLOR_PALETTES.findIndex(p => p.value === currentPalette);
    const nextIndex = (currentIndex + 1) % COLOR_PALETTES.length;
    changePalette(COLOR_PALETTES[nextIndex].value);
  };

  return { isDarkMode, toggleTheme, currentPalette, changePalette };
};
