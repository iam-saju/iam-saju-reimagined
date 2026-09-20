import { useEffect, useRef, useCallback } from 'react';

/**
 * Background ASCII particle swarm, rendered as sparse ASCII texture whose
 * character comes from local particle density and velocity. Particles are
 * plain `.` `·` `:` `+` `*` glyphs — no direction-encoding characters —
 * so any sense of motion or formation comes purely from how the positions
 * change frame to frame, not from the glyph chosen.
 *
 * The collective-motion mechanism is adapted from Fabregas, Liao & Outada,
 * "The Mathematical Theory of Behavioural Swarms" (arXiv:2508.12183):
 *  - Particles communicate through the Cucker-Smale weight function
 *    psi(r) = K / (1 + r)^beta (eq. 2.2-2.3), so influence decays smoothly
 *    with distance rather than a hard cutoff.
 *  - Each particle only communicates within its own bounded interaction
 *    domain Omega_i — a small, per-particle set of its nearest neighbors
 *    (3-8, personality-dependent) — mirroring the paper's own Section 4
 *    extension (a visibility-bounded Omega_i). This keeps the swarm from
 *    ever behaving like one globally-coherent body.
 *  - That Omega_i weighting is additionally anisotropic: neighbors roughly
 *    ahead of or behind a particle's current heading count more than
 *    neighbors directly to its side. This is what lets long, thin,
 *    fish/bird-like streams form (particles entrain with what's in front
 *    of and behind them) instead of the isotropic case, which tends to
 *    collapse into round blobs.
 *  - Each particle also carries a scalar "activity" u_i in [0,1] (the
 *    paper's behavioural state) that co-evolves via bounded-confidence
 *    consensus with nearby, similarly-active neighbors within Omega_i
 *    (the "homophily" mechanism the paper's critical review credits with
 *    producing several stable, distinct opinion blocs).
 *  - Activity blends each particle's own preferred heading against the
 *    Cucker-Smale-weighted heading of its Omega_i, and sets its preferred
 *    speed — following Algorithm 1's s_i = (1+u_i)/2,
 *    omega_i = (1-u_i) v_T_i + u_i v_S_i, with velocity relaxing toward
 *    s_i * omega_i at each particle's own rate.
 *
 * Layered on top: no two particles share a relaxation rate, turning
 * speed, preferred speed, noise strength, or neighbor count; velocity
 * turns at a clamped rate rather than snapping (inertia); each particle's
 * preferred heading wanders via a slow mean-reverting random walk
 * (correlated noise, not per-frame jitter) with rare independent
 * spontaneous impulses that only ripple as far as the local Omega_i chain
 * carries them; and the whole field's anchor point drifts slowly across
 * the frame on its own multi-minute cycle (large-scale migration, on top
 * of the fast individual noise and medium neighbor-driven structure).
 * None of this is choreographed — clustering, streaming, splitting and
 * migrating are a consequence of the simulation, not scripted states.
 *
 * Two more additions let structured-looking patterns surface briefly
 * inside the randomness, without ever being drawn directly:
 *  - Separation is a soft spacing spring (repel closer than a preferred
 *    distance, weakly attract a little beyond it) rather than pure
 *    repulsion — this gives particles a stable equilibrium spacing, so
 *    when a patch of the field happens to settle, it can snap into a
 *    grid/lattice-like local packing on its own.
 *  - Each particle, rarely and independently, enters a brief "orbit"
 *    around one randomly-chosen nearby neighbor for a few seconds, at a
 *    personal angular speed and a radius that grows at its own rate
 *    (near-zero growth reads as a ring, faster growth reads as a spiral
 *    arm) — blended in as a gentle nudge, not a takeover, so it only
 *    reads as a visible pattern when several nearby particles happen to
 *    be orbiting at once. On top of that, a slow compression wave sweeps
 *    across the whole field on its own axis and period, alternately
 *    pulling particles in and letting them relax back out as it passes.
 *
 * The arena itself is a wide ellipse, not a circle — the field has real
 * horizontal room to stretch into elongated streams rather than staying
 * columnar — and the leash/lattice pull strength both breathe slowly
 * in and out over a multi-minute cycle, so the whole field genuinely
 * disperses toward near-empty before drawing back together, instead of
 * holding a roughly constant amount of visual density at all times.
 * Colors are a small, unevenly-weighted set (most particles share one
 * muted base tone, a minority carry a couple of subtle accents) so the
 * field reads as one organism rather than generative confetti.
 */

