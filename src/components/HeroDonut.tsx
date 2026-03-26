import { useEffect, useRef, useCallback, useState } from 'react';
import { useGlobalDonut } from '@/hooks/useGlobalDonut';

/**
 * Background ASCII donut — optimized for performance.
 * Uses a single textContent update (no innerHTML/spans) since it's at 5-8% opacity anyway.
 */

interface HeroDonutProps {
  accentColor?: string;
}

const VIBGYOR_COLORS = ['#ee82ee', '#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082'];

const HeroDonut = ({ accentColor }: HeroDonutProps) => {
    const { globalState } = useGlobalDonut();
    const preRef = useRef<HTMLPreElement>(null);
    const animationRef = useRef<number>();
    const lastFrameRef = useRef(0);
    const [currentColorIndex, setCurrentColorIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentColorIndex((prev) => (prev + 1) % VIBGYOR_COLORS.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const accent = accentColor || VIBGYOR_COLORS[currentColorIndex];

    const render = useCallback((timestamp: number) => {
        // Throttle to ~30fps for the background donut — saves CPU
        if (timestamp - lastFrameRef.current < 33) {
            animationRef.current = requestAnimationFrame(render);
            return;
        }
        lastFrameRef.current = timestamp;

        if (!preRef.current) {
            animationRef.current = requestAnimationFrame(render);
            return;
        }

        const width = 80;
        const height = 50;

        const A = globalState.A;
        const B = globalState.B;

        const cosA = Math.cos(A), sinA = Math.sin(A);
        const cosB = Math.cos(B), sinB = Math.sin(B);

        const zbuffer = new Float32Array(width * height);
        const cbuffer = new Uint8Array(width * height); // 0 = space

        const R1 = 0.8, R2 = 1.7, K2 = 5;
        const K1x = width * K2 * 3 / (8 * (R1 + R2));
        const K1y = K1x * 0.55;

        const luminanceChars = '.,:;i1tfLCG08@';
        const charLen = luminanceChars.length;

        for (let theta = 0; theta < 6.28; theta += 0.04) {
            const cosT = Math.cos(theta), sinT = Math.sin(theta);
            for (let phi = 0; phi < 6.28; phi += 0.02) {
                const cosP = Math.cos(phi), sinP = Math.sin(phi);

                const cx = R2 + R1 * cosT;
                const cy = R1 * sinT;

                const x = cx * (cosB * cosP + sinA * sinB * sinP) - cy * cosA * sinB;
                const y = cx * (sinB * cosP - sinA * cosB * sinP) + cy * cosA * cosB;
                const z = K2 + cosA * cx * sinP + cy * sinA;
                const ooz = 1 / z;

                const xp = (width / 2 + K1x * ooz * x) | 0;
                const yp = (height / 2 - K1y * ooz * y) | 0;

                if (xp >= 0 && xp < width && yp >= 0 && yp < height) {
                    const idx = xp + width * yp;
                    if (ooz > zbuffer[idx]) {
                        zbuffer[idx] = ooz;

                        const ny = cosT * (sinB * cosP - sinA * cosB * sinP) + sinT * cosA * cosB;
                        const nz = cosA * cosT * sinP + sinT * sinA;

                        let lum = (ny * (-0.8) + nz * (-2)) / 2.154;
                        lum = lum * 0.75 + 0.25;
                        lum *= 0.5 + 0.5 * (1 - Math.abs(sinT));

                        const ci = Math.max(0, Math.min((lum * (charLen - 1)) | 0, charLen - 1));
                        cbuffer[idx] = ci + 1; // +1 so 0 = space
                    }
                }
            }
        }

        // Build plain text — no DOM spans, just textContent
        const lines: string[] = [];
        for (let j = 0; j < height; j++) {
            let line = '';
            for (let i = 0; i < width; i++) {
                const ci = cbuffer[i + width * j];
                line += ci ? luminanceChars[ci - 1] : ' ';
            }
            lines.push(line);
        }

        preRef.current.textContent = lines.join('\n');

        globalState.updateRotation(0.03, 0.02);
        animationRef.current = requestAnimationFrame(render);
    }, [globalState]);

    useEffect(() => {
        animationRef.current = requestAnimationFrame(render);
        return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
    }, [render]);

    return (
        <pre
            ref={preRef}
            style={{
                fontFamily: "'Geist Mono', 'SF Mono', 'Fira Code', Consolas, monospace",
                fontSize: 'clamp(4px, 0.7vw, 10px)',
                lineHeight: 1.0,
                letterSpacing: '0.04em',
                userSelect: 'none',
                margin: 0,
                opacity: 0.25,
                overflow: 'visible',
                color: accent,
                transition: 'color 1s ease-in-out',
            }}
        />
    );
};

export default HeroDonut;
