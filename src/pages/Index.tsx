import { useState } from 'react';
import { useDonutTerminal } from '@/hooks/useDonutTerminal';
import { useTheme } from '@/hooks/useTheme';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import DonutBackground from "@/components/DonutBackground";

interface IndexProps {
  donutState?: {
    updateRotation: (deltaA: number, deltaB: number) => void;
    getRotation: () => { A: number; B: number };
    setRotation: (A: number, B: number) => void;
  };
}

const Index = ({ donutState }: IndexProps) => {
  const { isTerminalVisible } = useDonutTerminal();
  const { isDarkMode, toggleTheme } = useTheme();

  // Debug logging
  console.log('Index render - isTerminalVisible:', isTerminalVisible);

  return (
    <div className={`min-h-screen font-sans relative transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-white text-foreground'
    }`}>
      {/* Light mode background gradient */}
      {!isTerminalVisible && !isDarkMode && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
      )}
      
      {/* Terminal mode: pure black background */}
      {isTerminalVisible && (
        <div className="absolute inset-0 bg-black" />
      )}
      
      {/* Hide navigation when terminal is visible */}
      {!isTerminalVisible && <Navigation isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />}
      
      <main className="relative z-10">
        {/* Hide hero content when terminal is visible */}
        {!isTerminalVisible && <Hero isDarkMode={isDarkMode} />}
        {!isTerminalVisible && <Footer isDarkMode={isDarkMode} />}
      </main>
    </div>
  );
};

export default Index;