interface ParticleSwarmProps {
  accentColor?: string;
  isDarkMode?: boolean;
}

// A restrained, muted palette — most particles share one base tone (close
// to the site's own body-text color, for cohesion) with two subtle accent
// hues sparingly mixed in, weighted so the field reads as one biological
// system rather than confetti. Light mode reuses the same weighting with
// Solarized accents suited to the cream background.
const DARK_COLOR_PALETTE = ['#a89d8c', '#c9847a', '#8a9a8f'];
const LIGHT_COLOR_PALETTE = ['#93a1a1', '#b58900', '#6c71c4'];
const COLOR_WEIGHTS = [0.7, 0.18, 0.12];

const PALETTE = ' .·:+*'; // space + 5 density/speed intensity levels — no direction glyphs
const PALETTE_LEN = PALETTE.length;

// Wider than tall in grid units, and more so once rendered: monospace
// characters are narrower than they are high, so an equal-unit grid reads
// as portrait on screen. This ratio is tuned to read as landscape once
// rendered, giving the field room for horizontally elongated formations
// instead of the vertical/columnar look a near-square grid produces.
const WIDTH = 150;
const HEIGHT = 62;
const N = 220;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT * 0.44; // slightly above true center, closer to the hero copy

// Cucker-Smale communication weight psi(r) = CS_K / (1 + r)^CS_BETA (eq. 2.2-2.3),
// applied only within each particle's own bounded Omega_i (see file header).
const CS_K = 1;
const CS_BETA = 0.45;
const MAX_K_NEIGHBORS = 8; // upper bound used to size scratch arrays

// Anisotropy: neighbors aligned with a particle's current heading (ahead
// or behind) weigh up to 1.0x; neighbors directly to the side weigh only
// ANISO_BASE — this is what produces elongated streams instead of blobs.
// Kept low so the effect reads clearly rather than staying isotropic.
const ANISO_BASE = 0.18;

// Bounded-confidence homophily threshold for activity consensus.
const HOMOPHILY_EPSILON = 0.15;

// Separation as a soft spacing spring: repel within PREFERRED_SPACING,
// weakly attract out to LATTICE_CUTOFF — gives particles a stable
// equilibrium spacing instead of pure repulsion, which is what lets
// grid/lattice-like local patches emerge when a region happens to settle.
const PREFERRED_SPACING = 3.0;
const LATTICE_CUTOFF = 6.5;
const LATTICE_CUTOFF_SQ = LATTICE_CUTOFF * LATTICE_CUTOFF;
const LJ_STRENGTH = 0.55;
const SEPARATION_WEIGHT = 0.5; // not from the paper — practical anti-overlap/lattice term

const MAX_SPEED = 0.6;
// Elliptical, not circular — wider than tall, so the field has real room
// to stretch into horizontal formations instead of staying columnar.
const LEASH_RADIUS_X = WIDTH * 0.46;
const LEASH_RADIUS_Y = HEIGHT * 0.5;
const LEASH_WEIGHT_BASE = 0.32; // not from the paper — keeps the field on screen
// Slow global "breathing": the leash and lattice pull both fade in and out
// on a multi-minute cycle, so the whole field genuinely disperses toward
// near-empty before drawing back together, rather than holding one
// roughly-constant amount of visual density at all times.
const BREATHE_FREQ = 0.011;
const BREATHE_MIN = 0.45, BREATHE_MAX = 1.15;

// Rare per-particle "orbit" bursts around one random nearby neighbor —
// near-zero radius growth reads as a ring, faster growth as a spiral arm.
// Purely local and probabilistic, so it only reads as a pattern when
// several nearby particles happen to be orbiting at the same time.
const BURST_PROBABILITY = 0.0015; // per particle, per frame
const BURST_DURATION_MIN = 4, BURST_DURATION_MAX = 9; // seconds
const ORBIT_START_RADIUS = 2.0;
const ORBIT_RADIUS_GROWTH_MIN = 0, ORBIT_RADIUS_GROWTH_MAX = 0.5; // grid units/sec
const ORBIT_ANGULAR_SPEED_MIN = 0.5, ORBIT_ANGULAR_SPEED_MAX = 1.5; // rad/sec
const ORBIT_WEIGHT = 0.4;
const FRAME_DT = 1 / 30;

