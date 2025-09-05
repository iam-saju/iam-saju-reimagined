const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-start">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="space-y-8">
          <h1 className="text-4xl font-light text-foreground">
            hi.
          </h1>
          
          <div className="space-y-6 text-lg leading-relaxed text-foreground max-w-2xl">
            <p>
              i am saju! i'm glad you're here :)
            </p>
            
            <p>
              i studied <strong>computer science</strong> and <strong>software engineering</strong> in my 
              undergrad. i've researched <strong>machine learning</strong> for my senior (theoretical) research, and 
              currently working as a <strong>full-stack developer</strong>, building things from scratch.
            </p>
            
            <p>
              i love <strong>building products</strong>, <strong>problem-solving</strong>, and coding things up from scratch, like 
              React applications, Node.js backends, amongst other things.
            </p>
            
            <p>
              i've also built several personal projects from scratch, implemented modern web architectures, 
              written my own authentication systems, and spun up everything from small portfolio sites 
              to full-scale applications.
            </p>
            
            <p>
              i have pivoted from academic research to product development and i love 
              building user-facing applications and solving real-world problems.
            </p>
            
            <p className="text-muted-foreground">
              i like to tweet: <a 
                href="https://x.com/saju" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @saju
              </a>
            </p>
            
            <p className="text-sm text-muted-foreground italic">
              <strong>Note:</strong> this site is a work in progress :)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;