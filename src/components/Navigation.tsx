import { useState } from 'react';

interface NavigationProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const Navigation = ({ isDarkMode = false, onToggleTheme }: NavigationProps) => {
  const [activeSection, setActiveSection] = useState('more');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isDarkMode 
        ? '' 
        : 'bg-white'
    }`} style={{ backgroundColor: isDarkMode ? '#1C1C1C' : undefined }}>
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => scrollToSection('more')}
            className={`text-lg font-medium transition-colors ${
              isDarkMode 
                ? 'text-gray-200 hover:text-gray-100' 
                : 'text-foreground hover:text-foreground/80'
            }`}
          >
            saju
          </button>
          
          <div className="flex items-center gap-6 text-sm">
            {[
              { id: 'more', label: 'about' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`transition-colors ${
                  activeSection === item.id 
                    ? (isDarkMode ? 'text-gray-200 font-medium' : 'text-foreground font-medium')
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-muted-foreground hover:text-foreground')
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <a
              href="/posts"
              className={`transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              posts
            </a>
            
            <a
              href="/archive"
              className={`transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              archive
            </a>
            
            <a 
              href="https://github.com/iam-saju" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`transition-colors ${
                isDarkMode ? 'text-gray-300 hover:text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              github
            </a>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;