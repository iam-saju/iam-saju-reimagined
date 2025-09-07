import { useDonutTerminal } from '@/hooks/useDonutTerminal';
import { useTheme } from '@/hooks/useTheme';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

interface IndexProps {
  donutState?: {
    updateRotation: (deltaA: number, deltaB: number) => void;
    getRotation: () => { A: number; B: number };
    setRotation: (A: number, B: number) => void;
  };
}

const Index = ({}: IndexProps) => {
  const { isTerminalVisible } = useDonutTerminal();
  const { isDarkMode, toggleTheme } = useTheme();

  // Debug logging
  console.log('Index render - isTerminalVisible:', isTerminalVisible);

  return (
    <div className={`h-screen font-sans relative transition-colors duration-300 overflow-hidden ${
      isDarkMode ? 'text-gray-200' : 'bg-white text-foreground'
    }`} style={{ backgroundColor: isDarkMode ? '#1C1C1C' : undefined }}>
      {/* Light mode background - pure white */}
      {!isTerminalVisible && !isDarkMode && (
        <div className="absolute inset-0 bg-white" />
      )}
      
      {/* Terminal mode: dark background */}
      {isTerminalVisible && (
        <div className="absolute inset-0 bg-[#0a0a0a]" />
      )}
      
      {/* Hide navigation when terminal is visible */}
      {!isTerminalVisible && <Navigation isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />}
      
      <main className="relative z-10">
        {/* Hide main content when terminal is visible */}
        {!isTerminalVisible && (
          <>
            <Hero isDarkMode={isDarkMode} />
            <Footer isDarkMode={isDarkMode} />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
