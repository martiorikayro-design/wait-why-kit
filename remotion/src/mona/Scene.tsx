import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Stick, Arm, Legs, Opts, Outfit, Expr, ARM_REST_L, ARM_REST_R, LEGS_STAND, walkLegs} from '../stick/Stick';
import {Line, Shape, circlePts} from '../stick/ink';
import {INK, PAPER, CREAM, TAN, TAN_D, SAGE, SAGE_D, NAVY, BRICK, OLIVE, MUSTARD, WHITE, BROWN_D} from '../stick/style';
import {FAMILY} from '../stick/fonts';
import {Framed, GlassCase, Hooks, WallArt, Doorway, Clock, BoxCamera, Newspaper, Trunk, Candle, MoonWindow} from './props';
import CAPS from './captions.json';

/* ---------------- time helpers ---------------- */
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const inv = (a: number, b: number, x: number) => clamp((x - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ss = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);           // smootherstep
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const back = (u: number) => 1 + 2.4 * Math.pow(u - 1, 3) + 1.4 * Math.pow(u - 1, 2);
const pop = (t: number, t0: number, d = 0.25) => (t <= t0 ? 0 : back(clamp((t - t0) / d)));
const wob = (t: number, t0: number, a: number, hz = 4, dec = 7) => (t < t0 ? 0 : a * Math.exp(-dec * (t - t0)) * Math.cos(2 * Math.PI * hz * (t - t0)));
const idle = (t: number, seed: number) => 1 + 0.01 * Math.sin(t * 3.4 + seed);

/* ---------------- world anchors ---------------- */
const FLOOR = 1560;
const PAINT = {x: 540, y: 1010};
const APT = 4000; // the apartment set lives far to the right on the same plane

/* ---------------- camera: keys with smootherstep glides; hard cuts marked ---------------- */
type K = {t: number; x: number; y: number; z: number; r?: number; cut?: boolean};
const KEYS: K[] = [
  {t: 0, x: 590, y: 1110, z: 330}, {t: 2.6, x: 588, y: 1104, z: 352},
  {t: 2.84, x: 520, y: 1190, z: 150, cut: true}, {t: 6.25, x: 530, y: 1180, z: 170},
  {t: 7.0, x: 500, y: 1060, z: 445}, {t: 8.3, x: 506, y: 1066, z: 458},
  {t: 9.0, x: 470, y: 1150, z: 330}, {t: 10.4, x: 480, y: 1150, z: 330}, {t: 11.0, x: 720, y: 1170, z: 300},
  {t: 11.6, x: 640, y: 1090, z: 180}, {t: 12.45, x: 630, y: 1090, z: 200},
  {t: 12.95, x: 480, y: 1150, z: 280}, {t: 14.35, x: 490, y: 1150, z: 292},
  {t: 15.1, x: 540, y: 1230, z: 90}, {t: 16.62, x: 540, y: 1226, z: 108}, {t: 17.6, x: 540, y: 1020, z: 520},
  {t: 17.84, x: APT + 540, y: 1260, z: 300, cut: true}, {t: 19.58, x: APT + 540, y: 1236, z: 365},
  {t: 19.62, x: 560, y: 1180, z: 200, cut: true}, {t: 22.85, x: 556, y: 1160, z: 250},
  {t: 24.0, x: 540, y: 1004, z: 610, r: 4},
];
const kOf = (z: number) => 1000 / (1000 - z);
const camAt = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 1 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  if (a === b || b.cut) return {x: a.x, y: a.y, z: a.z, r: a.r ?? 0};
  const u = ss(inv(a.t, b.t, t));   // glides are their own key pairs; long pairs are slow creeps
  const k = Math.exp(lerp(Math.log(kOf(a.z)), Math.log(kOf(b.z)), u));
  return {x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: 1000 - 1000 / k, r: lerp(a.r ?? 0, b.r ?? 0, u)};
};

