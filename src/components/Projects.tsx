const Projects = () => {
  const projects = [
    {
      title: "E-commerce Platform",
      description: "Built a full-stack e-commerce platform from scratch using React, Node.js, and PostgreSQL. Implemented user authentication, payment processing, inventory management, and admin dashboard.",
      tech: ["React", "Node.js", "PostgreSQL", "Stripe API", "JWT"],
      year: "2024"
    },
    {
      title: "Task Management System",
      description: "Developed a collaborative task management application with real-time updates, team collaboration features, and advanced filtering. Built with modern React patterns and WebSocket integration.",
      tech: ["React", "TypeScript", "Socket.io", "Express", "MongoDB"],
      year: "2024"
    },
    {
      title: "Machine Learning Model Deployment",
      description: "Created an end-to-end ML pipeline for predictive analytics, including data preprocessing, model training, and deployment with a REST API interface. Achieved 94% accuracy on test data.",
      tech: ["Python", "scikit-learn", "Flask", "Docker", "AWS"],
      year: "2023"
    },
    {
      title: "Personal Portfolio Website",
      description: "Designed and built this minimalist portfolio website focusing on clean typography and user experience. Implemented responsive design and optimized for performance.",
      tech: ["React", "TypeScript", "Tailwind CSS", "Vite"],
      year: "2024"
    }
  ];

  return (
    <section id="projects" className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="space-y-12">
          <h2 className="text-2xl font-medium text-foreground">
            projects
          </h2>
          
          <div className="space-y-12">
            {projects.map((project, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-foreground">
                    {project.title}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {project.year}
                  </span>
                </div>
                
                <p className="text-base leading-relaxed text-muted-foreground max-w-2xl">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground">
            more projects available on my{' '}
            <a 
              href="https://github.com/iam-saju" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Projects;