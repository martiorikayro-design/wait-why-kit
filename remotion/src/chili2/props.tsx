import React from 'react';
import {Line, P, Shape, circlePts, ellPts} from '../stick/ink';
import {INK, CREAM, TAN, TAN_D, SAGE, SAGE_D, OLIVE, OLIVE_D, MUSTARD, MUSTARD_D, WHITE, DUST, NAVY, NAVY_D, BROWN, BROWN_D, GLASS, BRICK} from '../stick/style';

/** Props for "Birds can eat chilies" (detective remake), hand-inked stickman style. */
export const CHILI = '#B8432F';
export const CHILI_D = '#8F3324';
export const ROSE = '#C98D86';
export const ROSE_D = '#A86B65';
export const MOUTH = '#4E2C2C';
export const GREY = '#A19C93';
export const GREY_D = '#7C776F';
export const PINK = '#DDAA9E';
export const SKY = '#E8DDC4';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const rot = (p: P, a: number): P => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];

/** A chili pepper hanging from its cap. Origin = top of the cap; the pod curls down and to the right. */
export const Chili: React.FC<{s?: number; bite?: number; seed?: number; glint?: number}> = ({s = 1, bite = 0, seed = 1, glint = 0}) => {
  const pod: P[] = bite > 0.5
    ? [[-15, 6], [-19, 34], [-15, 66], [-6, 92], [2, 88], [-2, 98], [8, 96], [12, 86], [16, 60], [18, 26], [14, 6]]
    : [[-15, 6], [-19, 34], [-15, 72], [-5, 112], [9, 140], [22, 152], [20, 132], [15, 98], [17, 58], [18, 24], [14, 6]];
  return (
    <g transform={`scale(${s})`}>
      <Shape pts={pod} fill={CHILI} w={5} seed={seed} />
      <Line pts={[[-7, 22], [-9, 56], [-3, 86]]} w={4} seed={seed + 1} taper={0.5} color="#D8735C" />
      <Shape pts={[[-20, 8], [-10, -4], [0, 2], [10, -4], [20, 8], [8, 14], [-8, 14]]} fill={OLIVE} w={4} seed={seed + 2} />
      <Line pts={[[0, -2], [-2, -22], [6, -34]]} w={5} seed={seed + 3} taper={0.6} color={OLIVE_D} />
      {glint > 0 && <Line pts={[[-12, 30], [-12, 48]]} w={5 * glint} seed={seed + 4} taper={0.3} color={WHITE} />}
    </g>
  );
};

/** Chili plant. Origin = ground at the stem. `slots` = where pods hang (world offsets). */
export const PLANT_PODS: P[] = [[-118, -250], [-44, -328], [64, -300], [126, -214], [-150, -148], [40, -176]];
export const PERCH: P = [20, -372];
export const ChiliPlant: React.FC<{t: number; pods?: boolean[]; seed?: number; glint?: number; happy?: number}> = ({t, pods, seed = 1, glint = 0, happy = 0}) => {
  const sway = Math.sin(t * 1.7) * 2 + happy * Math.sin(t * 9) * 4;
  const leaves: [number, number, number, number][] = [[-90, -210, 46, -0.6], [-150, -120, 40, -0.3], [90, -250, 48, 0.5], [140, -170, 42, 0.3],
    [-40, -300, 44, -0.9], [60, -350, 40, 0.8], [-110, -300, 38, -0.4], [20, -230, 36, 0.2], [150, -270, 34, 0.7], [-20, -150, 34, -0.2]];
  return (
    <g transform={`rotate(${sway * 0.4} 0 0)`}>
      <Line pts={[[0, 0], [-6, -120], [4, -240], [20, -372]]} w={13} seed={seed} taper={0.7} color={OLIVE_D} />
      <Line pts={[[-4, -150], [-80, -200], [-140, -150]]} w={8} seed={seed + 1} taper={0.7} color={OLIVE_D} />
      <Line pts={[[2, -200], [80, -240], [126, -214]]} w={8} seed={seed + 2} taper={0.7} color={OLIVE_D} />
      <Line pts={[[6, -260], [-40, -310], [-44, -328]]} w={7} seed={seed + 3} taper={0.7} color={OLIVE_D} />
      <Line pts={[[12, -300], [60, -300], [64, -300]]} w={7} seed={seed + 4} taper={0.7} color={OLIVE_D} />
      {leaves.map(([x, y, r, a], i) => (
        <Shape key={i} pts={ellPts(x, y, r, r * 0.46, 12, a + Math.sin(t * 2 + i) * 0.05)} fill={i % 3 ? SAGE : SAGE_D} w={4.5} seed={seed + 10 + i} />
      ))}
      {PLANT_PODS.map(([x, y], i) => (pods ? pods[i] : true) && (
        <g key={i} transform={`translate(${x} ${y}) rotate(${(i % 2 ? -8 : 10) + Math.sin(t * 2.2 + i) * 3})`}>
          <Chili s={i === 4 ? 0.85 : 0.75} seed={seed + 30 + i} glint={glint} />
        </g>
      ))}
    </g>
  );
};

