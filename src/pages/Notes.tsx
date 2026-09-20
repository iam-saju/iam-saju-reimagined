import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackIcon from '@/components/icons/BackIcon';
import { useTheme } from '@/hooks/useTheme';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { posts } from '@/types/post';
import type { Post } from '@/types/post';

const Notes = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dark: black-brown composition · Light: Solarized light
  const bg = isDarkMode ? '#1a1512' : '#fdf6e3';
  const heading = isDarkMode ? '#ede4d3' : '#073642';
  const body = isDarkMode ? '#a89d8c' : '#586e75';
  const muted = isDarkMode ? '#7d7263' : '#93a1a1';
  const accent = '#b58900';
  const link = '#268bd2';
  const green = '#859900';
  const cardBorder = isDarkMode ? '#2a221c' : '#eee8d5';
  const border = cardBorder;
  const mono = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif";
  const gothic = "'Grenze Gotisch', 'Instrument Serif', Georgia, serif";

  // ── Helper Components ──────────────────────────────────────────────────────
  const TagPill = ({ tag, isActive, onClick }: { tag: string; isActive?: boolean; onClick?: (tag: string) => void }) => {
    const isComingSoon = tag === 'coming soon';
    const tangerine = '#FF8C00';

    return (
      <span
        onClick={(e) => {
          if (isComingSoon || !onClick) return;
          e.stopPropagation();
          onClick(tag);
        }}
        className={`text-[9px] lowercase px-2.5 py-0.5 rounded-sm transition-all duration-200 ${
          isComingSoon ? '' : 'cursor-pointer hover:scale-105 active:scale-95'
        }`}
        style={{
          fontFamily: mono,
          color: isComingSoon ? '#ffffff' : (isActive ? '#ffffff' : green),
          backgroundColor: isComingSoon
            ? tangerine
            : (isActive ? green : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')),
          textAlign: isComingSoon ? 'center' : 'left',
          fontWeight: isComingSoon || isActive ? '600' : 'normal',
          border: isActive ? `1px solid ${green}` : 'none',
          boxShadow: isActive ? `0 2px 8px ${green}40` : 'none',
        }}
      >
        {tag}
      </span>
    );
  };

  // ── List Card ─────────────────────────────────────────────────────────────
  const ListCard = ({ post }: { post: Post }) => {
    return (
      <div
        className="group cursor-pointer flex flex-col gap-1 pb-10 border-b transition-all duration-300"
        style={{ borderColor: `${cardBorder}30` }}
        onClick={() => {
          if (post.draft) return;
          if (post.sections && post.sections.length > 0) {
            navigate(`/posts/${post.slug}`);
          } else if (post.link) {
            window.open(post.link, '_blank');
          }
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px]" style={{ fontFamily: mono, color: muted }}>
              {post.date}
            </span>
          </div>

          <h3
            className="text-[23px] sm:text-[28px] font-medium leading-tight group-hover:text-[#268bd2] transition-colors mb-2"
            style={{ color: heading, fontFamily: gothic }}
          >
            {post.title}
          </h3>

          <p
            className="leading-relaxed text-sm line-clamp-2 max-w-2xl"
            style={{ fontFamily: mono, color: body }}
          >
            {post.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {post.draft && <TagPill tag="coming soon" />}
            {post.tags.map(tag => (
              <TagPill
                key={tag}
                tag={tag}
                isActive={activeTags.includes(tag)}
                onClick={(t) => setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
              />
            ))}

            <div className="ml-auto">
              {post.draft ? (
                <span
                  className="text-[9px] opacity-50"
                  style={{ fontFamily: mono, color: muted }}
                >
                  coming soon
                </span>
              ) : (
                <span
                  className="text-[9px] flex items-center gap-1 transition-all duration-300 group-hover:translate-x-1"
                  style={{ fontFamily: mono, color: link }}
                >
                  read <span className="text-xs">→</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const allUniqueTags = Array.from(new Set(posts.flatMap(p => p.tags))).sort();

  const matchesFilter = (post: Post) => {
    if (activeTags.length === 0) return true;
    return activeTags.some(tag => post.tags.includes(tag));
  };

  const visiblePosts = posts.filter(p => matchesFilter(p));

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: bg, color: body }}
    >
      <Navigation isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />

      {/* Scroll progress bar */}
      <div
        className="fixed top-0 left-0 z-[60] h-[2px]"
        style={{
          width: `${scrollProgress}%`,
          backgroundColor: accent,
          transition: 'width 0.1s linear',
          boxShadow: scrollProgress > 0 ? `0 0 8px ${accent}60` : 'none',
        }}
      />

      <main className="relative z-10 pt-8 sm:pt-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 pb-4 pt-0">
          <div className="space-y-6">
            {/* Header */}
            <div className="pb-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-[11px] mb-4 transition-all duration-150 hover:opacity-70 hover:-translate-x-0.5 w-fit"
                style={{ color: accent, fontFamily: mono }}
              >
                <BackIcon className="w-4 h-4 shrink-0" />
                home
              </button>
              <h1
                className="text-4xl sm:text-5xl md:text-[3.5rem] font-medium leading-tight mb-4"
                style={{ color: heading, fontFamily: gothic }}
              >
                posts.
              </h1>
              <p
                className="text-[10px] sm:text-sm leading-relaxed max-w-lg"
                style={{ fontFamily: mono, color: muted, opacity: 0.8 }}
              >
                random stuff i've written about, built, or experimented with.
              </p>
            </div>

            {/* Tag Quick Filters */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[9px] opacity-40 uppercase tracking-widest pt-0.5" style={{ fontFamily: mono }}>FILTER:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTags([])}
                  className="text-[9px] lowercase px-2.5 py-0.5 rounded-sm transition-all border shadow-sm"
                  style={{
                    fontFamily: mono,
                    color: activeTags.length === 0 ? '#ffffff' : muted,
                    backgroundColor: activeTags.length === 0 ? accent : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                    borderColor: activeTags.length === 0 ? accent : `${border}20`
                  }}
                >
                  all
                </button>
                {allUniqueTags.map(tag => (
                  <TagPill
                    key={tag}
                    tag={tag}
                    isActive={activeTags.includes(tag)}
                    onClick={(t) => setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                  />
                ))}
              </div>
            </div>

            {/* Post list */}
            <div className="min-h-[400px]">
              <div className="flex flex-col gap-1">
                {visiblePosts.map(post => (
                  <ListCard key={post.slug} post={post} />
                ))}
                {visiblePosts.length === 0 && (
                  <div className="py-20 text-center opacity-40" style={{ fontFamily: mono }}>
                    no posts found for this filter combination.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer isDarkMode={isDarkMode} />
      </main>
    </div>
  );
};

export default Notes;
