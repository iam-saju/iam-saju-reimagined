const About = () => {
  return (
    <section id="about" className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="space-y-8">
          <h2 className="text-2xl font-medium text-foreground">
            about
          </h2>
          
          <div className="space-y-6 text-base leading-relaxed text-foreground max-w-2xl">
            <p>
              i'm a software engineer passionate about building clean, efficient, and user-focused applications. 
              my journey started with computer science fundamentals and has evolved into full-stack development 
              with a particular interest in modern web technologies.
            </p>
            
            <p>
              currently, i work as a full-stack developer where i build end-to-end solutions using React, 
              Node.js, and various databases. i enjoy the entire product development lifecycle - from 
              initial concept and architecture design to deployment and maintenance.
            </p>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">technical interests</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Full-stack web development (React, Node.js, TypeScript)</li>
                <li>• Modern JavaScript frameworks and libraries</li>
                <li>• Database design and optimization</li>
                <li>• API design and microservices architecture</li>
                <li>• DevOps and deployment automation</li>
                <li>• Machine learning and AI applications</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">when i'm not coding</h3>
              <p className="text-muted-foreground">
                i enjoy exploring new technologies, contributing to open source projects, writing about 
                development experiences, and staying up-to-date with the latest trends in software engineering. 
                i also love discussing product strategy and the intersection of technology and user experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;