import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalDonut } from '../hooks/useGlobalDonut';

interface DonutTerminalProps {
  isVisible: boolean;
  isClosing?: boolean;
  onClose: () => void;
  initialA?: number;
  initialB?: number;
}

const DonutTerminal: React.FC<DonutTerminalProps> = ({ isVisible, isClosing = false, onClose }) => {
  const { globalState, setRunning, setSpeed, setColor, reset } = useGlobalDonut();
  const navigate = useNavigate();
  const [commandOutput, setCommandOutput] = useState('');
  const [commandInput, setCommandInput] = useState('');
  const [bgColor, setBgColor] = useState('#1C1C1C');
  const [isDragOver, setIsDragOver] = useState(false);
  const [asciiArt, setAsciiArt] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);

  // Terminal bar position & size
  const [termPos, setTermPos] = useState({ x: 0, y: 0 });
  const [termSize, setTermSize] = useState({ w: 520, h: 160 });
  const [isCentered, setIsCentered] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);

  const donutDisplayRef = useRef<HTMLPreElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 });
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0, x: 0, y: 0 });
  const outputRef = useRef<HTMLDivElement>(null);

  // ── Detect mobile ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Open animation ──
  useEffect(() => {
    if (isVisible) {
      setIsOpening(true);
      setIsCentered(true);
      const timer = setTimeout(() => setIsOpening(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // ── Scroll output to bottom ──
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commandOutput]);

  // ── Drag (desktop only) ──
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    e.preventDefault();
    const rect = terminalRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isCentered) {
      setTermPos({ x: rect.left, y: rect.top });
      setIsCentered(false);
    }

    dragStartRef.current = {
      mouseX: e.clientX, mouseY: e.clientY,
      elX: isCentered ? rect.left : termPos.x,
      elY: isCentered ? rect.top : termPos.y,
    };
    setIsDragging(true);
  }, [isCentered, termPos, isMobile]);

  useEffect(() => {
    if (!isDragging) return;
    const move = (e: MouseEvent) => {
      setTermPos({
        x: dragStartRef.current.elX + e.clientX - dragStartRef.current.mouseX,
        y: dragStartRef.current.elY + e.clientY - dragStartRef.current.mouseY,
      });
    };
    const up = () => setIsDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [isDragging]);

  // ── Resize (desktop only) ──
  const handleResizeStart = useCallback((e: React.MouseEvent, dir: string) => {
    if (isMobile) return;
    e.preventDefault(); e.stopPropagation();
    const rect = terminalRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isCentered) {
      setTermPos({ x: rect.left, y: rect.top });
      setTermSize({ w: rect.width, h: rect.height });
      setIsCentered(false);
    }

    resizeStartRef.current = {
      mouseX: e.clientX, mouseY: e.clientY,
      w: isCentered ? rect.width : termSize.w,
      h: isCentered ? rect.height : termSize.h,
      x: isCentered ? rect.left : termPos.x,
      y: isCentered ? rect.top : termPos.y,
    };
    setIsResizing(dir);
  }, [isCentered, termSize, termPos, isMobile]);

  useEffect(() => {
    if (!isResizing) return;
    const move = (e: MouseEvent) => {
      const dx = e.clientX - resizeStartRef.current.mouseX;
      const dy = e.clientY - resizeStartRef.current.mouseY;
      const s = resizeStartRef.current;
      let nw = s.w, nh = s.h, nx = s.x, ny = s.y;
      if (isResizing.includes('e')) nw = Math.max(320, s.w + dx);
      if (isResizing.includes('w')) { nw = Math.max(320, s.w - dx); nx = s.x + s.w - nw; }
      if (isResizing.includes('s')) nh = Math.max(120, s.h + dy);
      if (isResizing.includes('n')) { nh = Math.max(120, s.h - dy); ny = s.y + s.h - nh; }
      setTermSize({ w: nw, h: nh });
      setTermPos({ x: nx, y: ny });
    };
    const up = () => setIsResizing(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [isResizing]);

  // ── ASCII image conversion ──
  const convertToAscii = useCallback(async (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d');
        const w = isMobile ? 60 : 120;
        const h = Math.floor(w * (img.height / img.width) * 0.5);
        c.width = w; c.height = h;
        ctx?.drawImage(img, 0, 0, w, h);
        const d = ctx?.getImageData(0, 0, w, h);
        if (!d) { resolve('Error'); return; }
        const ramp = ' .:-=+*#%@';
        let out = '';
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const b = (d.data[i] + d.data[i + 1] + d.data[i + 2]) / 3;
            out += ramp[Math.floor(b / 255 * (ramp.length - 1))];
          }
          out += '\n';
        }
        resolve(out);
      };
      img.src = dataUrl;
    });
  }, [isMobile]);

  const handleFileUpload = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const ascii = await convertToAscii(e.target?.result as string);
      setAsciiArt(ascii);
      setCommandOutput('✓ ascii art generated');
    };
    reader.readAsDataURL(file);
  }, [convertToAscii]);

  const handleFileDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleFileDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); }, []);
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const f = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
    if (f) handleFileUpload(f);
  }, [handleFileUpload]);

  // ── Donut animation — per-character colored rendering ──
  const animate = useCallback(() => {
    if (!donutDisplayRef.current || !globalState.isRunning) return;

    const width = isMobile ? 30 : 45;
    const height = isMobile ? 16 : 22;

    const output: string[][] = Array(height).fill(null).map(() => Array(width).fill(' '));
    const zbuffer: number[][] = Array(height).fill(null).map(() => Array(width).fill(0));
    const lumMap: number[][] = Array(height).fill(null).map(() => Array(width).fill(-1));

    const ramp = ' .`\'-,:;_~"^!|/\\i><?+1)(lI}{][rcvunxzjftYJL7VT*FCo2Z35SUkwqbdpham#OQ0GW8XDKR%HN$AEMB&@';
    const rampLen = ramp.length;

    const sinA = Math.sin(globalState.A), cosA = Math.cos(globalState.A);
    const sinB = Math.sin(globalState.B), cosB = Math.cos(globalState.B);

    const R1 = 1.0, R2 = 2.5, K2 = 5;
    const K1x = width * K2 * 3 / (8 * (R1 + R2));
    const K1y = K1x * 0.55;

    for (let theta = 0; theta < 6.2832; theta += isMobile ? 0.05 : 0.03) {
      const sinT = Math.sin(theta), cosT = Math.cos(theta);
      for (let phi = 0; phi < 6.2832; phi += isMobile ? 0.015 : 0.01) {
        const sinP = Math.sin(phi), cosP = Math.cos(phi);

        const cx = R2 + R1 * cosT;
        const cy = R1 * sinT;

        const x3d = cx * (cosB * cosP + sinA * sinB * sinP) - cy * cosA * sinB;
        const y3d = cx * (sinB * cosP - sinA * cosB * sinP) + cy * cosA * cosB;
        const z3d = K2 + cosA * cx * sinP + cy * sinA;
        const ooz = 1 / z3d;

        const xp = Math.floor(width / 2 + K1x * ooz * x3d);
        const yp = Math.floor(height / 2 - K1y * ooz * y3d);

        if (yp < 0 || yp >= height || xp < 0 || xp >= width || ooz <= zbuffer[yp][xp]) continue;
        zbuffer[yp][xp] = ooz;

        const nnx = cosT * (cosB * cosP + sinA * sinB * sinP) - cosA * sinB * sinT;
        const nny = cosT * (sinB * cosP - sinA * cosB * sinP) + cosA * cosB * sinT;
        const nnz = cosA * cosT * sinP + sinA * sinT;
        const nMag = Math.sqrt(nnx * nnx + nny * nny + nnz * nnz) || 1;
        const nx = nnx / nMag, ny = nny / nMag, nz = nnz / nMag;

        // 3-light cinematic setup
        const kl = 0.577;
        const keyDot = Math.max(0, (nx * 0.5 + ny * (-0.7) + nz * 0.5) * kl * 1.73);
        const keyR = 2 * keyDot * nx - 0.5 * kl * 1.73;
        const keyRy = 2 * keyDot * ny - (-0.7) * kl * 1.73;
        const keyRz = 2 * keyDot * nz - 0.5 * kl * 1.73;
        const keySpec = Math.pow(Math.max(0, -(keyRz) / (Math.sqrt(keyR * keyR + keyRy * keyRy + keyRz * keyRz) || 1)), 24);

        const fillDot = Math.max(0, nx * (-0.4) + ny * 0.5 + nz * 0.3);
        const rimDot = Math.max(0, nz * (-0.8) + nx * 0.1);
        const fresnel = Math.pow(1.0 - Math.abs(nz), 3.0);
        const ao = 0.7 + 0.3 * Math.max(0, cosT * 0.5 + 0.5);

        const ambient = 0.04;
        const diffuse = 0.45 * keyDot + 0.12 * fillDot;
        const specular = 0.25 * keySpec;
        const rim = 0.15 * rimDot + 0.12 * fresnel;

        let luminance = (ambient + diffuse + specular + rim) * ao;
        luminance = Math.pow(Math.min(1, Math.max(0, luminance)), 0.6);

        const ci = Math.max(0, Math.min(Math.floor(luminance * (rampLen - 1)), rampLen - 1));
        output[yp][xp] = ramp[ci];
        lumMap[yp][xp] = luminance;
      }
    }

    // ── Per-character color rendering ──
    const baseColor = globalState.color;
    const lines: string[] = [];
    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        const ch = output[y][x];
        const lum = lumMap[y][x];
        if (lum < 0 || ch === ' ') {
          line += ' ';
        } else {
          let r: number, g: number, b: number;
          const br = parseInt(baseColor.slice(1, 3), 16);
          const bg = parseInt(baseColor.slice(3, 5), 16);
          const bb = parseInt(baseColor.slice(5, 7), 16);

          if (lum > 0.75) {
            const t = (lum - 0.75) / 0.25;
            r = Math.round(br + (255 - br) * t * 0.9);
            g = Math.round(bg + (250 - bg) * t * 0.85);
            b = Math.round(bb + (220 - bb) * t * 0.6);
          } else if (lum > 0.3) {
            const intensity = 0.4 + (lum - 0.3) / 0.45 * 0.6;
            r = Math.round(br * intensity);
            g = Math.round(bg * intensity);
            b = Math.round(bb * intensity);
          } else {
            const intensity = lum / 0.3 * 0.4;
            r = Math.round(br * intensity * 0.6);
            g = Math.round(bg * intensity * 0.7);
            b = Math.round(bb * intensity * 1.2);
          }

          r = Math.min(255, Math.max(0, r));
          g = Math.min(255, Math.max(0, g));
          b = Math.min(255, Math.max(0, b));

          const glow = lum > 0.6 ? `text-shadow:0 0 ${Math.round(lum * 8)}px rgba(${r},${g},${b},${(lum * 0.5).toFixed(2)})` : '';
          const escaped = ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === '&' ? '&amp;' : ch === '"' ? '&quot;' : ch;
          line += `<span style="color:rgb(${r},${g},${b});${glow}">${escaped}</span>`;
        }
      }
      lines.push(line);
    }
    donutDisplayRef.current.innerHTML = lines.join('\n');

    globalState.updateRotation(0.04 * globalState.speed, 0.02 * globalState.speed);

    if (globalState.isRunning) {
      animationIdRef.current = requestAnimationFrame(animate);
    }
  }, [globalState, isMobile]);

  // Terminal prompt
  const prompt = 'λ ~';

  const availableCommands = [
    'start', 'stop', 'speed', 'color', 'bg', 'theme', 'reset', 'clear',
    'ascii', 'help', 'exit', 'posts', 'open', 'whoami', 'ls', 'about',
    'neofetch', 'cd', 'goto',
  ];

  // Site content for commands
  const sitePages = [
    { slug: 'home', path: '/', desc: 'landing page' },
    { slug: 'posts', path: '/posts', desc: 'blog posts & writing' },
    { slug: 'archive', path: '/archive', desc: 'visual archive' },
  ];

  const sitePosts = [
    { slug: 'bitcoin-server', title: 'bitcoin server in c++', date: 'dec 2024', readTime: '8 min', tags: 'blockchain, c++, systems' },
    { slug: 'gradient-descent', title: 'gradient descent', date: 'nov 2024', readTime: '5 min', tags: 'optimization, ml, math', link: 'https://harmless-bed-5d7.notion.site/gradient-descent-1fb97604c89d8054b6c0c62eba56a889' },
  ];

  // ── Commands ──
  const executeCommand = useCallback((cmd: string) => {
    if (!cmd.trim()) return;
    setCommandHistory(prev => [...prev.slice(-50), cmd.trim()]);
    setHistoryIndex(-1);

    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).map(a => a.toLowerCase());

    const colors: Record<string, string> = {
      blue: '#4a9eff', red: '#ff4a4a', green: '#4aff4a', purple: '#a855f7',
      orange: '#ff8c00', pink: '#ff69b4', cyan: '#00ffff', yellow: '#ffff00',
      white: '#ffffff', amber: '#ffbf00',
    };

    const bgColors: Record<string, string> = {
      default: '#1C1C1C', black: '#0a0a0a', dark: '#111111', midnight: '#0d1117',
      navy: '#0a1628', white: '#f5f5f0',
    };

    const snark = [
      `'${command}'? not a thing. try 'help'.`,
      `the donut spins in silent judgement.`,
      `unknown: '${command}'. the void stares back.`,
      `nope. try 'help'.`,
      `segfault (core dumped) — just kidding. try 'help'.`,
    ];

    switch (command) {
      case 'start': setRunning(true); setCommandOutput('▶ spinning'); break;
      case 'stop': setRunning(false); setCommandOutput('⏸ paused'); break;
      case 'speed': {
        if (!args[0]) { setCommandOutput(`speed: ${globalState.speed}x  (range: 0.1–10)`); return; }
        const s = parseFloat(args[0]);
        if (isNaN(s) || s < 0.1 || s > 10) { setCommandOutput('⚠ range: 0.1–10'); return; }
        setSpeed(s); setCommandOutput(`✓ speed → ${s}x`); break;
      }
      case 'color':
        if (!args[0]) { setCommandOutput(`colors: ${Object.keys(colors).join(', ')}`); return; }
        if (args[0].startsWith('#') && /^#[0-9a-fA-F]{6}$/.test(args[0])) {
          setColor(args[0]); setCommandOutput(`✓ color → ${args[0]}`);
        } else if (colors[args[0]]) {
          setColor(colors[args[0]]); setCommandOutput(`✓ color → ${args[0]}`);
        } else { setCommandOutput(`unknown color. available: ${Object.keys(colors).join(', ')}`); }
        break;
      case 'bg':
        if (!args[0]) { setCommandOutput(`backgrounds: ${Object.keys(bgColors).join(', ')}`); return; }
        if (args[0].startsWith('#') && /^#[0-9a-fA-F]{6}$/.test(args[0])) {
          setBgColor(args[0]); setCommandOutput(`✓ bg → ${args[0]}`);
        } else if (bgColors[args[0]]) {
          setBgColor(bgColors[args[0]]); setCommandOutput(`✓ bg → ${args[0]}`);
        } else { setCommandOutput(`unknown bg. available: ${Object.keys(bgColors).join(', ')}`); }
        break;
      case 'reset':
        reset(); setBgColor('#1C1C1C'); setIsCentered(true);
        setTermSize({ w: 520, h: 160 });
        setCommandOutput('✓ reset'); break;
      case 'clear': setCommandOutput(''); break;
      case 'ascii':
        if (!args[0]) { setCommandOutput('ascii upload — pick image\nascii clear — back to donut'); return; }
        if (args[0] === 'upload') { fileInputRef.current?.click(); setCommandOutput('📂 pick a file...'); }
        else if (args[0] === 'clear') { setAsciiArt(null); setCommandOutput('✓ donut restored'); }
        break;

      // ── Navigation / Content Commands ──
      case 'whoami':
        setCommandOutput(
          `saju@universe:~
━━━━━━━━━━━━━━━━━
name     : saju
role     : undergrad in ai & data science
building : gpu marketplace → gpu cluster
likes    : raw-socket http, ml theories,
           weird opencv hacks
club     : manchester united 🔴
twitter  : @saju0nx
github   : iam-saju

"build until it breaks. inspect the failure. repeat."`);
        break;

      case 'posts': {
        let output = 'blog posts:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        sitePosts.forEach((p, i) => {
          output += `  ${i + 1}. ${p.title}\n     ${p.date} · ${p.readTime} · [${p.tags}]\n`;
        });
        output += `\nuse 'open <slug>' to navigate\nslugs: ${sitePosts.map(p => p.slug).join(', ')}`;
        setCommandOutput(output);
        break;
      }

      case 'open': case 'goto': case 'cd': {
        if (!args[0]) { setCommandOutput('usage: open <slug>\npages: home, posts, archive\nposts: ' + sitePosts.map(p => p.slug).join(', ')); return; }
        const target = args[0];
        const page = sitePages.find(p => p.slug === target);
        if (page) {
          setCommandOutput(`→ navigating to /${target}...`);
          setTimeout(() => { onClose(); navigate(page.path); }, 400);
          return;
        }
        const post = sitePosts.find(p => p.slug === target || p.slug.includes(target));
        if (post) {
          if (post.link) {
            setCommandOutput(`→ opening ${post.title}...`);
            setTimeout(() => { window.open(post.link, '_blank'); }, 400);
          } else {
            setCommandOutput(`⚠ "${post.title}" — coming soon...`);
          }
          return;
        }
        setCommandOutput(`'${target}' not found.\npages: ${sitePages.map(p => p.slug).join(', ')}\nposts: ${sitePosts.map(p => p.slug).join(', ')}`);
        break;
      }

      case 'ls': {
        let output = 'drwxr-xr-x  saju  ~/portfolio\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        output += '  📁 posts/          blog posts & writing\n';
        output += '  📁 archive/        visual archive & artwork\n';
        output += '  📄 about           who is saju\n';
        output += '  🍩 donut.sh        you are here\n';
        output += `\n  ${sitePosts.length} posts · ${sitePages.length} pages`;
        setCommandOutput(output);
        break;
      }

      case 'about':
        setCommandOutput(
          `┌──────────────────────────────────┐
│  saju's portfolio terminal v2.0  │
│  react + vite + typescript       │
│  solarized dark theme            │
│  custom ascii donut engine       │
│  deployed on netlify              │
└──────────────────────────────────┘
press shift+t from any page to toggle.`);
        break;

      case 'neofetch': {
        setCommandOutput(
          `        🍩               saju@portfolio
     .-""""""-.           ━━━━━━━━━━━━━━━━
    /         \\          os: macOS
   |  O     O  |         shell: donut.sh v2.0
   |    ___    |         stack: react + vite + ts
   |   /   \\  |         theme: solarized dark
    \\___|___/           font: geist mono
     \\     /            uptime: since 2024
      '---'             packages: 42
                         ascii: custom engine`);
        break;
      }

      case 'sudo':
        setCommandOutput('nice try. 🍩'); break;

      case 'rm':
        setCommandOutput('you really thought...? 🗑️❌'); break;

      case 'help':
        setCommandOutput(
          `── navigation ──────────────────
posts            list all blog posts
open <slug>      navigate to a page/post
ls               directory listing
whoami           about saju
about            system info
neofetch         flex on 'em

── donut controls ──────────────
start / stop     spin control
speed <n>        0.1 – 10
color <name>     donut color
bg <name>        background
ascii upload     image → ascii
reset            defaults
clear            clear output
exit             close terminal`);
        break;
      case 'exit': onClose(); break;
      default: setCommandOutput(snark[Math.floor(Math.random() * snark.length)]);
    }
  }, [setRunning, setSpeed, setColor, reset, onClose, globalState.speed, navigate]);

  useEffect(() => {
    if (isVisible && globalState.isRunning && !asciiArt) animate();
    return () => { if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current); };
  }, [isVisible, globalState.isRunning, animate, asciiArt]);

  useEffect(() => {
    if (isVisible && commandInputRef.current) {
      // Small delay on mobile to ensure keyboard doesn't pop up immediately
      const timer = setTimeout(() => commandInputRef.current?.focus(), isMobile ? 500 : 0);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isMobile]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(commandInput); setCommandInput('');
      setTimeout(() => commandInputRef.current?.focus(), 0);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const i = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(i); setCommandInput(commandHistory[i]);
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const i = historyIndex + 1;
        if (i >= commandHistory.length) { setHistoryIndex(-1); setCommandInput(''); }
        else { setHistoryIndex(i); setCommandInput(commandHistory[i]); }
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const input = commandInput.trim().toLowerCase();
      if (input) {
        const m = availableCommands.filter(c => c.startsWith(input));
        if (m.length === 1) setCommandInput(m[0] + ' ');
        else if (m.length > 1) setCommandOutput(`matches: ${m.join(', ')}`);
      }
    }
  };

  if (!isVisible && !isClosing) return null;

  const glow = globalState.color + '30';

  const Handle = ({ dir, cursor, style }: { dir: string; cursor: string; style: React.CSSProperties }) => (
    <div onMouseDown={(e) => handleResizeStart(e, dir)}
      style={{ position: 'absolute', zIndex: 20, cursor, ...style }} />
  );

  return (
    <div
      className="fixed inset-0 z-50"
      onDragOver={handleFileDragOver}
      onDragLeave={handleFileDragLeave}
      onDrop={handleFileDrop}
      style={{
        animation: isClosing
          ? 'dtClose 0.4s cubic-bezier(0.4,0,1,1) forwards'
          : isOpening ? 'dtOpen 0.4s cubic-bezier(0.16,1,0.3,1)' : undefined,
        cursor: isDragging ? 'grabbing' : undefined,
      }}
    >
      <style>{`
        @keyframes dtOpen {
          from { opacity: 0; transform: scale(0.92) translateY(20px); filter: blur(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes dtClose {
          from { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
          to { opacity: 0; transform: scale(0.92) translateY(20px); filter: blur(8px); }
        }
      `}</style>

      <input ref={fileInputRef} type="file" accept="image/*"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
        className="hidden" />

      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center z-[60]"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', border: `2px dashed ${globalState.color}` }}>
          <div className="text-lg font-mono" style={{ color: globalState.color }}>drop image here</div>
        </div>
      )}

      {/* Background — full viewport, matching site bg */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        {/* Subtle ambient glow */}
        <div className="absolute pointer-events-none"
          style={{
            width: isMobile ? '250px' : '400px',
            height: isMobile ? '200px' : '300px',
            background: `radial-gradient(ellipse at center, ${glow} 0%, transparent 70%)`,
            filter: 'blur(60px)', opacity: 0.5,
          }}
        />

        {/* Donut display — responsive */}
        {asciiArt ? (
          <pre className="whitespace-pre font-mono text-center relative"
            style={{
              fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', Monaco, monospace",
              color: '#e5e5e5',
              fontSize: isMobile ? '6px' : '11px',
              lineHeight: '1.15',
              letterSpacing: '0.04em', zIndex: 3,
            }}>
            {asciiArt}
          </pre>
        ) : (
          <pre ref={donutDisplayRef} className="whitespace-pre relative select-none"
            style={{
              fontFamily: 'Consolas, "Courier New", monospace',
              fontSize: isMobile ? 'clamp(7px, 2.5vw, 12px)' : 'clamp(8px, 1.4vw, 16px)',
              lineHeight: 0.85,
              letterSpacing: '-0.03em',
              fontWeight: 'bold',
              zIndex: 3,
            }}
          />
        )}
      </div>

      {/* Terminal bar — full width on mobile, floating window on desktop */}
      <div ref={terminalRef}
        className="absolute"
        style={{
          zIndex: 10,
          ...(isMobile
            ? {
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
            }
            : isCentered
              ? { bottom: '16px', left: '50%', transform: 'translateX(-50%)', width: `${termSize.w}px`, maxWidth: '94vw' }
              : { left: `${termPos.x}px`, top: `${termPos.y}px`, width: `${termSize.w}px` }
          ),
        }}
      >
        <div className="overflow-hidden relative"
          style={{
            borderRadius: isMobile ? '12px 12px 0 0' : '10px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderBottom: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: isMobile
              ? '0 -4px 24px rgba(0,0,0,0.5)'
              : '0 4px 24px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.06)',
            height: isMobile ? undefined : (isCentered ? undefined : `${termSize.h}px`),
            maxHeight: isMobile ? '55vh' : undefined,
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Resize handles — desktop only */}
          {!isMobile && (
            <>
              <Handle dir="n" cursor="ns-resize" style={{ top: -3, left: 12, right: 12, height: 6 }} />
              <Handle dir="s" cursor="ns-resize" style={{ bottom: -3, left: 12, right: 12, height: 6 }} />
              <Handle dir="w" cursor="ew-resize" style={{ left: -3, top: 12, bottom: 12, width: 6 }} />
              <Handle dir="e" cursor="ew-resize" style={{ right: -3, top: 12, bottom: 12, width: 6 }} />
              <Handle dir="nw" cursor="nwse-resize" style={{ top: -3, left: -3, width: 12, height: 12 }} />
              <Handle dir="ne" cursor="nesw-resize" style={{ top: -3, right: -3, width: 12, height: 12 }} />
              <Handle dir="sw" cursor="nesw-resize" style={{ bottom: -3, left: -3, width: 12, height: 12 }} />
              <Handle dir="se" cursor="nwse-resize" style={{ bottom: -3, right: -3, width: 12, height: 12 }} />
            </>
          )}

          {/* Title bar */}
          <div className="flex items-center px-3 sm:px-3.5 py-2 shrink-0"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              cursor: isMobile ? 'default' : (isDragging ? 'grabbing' : 'grab'),
              userSelect: 'none',
            }}
            onMouseDown={handleDragStart}
          >
            <div className="flex gap-[7px] mr-3" data-no-drag>
              <div className="w-[11px] h-[11px] rounded-full cursor-pointer hover:brightness-110 transition-all"
                style={{ backgroundColor: '#ff5f57' }} onClick={onClose} title="Close" />
              <div className="w-[11px] h-[11px] rounded-full" style={{ backgroundColor: '#febc2e' }} />
              <div className="w-[11px] h-[11px] rounded-full" style={{ backgroundColor: '#28c840' }} />
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono flex-1 text-center select-none"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
              donut.sh — {globalState.isRunning ? '● running' : '○ paused'}
            </span>
            <div className="w-[48px]" />
          </div>

          {/* Output */}
          <div ref={outputRef} className="px-3 sm:px-3.5 pt-2 pb-1.5 flex-1 overflow-y-auto" style={{ minHeight: '20px' }}>
            {commandOutput ? (
              <div className="text-[10px] sm:text-[11.5px] font-mono leading-relaxed whitespace-pre-wrap"
                style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", color: 'rgba(255,255,255,0.6)' }}>
                {commandOutput}
              </div>
            ) : (
              <div className="text-[10px] sm:text-[11px] font-mono text-center py-0.5 select-none"
                style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", color: 'rgba(255,255,255,0.18)' }}>
                type 'help' for commands
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 sm:px-3.5 pb-2 sm:pb-2.5 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center pt-2">
              <span className="text-[11px] sm:text-[12px] font-mono mr-2 shrink-0 select-none"
                style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", color: globalState.color, opacity: 0.8 }}>
                {prompt}
              </span>
              <input ref={commandInputRef} type="text" value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)} onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none flex-1 text-[11px] sm:text-[12px] font-mono"
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  color: 'rgba(255,255,255,0.85)', caretColor: globalState.color,
                }}
                placeholder="" autoComplete="off" spellCheck={false}
                enterKeyHint="send"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutTerminal;