const Layer: React.FC<{cam: {x: number; y: number; z: number; r: number}; z: number; children: React.ReactNode}> = ({cam, z, children}) => {
  const d = z - cam.z;
  if (d < 200) return null;
  const k = 1000 / d;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g transform={`translate(540 960) rotate(${cam.r}) scale(${k}) translate(${-cam.x} ${-cam.y})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- sets ---------------- */
const Gallery: React.FC<{t: number; night: number}> = ({t, night}) => (
  <g>
    <rect x={-800} y={200} width={2700} height={1360} fill="#E3D7BC" />
    {[-260, 120, 980, 1360].map((x, i) => <Line key={i} pts={[[x, 470], [x + 2, 1380]]} w={4} seed={60 + i} taper={0.8} color={TAN_D} />)}
    <rect x={-800} y={1380} width={2700} height={180} fill={SAGE} />
    <Line pts={[[-800, 1380], [1900, 1384]]} w={7} seed={2} taper={0.95} />
    <Line pts={[[-800, 470], [1900, 466]]} w={8} seed={3} taper={0.95} />
    <Line pts={[[-800, 440], [1900, 436]]} w={4} seed={4} taper={0.95} color={TAN_D} />
    <rect x={-800} y={FLOOR} width={2700} height={900} fill={TAN} />
    {[1600, 1660, 1740, 1840, 1960].map((y, i) => <Line key={i} pts={[[-800, y], [1900, y + 2]]} w={3} seed={70 + i} taper={0.9} color={TAN_D} />)}
    <Line pts={[[-800, FLOOR], [1900, FLOOR + 2]]} w={8} seed={5} taper={0.95} />
    <g transform={`translate(120 ${FLOOR})`}><Doorway seed={11} /></g>
    <g transform={`translate(980 ${FLOOR})`}><Doorway seed={13} /></g>
    <g transform="translate(-180 1000)"><WallArt w={170} h={120} kind="land" seed={21} /></g>
    <g transform="translate(290 860)"><WallArt w={90} h={70} kind="still" seed={23} /></g>
    <g transform="translate(790 860)"><WallArt w={80} h={110} kind="portrait" seed={25} /></g>
    <g transform="translate(1240 1000)"><WallArt w={160} h={120} kind="land" seed={27} /></g>
    <g transform="translate(980 700)"><Clock t={t} speed={night > 0 ? 6 : 0.02} seed={31} /></g>
    <g transform={`translate(${PAINT.x} ${PAINT.y})`}><Hooks seed={41} /></g>
  </g>
);

const Apartment: React.FC<{t: number}> = ({t}) => {
  const open = ss(inv(18.72, 19.05, t)) * 0.9;
  const peek = inv(19.0, 19.2, t);
  return (
    <g transform={`translate(${APT} 0)`}>
      <rect x={-500} y={300} width={2100} height={1260} fill="#3A4560" />
      <rect x={-500} y={FLOOR} width={2100} height={900} fill="#5B4636" />
      {[1640, 1740, 1880].map((y, i) => <Line key={i} pts={[[-500, y], [1600, y + 3]]} w={3.5} seed={80 + i} taper={0.9} color="#3E3026" />)}
      <Line pts={[[-500, FLOOR], [1600, FLOOR + 2]]} w={8} seed={6} taper={0.95} />
      <g transform="translate(250 960)"><MoonWindow seed={91} /></g>
      <path d="M 170 1120 L 330 1120 L 700 1560 L -120 1560 Z" fill="#EFE3C2" opacity={0.09} />
      <g transform={`translate(560 ${FLOOR})`}>
        <Trunk open={open} seed={95} />
        {peek > 0 && (
          <g transform={`translate(-10 -150) scale(${peek})`}>
            <rect x={-60} y={-14} width={120} height={22} fill="#1A1714" />
            <ellipse cx={-14} cy={-3} rx={9} ry={7} fill={WHITE} /><ellipse cx={16} cy={-3} rx={9} ry={7} fill={WHITE} />
            <circle cx={-12 + Math.sin(t * 3) * 2} cy={-2} r={3.6} fill={INK} /><circle cx={18 + Math.sin(t * 3) * 2} cy={-2} r={3.6} fill={INK} />
          </g>
        )}
      </g>
      <g transform={`translate(860 ${FLOOR})`}><Candle t={t} seed={97} /></g>
    </g>
  );
};

/* ---------------- the painting through the story ---------------- */
const Painting: React.FC<{t: number}> = ({t}) => {
  const onWall = (t < 2.23) || (t >= 2.84 && t < 8.53) || t >= 19.62;
  if (onWall) {
    const s = t < 2.84 ? 1 + wob(t, 1.19, 0.03, 5, 6) - (t > 2.23 ? 1 : 0) : 1;
    const out = t >= 2.23 && t < 2.84 ? 0 : 1;
    const smile = t > 23.07 ? 3 * easeOut(inv(23.07, 23.4, t)) : 0;
    const look = t > 22.9 ? 0 : t > 19.62 ? 0.4 * Math.sin(t * 1.3) : 0;
    const shine = t > 6.5 && t < 8.4 ? ((t - 6.5) * 0.7) % 1 : 0;
    const sc = t >= 2.0 && t < 2.23 ? 1 : s;
    const vanish = t >= 2.23 && t < 2.45 ? 1 - easeOut(inv(2.23, 2.4, t)) : out;
    return (
      <g transform={`translate(${PAINT.x} ${PAINT.y}) scale(${sc * vanish})`}>
        <Framed look={look} smile={smile} seed={51} />
        <GlassCase shine={shine} seed={53} />
      </g>
    );
  }
  return null;
};

/* ---------------- actors ---------------- */
type Pose = {x: number; y: number; outfit: Outfit; expr: Expr; armL?: Arm; armR?: Arm; legs?: Legs; look?: number; sx?: number; sy?: number; rot?: number; opts?: Opts; back?: boolean; s?: number; flip?: boolean; prop?: boolean; hatLift?: number};
const Actor: React.FC<{p: Pose; seed: number; t: number}> = ({p, seed, t}) => {
  const s = p.s ?? 1;
  const by = idle(t, seed);
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot ?? 0}) scale(${s * (p.flip ? -1 : 1) * (p.sx ?? 1)} ${s * (p.sy ?? 1) * by})`}>
      <ellipse cx={0} cy={4} rx={70} ry={10} fill="rgba(60,45,30,0.18)" />
      <Stick outfit={p.outfit} expr={p.expr} armL={p.armL} armR={p.armR} legs={p.legs} look={p.look} seed={seed}
        opts={{...p.opts, hatLift: p.hatLift}} back={p.back} prop={p.prop ?? false} />
    </g>
  );
};

