const Hero = () => {
  return (
    <section id="about" className="min-h-screen flex items-center justify-start relative">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="space-y-8">
          <h1 className="text-4xl font-light text-foreground">
            yo.
          </h1>
          
          <div className="space-y-6 text-lg leading-relaxed text-foreground max-w-2xl">
            
            <p>
              i'm an undergrad in <strong>ai & data science</strong>. i spend my time building things that probably shouldn't exist but do anyway. some were big ideas — like a <strong>gpu marketplace</strong> that might morph into a gpu cluster center. others were just me having fun, like writing a <strong>blockchain in c++</strong> with utxo, merkle trees, pow, and ecdsa just because i wanted to see if i could.
            </p>
            
            <p>
              i like understanding things at the level where you can break them — <strong>raw-socket http servers in python</strong>, <strong>ml workflows from scratch</strong>, and weird <strong>computer vision experiments</strong> using opencv and fastapi.
            </p>
            
            <p>
              i built <strong>qubit</strong>, which turns telegram into a makeshift cloud storage system with chunked uploads and multi-threaded bots. also built stuff like vue.js dashboards, file assembly pipelines, and random utilities i'll probably never use again but was fun to code.
            </p>
            
            <p>
              outside of code, i'm a die-hard <strong className="text-red-600">manchester united</strong> fan.
            </p>
            
            <p className="text-muted-foreground">
              i tweet here: <a 
                href="https://x.com/saju0nx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @saju0nx
              </a>
            </p>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;