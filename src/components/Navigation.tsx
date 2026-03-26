import { useState, useCallback, useRef } from 'react';

interface NavigationProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

// Characters used for the scramble effect
const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~';

const GlitchLink = ({
  text,
  href,
  color,
  hoverColor,
  external,
  onClick,
}: {
  text: string;
  href: string;
  color: string;
  hoverColor: string;
  external?: boolean;
  onClick?: () => void;
}) => {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startGlitch = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];

    const chars = text.split('');
    const settled = new Array(chars.length).fill(false);
    const current = chars.map(() => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]);
    setDisplayText(current.join(''));

    intervalRef.current = setInterval(() => {
      for (let i = 0; i < current.length; i++) {
        if (!settled[i]) {
          current[i] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
      }
      setDisplayText(current.join(''));
    }, 40);

    chars.forEach((char, i) => {
      const timeout = setTimeout(() => {
        settled[i] = true;
        current[i] = char;
        setDisplayText(current.join(''));
        if (settled.every(Boolean)) {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 60 + i * 50);
      timeoutsRef.current.push(timeout);
    });
  }, [text]);

  const stopGlitch = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
    setDisplayText(text);
  }, [text]);

  return (
    <a
      href={href}
      className="transition-colors"
      style={{ color, fontFamily: "'Geist Mono', monospace" }}
      onMouseEnter={e => {
        e.currentTarget.style.color = hoverColor;
        startGlitch();
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = color;
        stopGlitch();
      }}
      onClick={onClick}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {displayText}
    </a>
  );
};

const Navigation = ({ isDarkMode = true, onToggleTheme }: NavigationProps) => {
  // Solarized colors
  const bg = isDarkMode ? '#002b36' : '#fdf6e3';
  const border = isDarkMode ? '#073642' : '#eee8d5';
  const linkColor = isDarkMode ? '#839496' : '#657b83';
  const linkHover = isDarkMode ? '#eee8d5' : '#073642';
  const titleColor = isDarkMode ? '#eee8d5' : '#073642';

  return (
    <header 
      className="sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-300 border-b"
      style={{ 
        backgroundColor: `${bg}dd`, 
        borderColor: `${border}40`,
        fontFamily: "'Geist Mono', monospace" 
      }}
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo - Left */}
        <div className="flex-1">
          <a 
            href="/" 
            className="font-serif text-xl sm:text-2xl font-bold tracking-tight hover:opacity-75 transition-opacity"
            style={{ color: titleColor }}
          >
            saju
          </a>
        </div>

        {/* Links - Center (Desktop) / Mobile simplified */}
        <nav className="hidden sm:flex items-center justify-center gap-8 text-[13px] font-medium tracking-wide">
          <GlitchLink text="posts" href="/posts" color={linkColor} hoverColor={linkHover} />
          <GlitchLink text="archive" href="/archive" color={linkColor} hoverColor={linkHover} />
          <GlitchLink text="github" href="https://github.com/iam-saju" external color={linkColor} hoverColor={linkHover} />
        </nav>

        {/* Right Section: Mobile Toggle (optional) + Theme + Lambda */}
        <div className="flex-1 flex justify-end items-center gap-3">
          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme} 
            className="p-1.5 rounded-md transition-all duration-200 flex items-center justify-center border hover:opacity-80" 
            style={{ color: linkColor, borderColor: `${border}60` }}
            title="Toggle Theme"
          >
            {isDarkMode ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Mobile minimal menu for links */}
          <div className="sm:hidden flex items-center gap-4 ml-2">
             <a href="/posts" className="text-xs font-medium" style={{ color: linkColor }}>posts</a>
             <a href="/archive" className="text-xs font-medium" style={{ color: linkColor }}>archive</a>
             <a href="https://github.com/iam-saju" target="_blank" rel="noopener noreferrer" className="text-xs font-medium" style={{ color: linkColor }}>github</a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;