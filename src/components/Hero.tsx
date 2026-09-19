import { useState, useEffect } from 'react';
import HeroDonut from './HeroDonut';

interface HeroProps {
  isDarkMode?: boolean;
}

const Hero = ({ isDarkMode = true }: HeroProps) => {
  const heading = isDarkMode ? '#ede4d3' : '#073642';
  const body = isDarkMode ? '#a89d8c' : '#586e75';
  const muted = isDarkMode ? '#7d7263' : '#93a1a1';
  const bright = isDarkMode ? '#ede4d3' : '#073642';

  const [typedText, setTypedText] = useState('');
  const [showCursor] = useState(true);
  const fullText = 'hey';
  useEffect(() => {
    let i = 0;
    const delay = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < fullText.length) {
          setTypedText(fullText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          // Removed setTimeout(() => setShowCursor(false), 2000) to make cursor blink indefinitely
        }
      }, 150);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(delay);
  }, []);

  return (
    <section id="about" className="flex-1 relative flex items-center justify-start font-serif overflow-hidden">
      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      <div className="relative w-full max-w-6xl mx-auto h-full flex items-center">
        <div className="absolute top-0 bottom-0 left-1/2 right-0 flex items-center justify-center pointer-events-none" style={{ overflow: 'visible', zIndex: 0 }}>
          <HeroDonut />
        </div>

        <div className="max-w-xl px-6 sm:px-10 lg:px-16 py-4 pt-20 sm:pt-4 pb-16 sm:pb-24 relative z-10">

        <div
          className="space-y-6 text-[15px] sm:text-base leading-relaxed"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif", color: body }}
        >
          <h1
            className="font-serif text-[2.1rem] sm:text-[2.625rem] md:text-[3.15rem] font-normal leading-[1.1]"
            style={{ color: heading }}
          >
            {typedText}
            {showCursor && (
              <span className="inline-block ml-1 animate-pulse" style={{
                color: '#cb4b16',
                fontWeight: 600,
                animation: 'cursor-blink 1.0s step-end infinite',
              }}>
                |
              </span>
            )}
          </h1>

          <div className="space-y-3">
            <p>
              i'm <span style={{ color: bright, fontWeight: 600 }}>saju</span>. :)
            </p>

            <p>
              building <span style={{ fontWeight: 600 }}>systems</span> and pushing them until they fail.
            </p>

            <p style={{ color: muted }}>
              currently exploring{' '}
              <span style={{ fontWeight: 600 }}>
                reinforcement learning, AI agents, inference systems, and compute
              </span>{' '}
              — building things, breaking them, and figuring out what happens underneath.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              <>built <span style={{ fontWeight: 600 }}>buoyancy labs</span> — multilingual voice &amp; whatsapp agents for Indian businesses, handling code-switched language like Hinglish, Tanglish, and Manglish</>,
              <>writing <span style={{ fontWeight: 600 }}>adversarial prompts</span> and grading LLM outputs against golden responses</>,
              <>built <span style={{ fontWeight: 600 }}>market01</span>, a GPU rental marketplace, and <span style={{ fontWeight: 600 }}>qubit</span>, a Telegram cloud storage bot</>,
              <>building <span style={{ fontWeight: 600 }}>RL Painter</span> — training coding agents to create visual art through reinforcement learning</>,
            ].map((item, i) => (
              <li key={i} className="flex gap-2.5">
                <span aria-hidden="true" style={{ color: muted }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2" style={{ color: muted }}>
            <p>build until it breaks. inspect the failure. repeat.</p>
            <p>
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

          <p>
            <span style={{ fontWeight: 600 }}>tweets</span>{' '}
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

          <p className="hidden lg:block text-sm italic" style={{ color: muted }}>
            enter terminal for shift + t
          </p>
        </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
