import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Stick, Arm, Expr, ARM_REST_L, ARM_REST_R} from '../stick/Stick';
import {Line, Shape, circlePts, ellPts} from '../stick/ink';
import {INK, CREAM, TAN, TAN_D, MUSTARD, MUSTARD_D, WHITE, BROWN_D, DUST} from '../stick/style';
import {FAMILY} from '../stick/fonts';
import {
  Island, Waves, IceFloe, Tortoise, Cake, Bowhead, Shark, Clam, GlassSponge, Jelly, Polyp, Rocks, Seaweed, Fish, Bubbles, Sunbeams, WATER_TOP, SKY,
} from './props';
import CAPS from './captions.json';

/* ---------------- helpers ---------------- */
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const inv = (a: number, b: number, x: number) => clamp((x - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ss = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const back = (u: number) => 1 + 2.4 * Math.pow(u - 1, 3) + 1.4 * Math.pow(u - 1, 2);
const pop = (t: number, t0: number, d = 0.25) => (t <= t0 ? 0 : back(clamp((t - t0) / d)));
const wob = (t: number, t0: number, a: number, hz = 4, dec = 7) => (t < t0 ? 0 : a * Math.exp(-dec * (t - t0)) * Math.cos(2 * Math.PI * hz * (t - t0)));

/* word onsets in composition seconds (voice placed at 0.15 s) */
const W = {
  die: 1.47, six: 2.17, ninety4: 4.82, five: 6.92, eleven5: 8.3, four: 9.48, seventy2: 11.11, three: 12.59, seven3: 13.47,
  two: 14.73, thousand: 16.44, and1: 17.83, one: 18.22, immortal: 18.72, jelly: 19.1, hurt: 20.41, old: 20.91, turn: 21.62,
  baby: 22.56, stage: 22.92, start: 23.47, over: 23.76,
};
export const RANK_DUR = 25.0;

/* ---------------- world ---------------- */
const ISLAND = {x: -300, y: WATER_TOP};
const TORT = {x: ISLAND.x + 70, y: WATER_TOP - 268};
const CAKE = {x: ISLAND.x - 200, y: WATER_TOP - 262};
const WHALE = {x: 560, y: 1960};
const SHARK = {x: 540, y: 3300};
const SHELF = 4300;
const CLAM = {x: 540, y: SHELF};
const DEEP = 5720;
const SPONGE = {x: 1600, y: DEEP};
const JELLY = {x: 1500, y: 2000};
const ROCK = {x: 1500, y: 2420};

type K = {t: number; x: number; y: number; z: number; r?: number; cut?: boolean};
const KEYS: K[] = [
  {t: 0, x: JELLY.x, y: 1980, z: 420}, {t: 2.0, x: JELLY.x, y: 1975, z: 440},
  {t: 2.0, x: ISLAND.x - 30, y: 1380, z: 360, cut: true}, {t: 6.55, x: ISLAND.x - 40, y: 1386, z: 392},
  {t: 7.05, x: WHALE.x, y: 1950, z: 300}, {t: 9.2, x: WHALE.x + 20, y: 1950, z: 322},
  {t: 9.7, x: SHARK.x, y: 3290, z: 360}, {t: 12.3, x: SHARK.x + 20, y: 3300, z: 382},
  {t: 12.8, x: CLAM.x, y: SHELF - 90, z: 560}, {t: 14.45, x: CLAM.x, y: SHELF - 86, z: 580},
  {t: 15.0, x: SPONGE.x, y: DEEP - 300, z: 330}, {t: 17.55, x: SPONGE.x, y: DEEP - 310, z: 352},
  {t: 18.4, x: JELLY.x, y: 1990, z: 420}, {t: 20.1, x: JELLY.x, y: 2000, z: 440},
  {t: 21.9, x: JELLY.x, y: 2250, z: 480}, {t: 23.3, x: JELLY.x, y: 2262, z: 490}, {t: 25.0, x: JELLY.x, y: 2120, z: 450},
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

/* backdrop: sky above the waterline, a depth gradient below it (mid-plane coordinates) */
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <g>
    <defs>
      <linearGradient id="sea" x1="0" y1={WATER_TOP} x2="0" y2={6400} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#A9CFCB" />
        <stop offset="0.12" stopColor="#7FAFB3" />
        <stop offset="0.35" stopColor="#4F7E8C" />
        <stop offset="0.62" stopColor="#2C4A5E" />
        <stop offset="0.85" stopColor="#1A2A3C" />
        <stop offset="1" stopColor="#111A27" />
      </linearGradient>
    </defs>
    <rect x={-3000} y={-1000} width={8000} height={WATER_TOP + 1000} fill={SKY} />
    <rect x={-3000} y={WATER_TOP} width={8000} height={6000} fill="url(#sea)" />
    <g transform={`translate(-200 ${WATER_TOP})`}><Sunbeams t={t} /></g>
    <g transform={`translate(1100 ${WATER_TOP})`}><Sunbeams t={t + 3} /></g>
  </g>
);

const FarStuff: React.FC<{t: number}> = ({t}) => (
  <g>
    {[[-200, 3000, 420], [900, 3600, 360], [2000, 3200, 500], [300, 5200, 700], [2300, 5400, 600]].map(([x, y, w], i) => (
      <path key={i} d={`M ${x - w / 2} ${y} L ${x - w / 2 + 30} ${y - 60} L ${x - w / 5} ${y - 90} L ${x + w / 6} ${y - 70} L ${x + w / 2 - 20} ${y - 40} L ${x + w / 2} ${y} Z`} fill="rgba(31,50,66,0.35)" />
    ))}
    {Array.from({length: 9}).map((_, i) => {
      const x = ((i * 380 + t * 40) % 2600) - 600, y = 2600 + (i % 3) * 120;
      return <path key={`f${i}`} d={`M ${x - 20} ${y} Q ${x} ${y - 9} ${x + 22} ${y} Q ${x} ${y + 9} ${x - 20} ${y} Z M ${x - 20} ${y} L ${x - 31} ${y - 9} L ${x - 31} ${y + 9} Z`} fill="rgba(46,74,90,0.4)" />;
    })}
  </g>
);

const Seabed: React.FC<{t: number}> = ({t}) => (
  <g>
    <Shape pts={[[-1600, SHELF], [-400, SHELF - 20], [200, SHELF + 10], [900, SHELF - 10], [1050, SHELF + 60], [1180, DEEP - 300], [1300, DEEP], [3200, DEEP + 10], [3200, 8000], [-1600, 8000]]} fill="#C8B48C" w={8} seed={3} />
    <Shape pts={[[1050, SHELF + 60], [1180, DEEP - 300], [1300, DEEP], [3200, DEEP + 10], [3200, 8000], [1000, 8000]]} fill="#3B4350" w={7} seed={4} />
    {[[-300, SHELF], [160, SHELF + 4], [860, SHELF - 6]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><Seaweed t={t} h={220 + i * 40} seed={i + 2} /></g>)}
    {[[2000, DEEP], [1350, DEEP]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><Rocks w={260} seed={i + 9} fill="#2A3340" /></g>)}
    <Shape pts={[[ROCK.x - 105, ROCK.y - 10], [ROCK.x - 130, ROCK.y + 320], [ROCK.x + 140, ROCK.y + 320], [ROCK.x + 110, ROCK.y - 10]]} fill="#4C5F64" w={6} seed={13} />
    <g transform={`translate(${ROCK.x} ${ROCK.y})`}><Rocks w={230} seed={12} fill="#5B6E73" /></g>
    {[[-80, 40, 200], [70, 120, 260], [-40, 230, 300]].map(([dx, dy, w], i) => <Line key={i} pts={[[ROCK.x + dx - 40, ROCK.y + dy], [ROCK.x + dx + 40, ROCK.y + dy + 6]]} w={4} seed={20 + i} taper={0.8} color="#6E8388" />)}
    {[[-90, 0], [96, -4]].map(([dx], i) => <g key={i} transform={`translate(${ROCK.x + dx} ${ROCK.y - 20})`}><Seaweed t={t + i} h={120} seed={30 + i} color="#5E7F55" /></g>)}
  </g>
);

/* ---------------- the immortal jellyfish's life, rewound ---------------- */
const JellyLife: React.FC<{t: number}> = ({t}) => {
  const hook = t < 2.0;
  const droop = inv(W.hurt, W.old + 0.3, t);
  const shrink = ss(inv(W.turn - 0.1, W.turn + 0.6, t));
  const y = JELLY.y + 250 * ss(inv(W.hurt, W.turn + 0.2, t)) + 96 * shrink;
  const s = 1.15 * (1 - 0.7 * shrink);
  const polyp = ss(inv(22.3, 22.95, t));
  return (
    <g>
      {t < 23.0 && (
        <g transform={`translate(${JELLY.x + Math.sin(t * 0.9) * 10} ${y + Math.sin(t * 1.3) * 8 * (1 - droop)})`} opacity={1 - inv(22.6, 23.0, t)}>
          <Jelly t={t} s={s} droop={droop} dark={hook ? 1 : 0} seed={3} />
          {t > W.hurt && t < 22.2 && (
            <g transform={`translate(26 -40) rotate(-20) scale(${pop(t, W.hurt, 0.2) * s})`}>
              <Shape pts={[[-24, -9], [24, -9], [24, 9], [-24, 9]]} fill="#E7C9A3" w={3.5} seed={5} />
              <Shape pts={[[-9, -24], [9, -24], [9, 24], [-9, 24]]} fill="#E7C9A3" w={3.5} seed={6} />
            </g>
          )}
        </g>
      )}
      <g transform={`translate(${ROCK.x} ${ROCK.y - 86})`}><Polyp t={t} grow={polyp} seed={7} /></g>
      {[[0, -126, 0], [-46, -100, 0.15], [50, -110, 0.3]].map(([dx, dy, d], i) => {
        const u = inv(W.start - 0.1 + d, 24.8 + d, t);
        if (u <= 0) return null;
        return (
          <g key={i} transform={`translate(${ROCK.x + dx + Math.sin(t * 2 + i) * 18 * u + (i - 1) * 90 * u} ${ROCK.y - 88 + dy - 300 * easeOut(u)})`}>
            <Jelly t={t + i} s={0.32 * Math.min(1, u * 4)} seed={10 + i} />
          </g>
        );
      })}
    </g>
  );
};

/* ---------------- host: the detective ages with every entry ---------------- */
const levelAt = (t: number) => (t < W.six ? 0 : t < W.five ? 1 : t < W.four ? 2 : t < W.three ? 3 : t < W.two ? 4 : 5);
const BEARD = [0, 0, 40, 130, 230, 420];

const Aging: React.FC<{lv: number; t: number}> = ({lv, t}) => (
  <g>
    {lv >= 1 && <Shape pts={[[-40, -530], [-18, -546], [0, -538], [18, -546], [40, -530], [20, -518], [0, -524], [-20, -518]]} fill={WHITE} w={3.5} seed={5} />}
    {lv >= 1 && [[-56, -546, -40, -540], [40, -540, 56, -546]].map(([a, b, c, d], i) => <Line key={i} pts={[[a, b], [c, d]]} w={3} seed={6 + i} taper={0.5} />)}
    {lv >= 2 && (
      <Shape pts={[[-62, -506], [-44, -468], [-20, -470 + BEARD[lv] * 0.1], [0, -470 + BEARD[lv]], [20, -470 + BEARD[lv] * 0.1], [44, -468], [62, -506], [30, -516], [0, -510], [-30, -516]]}
        fill={WHITE} w={4.5} seed={8} />
    )}
    {lv >= 2 && (
      <g>
        <Shape pts={circlePts(-33, -568, 24, 3, 12)} fill="rgba(214,226,223,0.35)" w={4.5} seed={11} />
        <Shape pts={circlePts(33, -568, 24, 4, 12)} fill="rgba(214,226,223,0.35)" w={4.5} seed={12} />
        <Line pts={[[-10, -572], [10, -572]]} w={4} seed={13} />
      </g>
    )}
    {lv >= 3 && (
      <g>
        <Line pts={[[-96, -250], [-100, -120], [-104, 0]]} w={10} seed={14} taper={0.95} color={BROWN_D} />
        <Line pts={[[-96, -250], [-92, -278], [-70, -286], [-58, -270]]} w={10} seed={15} taper={0.9} color={BROWN_D} />
      </g>
    )}
    {lv >= 5 && (
      <g>
        {[0, 1, 2, 3].map((i) => <Line key={i} pts={[[96, -640], [96 + 70 * Math.cos(0.3 + i * 0.35), -640 + 70 * Math.sin(0.3 + i * 0.35)]]} w={2} seed={20 + i} taper={0.2} color="#E9E4DA" />)}
        {[30, 50].map((r, i) => <Line key={`r${i}`} pts={Array.from({length: 5}).map((_, j) => [96 + r * Math.cos(0.3 + j * 0.35), -640 + r * Math.sin(0.3 + j * 0.35)] as [number, number])} w={2} seed={30 + i} taper={0.2} color="#E9E4DA" />)}
        <Line pts={[[-80, -640], [-80, -560 + Math.sin(t * 2.4) * 16]]} w={1.6} seed={40} taper={0.1} color="#E9E4DA" />
        <Shape pts={circlePts(-80, -552 + Math.sin(t * 2.4) * 16, 9, 3, 8)} fill={INK} w={2} seed={41} />
        {[-1, 1].map((s) => [0, 1].map((j) => <Line key={`${s}${j}`} pts={[[-80, -552 + Math.sin(t * 2.4) * 16], [-80 + s * 16, -560 + j * 14 + Math.sin(t * 2.4) * 16]]} w={2} seed={42 + j} taper={0.3} />))}
      </g>
    )}
  </g>
);

const BabyDetective: React.FC<{t: number}> = ({t}) => {
  const giggle = Math.abs(Math.sin(t * 9)) * 8;
  return (
    <g transform={`translate(0 ${-giggle})`}>
      {[[-1], [1]].map(([s], i) => <Line key={i} pts={[[s * 26, -110], [s * 60, -40], [s * 82, -30]]} w={8} seed={i} taper={0.6} />)}
      {[[-1], [1]].map(([s], i) => <Shape key={`f${i}`} pts={ellPts(s * 92, -28, 18, 12)} fill="#2E2A26" w={4} seed={i + 2} />)}
      <Shape pts={[[-62, -100], [-70, -180], [-50, -240], [50, -240], [70, -180], [62, -100], [0, -90]]} fill={TAN} w={6.5} seed={5} />
      <Shape pts={[[-10, -236], [10, -236], [10, -100], [-10, -100]]} fill={TAN_D} w={3} seed={6} />
      {[[-1], [1]].map(([s], i) => <Line key={`a${i}`} pts={[[s * 52, -228], [s * 92, -250 - (i ? giggle * 2 : 0)], [s * 110, -290 - (i ? giggle * 2 : 0)]]} w={7} seed={i + 8} taper={0.55} />)}
      <g transform="translate(0 -232) scale(0.62) translate(0 565)">
        <Stick outfit="detective" expr="happy" headOnly seed={7} prop={false} />
        <Shape pts={circlePts(0, -506, 22, 3, 10)} fill={MUSTARD} w={4} seed={9} />
        <Shape pts={circlePts(0, -506, 9, 4, 8)} fill="#F0D9A0" w={3} seed={10} />
      </g>
    </g>
  );
};

const Host: React.FC<{t: number}> = ({t}) => {
  const lv = levelAt(t);
  const baby = t >= W.baby;
  const changes = [W.six, W.five, W.four, W.three, W.two, W.baby];
  const lastChange = changes.filter((c) => t >= c).pop() ?? -10;
  const puff = t - lastChange < 0.35 ? (t - lastChange) / 0.35 : -1;
  const react = (t0: number) => t > t0 && t < t0 + 0.6;
  let expr: Expr = 'neutral';
  if (t < 2.0) expr = t > W.die - 0.1 ? 'surprised' : 'happy';
  else if ([W.six, W.five, W.four, W.three, W.two].some(react)) expr = 'surprised';
  else if (t > W.and1 && t < W.jelly) expr = 'worried';
  else if (t >= W.jelly && t < W.hurt) expr = 'shock';
  else if (lv >= 5) expr = 'smug';
  else if (lv >= 3) expr = 'worried';
  const hunch = baby ? 0 : Math.max(0, lv - 2) * 3;
  const shake = lv >= 4 && !baby ? Math.sin(t * 40) * 2 : 0;
  const hold = lv <= 2;
  const armR: Arm = hold ? {elbow: [104, -352], hand: [112, -420]} : ARM_REST_R;
  const armL: Arm = lv >= 3 ? {elbow: [-84, -330], hand: [-96, -256]} : ARM_REST_L;
  const sq = 1 + wob(t, lastChange, 0.05, 5, 7);
  const enter = ss(inv(0, 0.3, t));
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', overflow: 'visible'}}>
        <g transform={`translate(${235 + shake} ${2010 + (1 - enter) * 300})`}>
          {!baby && (
            <g transform={`rotate(${-hunch}) scale(1 ${(1 + 0.012 * Math.sin(t * 3.1)) * sq})`}>
              <Stick outfit="detective" expr={expr} armL={armL} armR={armR} prop={hold} seed={7} opts={{hatLift: t > W.die && t < 2.0 ? 18 : 0}} />
              <Aging lv={lv} t={t} />
            </g>
          )}
          {baby && <g transform="translate(10 -20) scale(1.35)"><BabyDetective t={t} /></g>}
          {puff >= 0 && (
            <g transform="translate(0 -520)" opacity={1 - puff}>
              {[[-90, -40], [0, -110], [90, -40], [-60, 60], [60, 60]].map(([x, y], i) => (
                <Shape key={i} pts={circlePts(x * (0.6 + puff), y * (0.6 + puff), 40 + 30 * puff, i, 10)} fill={WHITE} w={5} seed={i} />
              ))}
            </g>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- rank badge + age counter ---------------- */
const ENTRIES = [
  {n: 6, t0: W.six, c0: W.ninety4, c1: W.ninety4 + 0.75, v: 194, pre: '', post: ' YEARS'},
  {n: 5, t0: W.five, c0: W.eleven5, c1: W.eleven5 + 0.65, v: 211, pre: '', post: ' YEARS'},
  {n: 4, t0: W.four, c0: W.seventy2, c1: W.seventy2 + 0.8, v: 272, pre: '', post: '+ YEARS'},
  {n: 3, t0: W.three, c0: W.seven3, c1: W.seven3 + 0.7, v: 507, pre: '', post: ' YEARS'},
  {n: 2, t0: W.two, c0: W.thousand - 0.25, c1: W.thousand + 0.5, v: 11000, pre: '~', post: ' YEARS'},
  {n: 1, t0: 17.96, c0: W.jelly, c1: W.jelly, v: -1, pre: '', post: ''},
];
const Badge: React.FC<{t: number}> = ({t}) => {
  const e = [...ENTRIES].reverse().find((x) => t >= x.t0);
  if (!e) return null;
  const s = pop(t, e.t0, 0.3);
  const shown = t >= e.c0;
  const val = e.v < 0 ? '∞' : `${e.pre}${Math.round(e.v * ss(inv(e.c0, e.c1, t))).toLocaleString('en-US')}${e.post}`;
  const cs = pop(t, e.c0, 0.25);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <g transform={`translate(128 470) scale(${s}) rotate(${-6 + wob(t, e.t0, 8, 3, 5)})`}>
          <Shape pts={circlePts(0, 0, 76, e.n, 14, 0.02)} fill={MUSTARD} w={9} seed={e.n} />
          <text x={2} y={30} textAnchor="middle" fontFamily={FAMILY} fontWeight={700} fontSize={84} fill={INK}>#{e.n}</text>
        </g>
      </svg>
      {shown && e.v < 0 && (
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
          <g transform={`translate(330 472) scale(${cs})`}>
            {(() => {
              const pts = Array.from({length: 73}).map((_, i) => { const th = (i / 72) * Math.PI * 2; const d = 1 + Math.sin(th) ** 2; return `${(92 * Math.cos(th)) / d},${(92 * Math.sin(th) * Math.cos(th)) / d}`; }).join(' ');
              return <g><polyline points={pts} fill="none" stroke={INK} strokeWidth={38} strokeLinejoin="round" strokeLinecap="round" transform="translate(0 6)" />
                <polyline points={pts} fill="none" stroke={INK} strokeWidth={38} strokeLinejoin="round" strokeLinecap="round" />
                <polyline points={pts} fill="none" stroke={CREAM} strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" /></g>;
            })()}
          </g>
        </svg>
      )}
      {shown && e.v >= 0 && (
        <div style={{position: 'absolute', left: 226, top: 470, transform: `translateY(-50%) scale(${cs})`, transformOrigin: '0% 50%',
          fontFamily: FAMILY, fontWeight: 700, fontSize: e.v < 0 ? 120 : 70, color: CREAM, WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill',
          letterSpacing: '0.03em', filter: `drop-shadow(0px 6px 0px ${INK})`, whiteSpace: 'nowrap'}}>{val}</div>
      )}
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
export const RankShort: React.FC<SceneProps> = ({muted = false, hideCaptions = false, hideHost = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cam = camAt(t);
  const flash = [2.0].reduce((m, c) => Math.max(m, t >= c && t < c + 0.2 ? 1 - (t - c) / 0.2 : 0), 0);
  const rush = Math.sin(Math.PI * inv(17.55, 18.4, t));
  return (
    <AbsoluteFill style={{background: SKY}}>
      <Layer cam={cam} z={1000}><Backdrop t={t} /></Layer>
      <Layer cam={cam} z={1400}><FarStuff t={t} /></Layer>
      <Layer cam={cam} z={1000}>
        <path d={`M ${ISLAND.x - 680} ${WATER_TOP + 30} L ${ISLAND.x + 650} ${WATER_TOP + 30} C ${ISLAND.x + 760} ${WATER_TOP + 500} ${ISLAND.x + 600} ${WATER_TOP + 900} ${ISLAND.x + 300} ${WATER_TOP + 1100} L ${ISLAND.x - 900} ${WATER_TOP + 1100} Z`} fill="#4E7C78" opacity={0.45} />
        <g transform={`translate(${ISLAND.x} ${ISLAND.y})`}><Island seed={3} /></g>
        <Waves t={t} x0={-1500} x1={3200} />
        {[[700, 160], [1010, 220], [180, 120]].map(([x, w], i) => (
          <g key={i} transform={`translate(${x + Math.sin(t * 0.8 + i) * 10} ${WATER_TOP + 6 + Math.sin(t * 1.6 + i) * 4})`}><IceFloe w={w} seed={i + 4} /></g>
        ))}
        <g transform={`translate(${CAKE.x} ${CAKE.y}) scale(0.9)`}><Cake t={t} seed={5} /></g>
        <g transform={`translate(${TORT.x} ${TORT.y}) scale(0.95)`}><Tortoise t={t} chew={Math.max(0, Math.sin(t * 7))} seed={9} /></g>
        <g transform={`translate(${WHALE.x + Math.sin(t * 0.5) * 30} ${WHALE.y + Math.sin(t * 1.1) * 10})`}><Bowhead t={t} seed={11} /></g>
        {t > 7.5 && t < 9.4 && (
          <g transform={`translate(${WHALE.x + 230} ${WATER_TOP - 10})`} opacity={1 - inv(8.9, 9.4, t)}>
            {[-1, 1].map((s) => [0, 1, 2].map((j) => {
              const u = clamp((t - 7.5) * 1.6 - j * 0.15);
              return <Shape key={`${s}${j}`} pts={circlePts(s * (20 + 60 * u + j * 12), -60 - 140 * u - j * 30, 18 + 16 * u, j, 9)} fill={WHITE} w={4} seed={j} />;
            }))}
          </g>
        )}
        <g transform={`translate(${SHARK.x + Math.sin(t * 0.4) * 40} ${SHARK.y + Math.sin(t * 0.9) * 12})`}><Shark t={t} seed={13} /></g>
        <Seabed t={t} />
        <g transform={`translate(${CLAM.x} ${CLAM.y + 4})`}><Clam t={t} count={inv(W.seven3 - 0.2, W.seven3 + 0.7, t)} seed={15} /></g>
        <g transform={`translate(${SPONGE.x} ${SPONGE.y})`}><GlassSponge t={t} glow={t > 14.5 && t < 17.6 ? 1 : 0.4} seed={17} /></g>
        <JellyLife t={t} />
      </Layer>
      <Layer cam={cam} z={820}>
        <Bubbles t={t} x={WHALE.x - 300} y={2400} n={6} spread={160} seed={2} />
        <Bubbles t={t} x={SHARK.x + 360} y={3500} n={6} spread={160} seed={5} />
        <Bubbles t={t} x={SPONGE.x - 300} y={DEEP - 100} n={5} spread={140} seed={8} />
        <Bubbles t={t} x={JELLY.x + 330} y={2300} n={7} spread={180} seed={11} />
        <g transform={`translate(${CLAM.x - 330} ${SHELF + 40})`}><Seaweed t={t} h={300} seed={21} color="#46603F" /></g>
        <g transform={`translate(${CLAM.x + 360} ${SHELF + 40})`}><Seaweed t={t + 1} h={260} seed={22} color="#46603F" /></g>
        {rush > 0 && Array.from({length: 18}).map((_, i) => (
          <circle key={i} cx={JELLY.x + ((i * 173) % 900) - 450} cy={cam.y + ((i * 331) % 1400) - 700} r={8 + (i % 4) * 5} fill="none" stroke="rgba(240,248,248,0.8)" strokeWidth={4} opacity={rush} />
        ))}
      </Layer>
      <Badge t={t} />
      {!hideHost && <Host t={t} />}
      {flash > 0 && <AbsoluteFill style={{background: WHITE, opacity: flash}} />}
      {!hideCaptions && <Captions t={t} />}
      <Img src={staticFile('stick/paper.png')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, mixBlendMode: 'multiply'}} />
      {!muted && <Audio src={staticFile('rank/mix.wav')} />}
    </AbsoluteFill>
  );
};
