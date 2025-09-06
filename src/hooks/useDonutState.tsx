import { useRef } from 'react';

// Global donut state to maintain rotation continuity
export const useDonutState = () => {
  const ARef = useRef(0);
  const BRef = useRef(0);

  const updateRotation = (deltaA: number, deltaB: number) => {
    ARef.current += deltaA;
    BRef.current += deltaB;
  };

  const getRotation = () => ({
    A: ARef.current,
    B: BRef.current
  });

  const setRotation = (A: number, B: number) => {
    ARef.current = A;
    BRef.current = B;
  };

  return {
    updateRotation,
    getRotation,
    setRotation
  };
};
