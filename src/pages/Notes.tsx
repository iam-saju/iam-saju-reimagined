import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Notes = () => {
  const notes = [
    {
      id: 1,
      title: "ml basics 01",
      description: "fundamentals of machine learning, neural networks, and optimization techniques",
      image: "/lovable-uploads/fbf90e6e-1606-410d-a383-8b6853f25fd2.png",
      category: "machine learning"
    },
    {
      id: 2,
      title: "bitcoin server in c++",
      description: "implementing a cryptocurrency server with utxo, merkle trees, and proof of work",
      image: "/lovable-uploads/806e7bb0-5fc0-441b-9c05-7aaf5b382d3b.png",
      category: "blockchain"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-lg font-light hover:text-primary transition-colors">
            ← back
          </a>
          <h1 className="text-lg font-light">notes</h1>
          <div></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-light">technical notes & experiments</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                random stuff i've written about, built, or experimented with. mostly for my own reference, 
                but maybe useful for others too.
              </p>
            </div>

            {/* Netflix-style Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {notes.map((note) => (
                <Card 
                  key={note.id} 
                  className="group cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm border-border/50"
                >
                  <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
                    <img 
                      src={note.image} 
                      alt={note.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {note.category}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-medium group-hover:text-primary transition-colors">
                      {note.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {note.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground">
                      coming soon...
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Placeholder for more notes */}
            <div className="text-center pt-12">
              <p className="text-sm text-muted-foreground italic">
                more notes coming as i procrastinate on actual work...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notes;