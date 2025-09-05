import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md mx-auto px-6">
        <h1 className="text-4xl font-light text-foreground">404</h1>
        <p className="text-lg text-muted-foreground">page not found</p>
        <p className="text-sm text-muted-foreground">
          looks like you've wandered into uncharted territory
        </p>
        <a 
          href="/" 
          className="inline-block text-primary hover:underline transition-colors"
        >
          ← back to home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
