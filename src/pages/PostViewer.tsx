import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { posts } from '@/types/post';
import type { Section } from '@/types/post';

// ── Helper: render inline `code` spans inside paragraph text ──────────────
const renderInlineCode = (
  text: string,
  isDarkMode: boolean,
  mono: string
): React.ReactNode[] => {
  const codeBg = isDarkMode ? 'rgba(38,139,210,0.12)' : 'rgba(38,139,210,0.09)';
  const codeColor = isDarkMode ? '#268bd2' : '#268bd2';
  const parts = text.split(/`([^`]+)`/);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={i}
        style={{
          fontFamily: mono,
          fontSize: '0.8em',
          color: codeColor,
          backgroundColor: codeBg,
          padding: '1px 5px',
          borderRadius: '3px',
        }}
      >
        {part}
      </code>
    ) : (
      part
    )
  );
};

// ── Helper: Basic Python Syntax Highlighting ──────────────────────────────
// Processes in order: comments → strings (hidden as placeholders) →
// keywords → function names → restore placeholders. This order prevents
// keyword regex from matching inside string/comment tokens.
const highlightPython = (code: string, isDarkMode: boolean): string => {
  const keyword     = '#cb4b16'; // orange — all keywords uniformly
  const stringColor = isDarkMode ? '#859900' : '#6a7c00'; // green (darker in light)
  const commentColor = isDarkMode ? '#586e75' : '#5d7374'; // muted (darker in light)
  const func        = '#268bd2'; // blue
  const number      = isDarkMode ? '#d33682' : '#b01e6e'; // magenta
  const keywordList = [
    'from','import','def','return','if','elif','else','for','in','while',
    'as','with','try','except','finally','raise','pass','break','continue',
    'None','True','False','yield','class','and','or','not','is','lambda',
  ];

  const placeholders: string[] = [];
  let colored = code
    // Escape HTML so dangerouslySetInnerHTML is safe
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 1. Hide triple-quoted strings
  colored = colored.replace(/("""[\s\S]*?"""|'''[\s\S]*?''')/g, (m) => {
    placeholders.push(`<span style="color:${stringColor}">${m}</span>`);
    return `\x00${placeholders.length - 1}\x00`;
  });

  // 2. Hide single-line comments
  colored = colored.replace(/(#[^\n]*)/g, (m) => {
    placeholders.push(`<span style="color:${commentColor}">${m}</span>`);
    return `\x00${placeholders.length - 1}\x00`;
  });

  // 3. Hide single/double-quoted strings
  colored = colored.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (m) => {
    placeholders.push(`<span style="color:${stringColor}">${m}</span>`);
    return `\x00${placeholders.length - 1}\x00`;
  });

  // 4. Keywords (uniform colour — fixes if/else/elif inconsistency)
  keywordList.forEach(k => {
    colored = colored.replace(
      new RegExp(`\\b(${k})\\b`, 'g'),
      `<span style="color:${keyword}">$1</span>`
    );
  });

  // 5. Numbers
  colored = colored.replace(/\b(\d+\.?\d*)\b/g,
    `<span style="color:${number}">$1</span>`);

  // 6. Function calls / definitions
  colored = colored.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g,
    `<span style="color:${func}">$1</span>`);

  // 7. Restore placeholders (reverse order avoids index corruption)
  for (let i = placeholders.length - 1; i >= 0; i--) {
    colored = colored.replace(`\x00${i}\x00`, placeholders[i]);
  }

  return colored;
};

// Plain HTML escape — used for non-python blocks (JS snippets, ascii diagrams,
// tables) that shouldn't be run through the python highlighter.
const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── CodeBlock component — line numbers + copy + slim header ────────────────
const CodeBlock = ({
  code,
  isDarkMode,
  lang,
}: {
  code: string;
  isDarkMode: boolean;
  lang?: string;
}) => {
  const [copied, setCopied] = useState(false);
  const label = (lang && lang.trim()) || 'python';
  const highlight = label === 'python';

  const codeBg     = isDarkMode ? '#15100d' : '#eae4d4'; // near-black brown = better contrast
  const codeBorder = isDarkMode ? 'rgba(168,157,140,0.12)' : 'rgba(147,161,161,0.25)';
  const headerBg   = isDarkMode ? 'rgba(21,16,13,0.95)' : '#d8d2c2';
  const gutterBg   = isDarkMode ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.04)';
  const gutterColor = isDarkMode ? '#5a4d40' : '#a0a8a8';
  const labelColor  = isDarkMode ? '#7a6a58' : '#7a8890';
  const codeText   = isDarkMode ? '#a89d8c' : '#3d5059';
  const mono = "'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', Menlo, Monaco, Consolas, monospace";

  const lines = code.split('\n');
  const lineCount = lines.length;
  const gutterWidth = lineCount >= 100 ? 42 : lineCount >= 10 ? 34 : 26;

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="mt-6 rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${codeBorder}`,
        boxShadow: isDarkMode
          ? '0 4px 20px rgba(0,0,0,0.35)'
          : '0 2px 12px rgba(0,0,0,0.07)',
      }}
    >
      {/* ── Slim header: language label + copy button (no dots) ── */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: headerBg, borderBottom: `1px solid ${codeBorder}` }}
      >
        {/* left side intentionally empty — clean look */}
        <span style={{ width: `${gutterWidth}px` }} />

        {/* right: language label + copy */}
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] tracking-[0.08em] uppercase"
            style={{ fontFamily: mono, color: labelColor }}
          >
            {label}
          </span>
          <button
            onClick={copyCode}
            title="Copy code"
            className="flex items-center gap-1 text-[10px] transition-all duration-150 hover:opacity-70"
            style={{ fontFamily: mono, color: copied ? '#859900' : labelColor }}
          >
            {copied ? (
              <span>✓ copied</span>
            ) : (
              /* clipboard icon inline SVG */
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 .586L14.414 3A2 2 0 0 1 15 4.414V12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2 0v10h7V4.414L10.586 2H6z"/>
                <path d="M1 4a1 1 0 0 0-1 1v9a2 2 0 0 0 2 2h7a1 1 0 1 0 0-2H2V5a1 1 0 0 0-1-1z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Code area: gutter + syntax-highlighted lines ── */}
      <div
        className="relative overflow-x-auto"
        style={{ backgroundColor: codeBg }}
      >
        {/* Right-edge fade — signals horizontal overflow */}
        <div
          className="pointer-events-none absolute top-0 right-0 bottom-0 z-10"
          style={{
            width: '40px',
            background: `linear-gradient(to right, transparent, ${codeBg})`,
          }}
        />

        <table
          className="w-full border-collapse"
          style={{ fontFamily: mono, fontSize: '11.5px', lineHeight: 1.8, color: codeText }}
        >
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="group">
                {/* Gutter */}
                <td
                  className="select-none text-right align-top py-0"
                  style={{
                    width: `${gutterWidth}px`,
                    minWidth: `${gutterWidth}px`,
                    paddingRight: '10px',
                    paddingLeft: '8px',
                    paddingTop: i === 0 ? '20px' : '0',
                    paddingBottom: i === lines.length - 1 ? '20px' : '0',
                    backgroundColor: gutterBg,
                    color: gutterColor,
                    borderRight: `1px solid ${codeBorder}`,
                    userSelect: 'none',
                  }}
                >
                  {i + 1}
                </td>
                {/* Code line */}
                <td
                  className="align-top whitespace-pre"
                  style={{
                    paddingLeft: '20px',
                    paddingRight: '40px', // leave room for fade
                    paddingTop: i === 0 ? '20px' : '0',
                    paddingBottom: i === lines.length - 1 ? '20px' : '0',
                    letterSpacing: '0.01em',
                  }}
                  dangerouslySetInnerHTML={{ __html: highlight ? highlightPython(line, isDarkMode) : escapeHtml(line) }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Back To Top Button ─────────────────────────────────────────────────────
const BackToTop = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const check = () => {
      const scrollY = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(total > 0 && scrollY / total > 0.3);
    };
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  if (!visible) return null;
  return (
    <button
      onClick={scrollTop}
      aria-label="Back to top"
      className="fixed bottom-8 right-8 z-50 w-9 h-9 flex items-center justify-center transition-all duration-200 hover:opacity-70"
      style={{
        backgroundColor: isDarkMode ? '#241d18' : '#eee8d5',
        border: `1px solid ${isDarkMode ? '#7d7263' : '#93a1a1'}40`,
        borderRadius: '6px',
        color: isDarkMode ? '#a89d8c' : '#586e75',
        fontSize: '14px',
        boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.08)',
      }}
    >
      ↑
    </button>
  );
};

// ── Reading Progress Bar ───────────────────────────────────────────────────
const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <div
      className="fixed top-0 left-0 z-[60] h-[2px] transition-all duration-100"
      style={{ width: `${progress}%`, background: 'linear-gradient(to right, #b58900, #cb4b16)' }}
    />
  );
};

