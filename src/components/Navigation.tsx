import { useState } from 'react';

const Navigation = () => {
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => scrollToSection('home')}
            className="text-lg font-medium text-foreground hover:text-primary transition-colors"
          >
            saju
          </button>
          
          <div className="flex items-center gap-6 text-sm">
            {[
              { id: 'home', label: 'home' },
              { id: 'about', label: 'about' },
              { id: 'projects', label: 'projects' },
              { id: 'experience', label: 'experience' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`transition-colors ${
                  activeSection === item.id 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="flex items-center gap-4 ml-4">
              <a 
                href="https://github.com/iam-saju" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://x.com/saju" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                X
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;