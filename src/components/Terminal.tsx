import { useState, useEffect, useRef } from 'react';
import { DonutSettings } from './DonutAnimation';

interface TerminalProps {
  isVisible: boolean;
  onClose: () => void;
  donutSettings: DonutSettings;
  onSettingsChange: (settings: Partial<DonutSettings>) => void;
  fps: number;
}

interface Command {
  command: string;
  args: string[];
  timestamp: Date;
}

const Terminal = ({ isVisible, onClose, donutSettings, onSettingsChange, fps }: TerminalProps) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Command[]>([]);
  const [output, setOutput] = useState<string[]>([
    'Welcome to Donut Terminal v1.0',
    'Type "help" for available commands',
    ''
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);
  
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);
  
  const addOutput = (text: string) => {
    setOutput(prev => [...prev, text]);
  };
  
  const processCommand = (commandLine: string) => {
    const parts = commandLine.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    const cmd: Command = { command, args, timestamp: new Date() };
    setHistory(prev => [...prev, cmd]);
    
    addOutput(`$ ${commandLine}`);
    
    switch (command) {
      case 'help':
        addOutput('Available commands:');
        addOutput('  help - Show this help message');
        addOutput('  clear - Clear terminal screen');
        addOutput('  exit - Close terminal');
        addOutput('  size [small|medium|large] - Change donut size');
        addOutput('  speed [0.1-5.0] - Adjust rotation speed');
        addOutput('  pause - Toggle donut animation');
        addOutput('  opacity [0-100] - Set donut opacity');
        addOutput('  color [blue|red|green|yellow|purple|cyan|white] - Change donut color');
        addOutput('  reset - Reset to default settings');
        addOutput('  info - Show current settings');
        addOutput('  fps - Show current frame rate');
        addOutput('  fullscreen - Toggle fullscreen donut');
        break;
        
      case 'clear':
        setOutput([]);
        break;
        
      case 'exit':
        onClose();
        break;
        
      case 'size':
        if (args.length === 0) {
          addOutput(`Current size: ${donutSettings.size}`);
        } else {
          const size = args[0].toLowerCase();
          if (['small', 'medium', 'large'].includes(size)) {
            onSettingsChange({ size: size as 'small' | 'medium' | 'large' });
            addOutput(`Size changed to: ${size}`);
          } else {
            addOutput('Error: Invalid size. Use small, medium, or large');
          }
        }
        break;
        
      case 'speed':
        if (args.length === 0) {
          addOutput(`Current speed: ${donutSettings.speed}`);
        } else {
          const speed = parseFloat(args[0]);
          if (isNaN(speed) || speed < 0.1 || speed > 5.0) {
            addOutput('Error: Speed must be between 0.1 and 5.0');
          } else {
            onSettingsChange({ speed });
            addOutput(`Speed changed to: ${speed}`);
          }
        }
        break;
        
      case 'pause':
        onSettingsChange({ paused: !donutSettings.paused });
        addOutput(`Animation ${donutSettings.paused ? 'resumed' : 'paused'}`);
        break;
        
      case 'opacity':
        if (args.length === 0) {
          addOutput(`Current opacity: ${donutSettings.opacity}%`);
        } else {
          const opacity = parseInt(args[0]);
          if (isNaN(opacity) || opacity < 0 || opacity > 100) {
            addOutput('Error: Opacity must be between 0 and 100');
          } else {
            onSettingsChange({ opacity });
            addOutput(`Opacity changed to: ${opacity}%`);
          }
        }
        break;
        
      case 'color':
        if (args.length === 0) {
          addOutput(`Current color: ${donutSettings.color}`);
        } else {
          const colorMap: { [key: string]: string } = {
            blue: '#4a9eff',
            red: '#ff4a4a',
            green: '#4aff4a',
            yellow: '#ffff4a',
            purple: '#ff4aff',
            cyan: '#4affff',
            white: '#ffffff'
          };
          
          const colorName = args[0].toLowerCase();
          if (colorMap[colorName]) {
            onSettingsChange({ color: colorMap[colorName] });
            addOutput(`Color changed to: ${colorName}`);
          } else {
            addOutput('Error: Invalid color. Available: blue, red, green, yellow, purple, cyan, white');
          }
        }
        break;
        
      case 'reset':
        onSettingsChange({
          size: 'medium',
          speed: 1,
          opacity: 100,
          color: '#4a9eff',
          paused: false
        });
        addOutput('Settings reset to defaults');
        break;
        
      case 'info':
        addOutput('Current Settings:');
        addOutput(`  Size: ${donutSettings.size}`);
        addOutput(`  Speed: ${donutSettings.speed}`);
        addOutput(`  Opacity: ${donutSettings.opacity}%`);
        addOutput(`  Color: ${donutSettings.color}`);
        addOutput(`  Paused: ${donutSettings.paused ? 'Yes' : 'No'}`);
        break;
        
      case 'fps':
        addOutput(`Current FPS: ${fps}`);
        break;
        
      case 'fullscreen':
        onSettingsChange({ opacity: donutSettings.opacity === 100 ? 30 : 100 });
        addOutput(`${donutSettings.opacity === 100 ? 'Exited' : 'Entered'} fullscreen mode`);
        break;
        
      case 'konami':
        addOutput('🍩 DONUT POWER ACTIVATED! 🍩');
        onSettingsChange({ speed: 3, size: 'large' });
        setTimeout(() => onSettingsChange({ speed: 1, size: 'medium' }), 3000);
        break;
        
      case 'hello':
        addOutput('Hello there! Welcome to the spinning donut terminal.');
        addOutput('    🍩');
        addOutput('   /   \\');
        addOutput('  (  o  )');
        addOutput('   \\___/');
        break;
        
      default:
        if (command) {
          addOutput(`Command not found: ${command}. Type "help" for available commands.`);
        }
        break;
    }
    
    addOutput('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        processCommand(input);
      }
      setInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]?.command || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]?.command || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const commands = ['help', 'clear', 'exit', 'size', 'speed', 'pause', 'opacity', 'color', 'reset', 'info', 'fps', 'fullscreen'];
      const matches = commands.filter(cmd => cmd.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0]);
      }
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black text-green-400 w-full max-w-4xl h-96 mx-4 rounded-lg overflow-hidden font-mono text-sm">
        <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
          <span>Donut Terminal</span>
          <button 
            onClick={onClose}
            className="text-red-400 hover:text-red-300 text-xl leading-none"
          >
            ×
          </button>
        </div>
        
        <div 
          ref={outputRef}
          className="p-4 h-80 overflow-y-auto scroll-smooth"
        >
          {output.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {line}
            </div>
          ))}
          
          <div className="flex items-center">
            <span className="text-blue-400">$ </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent outline-none flex-1 text-green-400 ml-1"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;