// ── Table of Contents ──────────────────────────────────────────────────────
const TableOfContents = ({
  sections,
  activeId,
  isDarkMode,
}: {
  sections: Section[];
  activeId: string;
  isDarkMode: boolean;
}) => {
  const muted = isDarkMode ? '#7d7263' : '#93a1a1';
  const mono = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif";

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside
      className="hidden md:flex flex-col gap-8 sticky top-24 self-start"
      style={{ width: '200px', minWidth: '200px', flexShrink: 0 }}
    >
      <button
        onClick={() => { window.location.href = '/posts'; }}
        className="flex items-center gap-1.5 text-[11px] transition-all duration-150 hover:opacity-70 hover:-translate-x-0.5 text-left w-fit"
        style={{ color: '#268bd2', fontFamily: mono }}
      >
        <ArrowLeft className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
        all posts
      </button>

      {/* Minimal vertical line ToC */}
      <div className="relative">
        {/* Track line left border */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-[1px]" 
          style={{ backgroundColor: isDarkMode ? 'rgba(168,157,140,0.18)' : 'rgba(147,161,161,0.2)' }}
        />
        
        <nav className="flex flex-col gap-3 relative py-2">
          {sections.map((section) => {
            const isActive = activeId === section.id;
            return (
              <div key={section.id} className="relative flex items-center">
                {isActive && (
                  <div 
                    className="absolute -left-[0.5px] w-[2px] h-full rounded-full transition-all duration-300" 
                    style={{ backgroundColor: isDarkMode ? '#ede4d3' : '#073642' }}
                  />
                )}
                <button
                  onClick={() => handleClick(section.id)}
                  className="block w-full text-left pl-4 py-0 transition-colors duration-200 text-[11px] leading-relaxed"
                  style={{
                    fontFamily: mono,
                    color: isActive ? (isDarkMode ? '#ede4d3' : '#073642') : muted,
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {section.heading.toLowerCase()}
                </button>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

// ── REMOVED TopBar component ────────────────────────────────────────────────

// ── Post Header ────────────────────────────────────────────────────────────
const PostHeader = ({
  title,
  tags,
  date,
  readTime,
  quote,
  isDarkMode,
}: {
  title: string;
  tags: string[];
  date: string;
  readTime: string;
  quote?: string;
  isDarkMode: boolean;
}) => {
  const heading = isDarkMode ? '#ede4d3' : '#073642';
  const green = '#859900';
  const muted = isDarkMode ? '#a89d8c' : '#586e75';
  const accent = '#b58900';
  const mono = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif";
  const gothic = "'Grenze Gotisch', 'Instrument Serif', Georgia, serif";
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mb-10 space-y-4">
      {/* Date, read time, and share button block immediately above title */}
      <div 
        className="flex items-center justify-between uppercase tracking-[0.1em] text-[10px] mb-3" 
        style={{ fontFamily: mono, color: muted }}
      >
        <span>{date} — {readTime}</span>
        <button
          onClick={handleShare}
          className="transition-all duration-150 hover:opacity-70 flex items-center gap-1.5"
          style={{ color: copied ? green : muted }}
        >
          {copied ? '✓ copied' : 'share ↗'}
        </button>
      </div>

      {/* Title — Grenze Gotisch display */}
      <h1
        className="text-4xl sm:text-5xl md:text-[3.6rem] font-medium leading-[1.12] tracking-[-0.01em]"
        style={{ color: heading, fontFamily: gothic }}
      >
        {title}
      </h1>

      {/* Tags — Apple-style pill badges */}
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[11px] lowercase px-2.5 py-0.5"
            style={{
              fontFamily: mono,
              color: green,
              border: `1px solid ${green}40`,
              backgroundColor: isDarkMode ? `${green}10` : `${green}0d`,
              letterSpacing: '0.03em',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Blockquote callout — Apple-style inset card */}
      {quote && (
        <div
          className="rounded-xl px-6 py-5"
          style={{
            backgroundColor: isDarkMode ? 'rgba(181,137,0,0.08)' : 'rgba(181,137,0,0.06)',
            borderLeft: `3px solid ${accent}`,
          }}
        >
          <p
            className="font-serif text-sm sm:text-base italic leading-[1.7]"
            style={{ color: muted }}
          >
            "{quote}"
          </p>
        </div>
      )}
    </div>
  );
};

// ── Post Body ──────────────────────────────────────────────────────────────
const PostBody = ({
  sections,
  activeId,
  isDarkMode,
}: {
  sections: Section[];
  activeId: string;
  isDarkMode: boolean;
}) => {
  const sectionHeading = isDarkMode ? '#ede4d3' : '#073642';
  const body = isDarkMode ? '#a89d8c' : '#586e75';
  const divider = isDarkMode ? 'rgba(168,157,140,0.14)' : 'rgba(147,161,161,0.2)';
  const mono = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif";

  return (
    <div>
      {sections.map((section, idx) => {
        const isActive = activeId === '' || activeId === section.id;
        const opacity = isActive ? 1 : 0.4;
        
        return (
          <div
            key={section.id}
            className="pb-10 transition-all duration-500 ease-in-out"
            style={{
              opacity,
              borderBottom: idx < sections.length - 1 ? `1px solid ${divider}` : 'none',
              marginBottom: idx < sections.length - 1 ? '40px' : 0,
            }}
          >
          {/* Section number label + heading — serif, headers only */}
          <p
            className="text-[10px] font-medium mb-1.5 tracking-[0.12em] uppercase"
            style={{ fontFamily: mono, color: isDarkMode ? '#7a6a58' : '#93a1a1' }}
          >
            {String(idx + 1).padStart(2, '0')}.
          </p>
          <h2
            id={section.id}
            className="font-serif text-xl sm:text-2xl font-normal leading-[1.3] mb-4 scroll-mt-28"
            style={{ color: sectionHeading }}
          >
            {section.heading}
          </h2>

          {/* Body paragraphs — inline code highlighted */}
          <div className="space-y-4">
            {section.body.split('\n\n').map((para, i) =>
              para.trim() ? (
                <p
                  key={i}
                  className="text-[13.5px] leading-[1.85]"
                  style={{ fontFamily: mono, color: body }}
                >
                  {renderInlineCode(para.trim(), isDarkMode, mono)}
                </p>
              ) : null
            )}
          </div>

          {/* Code block — redesigned with line numbers, copy button, slim header */}
          {section.code && (
            <CodeBlock code={section.code} isDarkMode={isDarkMode} lang={section.lang} />
          )}
          {/* Section image */}
          {section.image && (
            <div
              className="mt-6 rounded-xl overflow-hidden"
              style={{
                maxWidth: '640px',
                boxShadow: isDarkMode
                  ? '0 8px 32px rgba(0,0,0,0.35)'
                  : '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <img
                src={section.image}
                alt={section.heading}
                className="w-full h-auto"
              />
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
};

// ── PostViewer (main page) ─────────────────────────────────────────────────
const PostViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeId, setActiveId] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  const post = posts.find((p) => p.slug === slug);

  useEffect(() => {
    if (!post) navigate('/posts', { replace: true });
  }, [post, navigate]);

  // Scrollspy
  useEffect(() => {
    if (!post || post.sections.length === 0) return;
    const headingEls = post.sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -55% 0px', threshold: 0 }
    );
    headingEls.forEach((el) => observerRef.current!.observe(el));

    // Force active state to last section if user hits the bottom of the page
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        setActiveId(post.sections[post.sections.length - 1].id);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [post]);

  if (!post) return null;

  const bg = isDarkMode ? '#1a1512' : '#fdf6e3';
  const body = isDarkMode ? '#a89d8c' : '#586e75';

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: bg, color: body }}
    >
      <ReadingProgress />
      <BackToTop isDarkMode={isDarkMode} />
      <Navigation isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />

      <main
        className="relative z-10 pt-8"
        style={{
          animation: 'post-fade-in 0.5s ease-out both',
        }}
      >
        <style>{`
          @keyframes post-fade-in {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-20 pt-0">
          {/* Three-column layout */}
          <div className="flex gap-12 items-start">
            {/* Sticky ToC */}
            <TableOfContents
              sections={post.sections}
              activeId={activeId}
              isDarkMode={isDarkMode}
            />

            {/* Main content */}
            <article className="flex-1 min-w-0 max-w-2xl">
              <PostHeader
                title={post.title}
                tags={post.tags}
                date={post.date}
                readTime={post.readTime}
                quote={post.quote}
                isDarkMode={isDarkMode}
              />
              <PostBody sections={post.sections} activeId={activeId} isDarkMode={isDarkMode} />
            </article>


          </div>
        </div>

        <Footer isDarkMode={isDarkMode} />
      </main>
    </div>
  );
};

export default PostViewer;
