import { useState, useEffect } from 'react';

const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getCurrentDateTime = () => {
    const time = currentTime.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    const date = currentTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `${time} • ${date}`;
  };

  return (
    <footer className="py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="pt-8 border-t border-border">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              ©xaju. built with lots of ☕.
            </p>
            <p className="text-xs text-muted-foreground">
              {getCurrentDateTime()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;