// A slow compression wave traveling across the field on a rotating axis —
// alternately pulls particles in and lets them relax back out as it passes.
const WAVE_NUMBER = 0.22;
const WAVE_SPEED = 0.28;
const WAVE_STRENGTH = 0.22;
const WAVE_DIR_ROT_SPEED = 0.008;

// Slow large-scale migration: the leash's own anchor point wanders across
// the frame on a multi-minute Lissajous-style path (two incommensurate
// frequencies so it never repeats on a short cycle) — the "10-30s+ scale"
// on top of the fast individual noise and medium neighbor-driven structure.
const DRIFT_RADIUS_X = WIDTH * 0.2;
const DRIFT_RADIUS_Y = HEIGHT * 0.22;
const DRIFT_FREQ_X = 0.045;
const DRIFT_FREQ_Y = 0.033;

// Personal-heading wander: a mean-reverting random walk on angular velocity
// (not fresh randomness every frame), so each particle's own drift is
// smooth rather than jittery.
const HEADING_KICK = 0.01;
const HEADING_DECAY = 0.02;

// Rare, independent spontaneous impulses — "something changed" moments
// that only ripple as far as a particle's own Omega_i carries them.
const IMPULSE_PROBABILITY = 0.0008; // per particle, per frame (~once every ~40s each)
const IMPULSE_KICK = 0.9;

const DENSITY_CAP = 1.25; // lower cap so more of the glyph range (. · : + *) actually gets used

interface Particles {
  px: Float32Array;
  py: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  activity: Float32Array; // u_i
  headingAngle: Float32Array; // v_T_i direction
  headingAngVel: Float32Array; // smoothed angular drift of v_T_i
  gamma: Float32Array; // per-particle velocity relaxation rate
  activityRate: Float32Array; // per-particle activity consensus rate
  turnRateLimit: Float32Array; // max radians/frame the velocity may turn
  speedMul: Float32Array; // per-particle preferred-speed multiplier
  noiseStrength: Float32Array; // per-particle heading-wander strength
  speedFluctFreq: Float32Array;
  speedFluctPhase: Float32Array;
  perceptionCount: Int32Array; // size of this particle's own Omega_i (3-8)
  colorIdx: Int32Array; // fixed color bucket, assigned at spawn
  burstAnchorIdx: Int32Array; // -1 = not currently orbiting
  burstElapsed: Float32Array;
  burstDuration: Float32Array;
  burstAngle0: Float32Array;
  burstAngularSpeed: Float32Array;
  burstRadiusGrowth: Float32Array;
  fx: Float32Array;
  fy: Float32Array;
}

