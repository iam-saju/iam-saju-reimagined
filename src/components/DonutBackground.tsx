import React, { useRef, useEffect, useCallback } from 'react';

interface DonutBackgroundProps {
  isVisible: boolean;
  opacity?: number;
}

const DonutBackground: React.FC<DonutBackgroundProps> = ({ isVisible, opacity = 0.3 }) => {
  const donutDisplayRef = useRef<HTMLPreElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const ARef = useRef(0);
  const BRef = useRef(0);

  const renderDonut = useCallback(() => {
    const width = 80;
    const height = 22;
    const chars = '.,-~:;=!*#$@';
    
    const output: string[] = [];
    const zbuffer: number[] = [];
    
    // Initialize arrays
    for (let i = 0; i < width * height; i++) {
      output[i] = ' ';
      zbuffer[i] = 0;
    }

    // Donut rendering with authentic mathematics
    for (let j = 0; j < 6.28; j += 0.07) {
      for (let i = 0; i < 6.28; i += 0.02) {
        const c = Math.sin(i);
        const d = Math.cos(j);
        const e = Math.sin(ARef.current);
        const f = Math.sin(j);
        const g = Math.cos(ARef.current);
        const h = d + 2;
        const D = 1 / (c * h * e + f * g + 5);
        const l = Math.cos(i);
        const m = Math.cos(BRef.current);
        const n = Math.sin(BRef.current);
        const t = c * h * g - f * e;
        
        const x = Math.floor(width / 2 + (width / 4) * D * (l * h * m - t * n));
        const y = Math.floor(height / 2 + (height / 4) * D * (l * h * n + t * m));
        const o = x + width * y;
        const N = Math.floor(8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n));
        
        if (y < height && y >= 0 && x >= 0 && x < width && D > zbuffer[o]) {
          zbuffer[o] = D;
          output[o] = chars[N > 0 ? N : 0] || ' ';
        }
      }
    }

    let result = '';
    for (let k = 0; k < height; k++) {
      for (let j = 0; j < width; j++) {
        result += output[k * width + j];
      }
      result += '\n';
    }
    
    return result;
  }, []);

  const animate = useCallback(() => {
    if (!isVisible || !donutDisplayRef.current) return;

    const output = renderDonut();
    donutDisplayRef.current.textContent = output;
    
    ARef.current += 0.04;
    BRef.current += 0.02;
    
    setTimeout(() => {
      animationIdRef.current = requestAnimationFrame(animate);
    }, 1000 / 60); // 60fps
  }, [isVisible, renderDonut]);

  useEffect(() => {
    if (isVisible) {
      animate();
    }
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isVisible, animate]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
      style={{ opacity }}
    >
      <pre 
        ref={donutDisplayRef}
        className="text-xs leading-none whitespace-pre text-gray-600 font-mono"
        style={{ letterSpacing: 0, fontFamily: 'SF Mono, Monaco, monospace' }}
      />
    </div>
  );
};

export default DonutBackground;
