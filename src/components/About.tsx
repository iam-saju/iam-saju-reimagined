const About = () => {
  return (
    <section id="more" className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="space-y-8">
          <h2 className="text-2xl font-medium text-foreground">
            more about me
          </h2>
          
          <div className="space-y-6 text-base leading-relaxed text-foreground max-w-2xl">
            <p>
              i'm the kind of person who reads research papers for fun and then tries to implement them 
              from scratch just to see if i can. sometimes it works, sometimes it doesn't, but i always 
              learn something new.
            </p>
            
            <p>
              my approach to learning is hands-on and bottom-up. instead of using libraries, i prefer 
              understanding the underlying mechanics first. that's how i ended up writing http servers 
              from scratch, implementing blockchain protocols, and building computer vision pipelines 
              without relying on high-level abstractions.
            </p>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">current focus</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• distributed systems and infrastructure</li>
                <li>• gpu computing and cluster management</li>
                <li>• machine learning model optimization</li>
                <li>• blockchain and cryptocurrency protocols</li>
                <li>• low-level system programming</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">philosophy</h3>
              <p className="text-muted-foreground">
                i believe the best way to understand technology is to build it yourself. every abstraction 
                layer you peel back reveals new insights about how things actually work. plus, manchester 
                united is the greatest football club in the world (fight me).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;