/** Round songbird facing LEFT. Origin = feet. Body centre (0,-86). */
export type BirdEyes = 'open' | 'happy' | 'smug' | 'wide';
export const Bird: React.FC<{t: number; eyes?: BirdEyes; beak?: number; wing?: number; fly?: boolean; bulge?: number; hold?: boolean; seed?: number; shrug?: number}> = ({
  t, eyes = 'open', beak = 0, wing = 0, fly = false, bulge = -1, hold = false, seed = 1, shrug = 0,
}) => {
  const bob = fly ? 0 : Math.sin(t * 5) * 2;
  const wa = fly ? wing : -0.15 + shrug * 0.9;
  const wingPts = (a: number): P[] => [[10, -112], [70, -112 - 60 * a], [120, -100 - 110 * a], [96, -66 - 40 * a], [40, -64]];
  return (
    <g transform={`translate(0 ${bob})`}>
      {!fly && (
        <g>
          <Line pts={[[-14, -26], [-18, 0]]} w={5} seed={seed} color={MUSTARD_D} />
          <Line pts={[[14, -26], [12, 0]]} w={5} seed={seed + 1} color={MUSTARD_D} />
          <Line pts={[[-32, 2], [-4, 0]]} w={4} seed={seed + 2} color={MUSTARD_D} />
          <Line pts={[[-2, 2], [26, 0]]} w={4} seed={seed + 3} color={MUSTARD_D} />
        </g>
      )}
      <Shape pts={[[56, -106], [132, -138], [126, -104], [142, -80], [62, -72]]} fill={NAVY_D} w={5} seed={seed + 4} />
      <Shape pts={circlePts(0, -86, 72, seed, 14, 0.02)} fill={NAVY} w={6.5} seed={seed + 5} />
      <Shape pts={ellPts(-14, -66, 46, 40, 12)} fill={CREAM} w={4} seed={seed + 6} />
      {bulge >= 0 && bulge <= 1 && <Shape pts={ellPts(-40 + bulge * 34, -112 + bulge * 66, 20, 16)} fill={NAVY} w={4} seed={seed + 7} />}
      {hold && (
        <g transform="translate(-94 -126) rotate(70)"><Chili s={0.62} seed={seed + 8} /></g>
      )}
      {/* beak: upper + lower jaw */}
      <Shape pts={[[-60, -128], [-112, -112 - beak * 10], [-60, -104]]} fill={MUSTARD} w={4.5} seed={seed + 9} />
      <Shape pts={[[-60, -108], [-104, -104 + beak * 22], [-62, -94]]} fill={MUSTARD_D} w={4.5} seed={seed + 10} />
      {eyes === 'open' && <ellipse cx={-32} cy={-120} rx={7} ry={10} fill={INK} />}
      {eyes === 'wide' && <g><circle cx={-32} cy={-122} r={15} fill={WHITE} stroke={INK} strokeWidth={4} /><circle cx={-35} cy={-122} r={6} fill={INK} /></g>}
      {eyes === 'happy' && <Line pts={[[-44, -116], [-32, -128], [-20, -116]]} w={5} seed={seed + 11} taper={0.3} />}
      {eyes === 'smug' && <g><ellipse cx={-32} cy={-118} rx={7} ry={6} fill={INK} /><Line pts={[[-44, -124], [-20, -127]]} w={4.5} seed={seed + 12} taper={0.5} /></g>}
      <Line pts={[[-48, -146], [-34, -152], [-18, -146]]} w={4} seed={seed + 13} taper={0.3} />
      <Shape pts={wingPts(wa)} fill={NAVY_D} w={5} seed={seed + 14} />
      {fly && <Shape pts={wingPts(-wa * 0.7).map(([x, y]) => [x - 40, y + 4] as P)} fill={NAVY_D} w={4} seed={seed + 15} />}
    </g>
  );
};