const SNEAK_L: Arm = {elbow: [-70, -372], hand: [-26, -414]};
const SNEAK_R: Arm = {elbow: [70, -372], hand: [26, -414]};
const UP_L: Arm = {elbow: [-104, -470], hand: [-116, -540]};
const UP_R: Arm = {elbow: [104, -470], hand: [116, -540]};
const HOLD_L: Arm = {elbow: [-96, -330], hand: [-128, -280]};
const HOLD_R: Arm = {elbow: [96, -330], hand: [128, -280]};

const heldY = (t: number) => PAINT.y - 30 * ss(inv(8.53, 8.66, t)) + (FLOOR - 290 - PAINT.y + 30) * ss(inv(8.8, 9.25, t));
const handyman = (t: number): (Pose & {bundle?: boolean; held?: boolean}) | null => {
  if (t < 2.95 || t > 10.98) return null;
  if (t < 6.42) {
    const u = inv(2.95, 5.6, t);
    const x = lerp(120, 360, u);
    const walking = t < 5.6;
    const fix = t > 5.53 && t < 6.2;
    return {x, y: FLOOR, outfit: 'smock', expr: 'smug', look: 0.6, armL: SNEAK_L, armR: fix ? {elbow: [70, -390], hand: [24, -446]} : SNEAK_R,
      legs: walking ? walkLegs((t - 2.95) * 1.8, 0.8) : LEGS_STAND, sy: walking ? 1 - 0.03 * Math.abs(Math.sin((t - 2.95) * Math.PI * 1.8)) : 1};
  }
  if (t < 8.4) {
    const a = (t - 6.42) * Math.PI * 2 * 2.6;
    return {x: 330, y: FLOOR, outfit: 'smock', expr: 'happy', look: 1, armL: ARM_REST_L,
      armR: {elbow: [96, -420], hand: [150 + 14 * Math.cos(a), -470 + 12 * Math.sin(a)]}, sy: 1 + 0.01 * Math.sin(a)};
  }
  if (t < 9.45) {
    if (t < 8.53) {
      return {x: 330, y: FLOOR, outfit: 'smock', expr: 'smug', look: 1, armL: ARM_REST_L,
        armR: {elbow: [112, -478], hand: [182, -522]}, sy: 1 - 0.03 * ss(inv(8.4, 8.5, t))};
    }
    const hy = heldY(t) - FLOOR;
    const hand: [number, number] = [74, hy];
    const elbow: [number, number] = [50 + (hand[0] - 50) / 2 + 46, -416 + (hand[1] + 416) / 2 + 10];
    return {x: 330, y: FLOOR, outfit: 'smock', expr: 'happy', look: 1, armL: ARM_REST_L, armR: {elbow, hand}, held: true,
      sy: 1 + wob(t, 8.53, 0.05, 5, 8) + wob(t, 9.25, 0.04, 5, 8)};
  }
  const walking = t > 10.31;
  const x = walking ? lerp(330, 1240, ss(inv(10.31, 10.95, t))) : 330;
  return {x, y: FLOOR, outfit: 'shirt', expr: 'smug', look: 0.8, armL: ARM_REST_L, armR: {elbow: [96, -356], hand: [122, -300]}, bundle: true,
    legs: walking ? walkLegs((t - 10.31) * 3.2, 1) : LEGS_STAND, sy: 1 + wob(t, 9.45, 0.07, 5, 8)};
};

