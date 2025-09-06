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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [fps, setFps] = useState(60);
  
  const A = useRef(0);
  const B = useRef(0);
  
  const frameTimeRef = useRef<number[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size based on settings
    const sizes = {
      small: { width: 60, height: 30 },
      medium: { width: 80, height: 40 },
      large: { width: 100, height: 50 }
    };
    
    const size = sizes[settings.size];
    canvas.width = size.width;
    canvas.height = size.height;
    
    // ASCII characters for shading
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
      
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
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
          
          const x = Math.floor(size.width / 2 + (size.width / 4) * D * (l * h * m - t * n));
          const y = Math.floor(size.height / 2 + (size.height / 8) * D * (l * h * n + t * m));
          const o = Math.floor(8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n));
          
          if (y >= 0 && y < size.height && x >= 0 && x < size.width && D > zbuffer[y][x]) {
            zbuffer[y][x] = D;
            output[y][x] = o > 0 ? chars[Math.min(o, chars.length - 1)] : '.';
          }
        }
      }
      
      // Render ASCII to canvas
      ctx.fillStyle = settings.color;
      ctx.font = '10px monospace';
      
      for (let y = 0; y < size.height; y++) {
        for (let x = 0; x < size.width; x++) {
          if (output[y][x] !== ' ') {
            ctx.fillText(output[y][x], x * 8, y * 12 + 10);
          }
        }
      }
      
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
  
  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-30'
      }`}
      style={{ opacity: isVisible ? settings.opacity / 100 : 0.3 }}
    >
      <canvas 
        ref={canvasRef}
        className="pixelated"
        style={{
          imageRendering: 'pixelated',
          transform: 'scale(2)',
        }}
      />
    </div>
  );
};

export { DonutAnimation };
export type { DonutSettings };