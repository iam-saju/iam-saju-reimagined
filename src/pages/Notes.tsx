import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { posts } from '@/types/post';
import type { Post } from '@/types/post';
// Removed unused LayoutGrid and List imports to fix lint error



const Notes = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read tag from URL, support multiple tags via comma-separated ?tag=ai,python
  const urlTag = searchParams.get('tag');
  const [activeTags, setActiveTags] = useState<string[]>(
    urlTag ? urlTag.split(',').filter(Boolean) : []
  );

  // Sync URL when activeTags changes
  useEffect(() => {
    if (activeTags.length > 0) {
      setSearchParams({ tag: activeTags.join(',') }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [activeTags, setSearchParams]);

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

  // Solarized palette
  const bg = isDarkMode ? '#002b36' : '#fdf6e3';
  const heading = isDarkMode ? '#fdf6e3' : '#073642';
  const body = isDarkMode ? '#93a1a1' : '#586e75';
  const muted = isDarkMode ? '#657b83' : '#93a1a1';
  const accent = '#b58900';
  const link = '#268bd2';
  const green = '#859900';
  const cardBg = isDarkMode ? '#073642' : '#eee8d5';
  const cardBorder = isDarkMode ? '#073642' : '#eee8d5';
  const border = cardBorder;
  const mono = "'Geist Mono', monospace";

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
        className={`text-[10px] lowercase px-2.5 py-0.5 rounded-sm transition-all duration-200 ${
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



  // ── Post Card (Grid Style) ─────────────────────────────────────────────────
  const PostCard = ({ post, variant = 'standard', height }: { post: Post; variant?: 'featured' | 'standard'; height?: string }) => {
    const isFeatured = variant === 'featured';

    // Overlay Layout (Used for both lead cards in grid mode)
    if (height && layoutMode === 'grid') {
      return (
        <div
          className="group cursor-pointer overflow-hidden relative rounded-lg transition-all duration-350 ease-out border"
          style={{
            backgroundColor: cardBg,
            borderColor: cardBorder,
            height: height,
            minHeight: height,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.transform = 'translateY(-4px)';
            el.style.borderColor = accent;
            el.style.boxShadow = isDarkMode
              ? '0 12px 40px rgba(0,0,0,0.5)'
              : '0 10px 30px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.transform = 'translateY(0)';
            el.style.borderColor = cardBorder;
            el.style.boxShadow = 'none';
          }}
          onClick={() => {
            if (post.draft) return;
            if (post.sections && post.sections.length > 0) {
              navigate(`/posts/${post.slug}`);
            } else if (post.link) {
              window.open(post.link, '_blank');
            }
          }}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={post.cardImage || post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{
                objectPosition: post.cardImagePosition || 'center',
                filter: isDarkMode ? 'brightness(0.7)' : 'brightness(0.9)',
              }}
              loading="lazy"
            />
            {/* Gradient Overlay */}
            <div 
              className="absolute inset-0 z-10"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 80%)'
              }}
            />
          </div>

          {/* Overlay Content */}
          <div className="absolute inset-0 z-20 p-6 group">
            {/* Top Meta Info - cleaner and more spread out */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
              <div>
                {post.draft && <TagPill tag="coming soon" />}
              </div>
              <div className="flex flex-wrap gap-1.5 justify-end max-w-[60%]">
                {post.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="text-[9px] lowercase px-2 py-0.5 rounded-sm bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-sm"
                    style={{ fontFamily: mono, fontWeight: '600' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Content Area - decoupled absolute positioning for pixel-perfect horizontal alignment */}
            <div className="absolute inset-x-6 bottom-[48px]">
              <div className="flex flex-col justify-end">
                {/* Title */}
                <div className="h-[64px] md:h-[72px] flex flex-col justify-end">
                  <h3
                    className="font-serif font-normal leading-tight text-white transition-colors text-2xl md:text-3xl line-clamp-2"
                  >
                    {post.title}
                  </h3>
                </div>

                {/* Description - limited to few essential lines */}
                <p
                  className="leading-relaxed text-[11px] text-white/70 max-w-md line-clamp-2 mt-2"
                  style={{ fontFamily: mono }}
                >
                  {post.description}
                </p>
              </div>
            </div>

            {/* Bottom Meta Bar - independent bottom anchor to prevent shifting neighboring cards */}
            <div 
              className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-50 text-[9px] text-white" 
              style={{ fontFamily: mono }}
            >
              <div className="flex items-center gap-2">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <div>
                {post.draft ? (
                  <span className="opacity-80">coming soon</span>
                ) : (
                  <span className="text-sm transition-transform duration-300 group-hover:translate-x-1 inline-block">→</span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="group cursor-pointer overflow-hidden flex flex-col rounded-lg transition-all duration-350 ease-out"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          height: height || 'auto',
          minHeight: height || 'auto',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(-4px)';
          el.style.borderColor = accent;
          el.style.boxShadow = isDarkMode
            ? '0 12px 30px rgba(0,0,0,0.4)'
            : '0 10px 25px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(0)';
          el.style.borderColor = cardBorder;
          el.style.boxShadow = 'none';
        }}
        onClick={() => {
          if (post.draft) return;
          if (post.sections && post.sections.length > 0) {
            navigate(`/posts/${post.slug}`);
          } else if (post.link) {
            window.open(post.link, '_blank');
          }
        }}
      >
        {/* Image Container — Dynamic Aspect Ratio */}
        <div 
          className="relative overflow-hidden bg-black/5 dark:bg-white/5"
          style={{ 
            aspectRatio: post.aspectRatio === 'square' ? '1/1' : 
                         (post.aspectRatio === 'video' ? '16/9' : 
                         (post.aspectRatio === 'natural' ? 'auto' : '16/9')) 
          }}
        >
          <img
            src={post.cardImage || post.image}
            alt={post.title}
            className={`w-full h-full transition-transform duration-700 group-hover:scale-110 object-${post.objectFit || 'cover'}`}
            style={{
              objectPosition: post.cardImagePosition || 'center',
              transform: post.zoom ? 'scale(1.5)' : undefined,
              filter: isDarkMode
                ? (post.lightBg ? 'invert(1) hue-rotate(180deg) brightness(0.85)' : 'brightness(0.85)')
                : 'none',
            }}
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className={`flex flex-col gap-2 flex-1 ${isFeatured ? 'p-5' : 'p-4'}`}>
          <div className="space-y-1">
            {/* Meta Row */}
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ fontFamily: mono, color: muted }}>
                {post.date}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {post.draft && <TagPill tag="coming soon" />}
                {post.tags.slice(0, 2).map(tag => (
                  <TagPill 
                    key={tag} 
                    tag={tag} 
                    isActive={activeTags.includes(tag)}
                    onClick={(t) => setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} 
                  />
                ))}
              </div>
            </div>

            {/* Title */}
            <h3
              className={`font-serif font-normal leading-tight group-hover:text-[#268bd2] transition-colors mb-1.5 ${isFeatured ? 'text-2xl' : 'text-xl'}`}
              style={{ color: heading }}
            >
              {post.title}
            </h3>

            {/* Description */}
            <p
              className="leading-relaxed text-xs line-clamp-2"
              style={{ fontFamily: mono, color: body }}
            >
              {post.description}
            </p>
          </div>

          <div className="mt-auto pt-1 flex justify-end">
            {post.draft ? (
              <span className="text-[10px] opacity-40" style={{ fontFamily: mono, color: body }}>coming soon</span>
            ) : (
              <span 
                className="text-xs transition-all duration-300 group-hover:translate-x-1"
                style={{ fontFamily: mono, color: link }}
              >
                →
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── List Card (Pixperk Style) ──────────────────────────────────────────────
  const ListCard = ({ post }: { post: Post }) => {
    return (
      <div
        className="group cursor-pointer flex flex-col sm:flex-row gap-6 pb-10 border-b transition-all duration-300 items-start"
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
        {/* Left: Thumbnail — Dynamic Aspect Ratio */}
        <div 
          className="w-full sm:w-56 md:w-64 shrink-0 rounded-lg overflow-hidden relative border"
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', 
            borderColor: border,
            aspectRatio: post.aspectRatio === 'square' ? '1/1' : 
                         (post.aspectRatio === 'natural' ? 'auto' : '16/9')
          }}
        >
          <img
            src={post.cardImage || post.image}
            alt={post.title}
            className={`w-full h-full transition-transform duration-500 group-hover:scale-105 object-${post.objectFit || 'cover'}`}
            style={{
              objectPosition: post.cardImagePosition || 'center',
              transform: post.zoom ? 'scale(1.5)' : undefined,
              filter: isDarkMode
                ? (post.lightBg ? 'invert(1) hue-rotate(180deg) brightness(0.85)' : 'brightness(0.85)')
                : 'none',
            }}
            loading="lazy"
          />
        </div>

        {/* Right: Info */}
        <div className="flex-1 flex flex-col gap-1 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ fontFamily: mono, color: muted }}>
              {post.date}
            </span>
          </div>
          
          <h3
            className="font-serif text-2xl sm:text-3xl font-normal leading-tight group-hover:text-[#268bd2] transition-colors mb-2"
            style={{ color: heading }}
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
                  className="text-[10px] opacity-50"
                  style={{ fontFamily: mono, color: muted }}
                >
                  coming soon
                </span>
              ) : (
                <span 
                  className="text-[10px] flex items-center gap-1 transition-all duration-300 group-hover:translate-x-1"
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

  const featuredPost = posts.find(p => p.slug === 'gradient-descent')!;
  const bitcoinPost = posts.find(p => p.slug === 'bitcoin-server-cpp')!;
  const agenticPost = posts.find(p => p.slug === 'agentic-ai')!;
  const langchainPost = posts.find(p => p.slug === 'langchain-basics')!;

  const allUniqueTags = Array.from(new Set(posts.flatMap(p => p.tags))).sort();

  const matchesFilter = (post: Post) => {
    if (activeTags.length === 0) return true;
    return activeTags.some(tag => post.tags.includes(tag));
  };

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
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-4 pt-0">
          <div className="space-y-6">
            {/* Header + Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6" style={{ borderColor: 'transparent' }}>
              <div>
                <h1
                  className="font-serif text-3xl sm:text-4xl md:text-[3rem] font-normal leading-tight mb-4"
                  style={{ color: heading }}
                >
                  posts.
                </h1>
                <p
                  className="text-[12px] sm:text-sm leading-relaxed max-w-lg"
                  style={{ fontFamily: mono, color: muted, opacity: 0.8 }}
                >
                  random stuff i've written about, built, or experimented with.
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-md self-start sm:self-auto" style={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`px-3 py-1 rounded text-[10px] transition-all ${layoutMode === 'grid' ? 'shadow-md' : 'opacity-40 hover:opacity-100'}`}
                  style={{ 
                    fontFamily: mono,
                    backgroundColor: layoutMode === 'grid' ? (isDarkMode ? '#073642' : '#ffffff') : 'transparent',
                    color: layoutMode === 'grid' ? heading : muted,
                    border: layoutMode === 'grid' ? `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : '1px solid transparent'
                  }}
                >
                  grid
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`px-3 py-1 rounded text-[10px] transition-all ${layoutMode === 'list' ? 'shadow-md' : 'opacity-40 hover:opacity-100'}`}
                  style={{ 
                    fontFamily: mono,
                    backgroundColor: layoutMode === 'list' ? (isDarkMode ? '#073642' : '#ffffff') : 'transparent',
                    color: layoutMode === 'list' ? heading : muted,
                    border: layoutMode === 'list' ? `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : '1px solid transparent'
                  }}
                >
                  list
                </button>
              </div>
            </div>

            {/* Tag Quick Filters */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[10px] opacity-40 uppercase tracking-widest pt-0.5" style={{ fontFamily: mono }}>FILTER:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTags([])}
                  className="text-[10px] lowercase px-2.5 py-0.5 rounded-sm transition-all border shadow-sm"
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



            {/* Layout Content */}
            <div className="min-h-[400px]">
              {layoutMode === 'grid' ? (
                <div className="space-y-6">
                  <div className="space-y-6">
                    {/* Row 1: Bitcoin (3) & Gradient (5) */}
                    {(matchesFilter(bitcoinPost) || matchesFilter(featuredPost)) && (
                      <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
                        {matchesFilter(bitcoinPost) ? (
                          <div className="lg:col-span-3">
                            <PostCard post={bitcoinPost} variant="standard" height="420px" />
                          </div>
                        ) : null}
                        {matchesFilter(featuredPost) ? (
                          <div className="lg:col-span-5">
                            <PostCard post={featuredPost} variant="featured" height="420px" />
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Row 2: Agentic AI (3/5) & Langchain (2/5) */}
                    {(matchesFilter(agenticPost) || (langchainPost && matchesFilter(langchainPost))) && (
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {matchesFilter(agenticPost) ? (
                          <div className="lg:col-span-3">
                            <PostCard post={agenticPost} variant="featured" height="420px" />
                          </div>
                        ) : null}
                        {langchainPost && matchesFilter(langchainPost) ? (
                          <div className="lg:col-span-2">
                            <PostCard post={langchainPost} variant="standard" height="420px" />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Standard Grid for Remaining/Filtered standard posts */}
                  {posts.filter(p => !['gradient-descent', 'bitcoin-server-cpp', 'agentic-ai', 'langchain-basics'].includes(p.slug) && matchesFilter(p)).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {posts.filter(p => !['gradient-descent', 'bitcoin-server-cpp', 'agentic-ai', 'langchain-basics'].includes(p.slug) && matchesFilter(p)).map(post => (
                        <div key={post.slug}>
                          <PostCard post={post} variant="standard" />
                        </div>
                      ))}
                    </div>
                  )}

                  {posts.filter(p => matchesFilter(p)).length === 0 && (
                    <div className="py-20 text-center opacity-40" style={{ fontFamily: mono }}>
                      no posts found for this filter combination.
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {posts.filter(p => matchesFilter(p)).map(post => (
                    <ListCard key={post.slug} post={post} />
                  ))}
                  {posts.filter(p => matchesFilter(p)).length === 0 && (
                    <div className="py-20 text-center opacity-40" style={{ fontFamily: mono }}>
                      no posts found for this filter combination.
                    </div>
                  )}
                </div>
              )}
            </div>


          </div>
        </div>

        <Footer isDarkMode={isDarkMode} />
      </main>
    </div>
  );
};

export default Notes;