function makeParticles(colorCount: number, weights?: number[]): Particles {
  // Cumulative thresholds for weighted (not even) color assignment.
  const cumWeights: number[] = [];
  if (weights && weights.length === colorCount) {
    let acc = 0;
    for (const w of weights) { acc += w; cumWeights.push(acc); }
  } else {
    for (let c = 1; c <= colorCount; c++) cumWeights.push(c / colorCount);
  }
  const pickColor = () => {
    const r = Math.random() * cumWeights[cumWeights.length - 1];
    for (let c = 0; c < cumWeights.length; c++) if (r <= cumWeights[c]) return c;
    return cumWeights.length - 1;
  };

  const px = new Float32Array(N);
  const py = new Float32Array(N);
  const vx = new Float32Array(N);
  const vy = new Float32Array(N);
  const activity = new Float32Array(N);
  const headingAngle = new Float32Array(N);
  const headingAngVel = new Float32Array(N);
  const gamma = new Float32Array(N);
  const activityRate = new Float32Array(N);
  const turnRateLimit = new Float32Array(N);
  const speedMul = new Float32Array(N);
  const noiseStrength = new Float32Array(N);
  const speedFluctFreq = new Float32Array(N);
  const speedFluctPhase = new Float32Array(N);
  const perceptionCount = new Int32Array(N);
  const colorIdx = new Int32Array(N);
  const burstAnchorIdx = new Int32Array(N);
  const burstElapsed = new Float32Array(N);
  const burstDuration = new Float32Array(N);
  const burstAngle0 = new Float32Array(N);
  const burstAngularSpeed = new Float32Array(N);
  const burstRadiusGrowth = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const r = Math.sqrt(Math.random()) * Math.min(WIDTH, HEIGHT) * 0.45;
    const a = Math.random() * Math.PI * 2;
    px[i] = CENTER_X + r * Math.cos(a);
    py[i] = CENTER_Y + r * Math.sin(a) * 0.6; // slightly flattened initial spawn
    vx[i] = 0;
    vy[i] = 0;
    activity[i] = Math.random(); // u_i(0) ~ Uniform[0,1], per the paper's consensus-model setup
    headingAngle[i] = Math.random() * Math.PI * 2;
    headingAngVel[i] = 0;

    // Personality: every particle gets its own relaxation rates, turning
    // speed, preferred speed, noise strength, and how many neighbors it
    // even perceives — no two behave identically.
    gamma[i] = 0.12 * (0.75 + Math.random() * 0.5);
    activityRate[i] = 0.08 * (0.75 + Math.random() * 0.5);
    turnRateLimit[i] = 0.1 * (0.7 + Math.random() * 0.6);
    speedMul[i] = 0.85 + Math.random() * 0.3;
    noiseStrength[i] = 0.7 + Math.random() * 0.6;
    speedFluctFreq[i] = 0.08 + Math.random() * 0.1;
    speedFluctPhase[i] = Math.random() * Math.PI * 2;
    perceptionCount[i] = 3 + Math.floor(Math.random() * 6); // 3..8
    colorIdx[i] = pickColor(); // weighted — most particles share the base tone
    burstAnchorIdx[i] = -1;
  }
  return {
    px, py, vx, vy, activity, headingAngle, headingAngVel,
    gamma, activityRate, turnRateLimit, speedMul, noiseStrength,
    speedFluctFreq, speedFluctPhase, perceptionCount, colorIdx,
    burstAnchorIdx, burstElapsed, burstDuration, burstAngle0, burstAngularSpeed, burstRadiusGrowth,
    fx: new Float32Array(N), fy: new Float32Array(N),
  };
}

