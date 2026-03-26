import { useDonutTerminal } from '@/hooks/useDonutTerminal';
import { useTheme } from '@/hooks/useTheme';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';


const Index = () => {
  const { isTerminalVisible } = useDonutTerminal();
  const { isDarkMode, toggleTheme } = useTheme();

  // Solarized colors
  const bg = isDarkMode ? '#002b36' : '#fdf6e3';
  const text = isDarkMode ? '#839496' : '#657b83';

  return (
    <div
      className="h-screen overflow-hidden flex flex-col relative"
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
