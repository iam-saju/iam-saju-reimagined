import { useDonutTerminal } from '@/hooks/useSimpleTerminal';
import { useTheme } from '@/hooks/useTheme';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

interface IndexProps {}

const Index = ({}: IndexProps) => {
  const { isTerminalVisible } = useDonutTerminal();
  const { isDarkMode, toggleTheme } = useTheme();

  // Debug logging
  console.log('Index render - isTerminalVisible:', isTerminalVisible);

  return (
    <div className={`min-h-screen font-sans relative transition-colors duration-300 bg-background text-foreground`}>
      {/* Light mode background */}
      {!isTerminalVisible && (
        <div className="absolute inset-0 bg-background" />
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