const ParticleSwarm = ({ accentColor, isDarkMode = true }: ParticleSwarmProps) => {
  const colors = accentColor ? [accentColor] : (isDarkMode ? DARK_COLOR_PALETTE : LIGHT_COLOR_PALETTE);
  const preRefs = useRef<(HTMLPreElement | null)[]>([]);
  const animationRef = useRef<number>();
  const lastFrameRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  const particlesRef = useRef<Particles | null>(null);
  if (!particlesRef.current) particlesRef.current = makeParticles(colors.length, accentColor ? undefined : COLOR_WEIGHTS);

  // One density/velocity buffer set per color bucket, so each color layer
  // only draws the cells its own particles actually occupy.
  const densityRef = useRef<Float32Array[] | null>(null);
  const velSumRef = useRef<Float32Array[] | null>(null);
  if (!densityRef.current) densityRef.current = colors.map(() => new Float32Array(WIDTH * HEIGHT));
  if (!velSumRef.current) velSumRef.current = colors.map(() => new Float32Array(WIDTH * HEIGHT));

  // Activity updates are computed into a scratch buffer and applied after
  // the force pass, so every particle reads the same pre-update u values.
  const nextActivityRef = useRef<Float32Array | null>(null);
  if (!nextActivityRef.current) nextActivityRef.current = new Float32Array(N);

  // Scratch space for each particle's own nearest-neighbor set (Omega_i),
  // reused every frame instead of allocating.
  const nbrIdxRef = useRef<Int32Array | null>(null);
  const nbrDistSqRef = useRef<Float32Array | null>(null);
  if (!nbrIdxRef.current) nbrIdxRef.current = new Int32Array(MAX_K_NEIGHBORS);
  if (!nbrDistSqRef.current) nbrDistSqRef.current = new Float32Array(MAX_K_NEIGHBORS);

  const render = useCallback((timestamp: number) => {
    if (timestamp - lastFrameRef.current < 33) {
      animationRef.current = requestAnimationFrame(render);
      return;
    }
    lastFrameRef.current = timestamp;

    if (!preRefs.current[0]) {
      animationRef.current = requestAnimationFrame(render);
      return;
    }

    if (startTimeRef.current === null) startTimeRef.current = timestamp;
    const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;

    const {
      px, py, vx, vy, activity, headingAngle, headingAngVel,
      gamma, activityRate, turnRateLimit, speedMul, noiseStrength,
      speedFluctFreq, speedFluctPhase, perceptionCount,
      burstAnchorIdx, burstElapsed, burstDuration, burstAngle0, burstAngularSpeed, burstRadiusGrowth,
      fx, fy,
    } = particlesRef.current!;
    const nextActivity = nextActivityRef.current!;
    const nbrIdx = nbrIdxRef.current!;
    const nbrDistSq = nbrDistSqRef.current!;

    // Slow large-scale drift target for the leash (see file header).
    const targetCenterX = CENTER_X + Math.cos(elapsedSeconds * DRIFT_FREQ_X) * DRIFT_RADIUS_X;
    const targetCenterY = CENTER_Y + Math.sin(elapsedSeconds * DRIFT_FREQ_Y) * DRIFT_RADIUS_Y;

    // Slow global breathing: leash/lattice pull strength fades in and out
    // over a multi-minute cycle, letting the field genuinely disperse
    // toward near-empty before drawing back together (see file header).
    const breathe = BREATHE_MIN + (BREATHE_MAX - BREATHE_MIN) * (0.5 + 0.5 * Math.sin(elapsedSeconds * BREATHE_FREQ));
    const leashWeight = LEASH_WEIGHT_BASE * breathe;

    // Traveling compression wave: axis slowly rotates, wave itself sweeps
    // along that axis over time (see file header).
    const waveDirAngle = elapsedSeconds * WAVE_DIR_ROT_SPEED;
    const waveDirX = Math.cos(waveDirAngle), waveDirY = Math.sin(waveDirAngle);

    // ---- Force + activity-consensus pass: read-only over current state ----
    for (let i = 0; i < N; i++) {
      const pxi = px[i], pyi = py[i], ui = activity[i];
      const k = perceptionCount[i];

      // ---- Build Omega_i: this particle's own k nearest neighbors ----
      let nbrCount = 0;
      let worstIdx = -1, worstDist = -1;
      for (let j = 0; j < N; j++) {
        if (j === i) continue;
        const dx = pxi - px[j];
        const dy = pyi - py[j];
        const distSq = dx * dx + dy * dy;
        if (nbrCount < k) {
          nbrIdx[nbrCount] = j;
          nbrDistSq[nbrCount] = distSq;
          nbrCount++;
          if (distSq > worstDist) { worstDist = distSq; worstIdx = nbrCount - 1; }
        } else if (distSq < worstDist) {
          nbrIdx[worstIdx] = j;
          nbrDistSq[worstIdx] = distSq;
          worstDist = distSq;
          for (let m = 0; m < k; m++) {
            if (nbrDistSq[m] > worstDist) { worstDist = nbrDistSq[m]; worstIdx = m; }
          }
        }
      }

      // Current heading direction, used to weight Omega_i anisotropically
      // (ahead/behind count more than side-on) — falls back to the
      // preferred heading when nearly stationary.
      const curSpeed0 = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]);
      const headDirX = curSpeed0 > 1e-4 ? vx[i] / curSpeed0 : Math.cos(headingAngle[i]);
      const headDirY = curSpeed0 > 1e-4 ? vy[i] / curSpeed0 : Math.sin(headingAngle[i]);

      let sumWv = 0, sumVxW = 0, sumVyW = 0; // Cucker-Smale kinematic consensus, Omega_i only
      let sumUDelta = 0; // homophily-bounded activity consensus, Omega_i only
      for (let n = 0; n < nbrCount; n++) {
        const j = nbrIdx[n];
        const distSqN = nbrDistSq[n];
        const r = Math.sqrt(distSqN);
        let psi = CS_K / Math.pow(1 + r, CS_BETA);

        if (r > 1e-4) {
          const dirX = (px[j] - pxi) / r, dirY = (py[j] - pyi) / r;
          const dot = Math.abs(headDirX * dirX + headDirY * dirY);
          psi *= ANISO_BASE + (1 - ANISO_BASE) * dot;
        }

        sumWv += psi;
        sumVxW += psi * vx[j];
        sumVyW += psi * vy[j];

        if (Math.abs(activity[j] - ui) < HOMOPHILY_EPSILON) {
          sumUDelta += psi * (activity[j] - ui);
        }
      }

      // ---- Lattice spacing spring: repel closer than PREFERRED_SPACING,
      // weakly attract out to LATTICE_CUTOFF — a stable equilibrium
      // spacing rather than pure repulsion (see file header) ----
      let sepX = 0, sepY = 0;
      for (let j = 0; j < N; j++) {
        if (j === i) continue;
        const dx = pxi - px[j];
        const dy = pyi - py[j];
        const distSq = dx * dx + dy * dy;
        if (distSq < LATTICE_CUTOFF_SQ && distSq > 1e-6) {
          const r = Math.sqrt(distSq);
          let mag = LJ_STRENGTH * (PREFERRED_SPACING / r - 1);
          if (mag < 0) mag *= breathe; // only the weak attractive tail breathes; repulsion never fades
          sepX += (dx / r) * mag;
          sepY += (dy / r) * mag;
        }
      }

      // ---- Activity consensus: du_i/dt = beta_i * sum psi_ij (u_j - u_i), j in Omega_i (eq. 3.1) ----
      const newU = ui + activityRate[i] * sumUDelta;
      nextActivity[i] = newU < 0 ? 0 : newU > 1 ? 1 : newU;

      // ---- v_T_i: own preferred heading — a smoothed, mean-reverting random
      // walk on angular velocity, occasionally hit by a rare spontaneous impulse ----
      let kick = (Math.random() - 0.5) * HEADING_KICK * noiseStrength[i];
      if (Math.random() < IMPULSE_PROBABILITY) {
        kick += (Math.random() - 0.5) * IMPULSE_KICK;
      }
      headingAngVel[i] += kick - HEADING_DECAY * headingAngVel[i];
      headingAngle[i] += headingAngVel[i];
      const vTx = Math.cos(headingAngle[i]), vTy = Math.sin(headingAngle[i]);

      // ---- v_S_i: Cucker-Smale-weighted (anisotropic) heading of Omega_i (Algorithm 1 line 11) ----
      let vSx = vTx, vSy = vTy;
      if (sumWv > 1e-6) {
        const rawX = sumVxW / sumWv, rawY = sumVyW / sumWv;
        const mag = Math.sqrt(rawX * rawX + rawY * rawY);
        if (mag > 1e-6) { vSx = rawX / mag; vSy = rawY / mag; }
      }

      // ---- omega_i = (1-u_i) v_T_i + u_i v_S_i, s_i = (1+u_i)/2 (Algorithm 1 lines 10-11),
      // modulated by this particle's own preferred-speed personality and a
      // slow, independent speed fluctuation (intermittent acceleration) ----
      let omegaX = (1 - ui) * vTx + ui * vSx;
      let omegaY = (1 - ui) * vTy + ui * vSy;
      const omMag = Math.sqrt(omegaX * omegaX + omegaY * omegaY) || 1;
      omegaX /= omMag; omegaY /= omMag;
      const speedFluct = 1 + 0.15 * Math.sin(elapsedSeconds * speedFluctFreq[i] + speedFluctPhase[i]);
      const preferredSpeed = ((1 + ui) / 2) * MAX_SPEED * speedMul[i] * speedFluct;

      // ---- Center leash toward the slowly-drifting anchor (practical addition, not from the paper).
      // Elliptical (wider than tall) so the field has room to stretch horizontally. ----
      const dxC = targetCenterX - pxi;
      const dyC = targetCenterY - pyi;
      const distC = Math.sqrt(dxC * dxC + dyC * dyC) || 1e-6;
      const rNorm = Math.sqrt((dxC / LEASH_RADIUS_X) ** 2 + (dyC / LEASH_RADIUS_Y) ** 2);
      const pullMag = rNorm > 1
        ? 1 + (rNorm - 1)
        : rNorm * 0.25;
      const ux = dxC / distC, uy = dyC / distC;

      // ---- Orbit bursts: rarely, independently, orbit one random nearby
      // neighbor for a few seconds (ring if radius growth is ~0, spiral
      // arm if it grows faster) — see file header ----
      let orbitX = 0, orbitY = 0;
      if (burstAnchorIdx[i] === -1) {
        if (nbrCount > 0 && Math.random() < BURST_PROBABILITY) {
          burstAnchorIdx[i] = nbrIdx[Math.floor(Math.random() * nbrCount)];
          burstElapsed[i] = 0;
          burstDuration[i] = BURST_DURATION_MIN + Math.random() * (BURST_DURATION_MAX - BURST_DURATION_MIN);
          burstAngle0[i] = Math.random() * Math.PI * 2;
          burstAngularSpeed[i] = (ORBIT_ANGULAR_SPEED_MIN + Math.random() * (ORBIT_ANGULAR_SPEED_MAX - ORBIT_ANGULAR_SPEED_MIN)) * (Math.random() < 0.5 ? -1 : 1);
          burstRadiusGrowth[i] = ORBIT_RADIUS_GROWTH_MIN + Math.random() * (ORBIT_RADIUS_GROWTH_MAX - ORBIT_RADIUS_GROWTH_MIN);
        }
      } else {
        const anchor = burstAnchorIdx[i];
        const t = burstElapsed[i];
        const dur = burstDuration[i];
        if (t >= dur) {
          burstAnchorIdx[i] = -1;
        } else {
          const radius = ORBIT_START_RADIUS + burstRadiusGrowth[i] * t;
          const angle = burstAngle0[i] + burstAngularSpeed[i] * t;
          const targetX = px[anchor] + radius * Math.cos(angle);
          const targetY = py[anchor] + radius * Math.sin(angle);
          const odx = targetX - pxi, ody = targetY - pyi;
          const oMag = Math.sqrt(odx * odx + ody * ody) || 1e-6;
          const envelope = Math.sin(Math.PI * Math.min(1, t / dur)); // fades in/out, no hard pop
          orbitX = (odx / oMag) * envelope;
          orbitY = (ody / oMag) * envelope;
          burstElapsed[i] = t + FRAME_DT;
        }
      }

      // ---- Compression wave: sweeps along a slowly-rotating axis,
      // alternately pulling particles toward the drift anchor and
      // relaxing them back out (see file header) ----
      const waveAxisPos = pxi * waveDirX + pyi * waveDirY;
      const wave = Math.sin(waveAxisPos * WAVE_NUMBER - elapsedSeconds * WAVE_SPEED);
      const waveX = WAVE_STRENGTH * wave * ux;
      const waveY = WAVE_STRENGTH * wave * uy;

      // ---- dv_i/dt = gamma_i (s_i*omega_i - v_i) (Algorithm 1 line 12), plus lattice + leash + orbit + wave ----
      fx[i] = gamma[i] * (preferredSpeed * omegaX - vx[i]) + SEPARATION_WEIGHT * sepX + leashWeight * pullMag * ux + ORBIT_WEIGHT * orbitX + waveX;
      fy[i] = gamma[i] * (preferredSpeed * omegaY - vy[i]) + SEPARATION_WEIGHT * sepY + leashWeight * pullMag * uy + ORBIT_WEIGHT * orbitY + waveY;
    }

    // ---- Integration pass: turn-rate-limited inertia, not instant redirection ----
    for (let i = 0; i < N; i++) {
      activity[i] = nextActivity[i];

      const desiredVx = vx[i] + fx[i];
      const desiredVy = vy[i] + fy[i];
      let desiredSpeed = Math.sqrt(desiredVx * desiredVx + desiredVy * desiredVy);
      if (desiredSpeed > MAX_SPEED) desiredSpeed = MAX_SPEED;

      const curSpeed = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]);
      let newVx: number, newVy: number;

      if (curSpeed < 1e-4 || desiredSpeed < 1e-4) {
        const mag = Math.sqrt(desiredVx * desiredVx + desiredVy * desiredVy) || 1;
        newVx = (desiredVx / mag) * desiredSpeed;
        newVy = (desiredVy / mag) * desiredSpeed;
      } else {
        const curAngle = Math.atan2(vy[i], vx[i]);
        const desiredAngle = Math.atan2(desiredVy, desiredVx);
        let diff = desiredAngle - curAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const limit = turnRateLimit[i];
        if (diff > limit) diff = limit; else if (diff < -limit) diff = -limit;
        const newAngle = curAngle + diff;
        newVx = Math.cos(newAngle) * desiredSpeed;
        newVy = Math.sin(newAngle) * desiredSpeed;
      }

      vx[i] = newVx; vy[i] = newVy;

      let npx = px[i] + newVx;
      let npy = py[i] + newVy;
      if (npx < 0) npx = 0; else if (npx > WIDTH - 1) npx = WIDTH - 1;
      if (npy < 0) npy = 0; else if (npy > HEIGHT - 1) npy = HEIGHT - 1;
      px[i] = npx; py[i] = npy;
    }

    // ---- Rasterize: splat each particle into its own color bucket's buffers ----
    const densityBuckets = densityRef.current!;
    const velSumBuckets = velSumRef.current!;
    for (let c = 0; c < colors.length; c++) {
      densityBuckets[c].fill(0);
      velSumBuckets[c].fill(0);
    }

    const { colorIdx } = particlesRef.current!;
    for (let i = 0; i < N; i++) {
      const cx = Math.round(px[i]);
      const cy = Math.round(py[i]);
      const spd = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]);
      const density = densityBuckets[colorIdx[i]];
      const velSum = velSumBuckets[colorIdx[i]];

      const splat = (x: number, y: number, weight: number) => {
        if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
          const idx = x + WIDTH * y;
          density[idx] += weight;
          velSum[idx] += spd * weight;
        }
      };
      splat(cx, cy, 0.9);
      splat(cx - 1, cy, 0.25);
      splat(cx + 1, cy, 0.25);
      splat(cx, cy - 1, 0.25);
      splat(cx, cy + 1, 0.25);
    }

    // ---- Build plain text per color layer: density/speed intensity glyph only ----
    for (let c = 0; c < colors.length; c++) {
      const pre = preRefs.current[c];
      if (!pre) continue;
      const density = densityBuckets[c];
      const velSum = velSumBuckets[c];
      const lines: string[] = [];
      for (let j = 0; j < HEIGHT; j++) {
        let line = '';
        for (let i = 0; i < WIDTH; i++) {
          const idx = i + WIDTH * j;
          const d = density[idx];
          if (d <= 0) {
            line += ' ';
            continue;
          }
          const avgVel = velSum[idx] / d;
          const densityNorm = Math.min(1, d / DENSITY_CAP);
          const velNorm = Math.min(1, avgVel / MAX_SPEED);
          const intensity = Math.min(1, densityNorm * 0.8 + velNorm * 0.45);
          const ci = Math.min(PALETTE_LEN - 1, 1 + Math.round(intensity * (PALETTE_LEN - 2)));
          line += PALETTE[ci];
        }
        lines.push(line);
      }
      pre.textContent = lines.join('\n');
    }

    animationRef.current = requestAnimationFrame(render);
  }, [colors]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(render);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [render]);

  const baseStyle = {
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: 'clamp(4.5px, 0.95vw, 6.5px)',
    lineHeight: 1.0,
    letterSpacing: 0,
    userSelect: 'none' as const,
    margin: 0,
    overflow: 'visible' as const,
  };

  return (
    <div style={{ position: 'relative' }}>
      {colors.map((color, c) => (
        <pre
          key={color}
          ref={(el) => { preRefs.current[c] = el; }}
          style={{
            ...baseStyle,
            position: c === 0 ? 'relative' : 'absolute',
            top: 0,
            left: 0,
            opacity: isDarkMode ? 0.92 : 1,
            color,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleSwarm;