/** Little grey mouse facing LEFT. Origin = ground. */
export type MousePose = 'walk' | 'bite' | 'burn' | 'run' | 'chew';
export const Mouse: React.FC<{t: number; pose: MousePose; seed?: number; cheeks?: number}> = ({t, pose, seed = 1, cheeks = 0}) => {
  const step = Math.sin(t * 22);
  const run = pose === 'run';
  const sit = pose === 'chew';
  const red = pose === 'burn' || run;
  const hx = sit ? -26 : -74, hy = sit ? -150 : -70;
  return (
    <g>
      <Line pts={sit ? [[40, -30], [110, -20], [150, -60], [170, -40]] : [[60, -50], [120, -60 + step * 6], [170, -30], [200, -50]]} w={5} seed={seed} taper={0.85} color={GREY_D} />
      {!sit && [[-40, 0], [-14, 0], [24, 0], [48, 0]].map(([x], i) => (
        <Line key={i} pts={[[x, -20], [x + (run ? (i % 2 ? 22 : -22) : (i % 2 ? step : -step) * 8), 0]]} w={5} seed={seed + 1 + i} color={GREY_D} />
      ))}
      <Shape pts={sit ? ellPts(10, -80, 52, 70) : ellPts(6, -52, 74, 44)} fill={GREY} w={6} seed={seed + 6} />
      {sit && <Shape pts={ellPts(4, -64, 30, 40)} fill="#C2BDB3" w={3.5} seed={seed + 7} />}
      <g transform={`translate(${hx} ${hy})`}>
        <Shape pts={circlePts(14, -40, 22, seed, 10)} fill={GREY} w={5} seed={seed + 8} />
        <Shape pts={circlePts(14, -40, 11, seed, 8)} fill={PINK} w={3} seed={seed + 9} />
        <Shape pts={[[-30, -6], [-6, -34], [30, -32], [40, 0], [20, 22], [-14, 16]]} fill={GREY} w={5.5} seed={seed + 10} />
        {cheeks > 0 && <Shape pts={circlePts(14, 4, 12 + cheeks * 10, seed, 10)} fill={GREY} w={4} seed={seed + 11} />}
        {red && <Shape pts={[[-26, -4], [-6, -28], [26, -26], [34, -2], [18, 16], [-12, 12]]} fill={CHILI} w={0.1} seed={seed + 12} />}
        <Shape pts={circlePts(-34, -4, 7, seed, 8)} fill={PINK} w={3} seed={seed + 13} />
        {pose === 'burn' || run
          ? <g><circle cx={-4} cy={-16} r={11} fill={WHITE} stroke={INK} strokeWidth={3.5} /><circle cx={-7} cy={-16} r={4.5} fill={INK} /></g>
          : <ellipse cx={-6} cy={-16} rx={5} ry={7} fill={INK} />}
        {[[-26, 0, -58, -8], [-26, 4, -56, 10]].map(([x0, y0, x1, y1], i) => <Line key={i} pts={[[x0, y0], [x1, y1]]} w={2.5} seed={seed + 14 + i} taper={0.7} />)}
        {(pose === 'bite' || pose === 'burn' || run) && <Shape pts={ellPts(-18, 10, 9, 7)} fill={MOUTH} w={3} seed={seed + 16} />}
      </g>
    </g>
  );
};

