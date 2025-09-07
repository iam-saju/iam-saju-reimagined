import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Notes = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const notes = [
    {
      id: 1,
      title: "gradient descent",
      description: "understanding the fundamental optimization algorithm behind machine learning",
      image: "/lovable-uploads/fbf90e6e-1606-410d-a383-8b6853f25fd2.png",
      category: "optimization",
      learnLink: "https://harmless-bed-5d7.notion.site/gradient-descent-1fb97604c89d8054b6c0c62eba56a889"
    },
    {
      id: 2,
      title: "bitcoin server in c++",
      description: "implementing a cryptocurrency server with utxo, merkle trees, and proof of work",
      image: "/lovable-uploads/naka.jpeg",
      category: "blockchain"
    }
  ];

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
          <h1 className={`text-lg font-light ${isDarkMode ? 'text-white' : ''}`}>posts</h1>
          
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
              <h2 className={`text-3xl font-light ${isDarkMode ? 'text-white' : ''}`}>technical posts & experiments</h2>
              <p className={`max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-muted-foreground'}`}>
                random stuff i've written about, built, or experimented with. mostly for my own reference, 
                but maybe useful for others too.
              </p>
            </div>

            {/* Netflix-style Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {notes.map((note) => {
                const CardWrapper = 'div';
                const wrapperProps = {};

                return (
                  <CardWrapper key={note.id} {...wrapperProps}>
                    <Card 
                      className={`group cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg backdrop-blur-sm h-full ${
                        isDarkMode 
                          ? 'bg-gray-900/50 border-gray-700' 
                          : 'bg-card/50 border-border/50'
                      }`}
                    >
                      <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
                        <img 
                          src={note.image} 
                          alt={note.title}
                          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${
                            note.id === 2 ? 'object-top' : ''
                          }`}
                        />
                      </div>
                      <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded ${
                            isDarkMode 
                              ? 'text-gray-300 bg-gray-800' 
                              : 'text-muted-foreground bg-muted'
                          }`}>
                            {note.category}
                          </span>
                        </div>
                        <CardTitle className={`text-lg font-medium group-hover:text-primary transition-colors ${
                          isDarkMode ? 'text-white' : ''
                        }`}>
                          {note.title}
                        </CardTitle>
                        <CardDescription className={`text-sm leading-relaxed ${
                          isDarkMode ? 'text-gray-300' : ''
                        }`}>
                          {note.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                          {note.learnLink ? (
                            <a 
                              href={note.learnLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              learn →
                            </a>
                          ) : "coming soon..."}
                        </div>
                      </CardContent>
                    </Card>
                  </CardWrapper>
                );
              })}
            </div>

            {/* Placeholder for more notes */}
            <div className="text-center pt-12">
              <p className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                more posts coming as i procrastinate on actual work...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notes;