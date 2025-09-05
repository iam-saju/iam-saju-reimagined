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
              i'm saju! i'm glad you're here :)
            </p>
            
            <p>
              i'm currently an undergrad in <strong>ai & data science</strong>. i've worked on everything from 
              <strong>blockchain implementations in c++</strong> (inspired by satoshi's bitcoin paper), to building my own 
              <strong>gpu marketplace & cluster vision</strong>.
            </p>
            
            <p>
              i love exploring how systems work at a low level — whether that's coding minimal 
              <strong>http servers from scratch in python</strong>, engineering <strong>ml workflows</strong>, or experimenting with 
              <strong>computer vision</strong> using opencv, mediapipe, and fastapi.
            </p>
            
            <p>
              i've built <strong>qubit</strong>, a telegram wrapper that turns telegram into a cloud storage service, 
              and i'm always tinkering with side projects — from vue.js dashboards to distributed file upload systems.
            </p>
            
            <p>
              i've moved from pure academics into <strong>engineering + infra</strong>, but i still love digging into 
              first principles (and breaking machines for fun).
            </p>
            
            <p className="text-muted-foreground">
              <a 
                href="https://x.com/saju0nx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @saju0nx
              </a>
            </p>
            
            <p className="text-sm text-muted-foreground italic">
              <strong>note:</strong> this site's
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;