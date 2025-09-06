import { useEffect, useRef, useState } from 'react';

interface DonutSettings {
  size: 'small' | 'medium' | 'large';
  speed: number;
  opacity: number;
  color: string;
  paused: boolean;
}

interface DonutAnimationProps {
  settings: DonutSettings;
  isVisible: boolean;
}

const DonutAnimation = ({ settings, isVisible }: DonutAnimationProps) => {
  const animationRef = useRef<number>();
  const [asciiOutput, setAsciiOutput] = useState<string>('');
  const [fps, setFps] = useState(60);
  
  const A = useRef(0);
  const B = useRef(0);
  
  const frameTimeRef = useRef<number[]>([]);
  
  useEffect(() => {
    // Size configurations
    const sizes = {
      small: { width: 40, height: 20 },
      medium: { width: 60, height: 30 },
      large: { width: 80, height: 40 }
    };
    
    const size = sizes[settings.size];
    
    // ASCII characters for shading (from darkest to brightest)
    const chars = '.,-~:;=!*#$@';
    
    const render = (timestamp: number) => {
      if (settings.paused) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }
      
      // Calculate FPS
      frameTimeRef.current.push(timestamp);
      if (frameTimeRef.current.length > 60) {
        frameTimeRef.current.shift();
      }
      
      if (frameTimeRef.current.length > 1) {
        const avgFrameTime = (frameTimeRef.current[frameTimeRef.current.length - 1] - frameTimeRef.current[0]) / (frameTimeRef.current.length - 1);
        setFps(Math.round(1000 / avgFrameTime));
      }
      
      // Initialize output buffer
      const output = Array(size.height).fill(null).map(() => Array(size.width).fill(' '));
      const zbuffer = Array(size.height).fill(null).map(() => Array(size.width).fill(0));
      
      // Donut rendering algorithm (a1k0n's approach)
      for (let j = 0; j < 6.28; j += 0.07) {
        for (let i = 0; i < 6.28; i += 0.02) {
          const c = Math.sin(i);
          const d = Math.cos(j);
          const e = Math.sin(A.current);
          const f = Math.sin(j);
          const g = Math.cos(A.current);
          const h = d + 2;
          const D = 1 / (c * h * e + f * g + 5);
          const l = Math.cos(i);
          const m = Math.cos(B.current);
          const n = Math.sin(B.current);
          const t = c * h * g - f * e;
          
          const x = Math.floor(size.width / 2 + (size.width / 3) * D * (l * h * m - t * n));
          const y = Math.floor(size.height / 2 + (size.height / 4) * D * (l * h * n + t * m));
          const luminance = Math.floor(8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n));
          
          if (y >= 0 && y < size.height && x >= 0 && x < size.width && D > zbuffer[y][x]) {
            zbuffer[y][x] = D;
            output[y][x] = luminance > 0 ? chars[Math.min(Math.max(luminance, 0), chars.length - 1)] : '.';
          }
        }
      }
      
      // Convert 2D array to string
      const asciiString = output.map(row => row.join('')).join('\n');
      setAsciiOutput(asciiString);
      
      // Update rotation angles
      A.current += 0.04 * settings.speed;
      B.current += 0.02 * settings.speed;
      
      animationRef.current = requestAnimationFrame(render);
    };
    
    animationRef.current = requestAnimationFrame(render);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [settings]);
  
  const fontSize = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-30'
      }`}
      style={{ opacity: isVisible ? settings.opacity / 100 : 0.3 }}
    >
      <pre 
        className={`font-mono leading-none ${fontSize[settings.size]} select-none`}
        style={{ 
          color: settings.color,
          whiteSpace: 'pre',
          fontFamily: 'monospace',
          lineHeight: 1,
          letterSpacing: '0.1em'
        }}
      >
        {asciiOutput}
      </pre>
    </div>
  );
};

export { DonutAnimation };
export type { DonutSettings };