const guard = (t: number): Pose | null => {
  if (t < 12.48 || t > 14.4) return null;
  const walking = t < 13.05;
  const x = lerp(120, 390, ss(inv(12.48, 13.05, t)));
  const shrug = t > 13.21;
  return {x, y: FLOOR, outfit: 'guard', expr: shrug ? 'smug' : 'neutral', look: 0.7,
    armL: shrug ? {elbow: [-104, -372], hand: [-128, -432]} : ARM_REST_L, armR: shrug ? {elbow: [104, -372], hand: [128, -432]} : ARM_REST_R,
    legs: walking ? walkLegs((t - 12.48) * 2.2, 0.9) : LEGS_STAND, sy: 1 + wob(t, 13.21, 0.05, 4, 7)};
};

const CROWD: {x: number; opts: Opts; s: number}[] = [
  {x: 150, opts: {coat: NAVY, hat: 'bowler'}, s: 0.86}, {x: 270, opts: {coat: BRICK, hat: 'cloche', dress: true}, s: 0.8},
  {x: 390, opts: {coat: OLIVE, hat: 'boater'}, s: 0.88}, {x: 520, opts: {coat: SAGE_D, hat: 'none'}, s: 0.84},
  {x: 650, opts: {coat: '#6E5A7A', hat: 'cloche', dress: true}, s: 0.8}, {x: 780, opts: {coat: BROWN_D, hat: 'bowler'}, s: 0.9},
  {x: 905, opts: {coat: NAVY, hat: 'boater'}, s: 0.84},
];
const crowdPose = (t: number, i: number, final: boolean): Pose | null => {
  const c = CROWD[i];
  if (!final && (t < 14.46 || t > 17.84)) return null;
  if (final && t < 19.62) return null;
  const from = i % 2 ? 1300 : -260;
  const arrive = final ? 1 : ss(inv(14.5 + i * 0.07, 15.35 + i * 0.07, t));
  const part = final ? 0 : ss(inv(16.8, 17.5, t));
  const x = lerp(from, c.x, arrive) + Math.sign(c.x - 540) * 520 * part;
  const walking = !final && arrive < 1;
  const lean = !final && t > 16.38 ? easeOut(inv(16.38, 16.6, t)) : 0;
  return {x, y: 1700 + (i % 2) * 22, outfit: 'visitor', expr: 'neutral', back: true, s: c.s, opts: c.opts,
    legs: walking ? walkLegs(t * 2.4 + i * 0.3, 0.8) : LEGS_STAND, sy: 1 - 0.03 * lean, rot: (i % 2 ? 1 : -1) * 1.5 * lean,
    armL: final && i % 3 === 0 ? {elbow: [-80, -440], hand: [-60, -520]} : ARM_REST_L};
};

