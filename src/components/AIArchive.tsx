import { useState } from "react";
import { useTheme } from '@/hooks/useTheme';
import { X, Download, ExternalLink } from "lucide-react";

interface AIImage {
  id: string;
  title: string;
  url: string;
  timestamp: string;
  aspectRatio: number;
}

const AIArchive = () => {
  const [selectedImage, setSelectedImage] = useState<AIImage | null>(null);
  const [isLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  // Sample AI images data
  const aiImages: AIImage[] = [
    {
      id: "1",
      title: "Neural Network Visualization",
      url: "/lovable-uploads/fbf90e6e-1606-410d-a383-8b6853f25fd2.png",
      timestamp: "nov 2024",
      aspectRatio: 1.0
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
      aspectRatio: 1.0
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
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isDarkMode ? 'text-white' : 'bg-background text-foreground'
    }`} style={{ backgroundColor: isDarkMode ? '#1C1C1C' : undefined }}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'border-gray-700' 
          : 'bg-background/80 border-border'
      }`} style={{ backgroundColor: isDarkMode ? '#1C1C1C' : undefined }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a 
            href="/" 
            className={`text-lg font-light transition-colors ${
              isDarkMode ? 'text-white hover:text-gray-300' : 'hover:text-primary'
            }`}
          >
            ← back
          </a>
          <h1 className={`text-lg font-light ${isDarkMode ? 'text-white' : ''}`}>archive</h1>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className={`text-3xl font-light ${isDarkMode ? 'text-white' : ''}`}>archive</h2>
              <p className={`max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-muted-foreground'}`}>
                where Leonardo codes, Michelangelo sculpts in zeros, and my snapshots come together in an archive of timeless records
              </p>
            </div>

            {/* Masonry Grid */}
            <div className="masonry-grid">
              {aiImages.map((image) => (
                <div
                  key={image.id}
                  className="masonry-item group cursor-pointer"
                  onClick={() => handleImageClick(image)}
                >
                  <div className={`relative overflow-hidden rounded-sm backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-900/50 border-gray-700' 
                      : 'bg-card/50 border-border/50'
                  }`}>
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-end">
                      <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="text-sm font-medium mb-1">{image.title}</h3>
                        <p className="text-xs text-gray-300">{image.timestamp}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading Placeholder */}
            {isLoading && (
              <div className="masonry-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="masonry-item">
                    <div className={`rounded-sm animate-pulse ${
                      isDarkMode ? 'bg-gray-800/50' : 'bg-muted/50'
                    }`}>
                      <div className={`aspect-square ${
                        isDarkMode ? 'bg-gray-700/30' : 'bg-muted/30'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-12">
              <p className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                More AI-generated content coming as I explore new models and techniques...
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div 
            className={`relative max-w-4xl max-h-[90vh] rounded-sm shadow-lg ${
              isDarkMode ? 'bg-gray-900' : 'bg-card'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className={`absolute top-4 right-4 z-10 p-2 backdrop-blur-sm rounded-full transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800/80 hover:bg-gray-800 text-white' 
                  : 'bg-background/80 hover:bg-background'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image */}
            <div className="p-6">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[70vh] object-contain rounded-sm"
              />
            </div>

            {/* Metadata */}
            <div className="p-6 pt-0 space-y-4">
              <div>
                <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-white' : ''}`}>{selectedImage.title}</h3>
                <div className={`flex flex-wrap gap-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-muted-foreground'}`}>
                  <span>{selectedImage.timestamp}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(selectedImage)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => window.open(selectedImage.url, '_blank')}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-sm transition-colors text-sm ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-800 text-white' 
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Size
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
