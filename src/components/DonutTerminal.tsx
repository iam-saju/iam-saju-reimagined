import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGlobalDonut } from '../hooks/useGlobalDonut';

interface DonutTerminalProps {
  isVisible: boolean;
  onClose: () => void;
}

const DonutTerminal: React.FC<DonutTerminalProps> = ({ isVisible, onClose }) => {
  const { globalState, setRunning, setSpeed, setColor, reset } = useGlobalDonut();
  const [commandOutput, setCommandOutput] = useState('');
  const [commandInput, setCommandInput] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isDragOver, setIsDragOver] = useState(false);
  const [asciiArt, setAsciiArt] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const donutDisplayRef = useRef<HTMLPreElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationIdRef = useRef<number | null>(null);

  // ASCII conversion function
  const convertToAscii = useCallback(async (imageDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const maxWidth = 100;
        const aspectRatio = img.height / img.width;
        const height = Math.floor(maxWidth * aspectRatio * 0.5);
        
        canvas.width = maxWidth;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, maxWidth, height);
        const imageData = ctx?.getImageData(0, 0, maxWidth, height);
        
        if (!imageData) {
          resolve('Error: Could not process image');
          return;
        }
        
        const ASCII_CHARS = '@%#*+=-:. ';
        let asciiStr = '';
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < maxWidth; x++) {
            const pixelIndex = (y * maxWidth + x) * 4;
            const r = imageData.data[pixelIndex];
            const g = imageData.data[pixelIndex + 1];
            const b = imageData.data[pixelIndex + 2];
            
            const brightness = (r + g + b) / 3;
            const charIndex = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1));
            asciiStr += ASCII_CHARS[ASCII_CHARS.length - 1 - charIndex];
          }
          asciiStr += '\n';
        }
        
        resolve(asciiStr);
      };
      img.src = imageDataUrl;
    });
  }, []);

  // File upload handler
  const handleFileUpload = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const ascii = await convertToAscii(dataUrl);
      setAsciiArt(ascii);
      setCommandOutput('✓ ASCII art generated');
    };
    reader.readAsDataURL(file);
  }, [convertToAscii]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  }, [handleFileUpload]);

  // Donut animation
  const animate = useCallback(() => {
    if (!donutDisplayRef.current || !globalState.isRunning) return;

    const A = globalState.A;
    const B = globalState.B;
    
    const output = Array(22).fill(null).map(() => Array(80).fill(' '));
    const zbuffer = Array(22).fill(null).map(() => Array(80).fill(0));

    for (let j = 0; j < 6.28; j += 0.07) {
      for (let i = 0; i < 6.28; i += 0.02) {
        const c = Math.sin(i);
        const d = Math.cos(j);
        const e = Math.sin(A);
        const f = Math.sin(j);
        const g = Math.cos(A);
        const h = d + 2;
        const D = 1 / (c * h * e + f * g + 5);
        const l = Math.cos(i);
        const m = Math.cos(B);
        const n = Math.sin(B);
        const t = c * h * g - f * e;
        
        const x = Math.floor(40 + 30 * D * (l * h * m - t * n));
        const y = Math.floor(12 + 15 * D * (l * h * n + t * m));
        const luminance = Math.floor(8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n));
        
        if (y >= 0 && y < 22 && x >= 0 && x < 80 && D > zbuffer[y][x]) {
          zbuffer[y][x] = D;
          const chars = '.,-~:;=!*#$@';
          const charIndex = Math.max(0, Math.min(luminance, chars.length - 1));
          output[y][x] = chars[charIndex];
        }
      }
    }

    donutDisplayRef.current.textContent = output.map(row => row.join('')).join('\n');
    
    globalState.updateRotation(0.04 * globalState.speed, 0.02 * globalState.speed);
    
    if (globalState.isRunning) {
      animationIdRef.current = requestAnimationFrame(animate);
    }
  }, [globalState]);

  // Terminal prompt
  const terminalPrompt = `donut@terminal:~$`;


  // Execute command
  const executeCommand = useCallback((cmd: string) => {
    if (!cmd.trim()) return;
    
    const trimmedCmd = cmd.trim().toLowerCase();
    const parts = trimmedCmd.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    // Color presets
    const colors: { [key: string]: string } = {
      blue: '#4a9eff',
      red: '#ff4a4a',
      green: '#4aff4a',
      purple: '#a855f7',
      orange: '#ff8c00',
      pink: '#ff69b4',
      cyan: '#00ffff',
      yellow: '#ffff00',
      black: '#000000'
    };

    // Background colors
    const bgColors: { [key: string]: string } = {
      white: '#ffffff',
      black: '#000000',
      gray: '#808080',
      dark: '#1a1a1a',
      blue: '#4a9eff',
      red: '#ff4a4a',
      green: '#4aff4a'
    };

    switch (command) {
      case 'start':
        setRunning(true);
        setCommandOutput('✓ started');
        break;
      
      case 'stop':
        setRunning(false);
        setCommandOutput('✓ stopped');
        break;
      
      case 'speed':
        if (args.length === 0) {
          setCommandOutput('usage: speed [0.1-10]');
          return;
        }
        const speed = parseFloat(args[0]);
        if (isNaN(speed) || speed < 0.1 || speed > 10) {
          setCommandOutput('speed must be 0.1-10');
          return;
        }
        setSpeed(speed);
        setCommandOutput(`✓ speed ${speed}`);
        break;
      
      case 'color':
        if (args.length === 0) {
          setCommandOutput('usage: color [blue|red|green|purple|orange|pink|cyan|yellow|black]');
          return;
        }
        const colorName = args[0];
        if (!colors[colorName]) {
          setCommandOutput(`unknown color: ${colorName}`);
          return;
        }
        setColor(colors[colorName]);
        setCommandOutput(`✓ color ${colorName}`);
        break;
      
      
      case 'bg':
        if (args.length === 0) {
          setCommandOutput('usage: bg [white|black|gray|dark|blue|red|green]');
          return;
        }
        const bgName = args[0];
        if (!bgColors[bgName]) {
          setCommandOutput(`unknown bg color: ${bgName}`);
          return;
        }
        setBgColor(bgColors[bgName]);
        setCommandOutput(`✓ bg ${bgName}`);
        break;
      
      case 'theme':
        if (args.length === 0) {
          setCommandOutput('usage: theme [dark|light]');
          return;
        }
        
        const theme = args[0];
        if (theme === 'dark') {
          setIsDarkMode(true);
          setBgColor('#000000');
          setCommandOutput('✓ switched to dark theme');
        } else if (theme === 'light') {
          setIsDarkMode(false);
          setBgColor('#ffffff');
          setCommandOutput('✓ switched to light theme');
        } else {
          setCommandOutput('usage: theme [dark|light]');
        }
        break;
      
      case 'reset':
        reset();
        setBgColor(isDarkMode ? '#000000' : '#ffffff');
        setCommandOutput('✓ reset');
        break;
      
      case 'clear':
        setCommandOutput('');
        break;
      
      case 'ascii':
        if (args.length === 0) {
          setCommandOutput('usage: ascii upload\nDrag & drop an image or use ascii upload');
          return;
        }
        
        const subCommand = args[0];
        if (subCommand === 'upload') {
          fileInputRef.current?.click();
          setCommandOutput('Select an image file...');
        } else if (subCommand === 'clear') {
          setAsciiArt(null);
          setCommandOutput('✓ ASCII art cleared, donut restored');
        } else if (subCommand === 'help') {
          setCommandOutput('ascii commands:\n  ascii upload - Open file picker\n  ascii clear - Clear ASCII art\n  Drag & drop images directly');
        } else {
          setCommandOutput('usage: ascii upload, ascii clear, or ascii help');
        }
        break;
      
      case 'help':
        setCommandOutput(`commands:
start, stop
speed [0.1-10], color [name], bg [name]
ascii upload, ascii clear, ascii help
theme [dark|light]
reset, clear, exit, help`);
        break;
        
      case 'exit':
        setCommandOutput('✓ exiting...');
        
        // Navigate immediately without closing terminal first
        window.location.href = '/';
        break;
        
      default:
        setCommandOutput(`unknown: ${command}`);
    }
  }, [setRunning, setSpeed, setColor, reset, handleFileUpload, isDarkMode, onClose]);

  useEffect(() => {
    if (isVisible && globalState.isRunning && !asciiArt) {
      animate();
    }
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isVisible, globalState.isRunning, animate, asciiArt]);

  useEffect(() => {
    if (isVisible && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [isVisible]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(commandInput);
      setCommandInput('');
      setTimeout(() => {
        if (commandInputRef.current) {
          commandInputRef.current.focus();
        }
      }, 0);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
          }
        }}
        className="hidden"
      />

      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-400 flex items-center justify-center z-60">
          <div className="text-blue-400 text-xl font-mono">Drop image here for ASCII conversion</div>
        </div>
      )}

      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        {asciiArt ? (
          <pre 
            className="text-base leading-none whitespace-pre font-mono text-center"
            style={{ 
              fontFamily: 'SF Mono, Monaco, monospace',
              color: isDarkMode ? '#ffffff' : '#000000',
              lineHeight: '1.1'
            }}
          >
            {asciiArt}
          </pre>
        ) : (
          <pre 
            ref={donutDisplayRef}
            className="text-base leading-none whitespace-pre"
            style={{ 
              letterSpacing: 0, 
              fontFamily: 'SF Mono, Monaco, monospace',
              color: globalState.color
            }}
          />
        )}
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className={`rounded-2xl shadow-2xl w-[32rem] max-w-[95vw] transition-all duration-300 border ${isDarkMode ? 'bg-background border-border' : 'bg-black border-gray-800'}`}>
          
          <div className="px-6 pt-6 pb-4">
            {commandOutput && (
              <div className={`text-sm font-mono leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-green-300' : 'text-green-400'}`}>
                {commandOutput}
              </div>
            )}
            
            {!commandOutput && (
              <div className={`text-sm font-mono text-center py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                type commands to control donut
              </div>
            )}
          </div>
          
          <div className={`px-6 pb-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-800'}`}>
            <div className="flex items-center pt-4">
              <span className={`text-sm font-mono mr-3 ${isDarkMode ? 'text-green-300' : 'text-green-400'}`}>{terminalPrompt}</span>
              <input
                ref={commandInputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`bg-transparent border-none outline-none flex-1 text-sm font-mono placeholder-gray-600 ${isDarkMode ? 'text-gray-100' : 'text-white'}`}
                style={{ fontFamily: 'SF Mono, Monaco, monospace' }}
                placeholder="ascii upload, speed 0.5, color red, bg black"
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutTerminal;
