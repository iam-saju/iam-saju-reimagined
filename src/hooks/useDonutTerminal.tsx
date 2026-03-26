import { useState, useEffect, useRef, useCallback } from 'react';

export const useDonutTerminal = () => {
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const isClosingRef = useRef(false);

  const closeTerminal = useCallback(() => {
    if (isClosingRef.current || !isTerminalVisible) return;
    isClosingRef.current = true;
    setIsClosing(true);

    // Wait for close animation to finish before unmounting
    setTimeout(() => {
      setIsTerminalVisible(false);
      setIsClosing(false);
      isClosingRef.current = false;
    }, 400);
  }, [isTerminalVisible]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === 'T') {
        event.preventDefault();
        if (isClosingRef.current) return;
        if (isTerminalVisible) {
          closeTerminal();
        } else {
          setIsTerminalVisible(true);
        }
      }

      if (event.key === 'Escape' && isTerminalVisible) {
        event.preventDefault();
        closeTerminal();
      }
    };

    const handleCustomEvent = () => {
      if (isClosingRef.current) return;
      if (isTerminalVisible) {
        closeTerminal();
      } else {
        setIsTerminalVisible(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-terminal', handleCustomEvent);
    
    // Add long-press logic for mobile
    let touchTimer: ReturnType<typeof setTimeout> | null = null;
    const handleTouchStart = () => {
      touchTimer = setTimeout(handleCustomEvent, 500);
    };
    const handleTouchEnd = () => {
      if (touchTimer) clearTimeout(touchTimer);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchmove', handleTouchEnd); // Cancel on scroll

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-terminal', handleCustomEvent);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchEnd);
      if (touchTimer) clearTimeout(touchTimer);
    };
  }, [isTerminalVisible, closeTerminal]);

  return {
    isTerminalVisible,
    isClosing,
    closeTerminal,
    toggleTerminal: () => {
      if (isClosingRef.current) return;
      if (isTerminalVisible) closeTerminal();
      else setIsTerminalVisible(true);
    }
  };
};
