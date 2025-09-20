import { useState } from 'react';
import { ColorPaletteSwitcher } from '@/components/ColorPaletteSwitcher';

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border transition-all duration-300">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => scrollToSection('more')}
            className="text-lg font-medium text-foreground hover:text-foreground/80 transition-colors"
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
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <a
              href="/posts"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              posts
            </a>
            
            <a
              href="/archive"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              archive
            </a>
            
            <a 
              href="https://github.com/iam-saju" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              github
            </a>

            <ColorPaletteSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;