/** Cardboard flame on a stick: flip 0 = painted front, 1 = plain back (it's fake!). Origin = stick bottom. */
export const CutoutFlame: React.FC<{t: number; flip?: number; seed?: number}> = ({t, flip = 0, seed = 1}) => {
  const sx = Math.cos(Math.PI * clamp(flip));
  const back = sx < 0;
  const wob = back ? 0 : Math.sin(t * 18) * 3;
  const outer: P[] = [[-70, -60], [-82, -150], [-52, -220], [-40, -170], [-16, -270], [10, -190], [36, -250], [44, -170], [76, -200], [82, -120], [70, -60], [0, -40]];
  const inner: P[] = [[-36, -70], [-40, -130], [-18, -170], [-6, -140], [12, -190], [26, -130], [40, -150], [40, -90], [30, -66], [0, -58]];
  return (
    <g>
      <Line pts={[[0, 0], [0, -60]]} w={10} seed={seed} color={BROWN_D} />
      <g transform={`scale(${Math.max(0.04, Math.abs(sx))} 1) translate(${wob} 0)`}>
        <Shape pts={outer} fill={back ? TAN : CHILI} w={6} seed={seed + 1} />
        {!back && <Shape pts={inner} fill={MUSTARD} w={4} seed={seed + 2} />}
        {back && <Line pts={[[-30, -110], [30, -150]]} w={5} seed={seed + 3} taper={0.6} color={TAN_D} />}
        {back && <Shape pts={[[-20, -96], [20, -96], [20, -80], [-20, -80]]} fill="#D9CDB0" w={3} seed={seed + 4} />}
      </g>
    </g>
  );
};

/** Thermometer: origin = bulb centre; level 0..1. */
export const Thermometer: React.FC<{level: number; seed?: number; ok?: number}> = ({level, seed = 1, ok = 0}) => (
  <g>
    <Shape pts={[[-16, -20], [-16, -230], [-8, -246], [8, -246], [16, -230], [16, -20]]} fill={GLASS} w={5} seed={seed} />
    <rect x={-6} y={-20 - 200 * level} width={12} height={200 * level} fill={CHILI} />
    <Shape pts={circlePts(0, 0, 28, seed, 12)} fill={CHILI} w={5} seed={seed + 1} />
    {[0.2, 0.4, 0.6, 0.8].map((v, i) => <Line key={i} pts={[[16, -20 - 200 * v], [30, -20 - 200 * v]]} w={3} seed={seed + 2 + i} />)}
    {ok > 0 && <g transform={`translate(-74 -150) scale(${ok})`}>
      <Shape pts={circlePts(0, 0, 40, seed, 12)} fill={SAGE} w={5} seed={seed + 8} />
      <Line pts={[[-18, 2], [-4, 16], [20, -14]]} w={8} seed={seed + 9} taper={0.2} color={WHITE} />
    </g>}
  </g>
);

/** The pain sensor, drawn as a little alarm: bell + lamp + keyhole. Origin = bottom centre. */
export const Alarm: React.FC<{t: number; ring?: number; lamp?: number; hole?: 'round' | 'star'; feather?: boolean; seed?: number}> = ({
  t, ring = 0, lamp = 0, hole = 'round', feather = false, seed = 1,
}) => {
  const sh = ring * Math.sin(t * 60) * 5;
  return (
    <g transform={`translate(${sh} 0)`}>
      <Shape pts={[[-90, 0], [-90, -150], [90, -150], [90, 0]]} fill={CREAM} w={7} seed={seed} />
      <g transform={`rotate(${ring * Math.sin(t * 48) * 14} 0 -150)`}>
        <Shape pts={[[-46, -150], [-42, -196], [-20, -224], [20, -224], [42, -196], [46, -150]]} fill={MUSTARD} w={6} seed={seed + 1} />
        <Shape pts={circlePts(0, -232, 10, seed, 8)} fill={MUSTARD_D} w={4} seed={seed + 2} />
      </g>
      <Shape pts={circlePts(-44, -86, 24, seed, 10)} fill={lamp > 0.5 ? '#E2593F' : DUST} w={5} seed={seed + 3} />
      {lamp > 0.5 && <circle cx={-44} cy={-86} r={44} fill="#E2593F" opacity={0.25} />}
      {hole === 'round'
        ? <path d="M 34,-110 a 16,16 0 1,1 0.1,0 Z M 26,-98 L 42,-98 L 46,-56 L 22,-56 Z" fill={INK} transform="translate(0 0)" />
        : <path d={'M 40,-118 ' + Array.from({length: 10}).map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const r = i % 2 ? 9 : 22; return `L ${40 + r * Math.cos(a)},${-86 + r * Math.sin(a)}`; }).join(' ') + ' Z'} fill={INK} />}
      {feather && <g transform="translate(70 -150) rotate(30)"><Shape pts={ellPts(0, -30, 12, 34)} fill={NAVY} w={4} seed={seed + 5} /></g>}
      {ring > 0.1 && [[-120, -200, -150, -230], [120, -200, 150, -230], [-130, -150, -170, -150], [130, -150, 170, -150]].map(([a, b, c, d], i) => (
        <Line key={i} pts={[[a, b], [c, d]]} w={6} seed={seed + 10 + i} taper={0.5} />
      ))}
    </g>
  );
};

