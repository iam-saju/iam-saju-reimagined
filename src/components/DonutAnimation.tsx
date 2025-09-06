import { useEffect, useRef, useState } from 'react';
import { useGlobalDonut } from '../hooks/useGlobalDonut';

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
  const { globalState } = useGlobalDonut();
  const animationRef = useRef<number>();
  const [asciiOutput, setAsciiOutput] = useState<string>('');
  const [fps, setFps] = useState(60);
  
  const frameTimeRef = useRef<number[]>([]);
  
  useEffect(() => {
    // Size configurations - increased density
    const sizes = {
      small: { width: 50, height: 25 },
      medium: { width: 70, height: 35 },
      large: { width: 90, height: 45 }
    };
    
    const size = sizes[settings.size];
    
    // ASCII characters for shading (from darkest to brightest) - more variety
    const chars = ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';
    
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
      
      // Donut rendering algorithm with denser sampling
      for (let j = 0; j < 6.28; j += 0.03) { // Reduced from 0.07 to 0.03
        for (let i = 0; i < 6.28; i += 0.01) { // Reduced from 0.02 to 0.01
          const c = Math.sin(i);
          const d = Math.cos(j);
          const e = Math.sin(globalState.A);
          const f = Math.sin(j);
          const g = Math.cos(globalState.A);
          const h = d + 2;
          const D = 1 / (c * h * e + f * g + 5);
          const l = Math.cos(i);
          const m = Math.cos(globalState.B);
          const n = Math.sin(globalState.B);
          const t = c * h * g - f * e;
          
          const x = Math.floor(size.width / 2 + (size.width / 2.5) * D * (l * h * m - t * n));
          const y = Math.floor(size.height / 2 + (size.height / 3) * D * (l * h * n + t * m));
          const luminance = Math.floor(12 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n));
          
          if (y >= 0 && y < size.height && x >= 0 && x < size.width && D > zbuffer[y][x]) {
            zbuffer[y][x] = D;
            const charIndex = Math.max(0, Math.min(luminance + 8, chars.length - 1));
            output[y][x] = chars[charIndex];
          }
        }
      }
      
      // Convert 2D array to string
      const asciiString = output.map(row => row.join('')).join('\n');
      setAsciiOutput(asciiString);
      
      // Update rotation angles using global state
      globalState.updateRotation(0.04 * settings.speed, 0.02 * settings.speed);
      
      animationRef.current = requestAnimationFrame(render);
    };
    
    animationRef.current = requestAnimationFrame(render);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [settings, globalState]);
  
  const fontSize = {
    small: 'text-sm',
    medium: 'text-base', 
    large: 'text-lg'
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
          fontFamily: 'Consolas, "Courier New", monospace',
          lineHeight: 0.8,
          letterSpacing: '-0.05em',
          fontWeight: 'bold'
        }}
      >
        {asciiOutput}
      </pre>
    </div>
  );
};

export { DonutAnimation };
export type { DonutSettings };