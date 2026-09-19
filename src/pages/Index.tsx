import { useDonutTerminal } from '@/hooks/useDonutTerminal';
import { useTheme } from '@/hooks/useTheme';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';


const Index = () => {
  const { isTerminalVisible } = useDonutTerminal();
  const { isDarkMode, toggleTheme } = useTheme();

  // Dark: black-brown composition · Light: Solarized light
  const bg = isDarkMode ? '#1a1512' : '#fdf6e3';
  const text = isDarkMode ? '#a89d8c' : '#657b83';

  return (
    <div
      className={`${isTerminalVisible ? 'h-screen overflow-hidden' : 'min-h-screen'} flex flex-col relative`}
      style={{ backgroundColor: bg, color: text }}
    >
      {/* Terminal mode: dark background */}
      {isTerminalVisible && (
        <div className="absolute inset-0 bg-[#0a0a0a]" />
      )}

      {/* Hide navigation when terminal is visible */}
      {!isTerminalVisible && <Navigation isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />}

      <main className="relative z-10 flex-1 flex flex-col min-h-0">
        {/* Hide main content when terminal is visible */}
        {!isTerminalVisible && (
          <Hero isDarkMode={isDarkMode} />
        )}
      </main>
    </div>
  );
};

export default Index;