/** Capsaicin as a sneaky key in a robber's mask. Origin = centre of the bow (the round head). Blade points right. */
export type KeyMood = 'sneaky' | 'happy' | 'dizzy' | 'sad';
export const CapKey: React.FC<{t: number; mood?: KeyMood; bend?: number; seed?: number}> = ({t, mood = 'sneaky', bend = 0, seed = 1}) => {
  const blade: P[] = [[34, -12], [150, -12 - bend * 30], [150, 12 - bend * 30], [34, 12]];
  return (
    <g>
      <Shape pts={blade} fill={CHILI_D} w={5} seed={seed} />
      {[70, 100, 128].map((x, i) => <Shape key={i} pts={[[x, 10 - bend * 30 * (x - 34) / 116], [x + 14, 10 - bend * 30 * (x - 34) / 116], [x + 10, 30 - bend * 30 * (x - 34) / 116], [x + 2, 30 - bend * 30 * (x - 34) / 116]]} fill={CHILI_D} w={4} seed={seed + 1 + i} />)}
      <Shape pts={circlePts(0, 0, 46, seed, 12)} fill={CHILI} w={6} seed={seed + 5} />
      <Shape pts={[[-48, -16], [48, -16], [46, 6], [-46, 6]]} fill={NAVY_D} w={3} seed={seed + 6} />
      {mood === 'dizzy'
        ? [-18, 18].map((x, i) => <Line key={i} pts={[[x - 7, -10], [x + 7, 0], [x - 7, 2]]} w={3.5} seed={seed + 7 + i} color={WHITE} />)
        : [-18, 18].map((x, i) => <g key={i}><ellipse cx={x} cy={-5} rx={8} ry={6} fill={WHITE} /><circle cx={x + (mood === 'sneaky' ? 3 * Math.sin(t * 3) : 0)} cy={-5} r={3.5} fill={INK} /></g>)}
      {mood === 'happy' || mood === 'sneaky'
        ? <Line pts={[[-14, 22], [0, mood === 'happy' ? 32 : 26], [16, 20]]} w={4} seed={seed + 9} taper={0.3} />
        : <Line pts={[[-14, 30], [0, 22], [14, 30]]} w={4} seed={seed + 9} taper={0.3} />}
      {mood === 'sad' && <Shape pts={[[44, -30], [52, -48], [58, -30], [52, -22]]} fill={GLASS} w={3} seed={seed + 10} />}
      {mood === 'dizzy' && [0, 1, 2].map((i) => {
        const a = t * 6 + (i * Math.PI * 2) / 3;
        return <g key={i} transform={`translate(${Math.cos(a) * 46} ${-64 + Math.sin(a) * 12})`}><Shape pts={circlePts(0, 0, 7, i, 5, 0.3)} fill={MUSTARD} w={3} seed={seed + 11 + i} /></g>;
      })}
    </g>
  );
};

/** Inside a human mouth: dark mouth, teeth at the top, a big tongue with papillae. Origin = centre, ~1300 wide. */
export const HumanTongue: React.FC<{seed?: number}> = ({seed = 1}) => (
  <g>
    <rect x={-800} y={-900} width={1600} height={1800} fill={MOUTH} />
    {Array.from({length: 7}).map((_, i) => (
      <Shape key={i} pts={[[-630 + i * 180, -900], [-630 + i * 180, -560], [-610 + i * 180, -520], [-490 + i * 180, -520], [-470 + i * 180, -560], [-470 + i * 180, -900]]} fill={WHITE} w={6} seed={seed + i} />
    ))}
    <Shape pts={[[-700, 900], [-720, 200], [-640, -60], [-420, -200], [0, -250], [420, -200], [640, -60], [720, 200], [700, 900]]} fill={ROSE} w={8} seed={seed + 10} />
    <Line pts={[[0, -200], [6, 100], [0, 700]]} w={7} seed={seed + 11} taper={0.8} color={ROSE_D} />
    {Array.from({length: 34}).map((_, i) => {
      const h = (k: number) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
      const x = -600 + h(1) * 1200, y = -150 + h(2) * 900;
      return <Shape key={i} pts={circlePts(x, y, 14 + (i % 3) * 4, seed + i, 8)} fill={ROSE_D} w={0.1} seed={seed + 20 + i} />;
    })}
  </g>
);