/* ---------------- the host: the channel's detective, drawn in screen space ---------------- */
const Host: React.FC<{t: number}> = ({t}) => {
  let p: {x: number; y: number; s: number; flip: boolean; expr: Expr; armL: Arm; armR: Arm; prop: boolean; hat: number; enter: number} | null = null;
  if (t < 2.84) {
    const shocked = t > 2.23;
    p = {x: 820, y: 1990, s: 1.28, flip: true, expr: shocked ? 'shock' : 'happy', armL: ARM_REST_L,
      armR: {elbow: [104, -352], hand: [112, -420]}, prop: true, hat: shocked ? 34 * Math.max(0, 1 - Math.abs(wob(t, 2.23, 1, 3, 4)) * 0) * easeOut(inv(2.23, 2.32, t)) : 0, enter: 1};
  } else if (t > 11.05 && t < 12.5) {
    const up = Math.min(ss(inv(11.05, 11.3, t)), 1 - ss(inv(12.2, 12.45, t)));
    p = {x: 230, y: 2010 + 520 * (1 - up), s: 1.05, flip: false, expr: 'shock', armL: {elbow: [-108, -378], hand: [-134, -444]},
      armR: {elbow: [108, -378], hand: [134, -444]}, prop: false, hat: 18, enter: up};
  } else if (t > 19.62) {
    const pointing = t > 22.93;
    p = {x: 240, y: 2000, s: 1.1, flip: false, expr: pointing ? 'happy' : 'smug', armL: ARM_REST_L,
      armR: pointing ? {elbow: [112, -430], hand: [172, -478]} : ARM_REST_R, prop: false, hat: 0, enter: ss(inv(19.62, 19.9, t))};
  }
  if (!p) return null;
  const by = 1 + 0.012 * Math.sin(t * 3.1);
  const squash = 1 + wob(t, 2.23, 0.06, 5, 7) + wob(t, 22.93, 0.05, 5, 7);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', overflow: 'visible'}}>
        <g transform={`translate(${p.x} ${p.y + (1 - p.enter) * 300}) scale(${p.s * (p.flip ? -1 : 1)} ${p.s * by * squash})`}>
          <Stick outfit="detective" expr={p.expr} armL={p.armL} armR={p.armR} prop={p.prop} seed={7} opts={{hatLift: p.hat}} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- small effects ---------------- */
const FlashBurst: React.FC<{x: number; y: number; t: number; t0: number; s?: number}> = ({x, y, t, t0, s = 1}) => {
  if (t < t0 || t > t0 + 0.3) return null;
  const u = (t - t0) / 0.3;
  const r = 30 + 50 * easeOut(u);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (1 - u * 0.4)})`} opacity={1 - u * 0.8}>
      <Shape pts={circlePts(0, 0, 24 * (1 - u), 3, 10, 0.2)} fill={WHITE} w={4} seed={3} />
      {Array.from({length: 8}).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <Line key={i} pts={[[Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7], [Math.cos(a) * r, Math.sin(a) * r]]} w={6} seed={i} taper={0.5} />;
      })}
    </g>
  );
};

const Poof: React.FC<{x: number; y: number; t: number; t0: number}> = ({x, y, t, t0}) => {
  if (t < t0 || t > t0 + 0.42) return null;
  const u = (t - t0) / 0.42;
  const puffs = [[-90, -40, 70], [0, -90, 84], [92, -30, 72], [-50, 60, 66], [60, 70, 70], [0, 10, 96]];
  return (
    <g transform={`translate(${x} ${y})`} opacity={1 - ss(inv(0.55, 1, u))}>
      {puffs.map(([dx, dy, r], i) => (
        <Shape key={i} pts={circlePts(dx * (0.6 + 0.6 * easeOut(u)), dy * (0.6 + 0.6 * easeOut(u)), r * (0.5 + 0.7 * easeOut(Math.min(1, u * 2.2))), i, 10, 0.12)}
          fill={WHITE} w={6} seed={i + 3} />
      ))}
    </g>
  );
};

const ThoughtBubble: React.FC<{t: number}> = ({t}) => {
  const s = Math.min(pop(t, 13.42, 0.3), 1 - inv(14.2, 14.35, t));
  if (s <= 0) return null;
  return (
    <g>
      {[[470, 1010, 12], [520, 960, 18]].map(([x, y, r], i) => <Shape key={i} pts={circlePts(x, y, r * s, i, 8)} fill={WHITE} w={5} seed={i} />)}
      <g transform={`translate(700 820) scale(${s})`}>
        <Shape pts={circlePts(0, 0, 130, 7, 12, 0.05)} fill={WHITE} w={7} seed={7} />
        <g transform="translate(0 -20) scale(0.95)"><BoxCamera flash={t > 13.75 && t < 14.1 ? easeOut(inv(13.75, 13.9, t)) : 0} seed={9} /></g>
      </g>
    </g>
  );
};

const Bundle: React.FC = () => (
  <g>
    <Shape pts={[[-70, -95], [64, -100], [80, 90], [-76, 96]]} fill="#F3EEE2" w={7} seed={5} />
    <Line pts={[[-60, -40], [60, 20]]} w={4} seed={6} taper={0.6} color={TAN_D} />
    <Line pts={[[-50, 40], [66, -30]]} w={4} seed={7} taper={0.6} color={TAN_D} />
    <Shape pts={[[56, -102], [92, -126], [96, -100], [74, -86]]} fill="#F3EEE2" w={5} seed={8} />
  </g>
);

/* ---------------- captions ---------------- */
type Chunk = {start: number; end: number; words: {text: string; at: number}[]};
const Captions: React.FC<{t: number}> = ({t}) => {
  const chunks = CAPS as Chunk[];
  const idx = chunks.findIndex((c) => t >= c.start && t < c.end);
  if (idx < 0) return null;
  const c = chunks[idx];
  const s = idx === 0 ? 1 : 0.86 + 0.14 * pop(t, c.start, 0.16);
  let active = -1;
  c.words.forEach((w, i) => { if (t >= w.at - 0.03) active = i; });
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 245, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center'}}>
      <div style={{maxWidth: 900, textAlign: 'center', transform: `scale(${s})`, filter: `drop-shadow(0px 7px 0px ${INK})`}}>
        {c.words.map((w, i) => {
          const on = i === active;
          return (
            <span key={i} style={{display: 'inline-block', margin: '0 0.17em', fontFamily: FAMILY, fontWeight: 700, fontSize: 80, lineHeight: 1.1,
              letterSpacing: '0.03em', color: on ? MUSTARD : CREAM, WebkitTextStroke: `16px ${INK}`, paintOrder: 'stroke fill',
              transform: `scale(${on ? 1 + 0.1 * Math.min(1, pop(t, w.at - 0.03, 0.12)) : 1})`, transformOrigin: '50% 60%'}}>{w.text}</span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------- the film ---------------- */
export const MONA_FRAMES = 720;
export type SceneProps = {muted?: boolean; hideCaptions?: boolean; hideHost?: boolean};
export const MonaLisaShort: React.FC<SceneProps> = ({muted = false, hideCaptions = false, hideHost = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cam = camAt(t);
  const hm = handyman(t);
  const gd = guard(t);
  const night = t > 11.1 && t < 12.4 ? Math.sin(Math.PI * inv(11.1, 12.4, t)) : 0;
  const flash = [2.84, 17.84, 19.62].reduce((m, c) => Math.max(m, t >= c && t < c + 0.2 ? 1 - (t - c) / 0.2 : 0), 0);
  const final = t >= 19.62;
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <Layer cam={cam} z={1000}>
        <Gallery t={t} night={night} />
        <Painting t={t} />
        {t < 2.84 && [[380, 830, 1.19], [700, 760, 1.32], [420, 1180, 1.45], [690, 1150, 1.6]].map(([x, y, t0], i) => (
          <FlashBurst key={i} x={x} y={y} t={t} t0={t0} s={0.9} />
        ))}
        {hm && (
          <g>
            {hm.held && (
              <g transform={`translate(${PAINT.x} ${heldY(t)}) scale(${1 - 0.08 * ss(inv(8.8, 9.25, t))})`}>
                <Framed seed={51} /><GlassCase seed={53} />
              </g>
            )}
            {hm.bundle && <g transform={`translate(${hm.x + 150} ${FLOOR - 300}) rotate(6) scale(1.25)`}><Bundle /></g>}
            <Actor p={hm} seed={17} t={t} />
            <Poof x={430} y={FLOOR - 330} t={t} t0={9.42} />
          </g>
        )}
        {gd && <Actor p={gd} seed={23} t={t} />}
        <ThoughtBubble t={t} />
        {night > 0 && <rect x={-800} y={200} width={2700} height={2300} fill="#1B2440" opacity={0.5 * night} />}
        <Apartment t={t} />
      </Layer>
      <Layer cam={cam} z={850}>
        {CROWD.map((_, i) => {
          const p = crowdPose(t, i, false) ?? crowdPose(t, i, true);
          return p ? <Actor key={i} p={p} seed={100 + i} t={t} /> : null;
        })}
        {t > 15.0 && t < 16.5 && (
          <g transform={`translate(${lerp(-200, 1300, inv(15.0, 16.5, t))} ${1120 + 60 * Math.sin(t * 6)}) rotate(${t * 220})`}><Newspaper seed={61} /></g>
        )}
        {final && [[230, 1080, 20.7], [610, 1040, 21.1], [860, 1090, 21.5], [420, 1060, 21.95], [740, 1030, 22.4], [300, 1050, 22.75]].map(([x, y, t0], i) => (
          <FlashBurst key={i} x={x} y={y} t={t} t0={t0} />
        ))}
      </Layer>
      {!hideHost && <Host t={t} />}
      {flash > 0 && <AbsoluteFill style={{background: WHITE, opacity: flash}} />}
      {!hideCaptions && <Captions t={t} />}
      <Img src={staticFile('stick/paper.png')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, mixBlendMode: 'multiply'}} />
      {!muted && <Audio src={staticFile('mona/mix.wav')} />}
    </AbsoluteFill>
  );
};
