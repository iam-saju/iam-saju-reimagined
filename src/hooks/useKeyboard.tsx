import { useEffect, useState } from 'react';

export const useKeyboard = () => {
  const [isShiftTPressed, setIsShiftTPressed] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsShiftTPressed(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift' || e.key.toLowerCase() === 't') {
        setIsShiftTPressed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  return { isShiftTPressed };
};