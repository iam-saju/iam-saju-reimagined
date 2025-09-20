import { useState, useEffect } from 'react';

export const useSimpleTerminal = () => {
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === 'T') {
        event.preventDefault();
        setIsTerminalVisible(prev => !prev);
      }
      
      if (event.key === 'Escape' && isTerminalVisible) {
        event.preventDefault();
        setIsTerminalVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTerminalVisible]);

  const closeTerminal = () => {
    setIsTerminalVisible(false);
  };

  return {
    isTerminalVisible,
    closeTerminal,
    toggleTerminal: () => setIsTerminalVisible(prev => !prev)
  };
};