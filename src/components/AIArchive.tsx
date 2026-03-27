import { useEffect, useState } from "react";
import { useTheme } from '@/hooks/useTheme';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface AIImage {
  id: string;
  title: string;
  url: string;
  timestamp: string;
  aspectRatio: number;
  lightBg?: boolean;
  caption?: string;
  mediaType?: 'image' | 'video';
  sortDate?: string;
  uploadedAt?: string;
}

interface TimelineSection {
  key: string;
  label: string;
  items: AIImage[];
}

const SEEDED_IMAGES: AIImage[] = [
  {
    id: "1",
    title: "Neural Network Visualization",
    url: "/lovable-uploads/fbf90e6e-1606-410d-a383-8b6853f25fd2.png",
    timestamp: "nov 2024",
    sortDate: "2024-11-01",
    aspectRatio: 1.0,
    lightBg: true,
    caption: "glyph-like structure studies from early model experiments.",
  },
  {
    id: "2",
    title: "Cryptocurrency Mining",
    url: "/lovable-uploads/806e7bb0-5fc0-441b-9c05-7aaf5b382d3b.png",
    timestamp: "oct 2024",
    sortDate: "2024-10-01",
    aspectRatio: 1.33,
    caption: "bitcoin texture work cropped like an editorial cover.",
  },
  {
    id: "3",
    title: "Spinning Donut Animation",
    url: "/lovable-uploads/donut.gif",
    timestamp: "dec 2024",
    sortDate: "2024-12-01",
    aspectRatio: 1.0,
    mediaType: 'image',
    caption: "the donut that quietly became part of the site's identity.",
  },
  {
    id: "4",
    title: "Portrait Study",
    url: "/lovable-uploads/naka.jpeg",
    timestamp: "sep 2024",
    sortDate: "2024-09-01",
    aspectRatio: 1.0,
    caption: "a portrait frame from the archive's earlier visual notes.",
  },
  {
    id: "5",
    title: "Wide Landscape",
    url: "/lovable-uploads/1500x500 (1).jpeg",
    timestamp: "jan 2025",
    sortDate: "2025-01-01",
    aspectRatio: 3.0,
    caption: "panoramic composition work with more atmosphere than narrative.",
  },
  {
    id: "6",
    title: "BNC Connection",
    url: "/lovable-uploads/bnc.jpg",
    timestamp: "feb 2025",
    sortDate: "2025-02-01",
    aspectRatio: 1.0,
    caption: "hardware moodboard energy, close and tactile.",
  },
  {
    id: "7",
    title: "AI Generated Art",
    url: "/lovable-uploads/ChatGPT Image Jun 24, 2025, 08_08_35 PM.png",
    timestamp: "jun 2025",
    sortDate: "2025-06-24",
    aspectRatio: 1.0,
    lightBg: true,
    caption: "cleaner surface study with a lighter tonal register.",
  }
];

