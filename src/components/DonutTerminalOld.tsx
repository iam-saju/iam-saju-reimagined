import React, { useState, useEffect, useRef, useCallback } from 'react';

interface DonutTerminalProps {
  isVisible: boolean;
  onClose: () => void;
}

const DonutTerminal: React.FC<DonutTerminalProps> = ({ isVisible, onClose }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(5);
  const [size, setSize] = useState('med');
  const [chars, setChars] = useState('.,-~:;=!*#$@');
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandOutput, setCommandOutput] = useState('');
  const [commandInput, setCommandInput] = useState('');
  
  const donutDisplayRef = useRef<HTMLPreElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const ARef = useRef(0);
  const BRef = useRef(0);

  // Get current timestamp
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Get username and hostname
  const username = 'user';
  const hostname = 'MacBook-Pro';

  // Authentic a1l0n donut.c algorithm implementation

  const renderDonut = useCallback(() => {
    const width = size === 'S' ? 60 : size === 'M' ? 80 : 100;
    const height = size === 'S' ? 20 : size === 'M' ? 24 : 30;
    
    const output: string[] = [];
    const zbuffer: number[] = [];
    
    for (let i = 0; i < width * height; i++) {
      output[i] = ' ';
      zbuffer[i] = 0;
    }

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
  }, [size, chars]);

  const animate = useCallback(() => {
    if (!isRunning || !donutDisplayRef.current) return;

    const output = renderDonut();
    donutDisplayRef.current.textContent = output;
    
    ARef.current += 0.04 * (speed / 5) * (reverse ? -1 : 1);
    BRef.current += 0.02 * (speed / 5) * (reverse ? -1 : 1);
    
    setTimeout(() => {
      animationIdRef.current = requestAnimationFrame(animate);
    }, 1000 / fps);
  }, [isRunning, speed, reverse, fps, renderDonut]);

  const executeCommand = useCallback((command: string) => {
    if (!command) return;
    
    addToHistory(`donut@terminal:~$ ${command}`);
    const parts = command.toLowerCase().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case 'start':
        setIsRunning(true);
        addToHistory('Starting donut animation...');
        break;
      case 'stop':
        setIsRunning(false);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        addToHistory('Donut animation stopped.');
        if (donutDisplayRef.current) {
          donutDisplayRef.current.textContent = '';
        }
        break;
      case 'speed':
        const s = parseInt(args[0]);
        if (s >= 1 && s <= 10) {
          setSpeed(s);
          addToHistory(`Speed set to ${s}`);
        } else {
          addToHistory('Speed must be between 1 and 10');
        }
        break;
      case 'size':
        if (['S', 'M', 'L', 's', 'm', 'l'].includes(args[0])) {
          setSize(args[0].toUpperCase());
          addToHistory(`Size set to ${args[0].toUpperCase()}`);
        } else {
          addToHistory('Size must be S, M, or L');
        }
        break;
      case 'chars':
        if (args.join(' ')) {
          setChars(args.join(' '));
          addToHistory(`Characters set to: ${args.join(' ')}`);
        } else {
          addToHistory('Please provide characters for rendering');
        }
        break;
      case 'axis':
        const validAxes = ['x', 'y', 'z', 'xy', 'xz', 'yz', 'xyz'];
        if (validAxes.includes(args[0])) {
          setAxis(args[0].toUpperCase());
          addToHistory(`Rotation axis set to ${args[0].toUpperCase()}`);
        } else {
          addToHistory('Valid axes: x, y, z, xy, xz, yz, xyz');
        }
        break;
      case 'reverse':
        setReverse(prev => !prev);
        addToHistory(`Rotation ${!reverse ? 'reversed' : 'normal'}`);
        break;
      case 'reset':
        setSpeed(5);
        setSize('M');
        setChars('.,-~:;=!*#$@');
        setAxis('XY');
        setFps(60);
        setColors(false);
        setReverse(false);
        addToHistory('Reset to default parameters');
        break;
      case 'fps':
        const f = parseInt(args[0]);
        if (f >= 1 && f <= 120) {
          setFps(f);
          addToHistory(`FPS set to ${f}`);
        } else {
          addToHistory('FPS must be between 1 and 120');
        }
        break;
      case 'colors':
        if (args[0] === 'on') {
          setColors(true);
          addToHistory('Colors enabled');
        } else if (args[0] === 'off') {
          setColors(false);
          addToHistory('Colors disabled');
        } else {
          setColors(prev => !prev);
          addToHistory(`Colors ${!colors ? 'enabled' : 'disabled'}`);
        }
        break;
      case 'clear':
        setCommandHistory([]);
        break;
      case 'help':
        const help = [
          'Available commands:',
          '  start           - Begin donut rotation',
          '  stop            - Halt donut rotation',
          '  speed [1-10]    - Set rotation speed',
          '  size [S/M/L]    - Set donut size',
          '  chars [string]  - Set ASCII characters',
          '  axis [x/y/z]    - Change rotation axis',
          '  reverse         - Reverse rotation',
          '  reset           - Reset parameters',
          '  fps [number]    - Set frames per second',
          '  colors [on/off] - Toggle colors',
          '  clear           - Clear screen',
          '  help            - Show this help',
          '  exit            - Exit terminal mode'
        ];
        help.forEach(line => addToHistory(line));
        break;
      case 'exit':
        onClose();
        break;
      case 'konami':
        addToHistory('🌈 Rainbow mode activated!');
        // Add rainbow effect logic here
        break;
      case 'matrix':
        setChars('01');
        addToHistory('Matrix mode activated - Follow the white rabbit...');
        setTimeout(() => setChars('.,-~:;=!*#$@'), 15000);
        break;
      case 'turbo':
        const oldSpeed = speed;
        setSpeed(10);
        setFps(120);
        addToHistory('🚀 TURBO MODE ENGAGED!');
        setTimeout(() => {
          setSpeed(oldSpeed);
          setFps(60);
          addToHistory('Turbo mode deactivated');
        }, 5000);
        break;
      case 'tiny':
        const oldSize = size;
        setSize('S');
        setChars('·');
        addToHistory('🔍 Tiny donut mode activated');
        setTimeout(() => {
          setSize(oldSize);
          setChars('.,-~:;=!*#$@');
        }, 8000);
        break;
      default:
        addToHistory(`Command not found: ${cmd}. Type "help" for available commands.`);
    }
  }, [addToHistory, speed, size, chars, axis, fps, colors, reverse, onClose]);

  useEffect(() => {
    if (isRunning) {
      animate();
    }
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isRunning, animate]);

  useEffect(() => {
    if (isVisible && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [isVisible]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(commandInput);
      setCommandInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Navigate command history up
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Navigate command history down
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete logic
    }

    // Konami code detection
    const newKonamiCode = [...konamiCode, e.code];
    if (newKonamiCode.length > konamiSequence.length) {
      newKonamiCode.shift();
    }
    setKonamiCode(newKonamiCode);
    
    if (newKonamiCode.join(',') === konamiSequence.join(',')) {
      executeCommand('konami');
      setKonamiCode([]);
    }

    if (e.ctrlKey && e.key === 'c') {
      executeCommand('stop');
    } else if (e.ctrlKey && e.key === 'l') {
      executeCommand('clear');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl h-full max-h-[80vh] bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-700">
        {/* Terminal Window Header */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-300 text-sm font-medium">garden.terminal</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Terminal Content */}
        <div className="h-full flex flex-col bg-black text-green-400 font-mono">
          {/* Status Bar */}
          <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 text-xs text-gray-500">
            Garden Terminal v2.0 — Zen Edition | Speed: {speed} | Size: {size} | Axis: {axis} | FPS: {fps} | Status: {isRunning ? 'Running' : 'Stopped'}
          </div>
          
          {/* Main Terminal Area */}
          <div className="flex-1 flex flex-col p-4">
            {/* Welcome Message */}
            <div className="mb-4 text-sm text-gray-400">
              <div>Garden Terminal v2.0 — Zen Edition</div>
              <div>Type 'help' for available commands</div>
              <div className="border-b border-gray-800 my-2"></div>
            </div>

            {/* Donut Display Area */}
            <div className="flex-1 flex items-center justify-center">
              <pre 
                ref={donutDisplayRef}
                className="text-xs leading-none whitespace-pre font-mono text-green-400"
                style={{ letterSpacing: 0 }}
              />
            </div>
            
            {/* Command History */}
            <div className="max-h-32 overflow-y-auto mb-4 text-sm">
              {commandHistory.map((line, index) => (
                <div key={index} className="text-green-300">{line}</div>
              ))}
            </div>
            
            {/* Command Input */}
            <div className="flex items-center text-sm border-t border-gray-800 pt-2">
              <span className="text-green-400 mr-2">❯</span>
              <input
                ref={commandInputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none text-green-400 flex-1 font-mono"
                autoComplete="off"
                placeholder="Enter command..."
              />
              <span className="animate-pulse text-green-400">_</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutTerminal;
