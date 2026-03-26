import { useState, useEffect } from 'react';
import HeroDonut from './HeroDonut';

interface HeroProps {
  isDarkMode?: boolean;
}

const Hero = ({ isDarkMode = true }: HeroProps) => {
  const heading = isDarkMode ? '#E6EDF3' : '#073642';
  const body = isDarkMode ? '#8B949E' : '#586e75';
  const muted = isDarkMode ? '#6E7681' : '#93a1a1';
  const bright = isDarkMode ? '#E6EDF3' : '#073642';
  const accent = '#00FF9C';

  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = 'hey.';

  useEffect(() => {
    let i = 0;
    const delay = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < fullText.length) {
          setTypedText(fullText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 2000);
        }
      }, 150);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(delay);
  }, []);

  return (
    <section id="about" className="flex-1 relative flex items-center justify-center font-serif overflow-hidden">
      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ overflow: 'visible', zIndex: 0 }}>
        <HeroDonut />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 relative z-10">

        <div className="space-y-6">
          <h1
            className="font-serif text-4xl sm:text-5xl md:text-[3.5rem] font-normal leading-[1.1] mb-6"
            style={{ color: heading }}
          >
            {typedText}
            {showCursor && (
              <span style={{
                animation: 'cursor-blink 0.8s step-end infinite',
                color: accent,
                fontWeight: 400,
                marginLeft: '2px',
              }}>
                _
              </span>
            )}
          </h1>

          <div
            className="space-y-3 text-sm sm:text-base leading-relaxed"
            style={{ fontFamily: "'Geist Mono', monospace", color: body }}
          >
            <p>
              i'm <span style={{ color: bright, fontWeight: 600 }}>saju</span>. :)
            </p>

            <p>
              building <span style={{ fontWeight: 'bold' }}>compute systems</span> and pushing them until they fail.
            </p>

            <p style={{ color: muted }}>
              currently exploring <span style={{ fontWeight: 'bold' }}>gpu infrastructure</span>, <span style={{ fontWeight: 'bold' }}>distributed systems</span>, and how <span style={{ fontWeight: 'bold' }}>ml systems</span> behave under stress.
            </p>
          </div>

          <div className="pt-4 space-y-3" style={{ fontFamily: "'Geist Mono', monospace" }}>
            <h3 className="text-base sm:text-lg font-medium">experiments</h3>
            <ul className="space-y-1.5 text-sm sm:text-base">
              {[
                { text: 'building infra marketplaces and managing compute clusters', weight: ['infra'] },
                { text: 'exploring ml systems until they work or break', weight: ['ml'] },
                { text: 'experimenting with blockchain protocols', weight: ['blockchain'] },
                { text: 'writing servers and protocols from scratch', weight: ['servers', 'protocols'] },
              ].map((item, i) => (
                <li key={i}>
                  •{' '}
                  <a href="/posts" className="transition-colors hover:underline">
                    {item.text.split(' ').map((word, j) => {
                      const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
                      const isWeight = item.weight.some(w => cleanWord === w.toLowerCase());
                      return (
                        <span key={j} style={isWeight ? { fontWeight: 'bold' } : undefined}>
                          {word}{' '}
                        </span>
                      );
                    })}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 space-y-2" style={{ fontFamily: "'Geist Mono', monospace" }}>
            <p className="text-sm" style={{ color: muted }}>
              build until it breaks. inspect the failure. repeat.
            </p>
            <p className="text-sm" style={{ color: muted }}>
              <span
                className="font-bold"
                style={{
                  background: 'linear-gradient(to right, #dc322f, #cb4b16)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                manchester united
              </span>
              , always.
            </p>
          </div>

          <div className="pt-4" style={{ fontFamily: "'Geist Mono', monospace" }}>
            <p className="text-sm" style={{ color: body }}>
              <span style={{ fontWeight: 'bold' }}>tweets</span>{' '}
              <a
                href="https://x.com/saju0nx"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#00BFFF' }}
                className="hover:underline underline-offset-4"
              >
                @saju0nx
              </a>
            </p>
          </div>

          <p
            className="text-sm italic pt-2"
            style={{ fontFamily: "'Geist Mono', monospace", color: muted }}
          >
            <span className="hidden sm:inline">enter terminal for shift + t</span>
            <span className="sm:hidden">enter terminal for long press</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