/** Inside a bird's beak: mustard jaws top and bottom, a slim pointed tongue. Origin = centre. */
export const BirdTongue: React.FC<{seed?: number}> = ({seed = 1}) => (
  <g>
    <rect x={-800} y={-900} width={1600} height={1800} fill="#3E2F2A" />
    <Shape pts={[[-800, -900], [800, -900], [800, -420], [-200, -330], [-800, -380]]} fill={MUSTARD} w={8} seed={seed} />
    <Shape pts={[[-800, 900], [800, 900], [800, 460], [-200, 400], [-800, 430]]} fill={MUSTARD_D} w={8} seed={seed + 1} />
    <Shape pts={[[-700, 460], [-640, 160], [-420, 0], [-60, -40], [420, 30], [660, 140], [700, 460]]} fill={PINK} w={7} seed={seed + 2} />
    <Line pts={[[-500, 200], [0, 60], [500, 160]]} w={5} seed={seed + 3} taper={0.8} color={ROSE_D} />
  </g>
);

export const Seed: React.FC<{s?: number; seed?: number; broken?: boolean}> = ({s = 1, seed = 1, broken = false}) => (
  <g transform={`scale(${s})`}>
    {broken
      ? <g><Shape pts={[[-12, -4], [0, -16], [4, -2], [-4, 6]]} fill={CREAM} w={3} seed={seed} /><Shape pts={[[6, 4], [16, -2], [14, 12], [4, 14]]} fill={CREAM} w={3} seed={seed + 1} /></g>
      : <Shape pts={[[0, -16], [12, -6], [10, 10], [0, 16], [-10, 10], [-12, -6]]} fill={CREAM} w={3.5} seed={seed} />}
  </g>
);

