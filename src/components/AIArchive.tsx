import { useState } from "react";
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
}

const AIArchive = () => {
  const [selectedImage, setSelectedImage] = useState<AIImage | null>(null);
  const { isDarkMode, toggleTheme } = useTheme();

  // Solarized colors
  const bg = isDarkMode ? '#002b36' : '#fdf6e3';
  const heading = isDarkMode ? '#fdf6e3' : '#073642';
  const body = isDarkMode ? '#93a1a1' : '#586e75';
  const muted = isDarkMode ? '#657b83' : '#93a1a1';
  const accent = '#b58900';
  const cardBorder = isDarkMode ? '#073642' : '#eee8d5';
  const overlayBg = isDarkMode ? '#073642' : '#eee8d5';

  // Sample AI images data
  const aiImages: AIImage[] = [
    {
      id: "1",
      title: "Neural Network Visualization",
      url: "/lovable-uploads/fbf90e6e-1606-410d-a383-8b6853f25fd2.png",
      timestamp: "nov 2024",
      aspectRatio: 1.0,
      lightBg: true,
    },
    {
      id: "2",
      title: "Cryptocurrency Mining",
      url: "/lovable-uploads/806e7bb0-5fc0-441b-9c05-7aaf5b382d3b.png",
      timestamp: "oct 2024",
      aspectRatio: 1.33
    },
    {
      id: "3",
      title: "Spinning Donut Animation",
      url: "/lovable-uploads/donut.gif",
      timestamp: "dec 2024",
      aspectRatio: 1.0
    },
    {
      id: "4",
      title: "Portrait Study",
      url: "/lovable-uploads/naka.jpeg",
      timestamp: "sep 2024",
      aspectRatio: 1.0
    },
    {
      id: "5",
      title: "Wide Landscape",
      url: "/lovable-uploads/1500x500 (1).jpeg",
      timestamp: "jan 2025",
      aspectRatio: 3.0
    },
    {
      id: "6",
      title: "BNC Connection",
      url: "/lovable-uploads/bnc.jpg",
      timestamp: "feb 2025",
      aspectRatio: 1.0
    },
    {
      id: "7",
      title: "AI Generated Art",
      url: "/lovable-uploads/ChatGPT Image Jun 24, 2025, 08_08_35 PM.png",
      timestamp: "jun 2025",
      aspectRatio: 1.0,
      lightBg: true,
    }
  ];

  const handleImageClick = (image: AIImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleDownload = (image: AIImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `${image.title.replace(/\s+/g, '_')}.${image.url.split('.').pop()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: bg, color: body }}
    >
      <Navigation isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />

      <main className="relative z-10 pt-12 sm:pt-14">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16 pt-4 sm:pt-6">
          <div className="space-y-4">
            <h1
              className="font-serif text-3xl sm:text-4xl md:text-[3rem] font-normal leading-[1.15] mb-5"
              style={{ color: heading }}
            >
              archive.
            </h1>

            <p
              className="text-sm leading-relaxed"
              style={{ fontFamily: "'Geist Mono', monospace", color: muted }}
            >
              where Leonardo codes, Michelangelo sculpts in zeros, and my snapshots
              come together in an archive of timeless records.
            </p>

            {/* Image grid — responsive: 1 col on tiny, 2 cols on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 items-start">
              {aiImages.map((image) => (
                <div
                  key={image.id}
                  className="group cursor-pointer transition-all duration-200"
                  style={{
                    backgroundColor: isDarkMode ? '#073642' : '#eee8d5',
                    border: `1px solid ${cardBorder}`,
                    transform: 'translateY(0)',
                  }}
                  onClick={() => handleImageClick(image)}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = accent;
                    el.style.transform = 'translateY(-2px)';
                    el.style.boxShadow = isDarkMode
                      ? '0 6px 24px rgba(0,0,0,0.35)'
                      : '0 6px 24px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = cardBorder;
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  {/* Image — square, uniform */}
                  <div
                    className="overflow-hidden"
                    style={{
                      backgroundColor: isDarkMode ? '#002b36' : '#fdf6e3',
                      aspectRatio: '1 / 1',
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                      style={{
                        filter: isDarkMode
                          ? (image.lightBg ? 'invert(1) hue-rotate(180deg) brightness(0.85)' : 'brightness(0.85)')
                          : 'none'
                      }}
                    />
                  </div>

                  {/* Card info — compact, no extra space */}
                  <div
                    className="px-2.5 py-1.5"
                    style={{ borderTop: `1px solid ${cardBorder}` }}
                  >
                    <h3
                      className="font-serif text-base font-normal truncate"
                      style={{ color: heading }}
                    >
                      {image.title}
                    </h3>
                    <p
                      className="text-xs"
                      style={{ fontFamily: "'Geist Mono', monospace", color: muted }}
                    >
                      {image.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <p
              className="text-xs italic pt-8"
              style={{
                fontFamily: "'Geist Mono', monospace",
                color: isDarkMode ? '#586e75' : '#93a1a1',
              }}
            >
              more coming as i explore new models and techniques...
            </p>
          </div>
        </div>

        <Footer isDarkMode={isDarkMode} />
      </main>

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden"
            style={{
              backgroundColor: overlayBg,
              border: `1px solid ${cardBorder}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center transition-colors"
              style={{
                fontFamily: "'Geist Mono', monospace",
                color: muted,
                backgroundColor: `${bg}cc`,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = heading; }}
              onMouseLeave={e => { e.currentTarget.style.color = muted; }}
            >
              ×
            </button>

            {/* Image */}
            <div className="p-2 sm:p-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[55vh] sm:max-h-[65vh] object-contain"
                style={{
                  filter: isDarkMode && selectedImage.lightBg
                    ? 'invert(1) hue-rotate(180deg) brightness(0.85)'
                    : 'none'
                }}
              />
            </div>

            {/* Metadata */}
            <div
              className="px-4 pb-4 space-y-3"
              style={{ borderTop: `1px solid ${cardBorder}` }}
            >
              <div className="pt-3">
                <h3
                  className="text-base font-medium mb-1"
                  style={{ fontFamily: "'Geist Mono', monospace", color: heading }}
                >
                  {selectedImage.title}
                </h3>
                <span
                  className="text-xs"
                  style={{ fontFamily: "'Geist Mono', monospace", color: muted }}
                >
                  {selectedImage.timestamp}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(selectedImage)}
                  className="text-xs px-3 py-1.5 transition-colors"
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    color: heading,
                    backgroundColor: accent,
                  }}
                >
                  download
                </button>
                <button
                  onClick={() => window.open(selectedImage.url, '_blank')}
                  className="text-xs px-3 py-1.5 transition-colors"
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    color: body,
                    border: `1px solid ${cardBorder}`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = heading; }}
                  onMouseLeave={e => { e.currentTarget.style.color = body; }}
                >
                  full size →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIArchive;
