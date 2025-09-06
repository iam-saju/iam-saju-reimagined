import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalDonut } from '../hooks/useGlobalDonut';

interface DonutTerminalProps {
  isVisible: boolean;
  onClose: () => void;
  initialA?: number;
  initialB?: number;
}

const DonutTerminal: React.FC<DonutTerminalProps> = ({ isVisible, onClose }) => {
  const navigate = useNavigate();
  const { globalState, setRunning, setSpeed, setSize, setColor, reset } = useGlobalDonut();
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandOutput, setCommandOutput] = useState('');
  const [commandInput, setCommandInput] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [asciiArt, setAsciiArt] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const donutDisplayRef = useRef<HTMLPreElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationIdRef = useRef<number | null>(null);

  // ASCII conversion function (exact same as v0-to-ascii.vercel.app)
  const convertToAscii = useCallback(async (imageDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate dimensions (same as v0-to-ascii)
        const maxWidth = 100;
        const aspectRatio = img.height / img.width;
        const height = Math.floor(maxWidth * aspectRatio * 0.5); // 0.5 for character aspect ratio
        
        canvas.width = maxWidth;
        canvas.height = height;
        
        // Draw and get image data
        ctx?.drawImage(img, 0, 0, maxWidth, height);
        const imageData = ctx?.getImageData(0, 0, maxWidth, height);
        
        if (!imageData) {
          resolve('Error: Could not process image');
          return;
        }
        
        // ASCII characters (exact same as v0-to-ascii)
        const ASCII_CHARS = '@%#*+=-:. ';
        
        let asciiArt = '';
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < maxWidth; x++) {
            const index = (y * maxWidth + x) * 4;
            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            
            // Grayscale conversion (luminance formula)
            const gray = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
            
            // Map to ASCII character
            const charIndex = Math.floor((gray / 255) * (ASCII_CHARS.length - 1));
            asciiArt += ASCII_CHARS[ASCII_CHARS.length - 1 - charIndex];
          }
          asciiArt += '\n';
        }
        
        resolve(asciiArt);
      };
      
      img.src = imageDataUrl;
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setCommandOutput('Error: Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setCommandOutput('Error: File size too large (max 10MB)');
      return;
    }

    setCommandOutput('Converting image to ASCII art...');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageDataUrl = e.target?.result as string;
      setUploadedImage(imageDataUrl);
      
      try {
        // Attempt conversion multiple times if needed
        let asciiResult: string;
        let attempts = 0;
        const maxAttempts = 5;
        
        do {
          asciiResult = await convertToAscii(imageDataUrl);
          attempts++;
          console.log(`ASCII Art Generation Attempt ${attempts}:`, asciiResult.substring(0, 200) + '...');
          
          if (!asciiResult || asciiResult.trim().length === 0) {
            console.warn(`Attempt ${attempts} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before retry
          }
        } while ((!asciiResult || asciiResult.trim().length === 0) && attempts < maxAttempts);
        
        if (asciiResult && asciiResult.trim().length > 0) {
          setAsciiArt(asciiResult);
          setCommandOutput('✓ ASCII art displayed in canvas!');
          
          // Force multiple re-renders to ensure display
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              setForceUpdate(prev => prev + 1);
              console.log(`Force update ${i + 1} completed`);
            }, 200 * (i + 1));
          }
        } else {
          setCommandOutput('Error: Could not generate ASCII art after multiple attempts');
        }
      } catch (error) {
        console.error('ASCII conversion error:', error);
        setCommandOutput('Error: Failed to convert image');
      }
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
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  // Get username and hostname
  const username = 'kernel';
  const hostname = 'donutOS';

  // EXACT same donut algorithm using global state
  const renderDonut = useCallback(() => {
    // EXACT medium size settings from DonutAnimation
    const width = 70;
    const height = 35;
    const chars = ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';
    
    // Initialize output buffer
    const output = Array(height).fill(null).map(() => Array(width).fill(' '));
    const zbuffer = Array(height).fill(null).map(() => Array(width).fill(0));
    
    // EXACT same donut rendering algorithm using global state
    for (let j = 0; j < 6.28; j += 0.03) { // EXACT same as DonutAnimation
      for (let i = 0; i < 6.28; i += 0.01) { // EXACT same as DonutAnimation
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
        
        const x = Math.floor(width / 2 + (width / 2.5) * D * (l * h * m - t * n));
        const y = Math.floor(height / 2 + (height / 3) * D * (l * h * n + t * m));
        const luminance = Math.floor(12 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n));
        
        if (y >= 0 && y < height && x >= 0 && x < width && D > zbuffer[y][x]) {
          zbuffer[y][x] = D;
          const charIndex = Math.max(0, Math.min(luminance + 8, chars.length - 1));
          output[y][x] = chars[charIndex];
        }
      }
    }
    
    // Convert 2D array to string
    return output.map(row => row.join('')).join('\n');
  }, [globalState]);

  const animate = useCallback(() => {
    if (!isVisible || !globalState.isRunning || !donutDisplayRef.current) return;

    const output = renderDonut();
    donutDisplayRef.current.textContent = output;
    
    globalState.updateRotation(0.04 * globalState.speed, 0.02 * globalState.speed);
    
    animationIdRef.current = requestAnimationFrame(animate);
  }, [isVisible, globalState, renderDonut]);

  // Handle close with proper cleanup - prevent duplicate terminals
  const handleClose = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    
    // Reset all state
    setRunning(true);
    setSpeed(1);
    setSize('medium');
    setCurrentCommand('');
    setCommandOutput('');
    setCommandInput('');
    
    // Ensure only one close call
    setTimeout(() => {
      onClose();
    }, 0);
  }, [onClose]);

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
          // Trigger file input
          fileInputRef.current?.click();
          setCommandOutput('Select an image file...');
        } else if (subCommand === 'clear') {
          setAsciiArt(null);
          setUploadedImage(null);
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
        // Force close terminal state immediately and navigate
        setCommandOutput('✓ exiting...');
        onClose();
        // Force navigation after state cleanup
        setTimeout(() => {
          window.location.href = '/';
        }, 10);
        break;
      
      default:
        setCommandOutput(`unknown: ${command}`);
    }
  }, [setRunning, setSpeed, setColor, reset, onClose, navigate, handleFileUpload, isDarkMode]);

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
      // Refocus input after command execution
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
      {/* Hidden file input */}
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

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-400 flex items-center justify-center z-60">
          <div className="text-blue-400 text-xl font-mono">Drop image here for ASCII conversion</div>
        </div>
      )}

      {/* Dynamic Terminal Background */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        {asciiArt ? (
          // Display ASCII Art
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
          // Display Spinning Donut
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
      
      {/* Terminal Chat Window - Properly Rounded */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className={`rounded-2xl shadow-2xl w-[32rem] max-w-[95vw] transition-all duration-300 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-black border-gray-800'}`}>
          
          {/* Simple Output Area */}
          <div className="px-6 pt-6 pb-4 max-h-32 overflow-y-auto">
            {/* Command Output */}
            {commandOutput && (
              <div className={`text-sm font-mono leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-green-300' : 'text-green-400'}`}>
                {commandOutput}
              </div>
            )}
            
            {/* Welcome message when no output */}
            {!commandOutput && (
              <div className={`text-sm font-mono text-center py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                type commands to control donut
              </div>
            )}
          </div>
          
          {/* Clean Input Area */}
          <div className={`px-6 pb-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-800'}`}>
            <div className="flex items-center pt-4">
              <span className={`text-sm font-mono mr-3 ${isDarkMode ? 'text-green-300' : 'text-green-400'}`}>root@donut:~#</span>
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