/** Bird dropping with seeds in it. splat 0 = falling drop, 1 = landed. Origin = ground contact. */
export const Dropping: React.FC<{splat: number; seed?: number}> = ({splat, seed = 1}) => (
  splat < 1
    ? <Shape pts={[[0, -40], [14, -14], [10, 0], [-10, 0], [-14, -14]]} fill={WHITE} w={4} seed={seed} />
    : <g>
      <Shape pts={[[-56, 0], [-44, -22], [-14, -30], [10, -40], [36, -24], [58, -10], [52, 0]]} fill={WHITE} w={4.5} seed={seed} />
      {[[-24, -12], [8, -18], [30, -8]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${i * 50})`}><Seed s={0.6} seed={seed + i} /></g>)}
    </g>
);

/** Sprout growing into a small chili plant. g 0..1 = height, pod 0..1 = the first chili. Origin = ground. */
export const Sprout: React.FC<{g: number; pod: number; t: number; seed?: number}> = ({g, pod, t, seed = 1}) => {
  if (g <= 0) return null;
  const h = 30 + 200 * g;
  const lf = Math.min(1, g * 1.6);
  return (
    <g transform={`rotate(${Math.sin(t * 2) * 2})`}>
      <Line pts={[[0, 0], [-4, -h * 0.5], [2, -h]]} w={8} seed={seed} taper={0.7} color={OLIVE_D} />
      <g transform={`translate(2 ${-h})`}>
        <Shape pts={ellPts(-34 * lf, -8, 34 * lf, 14 * lf, 10, -0.4)} fill={SAGE} w={4} seed={seed + 1} />
        <Shape pts={ellPts(34 * lf, -8, 34 * lf, 14 * lf, 10, 0.4)} fill={SAGE} w={4} seed={seed + 2} />
      </g>
      {g > 0.6 && <Shape pts={ellPts(-30, -h * 0.55, 26 * (g - 0.6) * 2.5, 11 * (g - 0.6) * 2.5, 10, -0.5)} fill={SAGE_D} w={3.5} seed={seed + 3} />}
      {pod > 0 && <g transform={`translate(22 ${-h * 0.62}) rotate(-6) scale(${pod * 0.55})`}><Chili seed={seed + 5} /></g>}
    </g>
  );
};

export const Cactus: React.FC<{seed?: number}> = ({seed = 1}) => (
  <g>
    {[[0, -80, 50, 82, 0], [-56, -186, 40, 64, -0.4], [52, -196, 38, 60, 0.35], [6, -260, 32, 52, 0.05]].map(([x, y, rx, ry, a], i) => (
      <g key={i}>
        <Shape pts={ellPts(x, y, rx, ry, 12, a)} fill={i % 2 ? SAGE : SAGE_D} w={5.5} seed={seed + i} />
        {[[-12, -20], [14, 10], [-4, 30]].map(([dx, dy], j) => <circle key={j} cx={x + dx} cy={y + dy} r={3} fill={INK} />)}
      </g>
    ))}
  </g>
);

export const Rock: React.FC<{w?: number; h?: number; seed?: number; fill?: string}> = ({w = 120, h = 70, seed = 1, fill = DUST}) => (
  <Shape pts={[[-w / 2, 0], [-w / 2 + 10, -h * 0.7], [-w / 6, -h], [w / 4, -h * 0.9], [w / 2, -h * 0.4], [w / 2, 0]]} fill={fill} w={5.5} seed={seed} />
);

export const Cloud: React.FC<{s?: number; seed?: number}> = ({s = 1, seed = 1}) => (
  <g transform={`scale(${s})`}>
    <Shape pts={[[-120, 0], [-110, -40], [-60, -56], [-30, -90], [30, -92], [64, -56], [112, -48], [124, 0]]} fill={WHITE} w={5} seed={seed} />
  </g>
);

export const Steam: React.FC<{t: number; t0: number; x: number; y: number; n?: number}> = ({t, t0, x, y, n = 4}) => {
  if (t < t0) return null;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const u = ((t - t0) * 1.6 + i / n) % 1;
        return <g key={i} opacity={1 - u}><Shape pts={circlePts(x + Math.sin(i * 2 + t * 3) * 20 + (i % 2 ? 50 : -50) * u, y - 150 * u, 14 + 26 * u, i, 9, 0.1)} fill={WHITE} w={4} seed={i} /></g>;
      })}
    </g>
  );
};

export const Tears: React.FC<{t: number; t0: number; x: number; y: number}> = ({t, t0, x, y}) => {
  if (t < t0) return null;
  return (
    <g>
      {[-1, 1].map((sgn) => Array.from({length: 6}).map((_, i) => {
        const u = ((t - t0) * 2.2 + i / 6) % 1;
        const px = x + sgn * (40 + 160 * u), py = y - 40 + 260 * u * u - 120 * u;
        return <Shape key={`${sgn}${i}`} pts={[[px, py - 14], [px + 9, py + 2], [px, py + 10], [px - 9, py + 2]]} fill="#9CC3D1" w={3} seed={i} />;
      }))}
    </g>
  );
};

export const Sparkle: React.FC<{x: number; y: number; s: number; seed?: number}> = ({x, y, s, seed = 1}) => (
  s <= 0 ? null : <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Shape pts={[[0, -30], [7, -7], [30, 0], [7, 7], [0, 30], [-7, 7], [-30, 0], [-7, -7]]} fill={WHITE} w={4} seed={seed} />
  </g>
);

export const Hills: React.FC<{seed?: number}> = ({seed = 1}) => (
  <g>
    <Shape pts={[[-1400, 0], [-1100, -230], [-700, -120], [-300, -300], [200, -160], [600, -280], [1000, -140], [1500, -260], [2200, -120], [2800, -240], [3400, 0]]} fill="#CDBF9F" w={5} seed={seed} />
    <Shape pts={[[-1400, 0], [-900, -110], [-400, -60], [100, -140], [700, -70], [1200, -150], [1900, -60], [2600, -130], [3400, 0]]} fill="#B9B08C" w={5} seed={seed + 1} />
  </g>
);

export const GrassTuft: React.FC<{seed?: number; c?: string}> = ({seed = 1, c = SAGE_D}) => (
  <g>{[[-30, -60], [-12, -90], [6, -70], [24, -100], [40, -56]].map(([x, y], i) => <Line key={i} pts={[[x * 0.4, 0], [x, y]]} w={7} seed={seed + i} taper={0.8} color={c} />)}</g>
);

export {BRICK, BROWN, TAN, TAN_D};
