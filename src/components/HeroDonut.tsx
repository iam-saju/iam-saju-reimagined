import { useEffect, useRef, useCallback, useState } from 'react';
import { useGlobalDonut } from '@/hooks/useGlobalDonut';

/**
 * Background ASCII shape-shuffler — optimized for performance.
 * Uses a single textContent update (no innerHTML/spans) since it's at low opacity anyway.
 */

interface HeroDonutProps {
  accentColor?: string;
}

const VIBGYOR_COLORS = ['#ee82ee', '#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082'];

const luminanceChars = ' .`\'-,:;_~"^!|/\\i><?+1)(lI}{][rcvunxzjftYJL7VT*FCo2Z35SUkwqbdpham#OQ0GW8XDKR%HN$AEMB&@';
const charLen = luminanceChars.length;

// A local point + local (un-normalized) normal, in shape-local space BEFORE the
// shared view rotation is applied. Some shapes (the gyroscope) emit more than
// one of these per (theta,phi) sample — one per ring.
type LocalSample = [number, number, number, number, number, number];

interface ShapeDef {
    useTubeAO: boolean;
    speed: number;
    sample: (theta: number, phi: number, cosT: number, sinT: number, cosP: number, sinP: number) => LocalSample[];
}

// Rotate about X by A, then about Z by B — the exact view-rotation half of the
// classic donut.c fused formula, extracted so every shape can share it instead
// of each shape re-deriving its own fused position/normal algebra.
function applyView(
    lx: number, ly: number, lz: number,
    cosA: number, sinA: number, cosB: number, sinB: number
): [number, number, number] {
    const ly1 = ly * cosA - lz * sinA;
    const lz1 = ly * sinA + lz * cosA;
    const x = lx * cosB - ly1 * sinB;
    const y = lx * sinB + ly1 * cosB;
    return [x, y, lz1];
}

// ---- Torus family (ring / spindle / horn, depending on R1 vs R2) ----
function makeTorusShape(R1: number, R2: number, speed: number): ShapeDef {
    return {
        useTubeAO: true,
        speed,
        sample: (_theta, _phi, cosT, sinT, cosP, sinP) => {
            const cx = R2 + R1 * cosT;
            const cy = R1 * sinT;
            return [[cx * cosP, cy, cx * sinP, cosT * cosP, sinT, cosT * sinP]];
        },
    };
}

// ---- Sphere ----
const SPHERE_R = 1.9;
const sphereShape: ShapeDef = {
    useTubeAO: false,
    speed: 1.0,
    sample: (theta, _phi, _cosT, _sinT, cosP, sinP) => {
        const L = theta / 2; // latitude — sphere's own domain differs from the torus's theta, remapped so every shape shares the same theta<6.28 loop bounds
        const cosL = Math.cos(L), sinL = Math.sin(L);
        const cx = SPHERE_R * sinL;
        const cy = SPHERE_R * cosL;
        return [[cx * cosP, cy, cx * sinP, sinL * cosP, cosL, sinL * sinP]];
    },
};

// ---- Gyroscope (3 rings, each the torus sweep with a free 90°-axis-swap rotation) ----
const gyroBase = makeTorusShape(0.15, 2.0, 1.6);
const gyroRingRot: Array<(s: LocalSample) => LocalSample> = [
    (s) => s,
    (s) => [s[0], -s[2], s[1], s[3], -s[5], s[4]],
    (s) => [-s[1], s[0], s[2], -s[4], s[3], s[5]],
];
const gyroscopeShape: ShapeDef = {
    useTubeAO: true,
    speed: 1.6,
    sample: (theta, phi, cosT, sinT, cosP, sinP) => {
        const base = gyroBase.sample(theta, phi, cosT, sinT, cosP, sinP)[0];
        return gyroRingRot.map((rot) => rot(base));
    },
};

