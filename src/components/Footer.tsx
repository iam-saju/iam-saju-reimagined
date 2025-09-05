const Footer = () => {
  return (
    <footer className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">
              get in touch
            </h2>
            <p className="text-base text-muted-foreground max-w-xl">
              i'm always interested in new opportunities, collaborations, or just having 
              a conversation about technology and product development.
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <a 
              href="mailto:saju@example.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              email
            </a>
            <a 
              href="https://github.com/iam-saju" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              github
            </a>
            <a 
              href="https://x.com/saju" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              x / twitter
            </a>
            <a 
              href="https://linkedin.com/in/saju" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              linkedin
            </a>
          </div>
          
          <div className="pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground">
              © 2024 saju. built with React and lots of ☕
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;