const parseArchiveDate = (item: AIImage): Date | null => {
  const dateCandidates = [item.sortDate, item.uploadedAt];

  for (const candidate of dateCandidates) {
    if (!candidate) continue;
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  if (item.timestamp) {
    const parsed = new Date(`${item.timestamp} 1`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
};

const formatArchiveLabel = (date: Date | null) => {
  if (!date) return 'undated';
  return String(date.getUTCFullYear());
};

const buildTimelineSections = (items: AIImage[]): TimelineSection[] => {
  const sorted = [...items].sort((a, b) => {
    const aDate = parseArchiveDate(a)?.getTime() ?? 0;
    const bDate = parseArchiveDate(b)?.getTime() ?? 0;
    return bDate - aDate;
  });

  const sections = new Map<string, TimelineSection>();

  sorted.forEach((item) => {
    const date = parseArchiveDate(item);
    const key = date ? String(date.getUTCFullYear()) : 'undated';
    const label = formatArchiveLabel(date);

    if (!sections.has(key)) {
      sections.set(key, { key, label, items: [] });
    }

    sections.get(key)?.items.push(item);
  });

  return Array.from(sections.values());
};

const getGallerySpanClasses = (item: AIImage, index: number, count: number) => {
  const isLead = index === 0;

  if (count === 1) {
    if (item.aspectRatio >= 1.8) return 'sm:col-span-2 lg:col-span-12';
    if (item.aspectRatio >= 1.2) return 'sm:col-span-2 lg:col-span-8';
    return 'sm:col-span-2 lg:col-span-6';
  }

  if (isLead || item.aspectRatio >= 2.2) {
    return 'sm:col-span-2 lg:col-span-12';
  }

  const rhythmIndex = (index - 1) % 5;
  const inPairRow = rhythmIndex < 2;

  if (inPairRow) {
    return 'lg:col-span-6';
  }

  if (item.aspectRatio >= 1.75) {
    return 'sm:col-span-2 lg:col-span-6';
  }

  return 'lg:col-span-4';
};

const getGalleryAspectRatio = (item: AIImage) => {
  const safeRatio = Number.isFinite(item.aspectRatio) && item.aspectRatio > 0 ? item.aspectRatio : 1;
  return `${safeRatio} / 1`;
};

const normalizeText = (value?: string) => (value || '').trim().toLowerCase();

const getVisibleCaption = (item: AIImage) => {
  if (!item.caption?.trim()) return '';
  return normalizeText(item.caption) === normalizeText(item.title) ? '' : item.caption.trim();
};

const AIArchive = () => {
  const archiveApiBase = import.meta.env.VITE_UPLOAD_API_URL || 'http://localhost:3001';
  const [selectedImage, setSelectedImage] = useState<AIImage | null>(null);
  const [uploadedImages, setUploadedImages] = useState<AIImage[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { isDarkMode, toggleTheme } = useTheme();

  const bg = isDarkMode ? '#002b36' : '#fdf6e3';
  const heading = isDarkMode ? '#fdf6e3' : '#073642';
  const body = isDarkMode ? '#93a1a1' : '#586e75';
  const muted = isDarkMode ? '#657b83' : '#93a1a1';
  const accent = '#b58900';
  const cardBg = isDarkMode ? '#073642' : '#eee8d5';
  const cardBorder = isDarkMode ? '#073642' : '#e8dfc7';
  const overlayBg = isDarkMode ? '#073642' : '#f7f0de';
  const mono = "'Geist Mono', monospace";

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadUploadedImages = async () => {
      try {
        const response = await fetch(`${archiveApiBase}/api/archive-items`);
        if (!response.ok) return;

        const data = await response.json() as { items?: unknown[] };
        if (!Array.isArray(data.items)) return;

        const parsed = data.items.flatMap((entry, index) => {
          if (!entry || typeof entry !== 'object') return [];
          const item = entry as Record<string, unknown>;
          const url = typeof item.url === 'string' ? item.url : '';

          if (!url) return [];

          return [{
            id: typeof item.id === 'string' ? item.id : `uploaded-${index}`,
            title: typeof item.title === 'string' && item.title.trim() ? item.title : 'untitled',
            caption: typeof item.caption === 'string' ? item.caption : '',
            url,
            timestamp: typeof item.timestamp === 'string' ? item.timestamp : 'recent',
            aspectRatio: typeof item.aspectRatio === 'number' && item.aspectRatio > 0 ? item.aspectRatio : 1,
            lightBg: Boolean(item.lightBg),
            mediaType: item.mediaType === 'video' ? 'video' : 'image',
            sortDate: typeof item.sortDate === 'string' ? item.sortDate : undefined,
            uploadedAt: typeof item.uploadedAt === 'string' ? item.uploadedAt : undefined,
          } satisfies AIImage];
        });

        if (!isCancelled) {
          setUploadedImages(parsed);
        }
      } catch {
        if (!isCancelled) {
          setUploadedImages([]);
        }
      }
    };

    void loadUploadedImages();

    return () => {
      isCancelled = true;
    };
  }, [archiveApiBase]);

  const allImages = [...uploadedImages, ...SEEDED_IMAGES];
  const timelineSections = buildTimelineSections(allImages);

  const handleImageClick = (image: AIImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleDownload = (image: AIImage) => {
    const linkEl = document.createElement('a');
    linkEl.href = image.url;
    linkEl.download = `${image.title.replace(/\s+/g, '_')}.${image.url.split('.').pop()}`;
    document.body.appendChild(linkEl);
    linkEl.click();
    document.body.removeChild(linkEl);
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: bg, color: body }}>
      <Navigation isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />

      <div
        className="fixed top-0 left-0 z-[60] h-[2px]"
        style={{
          width: `${scrollProgress}%`,
          backgroundColor: accent,
          transition: 'width 0.1s linear',
          boxShadow: scrollProgress > 0 ? `0 0 8px ${accent}50` : 'none',
        }}
      />

      <main className="relative z-10 pt-10 sm:pt-14">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-14 sm:pb-16">
          <div className="space-y-6 sm:space-y-7">
            <section className="max-w-2xl space-y-2">
              <h1
                className="font-serif text-3xl sm:text-4xl md:text-[3rem] font-normal leading-tight"
                style={{ color: heading }}
              >
                archive.
              </h1>
              <p
                className="text-[13px] sm:text-sm leading-relaxed max-w-xl"
                style={{ fontFamily: mono, color: muted }}
              >
                a simple place where i keep images and moments i want to remember.
              </p>
            </section>

            <div className="relative space-y-8 sm:space-y-10 lg:pl-16">
              {timelineSections.length > 0 ? (
                <>
                  <div
                    className="hidden lg:block pointer-events-none absolute left-[8px] top-3 bottom-3 w-px"
                    style={{ backgroundColor: isDarkMode ? 'rgba(101,123,131,0.24)' : 'rgba(147,161,161,0.3)' }}
                  />

                  {timelineSections.map((section) => (
                    <section key={section.key} className="space-y-3 sm:space-y-4">
                    <div
                      className="sticky top-16 z-20 py-1 lg:py-0.5 lg:-ml-16"
                      style={{
                        backdropFilter: 'blur(2px)',
                        backgroundColor: isDarkMode ? 'rgba(0, 43, 54, 0.68)' : 'rgba(253, 246, 227, 0.72)',
                      }}
                    >
                      <div className="inline-flex items-center gap-2">
                        <span
                          className="hidden lg:block w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: isDarkMode ? '#93a1a1' : '#657b83' }}
                        />
                        <div
                          className="text-[0.84rem] sm:text-[0.92rem] font-serif leading-none shrink-0"
                          style={{ color: heading }}
                        >
                          {section.label}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-3.5 items-start">
                      {section.items.map((image, index) => (
                        <article
                          key={image.id}
                          className={`group overflow-hidden rounded-[8px] border transition-all duration-300 cursor-pointer ${getGallerySpanClasses(image, index, section.items.length)}`}
                          style={{
                            backgroundColor: cardBg,
                            borderColor: cardBorder,
                          }}
                          onClick={() => handleImageClick(image)}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.borderColor = accent;
                            el.style.transform = 'translateY(-2px)';
                            el.style.boxShadow = isDarkMode
                              ? '0 12px 24px rgba(0,0,0,0.32)'
                              : '0 10px 20px rgba(0,0,0,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.borderColor = cardBorder;
                            el.style.transform = 'translateY(0)';
                            el.style.boxShadow = 'none';
                          }}
                        >
                          <div
                            className="relative overflow-hidden"
                            style={{ aspectRatio: getGalleryAspectRatio(image) }}
                          >
                            {image.mediaType === 'video' ? (
                              <video
                                src={image.url}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                                muted
                                loop
                                autoPlay
                                playsInline
                              />
                            ) : (
                              <img
                                src={image.url}
                                alt={image.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                                loading="lazy"
                                style={{
                                  filter: isDarkMode
                                    ? (image.lightBg ? 'invert(1) hue-rotate(180deg) brightness(0.85)' : 'brightness(0.86)')
                                    : 'none',
                                }}
                              />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5 opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-1 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-300">
                              <h3
                                className={`font-serif font-normal leading-tight ${
                                  index === 0 ? 'text-xl sm:text-[2rem]' : 'text-base sm:text-lg'
                                }`}
                                style={{ color: '#fdf6e3' }}
                              >
                                {image.title}
                              </h3>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                    </section>
                  ))}
                </>
              ) : (
                <section
                  className="rounded-xl border px-6 py-12 text-center"
                  style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                >
                  <h2 className="font-serif text-3xl mb-3" style={{ color: heading }}>
                    archive is still gathering material.
                  </h2>
                  <p
                    className="text-sm max-w-xl mx-auto"
                    style={{ fontFamily: mono, color: muted }}
                  >
                    no saved items yet, but this gallery is ready for your first upload.
                  </p>
                </section>
              )}
            </div>

          </div>
        </div>

        <Footer isDarkMode={isDarkMode} />
      </main>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.82)' }}
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-xl border"
            style={{
              backgroundColor: overlayBg,
              borderColor: cardBorder,
              boxShadow: isDarkMode ? '0 24px 80px rgba(0,0,0,0.5)' : '0 24px 60px rgba(0,0,0,0.16)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full transition-colors"
              style={{
                fontFamily: mono,
                color: muted,
                backgroundColor: `${bg}d9`,
                border: `1px solid ${cardBorder}`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = heading; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = muted; }}
            >
              ×
            </button>

            <div className="px-4 sm:px-6 py-3.5" style={{ borderBottom: `1px solid ${cardBorder}` }}>
              <div
                className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.2em]"
                style={{ fontFamily: mono, color: muted }}
              >
                <span>{selectedImage.timestamp}</span>
              </div>
            </div>

            <div className="max-h-[calc(92vh-64px)] overflow-y-auto">
              <div className="p-3 sm:p-6">
                <div
                  className="overflow-hidden rounded-lg"
                  style={{ backgroundColor: isDarkMode ? '#002b36' : '#efe7d3' }}
                >
                  {selectedImage.mediaType === 'video' ? (
                    <video
                      src={selectedImage.url}
                      className="w-full h-auto max-h-[62vh] object-contain"
                      controls
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.title}
                      className="w-full h-auto max-h-[62vh] object-contain"
                      style={{
                        filter: isDarkMode && selectedImage.lightBg
                          ? 'invert(1) hue-rotate(180deg) brightness(0.85)'
                          : 'none',
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="px-5 sm:px-6 py-4 sm:py-5" style={{ borderTop: `1px solid ${cardBorder}` }}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-2 min-w-0">
                    <h3
                      className="font-serif text-[1.95rem] sm:text-[2.25rem] font-normal leading-tight"
                      style={{ color: heading }}
                    >
                      {selectedImage.title}
                    </h3>
                    {getVisibleCaption(selectedImage) ? (
                      <p
                        className="text-sm leading-[1.8] max-w-2xl"
                        style={{ fontFamily: mono, color: body }}
                      >
                        {getVisibleCaption(selectedImage)}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-3 sm:justify-end">
                    <button
                      onClick={() => handleDownload(selectedImage)}
                      className="text-xs px-4 py-2 rounded-sm transition-colors"
                      style={{
                        fontFamily: mono,
                        color: heading,
                        backgroundColor: accent,
                      }}
                    >
                      download
                    </button>
                    <button
                      onClick={() => window.open(selectedImage.url, '_blank')}
                      className="text-xs px-4 py-2 rounded-sm transition-colors"
                      style={{
                        fontFamily: mono,
                        color: body,
                        border: `1px solid ${cardBorder}`,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = heading; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = body; }}
                    >
                      full size →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIArchive;
