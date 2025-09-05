const Experience = () => {
  const experiences = [
    {
      role: "Full-Stack Developer",
      company: "Tech Startup",
      period: "2024 - Present",
      description: "Building scalable web applications using React, Node.js, and cloud technologies. Leading frontend development initiatives and contributing to architectural decisions. Working closely with product and design teams to deliver user-focused solutions.",
      highlights: [
        "Developed core features for the main application serving 10k+ users",
        "Implemented real-time features using WebSocket connections",
        "Optimized application performance resulting in 40% faster load times",
        "Mentored junior developers and established coding standards"
      ]
    },
    {
      role: "Software Engineering Intern",
      company: "Previous Company",
      period: "2023",
      description: "Contributed to various full-stack projects, gained experience with modern development workflows, and collaborated with cross-functional teams on product development.",
      highlights: [
        "Built responsive user interfaces using React and modern CSS",
        "Integrated third-party APIs and services",
        "Participated in code reviews and agile development processes",
        "Created comprehensive documentation for developed features"
      ]
    },
    {
      role: "Research Assistant",
      company: "University",
      period: "2022 - 2023",
      description: "Conducted research in machine learning applications, focusing on theoretical aspects and practical implementations. Published findings and presented at academic conferences.",
      highlights: [
        "Researched advanced machine learning algorithms and their applications",
        "Implemented and tested various ML models using Python",
        "Co-authored research papers published in academic journals",
        "Presented findings at university symposiums"
      ]
    }
  ];

  return (
    <section id="experience" className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="space-y-12">
          <h2 className="text-2xl font-medium text-foreground">
            experience
          </h2>
          
          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <div key={index} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-foreground">
                      {exp.role}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-base text-muted-foreground">
                    {exp.company}
                  </p>
                </div>
                
                <p className="text-base leading-relaxed text-foreground max-w-2xl">
                  {exp.description}
                </p>
                
                <ul className="space-y-2 text-sm text-muted-foreground max-w-2xl">
                  {exp.highlights.map((highlight, highlightIndex) => (
                    <li key={highlightIndex}>
                      • {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;