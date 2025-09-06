import { useState, useEffect, useRef } from 'react';

export const useDonutTerminal = () => {
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const isClosingRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === 'T') {
        event.preventDefault();
        if (!isClosingRef.current) {
          setIsTerminalVisible(prev => !prev);
        }
      }
      
      if (event.key === 'Escape' && isTerminalVisible) {
        event.preventDefault();
        if (!isClosingRef.current) {
          closeTerminal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTerminalVisible]);

  const closeTerminal = () => {
    if (isClosingRef.current) return;
    
    isClosingRef.current = true;
    setIsTerminalVisible(false);
    
    // Reset the closing flag after a short delay
    setTimeout(() => {
      isClosingRef.current = false;
    }, 100);
  };

  return {
    isTerminalVisible,
    closeTerminal,
    toggleTerminal: () => setIsTerminalVisible(prev => !prev)
  };
};
