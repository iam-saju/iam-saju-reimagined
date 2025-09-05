import { useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-lg font-light hover:text-primary transition-colors">
            ← back
          </a>
          <h1 className="text-lg font-light">archive</h1>
          <div></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-light">archive</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
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
                  <div className="relative overflow-hidden rounded-sm bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
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
                    <div className="bg-muted/50 rounded-sm animate-pulse">
                      <div className="aspect-square bg-muted/30"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-12">
              <p className="text-sm text-muted-foreground italic">
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
            className="relative max-w-4xl max-h-[90vh] bg-card rounded-sm shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
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
                <h3 className="text-xl font-medium mb-2">{selectedImage.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-sm hover:bg-muted transition-colors text-sm"
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
