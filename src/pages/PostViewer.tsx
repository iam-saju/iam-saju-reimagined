import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { posts } from '@/types/post';
import type { Post, Section } from '@/types/post';

// ── Helper: render inline `code` spans inside paragraph text ──────────────
const renderInlineCode = (
  text: string,
  isDarkMode: boolean,
  mono: string
): React.ReactNode[] => {
  // P5 fix: warm teal tint in dark mode (was flat grey), clean blue highlight in light
  const codeBg = isDarkMode ? 'rgba(42,143,143,0.18)' : 'rgba(38,139,210,0.09)';
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
const highlightPython = (code: string, isDarkMode: boolean) => {
  const keyword = isDarkMode ? '#cb4b16' : '#cb4b16'; // Orange
  const stringColor = isDarkMode ? '#859900' : '#859900'; // Green
  const commentColor = isDarkMode ? '#586e75' : '#93a1a1'; // Muted
  const func = isDarkMode ? '#268bd2' : '#268bd2'; // Blue
  const keywordList = ['from', 'import', 'def', 'return', 'if', 'else', 'for', 'in', 'while', 'as', 'with', 'try', 'except', 'None', 'True', 'False', 'yield', 'class'];

  const placeholders: string[] = [];
  let colored = code;

  // 1. Comments - hide them
  colored = colored.replace(/(#.*)/g, (match) => {
    placeholders.push(`<span style="color: ${commentColor}">${match}</span>`);
    return `____PYHL_${placeholders.length - 1}____`;
  });

  // 2. Strings - hide them
  colored = colored.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (match) => {
    placeholders.push(`<span style="color: ${stringColor}">${match}</span>`);
    return `____PYHL_${placeholders.length - 1}____`;
  });

  // 3. Keywords
  keywordList.forEach(k => {
    const regex = new RegExp(`\\b${k}\\b`, 'g');
    colored = colored.replace(regex, `<span style="color: ${keyword}">${k}</span>`);
  });

  // 4. Function calls/defs
  colored = colored.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b\s*\(/g, (_, p1) => `<span style="color: ${func}">${p1}</span>(`);

  // 5. Restore hidden parts in reverse
  for (let i = placeholders.length - 1; i >= 0; i--) {
    colored = colored.replace(`____PYHL_${i}____`, placeholders[i]);
  }

  return <span dangerouslySetInnerHTML={{ __html: colored }} />;
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
        backgroundColor: isDarkMode ? '#073642' : '#eee8d5',
        border: `1px solid ${isDarkMode ? '#657b83' : '#93a1a1'}40`,
        borderRadius: '6px',
        color: isDarkMode ? '#93a1a1' : '#586e75',
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
  const [mobileOpen, setMobileOpen] = useState(false);
  // P1 fix: bump inactive TOC contrast to pass WCAG AA (was ~2.1:1 on cream)  
  const muted = isDarkMode ? '#7AACAC' : '#6B7B7C';
  const mono = "'Geist Mono', monospace";
  const bg = isDarkMode ? '#002b36' : '#fdf6e3';
  const border = isDarkMode ? 'rgba(101,123,131,0.2)' : 'rgba(147,161,161,0.2)';

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  const TocItems = () => (
    <nav className="flex flex-col gap-3 relative py-2">
      {sections.map((section) => {
        const isActive = activeId === section.id;
        return (
          <div key={section.id} className="relative flex items-center">
            {isActive && (
              <div
                className="absolute -left-[0.5px] w-[2px] h-full rounded-full transition-all duration-300"
                style={{ backgroundColor: isDarkMode ? '#eee8d5' : '#073642' }}
              />
            )}
            <button
              onClick={() => handleClick(section.id)}
              className="block w-full text-left pl-4 py-0 transition-colors duration-200 text-[11px] leading-relaxed"
              style={{
                fontFamily: mono,
                color: isActive ? (isDarkMode ? '#eee8d5' : '#073642') : muted,
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {section.heading.toLowerCase()}
            </button>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* P9: Mobile sticky Contents pill */}
      <div
        className="md:hidden sticky top-20 z-40 mb-4"
        style={{ fontFamily: mono }}
      >
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[11px] px-3 py-1.5 rounded-full transition-all duration-200"
          style={{
            color: isDarkMode ? '#eee8d5' : '#073642',
            backgroundColor: isDarkMode ? '#073642' : '#eee8d5',
            border: `1px solid ${border}`,
          }}
        >
          contents {mobileOpen ? '↑' : '↓'}
        </button>
        {mobileOpen && (
          <div
            className="absolute top-9 left-0 rounded-lg p-4 shadow-lg z-50"
            style={{
              backgroundColor: bg,
              border: `1px solid ${border}`,
              minWidth: '200px',
            }}
          >
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-[1px]" style={{ backgroundColor: border }} />
              <TocItems />
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar  */}
      <aside
        className="hidden md:flex flex-col gap-8 sticky top-24 self-start"
        style={{ width: '200px', minWidth: '200px', flexShrink: 0 }}
      >
        <button
          onClick={() => { window.location.href = '/posts'; }}
          className="text-[11px] transition-all duration-150 hover:opacity-70 text-left w-fit"
          style={{ color: '#268bd2', fontFamily: mono }}
        >
          ← all posts
        </button>

        {/* Minimal vertical line ToC */}
        <div className="relative">
          {/* Track line left border */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[1px]"
            style={{ backgroundColor: border }}
          />
          <TocItems />
        </div>
      </aside>
    </>
  );
};

// ── REMOVED TopBar component ────────────────────────────────────────────────

// ── Post Header ────────────────────────────────────────────────────────────
const PostHeader = ({
  title,
  tags,
  date,
  readTime,
  image,
  imagePosition,
  quote,
  isDarkMode,
  lightBg,
}: {
  title: string;
  tags: string[];
  date: string;
  readTime: string;
  image: string;
  imagePosition?: string;
  quote?: string;
  isDarkMode: boolean;
  lightBg?: boolean;
}) => {
  const heading = isDarkMode ? '#fdf6e3' : '#073642';
  const green = '#859900';
  const muted = isDarkMode ? '#93a1a1' : '#586e75';
  const accent = '#b58900';
  const mono = "'Geist Mono', monospace";
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

      {/* Title — serif, headers only */}
      <h1
        className="font-serif text-3xl sm:text-4xl md:text-[3.25rem] font-normal leading-[1.1] tracking-[-0.01em]"
        style={{ color: heading }}
      >
        {title}
      </h1>

      {/* Tags — linked pill badges */}
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            to={`/posts?tag=${tag}`}
            className="text-[11px] lowercase px-2.5 py-0.5 transition-all duration-200 hover:opacity-80"
            style={{
              fontFamily: mono,
              color: green,
              border: `1px solid ${green}40`,
              backgroundColor: isDarkMode ? `${green}10` : `${green}0d`,
              letterSpacing: '0.03em',
              textDecoration: 'none',
            }}
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Cover image — P3: capped at 240px, 16/9, object-top */}
      <div
        className="overflow-hidden rounded-xl"
        style={{
          maxWidth: '680px',
          maxHeight: '240px',
          aspectRatio: '16/9',
          overflow: 'hidden',
          boxShadow: isDarkMode
            ? '0 8px 32px rgba(0,0,0,0.35)'
            : '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          style={{
            objectPosition: imagePosition || 'top',
            filter: isDarkMode
              ? lightBg
                ? 'invert(1) hue-rotate(180deg) brightness(0.85)'
                : 'brightness(0.8)'
              : 'none',
          }}
        />
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
  isDarkMode,
}: {
  sections: Section[];
  isDarkMode: boolean;
}) => {
  const sectionHeading = isDarkMode ? '#eee8d5' : '#073642';
  const body = isDarkMode ? '#93a1a1' : '#586e75';
  const divider = isDarkMode ? 'rgba(101,123,131,0.15)' : 'rgba(147,161,161,0.2)';
  const codeBg = isDarkMode ? '#001b22' : '#f5f0e1';
  const codeBorder = isDarkMode ? 'rgba(38,139,210,0.1)' : 'rgba(147,161,161,0.2)';
  const codeText = isDarkMode ? '#839496' : '#586e75';
  const mono = "'Geist Mono', monospace";

  return (
    <div>
      {sections.map((section, idx) => {
        // P6: always show sections at full opacity — remove the fade ghost effect
        const opacity = 1;
        
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
            style={{ fontFamily: mono, color: isDarkMode ? '#4A8A8E' : '#93a1a1' }}
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

          {/* Body paragraphs — P10: bumped to 17px, 1.85 line-height */}
          <div className="space-y-4">
            {section.body.split('\n\n').map((para, i) =>
              para.trim() ? (
                <p
                  key={i}
                  className="text-[17px] leading-[1.85]"
                  style={{ fontFamily: mono, color: body }}
                >
                  {renderInlineCode(para.trim(), isDarkMode, mono)}
                </p>
              ) : null
            )}
          </div>

          {/* Code block — Apple dev docs style */}
          {section.code && (
            <div
              className="mt-6 rounded-xl overflow-hidden"
              style={{
                border: `1px solid ${codeBorder}`,
                boxShadow: isDarkMode
                  ? '0 4px 16px rgba(0,0,0,0.3)'
                  : '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              {/* Code title bar */}
              <div
                className="flex items-center gap-1.5 px-4 py-2.5"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(0,43,54,0.9)' : '#e0dbd0',
                  borderBottom: `1px solid ${codeBorder}`,
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#dc322f' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#b58900' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#859900' }} />
                <span
                  className="ml-2 text-[10px] tracking-wide"
                  style={{ fontFamily: mono, color: isDarkMode ? '#4a6a72' : '#93a1a1' }}
                >
                  python
                </span>
              </div>
              <pre
                className="text-[11.5px] p-6 overflow-x-auto"
                style={{
                  fontFamily: mono,
                  backgroundColor: codeBg,
                  color: codeText,
                  lineHeight: 1.85,
                  margin: 0,
                  letterSpacing: '0.01em',
                }}
              >
                <code>{highlightPython(section.code, isDarkMode)}</code>
              </pre>
            </div>
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

// ── Post Footer — P2: closing line + rule + prev/next nav ──────────────────
const PostFooter = ({
  post,
  isDarkMode,
}: {
  post: Post;
  isDarkMode: boolean;
}) => {
  const mono = "'Geist Mono', monospace";
  const muted = isDarkMode ? '#7AACAC' : '#6B7B7C';
  const teal = isDarkMode ? '#2A8F8F' : '#1A7A7A';

  const allPublished = posts.filter((p) => !p.draft);
  const idx = allPublished.findIndex((p) => p.slug === post.slug);
  const prev = idx > 0 ? allPublished[idx - 1] : null;
  const next = idx < allPublished.length - 1 ? allPublished[idx + 1] : null;

  const related = posts
    .filter((p) => !p.draft && p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 3);

  return (
    <div className="mt-16 pb-4" style={{ fontFamily: mono }}>
      {post.closingLine && (
        <p
          className="text-center italic mb-8"
          style={{ color: muted, fontSize: '15px', lineHeight: 1.7 }}
        >
          {post.closingLine}
        </p>
      )}

      <div
        className="mx-auto mb-10"
        style={{ width: '60px', height: '1px', backgroundColor: `${teal}4D` }}
      />

      {(prev || next) && (
        <div className="flex justify-between items-start gap-8 mb-12">
          {prev ? (
            <Link
              to={`/posts/${prev.slug}`}
              className="group flex flex-col gap-0.5 max-w-[45%] transition-opacity hover:opacity-80"
            >
              <span className="uppercase tracking-[0.12em] text-[10px] mb-1" style={{ color: muted }}>
                ← previous
              </span>
              <span
                className="text-[13px] group-hover:underline leading-snug"
                style={{ color: isDarkMode ? '#eee8d5' : '#073642' }}
              >
                {prev.title}
              </span>
            </Link>
          ) : <div />}

          {next ? (
            <Link
              to={`/posts/${next.slug}`}
              className="group flex flex-col gap-0.5 items-end max-w-[45%] text-right transition-opacity hover:opacity-80"
            >
              <span className="uppercase tracking-[0.12em] text-[10px] mb-1" style={{ color: muted }}>
                next →
              </span>
              <span
                className="text-[13px] group-hover:underline leading-snug"
                style={{ color: isDarkMode ? '#eee8d5' : '#073642' }}
              >
                {next.title}
              </span>
            </Link>
          ) : <div />}
        </div>
      )}

      {related.length > 0 && (
        <div>
          <p className="uppercase tracking-[0.12em] text-[10px] mb-4" style={{ color: muted }}>
            more on this topic
          </p>
          <div className="flex flex-col gap-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/posts/${r.slug}`}
                className="group flex items-baseline justify-between gap-4 py-2 border-b transition-opacity hover:opacity-70"
                style={{ borderColor: isDarkMode ? 'rgba(101,123,131,0.15)' : 'rgba(147,161,161,0.2)' }}
              >
                <span
                  className="text-[13px] group-hover:underline"
                  style={{ color: isDarkMode ? '#eee8d5' : '#073642' }}
                >
                  {r.title}
                </span>
                <span className="text-[11px] whitespace-nowrap" style={{ color: muted }}>
                  {r.date}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
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

  const bg = isDarkMode ? '#002b36' : '#fdf6e3';
  const body = isDarkMode ? '#93a1a1' : '#586e75';

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
          <div className="flex gap-12 items-start mt-4">
            {/* Sticky ToC */}
            <TableOfContents
              sections={post.sections}
              activeId={activeId}
              isDarkMode={isDarkMode}
            />

            {/* Main content — P4: tighter line length */}
            <article className="flex-1 min-w-0" style={{ maxWidth: '620px' }}>
              <PostHeader
                title={post.title}
                tags={post.tags}
                date={post.date}
                readTime={post.readTime}
                image={post.image}
                imagePosition={post.imagePosition}
                quote={post.quote}
                isDarkMode={isDarkMode}
                lightBg={post.lightBg}
              />
              <PostBody sections={post.sections} isDarkMode={isDarkMode} />
              <PostFooter post={post} isDarkMode={isDarkMode} />
            </article>


          </div>
        </div>

        <Footer isDarkMode={isDarkMode} />
      </main>
    </div>
  );
};

export default PostViewer;