// ---- Gear / flower torus (wavy tube radius, analytic tangent-derived normal) ----
const GEAR_R2 = 1.7, GEAR_R1_BASE = 0.65, GEAR_N = 6, GEAR_AMP = 0.35;
const gearTorusShape: ShapeDef = {
    useTubeAO: true,
    speed: 1.3,
    sample: (theta, _phi, cosT, sinT, cosP, sinP) => {
        const r = GEAR_R1_BASE * (1 + GEAR_AMP * Math.cos(GEAR_N * theta));
        const rPrime = -GEAR_R1_BASE * GEAR_AMP * GEAR_N * Math.sin(GEAR_N * theta);
        const cx = GEAR_R2 + r * cosT;
        const cy = r * sinT;
        const dcx = rPrime * cosT - r * sinT;
        const dcy = rPrime * sinT + r * cosT;
        let nx2 = dcy, ny2 = -dcx; // tangent rotated -90°; reduces to (cosT,sinT) when rPrime=0 (plain torus)
        const nMag = Math.sqrt(nx2 * nx2 + ny2 * ny2) || 1;
        nx2 /= nMag; ny2 /= nMag;
        return [[cx * cosP, cy, cx * sinP, nx2 * cosP, ny2, nx2 * sinP]];
    },
};

const SHAPES: ShapeDef[] = [
    makeTorusShape(0.8, 1.7, 1.0),   // ring torus (original donut)
    sphereShape,
    gyroscopeShape,
    makeTorusShape(1.7, 0.8, 1.15),  // spindle torus
    gearTorusShape,
    makeTorusShape(1.25, 1.25, 1.05), // horn torus
];

const ROTATIONS_PER_SHAPE = 2;
const TRANSITION_ROTATIONS = 1;
const JITTER_MAG = 0.35;

// Deterministic per-point pseudo-noise (not Math.random()) so a given grid
// point's jitter direction is stable across a transition — only its magnitude
// changes frame to frame via the envelope, avoiding random per-frame flicker.
function hashJitter(theta: number, phi: number, kx: number, ky: number, scale: number): number {
    const s = Math.sin(theta * kx + phi * ky) * scale;
    return (s - Math.floor(s)) * 2 - 1;
}

