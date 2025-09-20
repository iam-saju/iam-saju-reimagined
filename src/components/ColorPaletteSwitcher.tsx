import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { useTheme, COLOR_PALETTES, ColorPalette } from '@/hooks/useTheme';

export const ColorPaletteSwitcher = () => {
  const { currentPalette, changePalette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50"
      >
        <Palette className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Palette Grid */}
          <div className="absolute right-0 top-12 z-50 bg-card border border-border rounded-lg shadow-lg p-4 min-w-[320px]">
            <h3 className="text-sm font-medium text-foreground mb-3">Color Palettes</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {COLOR_PALETTES.map((palette) => (
                <button
                  key={palette.value}
                  onClick={() => {
                    changePalette(palette.value);
                    setIsOpen(false);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    currentPalette === palette.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 bg-muted/30'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ 
                        backgroundColor: palette.description 
                      }}
                    />
                    <span className="text-xs font-medium text-foreground">
                      {palette.name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {palette.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};