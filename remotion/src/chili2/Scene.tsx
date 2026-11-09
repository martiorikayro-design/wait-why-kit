import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Stick, Arm, Expr, ARM_REST_L, ARM_REST_R, LEGS_STAND, walkLegs} from '../stick/Stick';
import {Line, Shape, circlePts, ellPts} from '../stick/ink';
import {INK, CREAM, TAN, TAN_D, SAGE, SAGE_D, MUSTARD, WHITE, NAVY, DUST} from '../stick/style';
import {FAMILY} from '../stick/fonts';
import {
  Chili, ChiliPlant, PERCH, Bird, BirdEyes, Mouse, MousePose, CutoutFlame, Thermometer, Alarm, CapKey, KeyMood, HumanTongue, BirdTongue,
  Seed, Dropping, Sprout, Cactus, Rock, Cloud, Steam, Tears, Sparkle, Hills, GrassTuft, SKY, CHILI, GREY,
} from './props';
import CAPS from './captions.json';

/* ---------------- time helpers ---------------- */
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const inv = (a: number, b: number, x: number) => clamp((x - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ss = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const back = (u: number) => 1 + 2.4 * Math.pow(u - 1, 3) + 1.4 * Math.pow(u - 1, 2);
const pop = (t: number, t0: number, d = 0.25) => (t <= t0 ? 0 : back(clamp((t - t0) / d)));
const wob = (t: number, t0: number, a: number, hz = 4, dec = 7) => (t < t0 ? 0 : a * Math.exp(-dec * (t - t0)) * Math.cos(2 * Math.PI * hz * (t - t0)));

/* word onsets (composition seconds; the voice starts at 0.1 s) */
const T = {
  eat: 0.6, make: 1.53, cry: 1.89, feel: 2.41, nothing: 2.65, burn1: 3.48, isnt: 3.75, real: 4.0, heat: 4.29,
  caps1: 4.9, tricking: 5.7, sensor: 6.11, warns: 6.76, burns: 7.6, birds2: 8.7, have: 8.98, caps2: 9.75, cant: 10.5, trick: 10.78, theirs: 11.03,
  helps: 11.9, pepper: 12.3, burn2: 13.0, scares: 13.29, off: 13.7, which: 14.26, chew: 14.5, seeds: 14.8, bits: 15.3,
  birds3: 16.26, swallow: 16.56, whole: 17.15, poop: 17.59, out: 17.98, ready: 18.22, grow: 18.53, end: 18.88,
};
export const CHILI_DUR = 20.2;

/* ---------------- world anchors ---------------- */
const GROUND = 1560;
const GUY = {x: 300, y: GROUND};
const PLANT = {x: 760, y: GROUND};
const BIRD_PERCH = {x: PLANT.x + PERCH[0], y: PLANT.y + PERCH[1]};
const FALLEN = {x: 1000, y: GROUND};
const SPROUT = {x: 1500, y: GROUND};
const TONGUE_H = {x: 4000, y: 1000};
const TONGUE_B = {x: 5600, y: 1000};
const NIBBLE = {x: 7200, y: GROUND};
const ALARM_H = {x: TONGUE_H.x + 180, y: 1150};
const ALARM_B = {x: TONGUE_B.x + 180, y: 1150};

/* ---------------- camera ---------------- */
type K = {t: number; x: number; y: number; z: number; r?: number; cut?: boolean};
const KEYS: K[] = [
  {t: 0, x: 540, y: 1150, z: 300}, {t: 1.45, x: 520, y: 1140, z: 315}, {t: 1.75, x: 430, y: 1080, z: 380}, {t: 2.3, x: 425, y: 1078, z: 392},
  {t: 2.6, x: 770, y: 1170, z: 420}, {t: 3.25, x: 772, y: 1168, z: 432},
  {t: 3.6, x: 340, y: 1020, z: 560}, {t: 4.6, x: 346, y: 1016, z: 578},
  {t: 4.65, x: TONGUE_H.x, y: 1000, z: 300, cut: true}, {t: 6.0, x: TONGUE_H.x + 30, y: 1010, z: 330},
  {t: 6.5, x: ALARM_H.x - 30, y: 990, z: 470}, {t: 8.12, x: ALARM_H.x - 24, y: 986, z: 492},
  {t: 8.6, x: TONGUE_B.x, y: 1000, z: 330}, {t: 9.9, x: TONGUE_B.x + 20, y: 1000, z: 345},
  {t: 10.35, x: ALARM_B.x - 60, y: 990, z: 450}, {t: 11.4, x: ALARM_B.x - 54, y: 986, z: 468},
  {t: 11.45, x: 760, y: 1150, z: 330, cut: true}, {t: 12.6, x: 790, y: 1170, z: 345},
  {t: 13.1, x: 900, y: 1290, z: 420}, {t: 14.15, x: 930, y: 1300, z: 440},
  {t: 14.2, x: NIBBLE.x, y: 1330, z: 430, cut: true}, {t: 15.7, x: NIBBLE.x, y: 1318, z: 470},
  {t: 15.74, x: 790, y: 1160, z: 470, cut: true}, {t: 17.4, x: 800, y: 1160, z: 480},
  {t: 18.0, x: 1450, y: 1300, z: 420}, {t: 18.9, x: 1460, y: 1300, z: 445},
  {t: 19.7, x: 1100, y: 1190, z: 280}, {t: 20.2, x: 1090, y: 1186, z: 286},
];
const kOf = (z: number) => 1000 / (1000 - z);
const camAt = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 1 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  if (a === b || b.cut) return {x: a.x, y: a.y, z: a.z, r: a.r ?? 0};
  const u = ss(inv(a.t, b.t, t));
  const k = Math.exp(lerp(Math.log(kOf(a.z)), Math.log(kOf(b.z)), u));
  return {x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: 1000 - 1000 / k, r: lerp(a.r ?? 0, b.r ?? 0, u)};
};

const Layer: React.FC<{cam: {x: number; y: number; z: number; r: number}; z: number; children: React.ReactNode}> = ({cam, z, children}) => {
  const d = z - cam.z;
  if (d < 150) return null;
  const k = 1000 / d;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g transform={`translate(540 960) rotate(${cam.r}) scale(${k}) translate(${-cam.x} ${-cam.y})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- the guy who eats the chili ---------------- */
const GuyActor: React.FC<{t: number}> = ({t}) => {
  if (t > 4.64) return null;
  const bit = t > T.make;
  const burning = t > T.cry;
  const expr: Expr = burning ? 'shock' : bit ? 'surprised' : 'happy';
  const raise = ss(inv(0.9, 1.45, t));
  const armR: Arm = burning
    ? {elbow: [96, -370], hand: [118, -300]}
    : {elbow: [lerp(84, 96, raise), lerp(-330, -420, raise)], hand: [lerp(96, 40, raise), lerp(-300, -500, raise)]};
  const armL: Arm = burning ? {elbow: [-104, -470], hand: [-120, -560]} : ARM_REST_L;
  const flush = burning ? easeOut(inv(T.cry, T.cry + 0.3, t)) : 0;
  const hop = burning ? Math.abs(Math.sin((t - T.cry) * 10)) * 12 * Math.exp(-(t - T.cry) * 1.2) : 0;
  return (
    <g transform={`translate(${GUY.x} ${GUY.y - hop})`}>
      <ellipse cx={0} cy={4 + hop} rx={70} ry={10} fill="rgba(60,45,30,0.18)" />
      <g transform={`scale(1 ${1 + 0.01 * Math.sin(t * 3.4) + wob(t, T.make, 0.04, 6, 8)})`}>
        <Stick outfit="hoodie" expr={expr} armL={armL} armR={armR} legs={LEGS_STAND} seed={41} look={burning ? 0 : 0.3} opts={{flush}} />
      </g>
      {!burning && <g transform={`translate(${armR.hand[0] + 6} ${armR.hand[1] - 6}) rotate(${lerp(140, 200, raise)})`}><Chili s={0.8} bite={bit ? 1 : 0} seed={5} /></g>}
      {burning && <g transform={`translate(${armR.hand[0] + 6} ${armR.hand[1] + 4}) rotate(150)`}><Chili s={0.8} bite={1} seed={5} /></g>}
      <Tears t={t} t0={T.cry} x={0} y={-570} />
      <Steam t={t} t0={T.cry + 0.1} x={0} y={-700} />
      {t > 3.3 && (
        <g transform={`translate(30 -494) rotate(78) scale(${0.5 * pop(t, 3.3, 0.22)})`}>
          <CutoutFlame t={t} flip={ss(inv(T.real, T.real + 0.28, t))} seed={9} />
        </g>
      )}
      {t > T.isnt - 0.05 && (
        <g transform={`translate(-150 -380) rotate(-8) scale(${0.7 * pop(t, T.isnt - 0.05, 0.25)})`}>
          <Thermometer level={0.3 + 0.02 * Math.sin(t * 8)} ok={pop(t, T.heat - 0.1, 0.25)} seed={13} />
        </g>
      )}
    </g>
  );
};

/* ---------------- the bird ---------------- */
type BirdState = {x: number; y: number; eyes: BirdEyes; beak: number; wing: number; fly: boolean; bulge: number; hold: boolean; shrug: number; s: number; flip?: boolean};
const birdAt = (t: number): BirdState | null => {
  const base: BirdState = {x: BIRD_PERCH.x, y: BIRD_PERCH.y, eyes: 'open', beak: 0, wing: 0, fly: false, bulge: -1, hold: false, shrug: 0, s: 0.8};
  if (t < 3.3) {
    const gulp = inv(T.eat, T.eat + 0.35, t);
    const smug = t > T.feel;
    return {...base, hold: t < T.eat + 0.05, beak: t < T.eat + 0.15 ? 0.6 : 0, bulge: gulp > 0 && gulp < 1 ? gulp : -1,
      eyes: t > T.eat && t < 1.4 ? 'happy' : smug ? 'smug' : 'open', shrug: smug ? Math.sin(Math.PI * inv(T.nothing, T.nothing + 0.5, t)) : 0};
  }
  if (t >= 11.45 && t < 14.2) {
    const peck = t < 12.6 ? Math.max(0, Math.sin((t - 11.45) * 9)) : 0;
    return {...base, beak: peck * 0.7, eyes: t > T.helps ? 'happy' : 'open'};
  }
  if (t >= 15.74 && t < 17.45) {
    const sw = inv(T.swallow, T.swallow + 0.5, t);
    return {...base, s: 0.9, hold: t > T.birds3 - 0.1 && t < T.swallow + 0.05, beak: t > T.birds3 - 0.1 && t < T.swallow + 0.15 ? 0.8 : 0,
      bulge: sw > 0 && sw < 1 ? sw : -1, eyes: t > T.swallow + 0.3 ? 'happy' : 'wide'};
  }
  if (t >= 17.45) {
    const u = inv(17.45, 18.3, t);
    const land = inv(18.95, 19.4, t);
    const flyX = lerp(BIRD_PERCH.x, SPROUT.x + 120, ss(u));
    const flyY = lerp(BIRD_PERCH.y, 1120, Math.sin(Math.PI * 0.5 * u)) + (t > 18.3 ? lerp(0, SPROUT.y - 1120, ss(land)) : 0);
    const flying = land < 1;
    return {...base, s: 0.9, x: t > 18.3 ? SPROUT.x + 150 : flyX, y: flyY, fly: flying, wing: flying ? Math.sin(t * 26) : 0, eyes: 'happy', flip: false};
  }
  return null;
};

/* ---------------- the mouse ---------------- */
const mouseAt = (t: number): {x: number; y: number; pose: MousePose; s: number} | null => {
  if (t < 12.3 || t > 14.15) return null;
  if (t < 12.85) return {x: lerp(1330, FALLEN.x + 110, ss(inv(12.3, 12.85, t))), y: GROUND, pose: 'walk', s: 0.9};
  if (t < T.scares) return {x: FALLEN.x + 110, y: GROUND, pose: t > T.burn2 ? 'bite' : 'walk', s: 0.9};
  if (t < T.off) return {x: FALLEN.x + 110, y: GROUND - 70 * Math.sin(Math.PI * inv(T.scares, T.scares + 0.36, t)), pose: 'burn', s: 0.9};
  return {x: lerp(FALLEN.x + 110, 1900, easeOut(inv(T.off, T.off + 0.5, t))), y: GROUND, pose: 'run', s: 0.9};
};

/* ---------------- sets ---------------- */
const Garden: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect x={-1200} y={GROUND} width={4200} height={1000} fill={TAN} />
    {[1600, 1680, 1800, 1950].map((y, i) => <Line key={i} pts={[[-1200, y], [3000, y + 4]]} w={3} seed={70 + i} taper={0.9} color={TAN_D} />)}
    <Line pts={[[-1200, GROUND], [3000, GROUND + 3]]} w={8} seed={5} taper={0.95} />
    <g transform={`translate(-60 ${GROUND})`}><Cactus seed={3} /></g>
    <g transform={`translate(1180 ${GROUND})`}><Rock w={150} h={80} seed={8} /></g>
    <g transform={`translate(1880 ${GROUND})`}><Cactus seed={12} /></g>
    <g transform={`translate(${PLANT.x} ${PLANT.y})`}><ChiliPlant t={t} glint={t > T.pepper && t < 13.0 ? Math.sin(Math.PI * inv(T.pepper, 13.0, t)) : 0} happy={t > T.helps && t < 12.8 ? 1 : 0} seed={21} /></g>
    {t < 13.0 && <g transform={`translate(${FALLEN.x} ${GROUND - 12}) rotate(-80)`}><Chili s={0.75} seed={33} /></g>}
    {t >= 13.0 && <g transform={`translate(${FALLEN.x} ${GROUND - 12}) rotate(-80)`}><Chili s={0.75} bite={1} seed={33} /></g>}
    {[[PLANT.x - 120, 0.2], [PLANT.x + 60, 0.5], [PLANT.x + 160, 0.8]].map(([x, d], i) => (
      <Sparkle key={i} x={x} y={1240 - i * 50} s={t > T.helps ? Math.max(0, Math.sin(Math.PI * inv(T.helps + d * 0.4, T.helps + d * 0.4 + 0.5, t))) * 0.9 : 0} seed={i} />
    ))}
    {/* the dropping + sprout */}
    {t > T.poop && t < T.out && <g transform={`translate(${SPROUT.x} ${lerp(1150, GROUND, inv(T.poop, T.out, t) ** 2)})`}><Dropping splat={0} seed={4} /></g>}
    {t >= T.out && <g transform={`translate(${SPROUT.x} ${GROUND})`}><g transform={`scale(${1 + wob(t, T.out, 0.2, 6, 9)} ${1 - wob(t, T.out, 0.2, 6, 9)})`}><Dropping splat={1} seed={4} /></g></g>}
    <g transform={`translate(${SPROUT.x + 10} ${GROUND - 20})`}>
      <Sprout t={t} g={t < T.ready ? 0 : 0.45 * back(inv(T.ready, T.ready + 0.3, t)) + 0.55 * ss(inv(T.grow, T.grow + 0.45, t))} pod={back(inv(T.grow + 0.3, T.grow + 0.6, t))} seed={9} />
    </g>
  </g>
);

const Sky: React.FC = () => (
  <g>
    <rect x={-2400} y={-1200} width={8000} height={2600} fill={SKY} />
    <g transform="translate(1230 560)"><Shape pts={circlePts(0, 0, 80, 3, 14)} fill="#E7C46C" w={6} seed={3} /></g>
    <g transform="translate(-200 330)"><Cloud s={0.9} seed={5} /></g>
    <g transform="translate(560 200)"><Cloud s={0.7} seed={6} /></g>
    <g transform="translate(1500 300)"><Cloud s={1} seed={7} /></g>
    <g transform="translate(0 1340)"><Hills seed={9} /></g>
  </g>
);

const MouthSets: React.FC<{t: number}> = ({t}) => {
  const ringH = t > T.warns && t < 8.2 ? 1 : 0;
  const lampH = ringH && Math.sin(t * 22) > -0.2 ? 1 : 0;
  // capsaicin key in the human mouth
  const kx = t < T.tricking ? lerp(TONGUE_H.x - 420, ALARM_H.x - 260, ss(inv(T.caps1, T.caps1 + 0.6, t))) : lerp(ALARM_H.x - 260, ALARM_H.x - 112, ss(inv(T.tricking, T.tricking + 0.3, t)));
  const turn = t > 6.05 && t < 6.6 ? Math.cos((t - 6.05) * 14) : 1;
  const moodH: KeyMood = t > T.warns ? 'happy' : 'sneaky';
  // capsaicin key in the bird's beak: tries, bonks, gives up
  const bonk = T.cant + 0.05;
  const kbx = t < bonk ? lerp(TONGUE_B.x - 420, ALARM_B.x - 112, ss(inv(T.caps2, bonk, t))) : ALARM_B.x - 112 - 120 * easeOut(inv(bonk, bonk + 0.3, t)) + 40 * ss(inv(bonk + 0.45, T.trick + 0.15, t)) - 40 * easeOut(inv(T.trick + 0.15, T.trick + 0.35, t));
  const moodB: KeyMood = t < bonk ? 'sneaky' : t < T.theirs ? 'dizzy' : 'sad';
  const bend = t > bonk ? Math.min(1, inv(bonk, bonk + 0.08, t)) * 0.7 : 0;
  return (
    <g>
      <g transform={`translate(${TONGUE_H.x} ${TONGUE_H.y})`}><HumanTongue seed={3} /></g>
      <g transform={`translate(${ALARM_H.x} ${ALARM_H.y}) scale(${1 + wob(t, T.sensor, 0.05, 5, 7)})`}><Alarm t={t} ring={ringH} lamp={lampH} hole="round" seed={5} /></g>
      {t > T.caps1 && t < 8.3 && (
        <g transform={`translate(${kx} ${ALARM_H.y - 96 + (t < T.tricking ? Math.abs(Math.sin(t * 9)) * -16 : 0)}) scale(${t > 6.0 ? 0.92 : 1} ${turn})`}><CapKey t={t} mood={moodH} seed={7} /></g>
      )}
      {t > T.burns - 0.05 && t < 8.3 && (
        <g transform={`translate(${ALARM_H.x} ${ALARM_H.y - 330}) scale(${0.7 * pop(t, T.burns - 0.05, 0.25)})`}><CutoutFlame t={t} seed={11} /></g>
      )}
      <g transform={`translate(${TONGUE_B.x} ${TONGUE_B.y})`}><BirdTongue seed={13} /></g>
      <g transform={`translate(${ALARM_B.x} ${ALARM_B.y}) scale(${1 + wob(t, T.have, 0.08, 5, 6)})`}><Alarm t={t} hole="star" feather seed={15} /></g>
      {t > T.caps2 && t < 11.45 && (
        <g transform={`translate(${kbx} ${ALARM_B.y - 86 + (t < bonk ? Math.abs(Math.sin(t * 9)) * -16 : 0)}) rotate(${t > bonk ? -14 * easeOut(inv(bonk, bonk + 0.2, t)) : 0})`}><CapKey t={t} mood={moodB} bend={bend} seed={17} /></g>
      )}
      {t > bonk && t < bonk + 0.25 && (
        <g transform={`translate(${ALARM_B.x + 40} ${ALARM_B.y - 86}) scale(${easeOut(inv(bonk, bonk + 0.25, t)) * 1.4})`} opacity={1 - inv(bonk, bonk + 0.25, t)}>
          {Array.from({length: 8}).map((_, i) => { const a = (i / 8) * Math.PI * 2; return <Line key={i} pts={[[Math.cos(a) * 30, Math.sin(a) * 30], [Math.cos(a) * 60, Math.sin(a) * 60]]} w={6} seed={i} taper={0.5} />; })}
        </g>
      )}
    </g>
  );
};

const NibbleSet: React.FC<{t: number}> = ({t}) => {
  const chew = t > T.chew ? Math.abs(Math.sin((t - T.chew) * 14)) : 0;
  const burst = inv(T.bits, T.bits + 0.45, t);
  return (
    <g transform={`translate(${NIBBLE.x} 0)`}>
      <rect x={-900} y={0} width={1800} height={GROUND} fill="#D9CCAD" />
      <rect x={-900} y={GROUND} width={1800} height={900} fill={TAN} />
      <Line pts={[[-900, GROUND], [900, GROUND + 3]]} w={8} seed={4} taper={0.95} />
      {[[-300, 0], [260, 0]].map(([x], i) => <g key={i} transform={`translate(${x} ${GROUND})`}><GrassTuft seed={i * 7} /></g>)}
      <g transform={`translate(30 ${GROUND}) scale(1.25)`}><Mouse t={t} pose="chew" cheeks={chew} seed={23} /></g>
      {t < T.bits && <g transform={`translate(-30 ${GROUND - 176})`}><Seed s={1.5} seed={3} /></g>}
      {[[-150, 0], [-120, 1], [-185, 2], [-140, 3]].map(([x, i]) => (
        <g key={i} transform={`translate(${x} ${GROUND - 14 - (i % 2) * 18}) scale(${pop(t, T.seeds + i * 0.06, 0.2)})`}><Seed s={1.3} seed={10 + i} /></g>
      ))}
      {burst > 0 && burst < 1 && Array.from({length: 9}).map((_, i) => {
        const a = -Math.PI / 2 + (i - 4) * 0.32;
        const r = 40 + 260 * easeOut(burst);
        return <g key={i} transform={`translate(${-30 + Math.cos(a) * r} ${GROUND - 176 + Math.sin(a) * r + 300 * burst * burst}) rotate(${i * 40 + burst * 200})`}><Seed s={1.1} broken seed={i} /></g>;
      })}
      {t > T.bits + 0.3 && [[-60, 0], [10, 1], [80, 2]].map(([x, i]) => <g key={i} transform={`translate(${x} ${GROUND - 8})`}><Seed s={1} broken seed={i + 20} /></g>)}
    </g>
  );
};

/* ---------------- the host detective (screen space) ---------------- */
const Host: React.FC<{t: number}> = ({t}) => {
  type H = {x: number; y: number; s: number; flip: boolean; expr: Expr; armL: Arm; armR: Arm; prop: boolean; hat: number; enter: number; xray?: boolean};
  let p: H | null = null;
  if (t < 3.3) {
    const out = 1 - ss(inv(3.05, 3.3, t));
    const surprised = t > T.nothing;
    p = {x: 600, y: 2020, s: 0.95, flip: true, expr: surprised ? 'surprised' : t > T.cry ? 'worried' : 'happy', armL: ARM_REST_L,
      armR: {elbow: [104, -352], hand: [112, -420]}, prop: true, hat: surprised ? 26 * easeOut(inv(T.nothing, T.nothing + 0.1, t)) * (1 - inv(T.nothing + 0.3, T.nothing + 0.5, t)) : 0, enter: Math.min(1, out)};
  } else if (t > 4.05 && t < 4.64) {
    const up = Math.min(ss(inv(4.05, 4.25, t)), 1 - ss(inv(4.45, 4.64, t)));
    p = {x: 860, y: 2010, s: 0.95, flip: true, expr: 'surprised', armL: ARM_REST_L, armR: {elbow: [104, -352], hand: [112, -420]}, prop: true, hat: 14, enter: up};
  } else if (t > 10.7 && t < 11.45) {
    const up = Math.min(ss(inv(10.7, 10.92, t)), 1 - ss(inv(11.25, 11.45, t)));
    p = {x: 230, y: 2010, s: 1.0, flip: false, expr: 'happy', armL: ARM_REST_L, armR: {elbow: [100, -440], hand: [96, -540]}, prop: false, hat: 0, enter: up};
  } else if (t > 16.95 && t < 17.62) {
    const up = Math.min(ss(inv(16.95, 17.12, t)), 1 - ss(inv(17.45, 17.62, t)));
    p = {x: 860, y: 2040, s: 1.0, flip: true, expr: 'surprised', armL: ARM_REST_L, armR: {elbow: [112, -470], hand: [150, -566]}, prop: false, hat: 16, enter: up};
  } else if (t > 19.0) {
    const pointing = t > 19.5;
    p = {x: 250, y: 2000, s: 1.0, flip: false, expr: pointing ? 'happy' : 'smug', armL: ARM_REST_L,
      armR: pointing ? {elbow: [112, -430], hand: [172, -478]} : ARM_REST_R, prop: false, hat: 0, enter: ss(inv(19.0, 19.3, t))};
  }
  if (!p) return null;
  const by = 1 + 0.012 * Math.sin(t * 3.1);
  const sq = 1 + wob(t, T.nothing, 0.06, 5, 7) + wob(t, 10.92, 0.05, 5, 7) + wob(t, 19.5, 0.05, 5, 7);
  const lensX = p.armR.hand[0] + 24, lensY = p.armR.hand[1] - 86;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', overflow: 'visible'}}>
        <defs><clipPath id="xr"><circle cx={lensX} cy={lensY} r={32} /></clipPath></defs>
        <g transform={`translate(${p.x} ${p.y + (1 - p.enter) * 420}) scale(${p.s * (p.flip ? -1 : 1)} ${p.s * by * sq})`}>
          <Stick outfit="detective" expr={p.expr} armL={p.armL} armR={p.armR} prop={p.prop} seed={7} opts={{hatLift: p.hat}} />
          {p.xray && (
            <g>
              <g clipPath="url(#xr)">
                <circle cx={lensX} cy={lensY} r={34} fill="#2F4A5C" />
                <g transform={`translate(${lensX - 2} ${lensY - 30}) rotate(20) scale(0.42)`}><Chili seed={3} /></g>
                {[[-6, -8], [4, 2], [-2, 12]].map(([dx, dy], i) => <circle key={i} cx={lensX + dx} cy={lensY + dy} r={3.4} fill={CREAM} stroke={INK} strokeWidth={1.5} />)}
              </g>
              <circle cx={lensX} cy={lensY} r={34} fill="none" stroke={INK} strokeWidth={6} />
            </g>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

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
export type SceneProps = {muted?: boolean; hideCaptions?: boolean; hideHost?: boolean};
export const ChiliShort: React.FC<SceneProps> = ({muted = false, hideCaptions = false, hideHost = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cam = camAt(t);
  const bird = birdAt(t);
  const mouse = mouseAt(t);
  const flash = [4.65, 11.45, 14.2, 15.74].reduce((m, c) => Math.max(m, t >= c && t < c + 0.18 ? 1 - (t - c) / 0.18 : 0), 0);
  const inMouth = t >= 4.65 && t < 11.45;
  return (
    <AbsoluteFill style={{background: SKY}}>
      {!inMouth && <Layer cam={cam} z={1500}><Sky /></Layer>}
      <Layer cam={cam} z={1000}>
        {!inMouth && t < 14.2 || t >= 15.74 ? <Garden t={t} /> : null}
        {inMouth && <MouthSets t={t} />}
        {t >= 14.2 && t < 15.74 && <NibbleSet t={t} />}
        {!inMouth && t < 14.2 && <GuyActor t={t} />}
        {bird && !inMouth && (
          <g transform={`translate(${bird.x} ${bird.y}) scale(${bird.s * (bird.flip === false && bird.fly ? -1 : 1)} ${bird.s})`}>
            <Bird t={t} eyes={bird.eyes} beak={bird.beak} wing={bird.wing} fly={bird.fly} bulge={bird.bulge} hold={bird.hold} shrug={bird.shrug} seed={31} />
          </g>
        )}
        {t > 16.95 && t < 17.62 && (() => {
          const sc = Math.min(back(inv(16.95, 17.15, t)), 1 - ss(inv(17.45, 17.62, t)));
          const bx = BIRD_PERCH.x - 6, by = BIRD_PERCH.y - 62;
          return (
            <g transform={`translate(${bx} ${by}) scale(${Math.max(0, sc)})`}>
              <defs><clipPath id="xray"><circle cx={0} cy={0} r={58} /></clipPath></defs>
              <Line pts={[[40, 40], [118, 118]]} w={16} seed={3} taper={0.8} color="#5E4430" />
              <g clipPath="url(#xray)">
                <circle cx={0} cy={0} r={60} fill="#2F4A5C" />
                <g transform="translate(-6 -44) rotate(16) scale(0.62)"><Chili seed={3} /></g>
                {[[-10, -6], [6, 8], [-2, 24], [12, -14]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={5.5} fill={CREAM} stroke={INK} strokeWidth={2} />)}
              </g>
              <circle cx={0} cy={0} r={60} fill="none" stroke={INK} strokeWidth={9} />
              <Line pts={[[-30, -40], [-12, -52]]} w={6} seed={4} taper={0.6} color={WHITE} />
            </g>
          );
        })()}
        {mouse && (
          <g transform={`translate(${mouse.x} ${mouse.y}) scale(${mouse.s})`}>
            <Mouse t={t} pose={mouse.pose} seed={51} />
            {mouse.pose === 'burn' && <Steam t={t} t0={T.scares} x={-70} y={-140} n={3} />}
          </g>
        )}
        {t > T.off && t < T.off + 0.6 && (
          <g transform={`translate(${FALLEN.x + 160} ${GROUND - 30})`} opacity={1 - inv(T.off, T.off + 0.6, t)}>
            {[[-40, -10, 30], [0, -30, 38], [40, -8, 30]].map(([x, y, r], i) => <Shape key={i} pts={circlePts(x * (1 + inv(T.off, T.off + 0.6, t)), y, r * (0.6 + inv(T.off, T.off + 0.6, t)), i, 9)} fill={CREAM} w={4} seed={i} />)}
          </g>
        )}
      </Layer>
      {!inMouth && t < 14.2 && (
        <Layer cam={cam} z={820}>
          <g transform={`translate(${-80} ${GROUND + 40})`}><GrassTuft seed={3} /></g>
          <g transform={`translate(${1260} ${GROUND + 60})`}><Rock w={170} h={70} seed={4} fill="#8F8A80" /></g>
          <g transform={`translate(${1720} ${GROUND + 40})`}><GrassTuft seed={8} /></g>
        </Layer>
      )}
      {!hideHost && <Host t={t} />}
      {flash > 0 && <AbsoluteFill style={{background: WHITE, opacity: flash}} />}
      {!hideCaptions && <Captions t={t} />}
      <Img src={staticFile('stick/paper.png')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, mixBlendMode: 'multiply'}} />
      {!muted && <Audio src={staticFile('chili2/mix.wav')} />}
    </AbsoluteFill>
  );
};