const HeroDonut = ({ accentColor }: HeroDonutProps) => {
    const { globalState } = useGlobalDonut();
    const preRef = useRef<HTMLPreElement>(null);
    const animationRef = useRef<number>();
    const lastFrameRef = useRef(0);
    const [currentColorIndex, setCurrentColorIndex] = useState(0);

    const shapeIndexRef = useRef(0);
    const prevShapeIndexRef = useRef(0);
    const shapeStartARef = useRef<number | null>(null);
    const transitionStartARef = useRef(0);
    const blendRef = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentColorIndex((prev) => (prev + 1) % VIBGYOR_COLORS.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const accent = accentColor || VIBGYOR_COLORS[currentColorIndex];

    const render = useCallback((timestamp: number) => {
        // Throttle to ~30fps for the background shape — saves CPU
        if (timestamp - lastFrameRef.current < 33) {
            animationRef.current = requestAnimationFrame(render);
            return;
        }
        lastFrameRef.current = timestamp;

        if (!preRef.current) {
            animationRef.current = requestAnimationFrame(render);
            return;
        }

        const width = 110;
        const height = 68;

        const A = globalState.A;
        const B = globalState.B;

        const cosA = Math.cos(A), sinA = Math.sin(A);
        const cosB = Math.cos(B), sinB = Math.sin(B);

        // ---- Shape shuffle: driven by accumulated rotation (A), not wall-clock time ----
        if (shapeStartARef.current === null) shapeStartARef.current = A;

        if (blendRef.current === 0 && (A - shapeStartARef.current) / (2 * Math.PI) >= ROTATIONS_PER_SHAPE) {
            prevShapeIndexRef.current = shapeIndexRef.current;
            let next = shapeIndexRef.current;
            while (next === shapeIndexRef.current) {
                next = Math.floor(Math.random() * SHAPES.length);
            }
            shapeIndexRef.current = next;
            transitionStartARef.current = A;
            blendRef.current = 1e-4;
        } else if (blendRef.current > 0) {
            const t = (A - transitionStartARef.current) / (2 * Math.PI * TRANSITION_ROTATIONS);
            if (t >= 1) {
                blendRef.current = 0;
                shapeStartARef.current = A;
            } else {
                blendRef.current = t;
            }
        }

        const currentShape = SHAPES[shapeIndexRef.current];
        const outgoingShape = SHAPES[prevShapeIndexRef.current];
        const blend = blendRef.current;

        const speedMul = blend > 0
            ? outgoingShape.speed + (currentShape.speed - outgoingShape.speed) * blend
            : currentShape.speed;

        const zbuffer = new Float32Array(width * height);
        const cbuffer = new Uint8Array(width * height); // 0 = space

        // Reference "characteristic radius" (the original torus's R1+R2≈2.5) —
        // every shape is tuned to roughly this extent so shuffling doesn't
        // visibly pop in overall size; the projection scale itself stays fixed
        // and shape-agnostic.
        const R1 = 0.8, R2 = 1.7, K2 = 5;
        const K1x = (width * K2 * 3 / (8 * (R1 + R2))) * 0.88;
        const K1y = K1x * 0.55;

        // Bulge effect: a "pull point" that slowly orbits the silhouette
        // (independent of the shape's own A/B spin), stretching whatever
        // surface is currently nearest to it outward — like an invisible
        // hand circling the shape and dragging a bulge around with it.
        const bulgeAngle = (timestamp * 0.00055) % (Math.PI * 2);

        // Transitions sample BOTH the outgoing and incoming shape per point
        // (plus jitter), roughly doubling cost — and the gyroscope alone
        // triples cost on top of that (3 rings per sample). Both push fps
        // down noticeably, so sample more coarsely whenever a transition is
        // in progress, and coarser still if the gyroscope is on either side
        // of it. Both shapes in a blend always share this step so the
        // (theta,phi) grid stays in lockstep for the lerp correspondence.
        const gyroInvolved = currentShape === gyroscopeShape || outgoingShape === gyroscopeShape;
        const inTransition = blend > 0;
        let phiStep = 0.01;
        if (gyroInvolved) phiStep = 0.024;
        else if (inTransition) phiStep = 0.016;

        for (let theta = 0; theta < 6.28; theta += 0.03) {
            const cosT = Math.cos(theta), sinT = Math.sin(theta);
            for (let phi = 0; phi < 6.28; phi += phiStep) {
                const cosP = Math.cos(phi), sinP = Math.sin(phi);

                const fromArr = currentShape === outgoingShape || blend === 0
                    ? null
                    : outgoingShape.sample(theta, phi, cosT, sinT, cosP, sinP);
                const toArr = currentShape.sample(theta, phi, cosT, sinT, cosP, sinP);
                const maxLen = fromArr ? Math.max(fromArr.length, toArr.length) : toArr.length;

                for (let ringIdx = 0; ringIdx < maxLen; ringIdx++) {
                    let lx: number, ly: number, lz: number, lnx: number, lny: number, lnz: number, tubeAOForPoint: boolean;

                    if (!fromArr) {
                        const s = toArr[ringIdx];
                        lx = s[0]; ly = s[1]; lz = s[2]; lnx = s[3]; lny = s[4]; lnz = s[5];
                        tubeAOForPoint = currentShape.useTubeAO;
                    } else {
                        const hasFrom = ringIdx < fromArr.length;
                        const hasTo = ringIdx < toArr.length;
                        const jx = hashJitter(theta, phi, 12.9898, 78.233, 43758.5453);
                        const jy = hashJitter(theta, phi, 39.346, 11.135, 24634.6345);
                        const jz = hashJitter(theta, phi, 27.619, 57.219, 12645.234);

                        if (hasFrom && hasTo) {
                            const a = fromArr[ringIdx], b = toArr[ringIdx];
                            const env = Math.sin(blend * Math.PI) * JITTER_MAG;
                            lx = a[0] + (b[0] - a[0]) * blend + jx * env;
                            ly = a[1] + (b[1] - a[1]) * blend + jy * env;
                            lz = a[2] + (b[2] - a[2]) * blend + jz * env;
                            lnx = a[3] + (b[3] - a[3]) * blend;
                            lny = a[4] + (b[4] - a[4]) * blend;
                            lnz = a[5] + (b[5] - a[5]) * blend;
                            tubeAOForPoint = blend < 0.5 ? outgoingShape.useTubeAO : currentShape.useTubeAO;
                        } else if (hasFrom) {
                            // A gyroscope ring with no counterpart in the incoming shape — disperses into jitter as blend -> 1.
                            const a = fromArr[ringIdx];
                            const disperse = blend;
                            lx = a[0] + jx * JITTER_MAG * disperse;
                            ly = a[1] + jy * JITTER_MAG * disperse;
                            lz = a[2] + jz * JITTER_MAG * disperse;
                            lnx = a[3]; lny = a[4]; lnz = a[5];
                            tubeAOForPoint = outgoingShape.useTubeAO;
                        } else {
                            // A gyroscope ring with no counterpart in the outgoing shape — coalesces out of jitter as blend -> 1.
                            const b = toArr[ringIdx];
                            const disperse = 1 - blend;
                            lx = b[0] + jx * JITTER_MAG * disperse;
                            ly = b[1] + jy * JITTER_MAG * disperse;
                            lz = b[2] + jz * JITTER_MAG * disperse;
                            lnx = b[3]; lny = b[4]; lnz = b[5];
                            tubeAOForPoint = currentShape.useTubeAO;
                        }
                    }

                    const [x, y, zView] = applyView(lx, ly, lz, cosA, sinA, cosB, sinB);
                    const ooz = 1 / (zView + K2);

                    let xpF = width / 2 + K1x * ooz * x;
                    let ypF = height / 2 - K1y * ooz * y;

                    const dxC = xpF - width / 2;
                    const dyC = ypF - height / 2;
                    const distC = Math.sqrt(dxC * dxC + dyC * dyC) || 1;
                    let dAngle = Math.atan2(dyC, dxC) - bulgeAngle;
                    dAngle = Math.atan2(Math.sin(dAngle), Math.cos(dAngle));
                    const angFalloff = Math.max(0, Math.cos(dAngle));
                    const distNorm = Math.min(1, distC / (width * 0.42));
                    const bulgeMag = angFalloff * angFalloff * distNorm * distNorm * 0.16;
                    xpF += bulgeMag * (dxC / distC) * width;
                    ypF += bulgeMag * (dyC / distC) * height;

                    const xp = xpF | 0;
                    const yp = ypF | 0;

                    if (xp >= 0 && xp < width && yp >= 0 && yp < height) {
                        const idx = xp + width * yp;
                        if (ooz > zbuffer[idx]) {
                            zbuffer[idx] = ooz;

                            const [nnx0, nny0, nnz0] = applyView(lnx, lny, lnz, cosA, sinA, cosB, sinB);
                            const nMag = Math.sqrt(nnx0 * nnx0 + nny0 * nny0 + nnz0 * nnz0) || 1;
                            const nx = nnx0 / nMag, ny = nny0 / nMag, nz = nnz0 / nMag;

                            // Key light: Lambertian diffuse + a tight specular highlight
                            // from the mirror-reflection vector.
                            const kl = 0.577;
                            const keyDot = Math.max(0, (nx * 0.5 + ny * (-0.7) + nz * 0.5) * kl * 1.73);
                            const keyRx = 2 * keyDot * nx - 0.5 * kl * 1.73;
                            const keyRy = 2 * keyDot * ny - (-0.7) * kl * 1.73;
                            const keyRz = 2 * keyDot * nz - 0.5 * kl * 1.73;
                            const keyRMag = Math.sqrt(keyRx * keyRx + keyRy * keyRy + keyRz * keyRz) || 1;
                            const keySpec = Math.pow(Math.max(0, -keyRz / keyRMag), 24);

                            // Soft fill light from the opposite side + a rim/fresnel term
                            // so the silhouette doesn't go flat black.
                            const fillDot = Math.max(0, nx * (-0.4) + ny * 0.5 + nz * 0.3);
                            const rimDot = Math.max(0, nz * (-0.8) + nx * 0.1);
                            const fresnel = Math.pow(1.0 - Math.abs(nz), 3.0);
                            const ao = tubeAOForPoint ? (0.7 + 0.3 * Math.max(0, cosT * 0.5 + 0.5)) : 1;

                            const ambient = 0.04;
                            const diffuse = 0.45 * keyDot + 0.12 * fillDot;
                            const specular = 0.25 * keySpec;
                            const rim = 0.15 * rimDot + 0.12 * fresnel;

                            let lum = (ambient + diffuse + specular + rim) * ao;
                            lum = Math.pow(Math.min(1, Math.max(0, lum)), 0.6);

                            const ci = Math.max(0, Math.min((lum * (charLen - 1)) | 0, charLen - 1));
                            cbuffer[idx] = ci + 1; // +1 so 0 = space
                        }
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

        globalState.updateRotation(0.03 * speedMul, 0.02 * speedMul);
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
                fontFamily: 'Consolas, "Courier New", monospace',
                fontSize: 'clamp(5px, 1vw, 7px)',
                lineHeight: 1.0,
                letterSpacing: 0,
                userSelect: 'none',
                margin: 0,
                opacity: 0.85,
                overflow: 'visible',
                color: accent,
                transition: 'color 1s ease-in-out',
            }}
        />
    );
};

export default HeroDonut;
