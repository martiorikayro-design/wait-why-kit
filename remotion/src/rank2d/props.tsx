import React from 'react';
import {Line, P, Shape, circlePts, ellPts} from '../stick/ink';
import {INK, WHITE} from '../stick/style';

/** Hand-inked props for the "fastest things" and "coldest things" rankings (origin = centre of each prop). */
const rays = (cx: number, cy: number, r0: number, r1: number, n: number, rot = 0): P[] => {
  const pts: P[] = [];
  for (let i = 0; i < n * 2; i++) { const a = rot + (i / (n * 2)) * Math.PI * 2; const r = i % 2 ? r0 : r1; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return pts;
};
const speed = (x0: number, x1: number, ys: number[], seed = 1, color = '#FFFFFF') =>
  ys.map((y, i) => <Line key={i} pts={[[x0, y], [x1 - i * 14, y + 3]]} w={6} seed={seed + i} taper={0.9} color={color} />);

/* ======================= FASTEST ======================= */
export const Runner: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => {
  const s = Math.sin(t * 14) * 14;
  return (
    <g transform="translate(0 40)">
      <Shape pts={[[-340, 130], [340, 130], [340, 160], [-340, 160]]} fill="#C0603F" w={6} seed={seed} />
      {[-260, -120, 20, 160, 300].map((x, i) => <Line key={i} pts={[[x, 134], [x + 60, 134]]} w={5} seed={seed + 1 + i} taper={0.6} color="#FFF1D8" />)}
      {speed(-330, -150, [-250, -190, -130, -70], seed + 10)}
      <g transform={`translate(0 ${-Math.abs(s) * 0.6})`}>
        {/* back leg, front leg */}
        <Line pts={[[-20, -60], [-95 - s, 20], [-160 - s, 80]]} w={26} seed={seed + 20} taper={0.5} />
        <Line pts={[[-10, -60], [60 + s, -5], [95 + s, 90]]} w={26} seed={seed + 21} taper={0.5} />
        <Shape pts={ellPts(-170 - s, 96, 34, 13)} fill="#2E2A26" w={4} seed={seed + 22} />
        <Shape pts={ellPts(112 + s, 106, 34, 13)} fill="#2E2A26" w={4} seed={seed + 23} />
        {/* shorts + shirt */}
        <Shape pts={[[-48, -70], [40, -70], [58, -10], [-46, -6]]} fill="#1F8F4E" w={6} seed={seed + 24} />
        <Shape pts={[[-50, -180], [46, -190], [56, -70], [-48, -70]]} fill="#F5C518" w={6.5} seed={seed + 25} />
        {/* arms */}
        <Line pts={[[-30, -165], [-90, -130 + s], [-110, -190 + s]]} w={20} seed={seed + 26} taper={0.5} />
        <Line pts={[[30, -168], [80, -120 - s], [130, -150 - s]]} w={20} seed={seed + 27} taper={0.5} />
        {/* head */}
        <Shape pts={circlePts(6, -245, 52, seed + 30, 12)} fill={WHITE} w={7} seed={seed + 30} />
        <ellipse cx={30} cy={-250} rx={7} ry={11} fill={INK} />
        <Line pts={[[18, -222], [34, -218], [48, -224]]} w={5} seed={seed + 31} taper={0.4} />
        <Line pts={[[-40, -270], [-8, -296], [36, -290]]} w={8} seed={seed + 32} taper={0.4} />
      </g>
    </g>
  );
};

export const Maglev: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => (
  <g>
    <Shape pts={[[-380, 90], [400, 90], [400, 130], [-380, 130]]} fill="#7C8794" w={6} seed={seed} />
    {Array.from({length: 11}).map((_, i) => <Line key={i} pts={[[-340 + i * 70, 94], [-340 + i * 70, 126]]} w={5} seed={seed + 1 + i} taper={0.5} color="#B8C2CE" />)}
    <Shape pts={[[-380, -50], [210, -56], [330, -28], [398, 36], [-380, 36]]} fill="#EAF0F6" w={8} seed={seed + 20} />
    <Shape pts={[[-380, 6], [398, 6], [398, 30], [-380, 30]]} fill="#2E7DD1" w={5} seed={seed + 21} />
    {Array.from({length: 8}).map((_, i) => <Shape key={i} pts={[[-330 + i * 70, -30], [-290 + i * 70, -30], [-290 + i * 70, -6], [-330 + i * 70, -6]]} fill="#27415E" w={4} seed={seed + 22 + i} />)}
    <Shape pts={[[236, -34], [300, -24], [352, 4], [236, 4]]} fill="#27415E" w={4.5} seed={seed + 40} />
    <Shape pts={[[-380, 36], [398, 36], [398, 62], [-380, 62]]} fill="#C9D2DC" w={4} seed={seed + 41} />
    {speed(-390, -200, [-70, -30, 10, 50], seed + 50, '#FFFFFF')}
  </g>
);

export const Spy: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => (
  <g>
    {speed(-400, -220, [-90, -30, 40, 100], seed + 10, '#FFFFFF')}
    <Shape pts={[[-80, -20], [-260, -190], [-250, -20], [-250, 40], [-70, 8]]} fill="#3C424D" w={7} seed={seed + 1} />
    <Shape pts={[[-80, 22], [-260, 190], [-250, 24], [-250, -36], [-70, -6]]} fill="#444B57" w={7} seed={seed + 2} />
    <Shape pts={[[-390, -4], [-200, -22], [250, -10], [430, 4], [250, 20], [-200, 22]]} fill="#2A2E36" w={8} seed={seed + 3} />
    <Line pts={[[-360, -1], [250, -2]]} w={5} seed={seed + 4} taper={0.3} color="#6F7886" />
    <Shape pts={[[-120, -22], [-40, -22], [-30, -60], [-110, -70]]} fill="#3C424D" w={6} seed={seed + 5} />
    <Shape pts={[[-30, -8], [40, -10], [40, 6], [-30, 8]]} fill="#E9B24D" w={4} seed={seed + 6} />
    <Shape pts={[[40, 0], [150, -4], [150, 8], [40, 10]]} fill="#E26F2E" w={3} seed={seed + 7} />
  </g>
);

export const Probe: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => (
  <g>
    <circle cx={330} cy={-40} r={170} fill="#FFD54A" opacity={0.22} />
    <circle cx={330} cy={-40} r={110} fill="#FFB42E" opacity={0.35} />
    {speed(-380, -200, [-90, -40, 20], seed + 10, '#FFFFFF')}
    {/* heat shield */}
    <Shape pts={ellPts(190, 0, 34, 150)} fill="#E9C46A" w={8} seed={seed + 1} />
    <Shape pts={ellPts(190, 0, 18, 110)} fill="#F4DC9A" w={4} seed={seed + 2} />
    {/* body + dish */}
    <Shape pts={[[-90, -48], [166, -40], [166, 40], [-90, 48]]} fill="#B8BEC8" w={7} seed={seed + 3} />
    <Shape pts={[[-90, -48], [-150, -90], [-170, 0], [-150, 90], [-90, 48]]} fill="#E6EAF0" w={6} seed={seed + 4} />
    {/* solar arrays */}
    <Shape pts={[[40, -48], [100, -48], [96, -170], [44, -170]]} fill="#1F3A5F" w={6} seed={seed + 5} />
    <Shape pts={[[40, 48], [100, 48], [96, 170], [44, 170]]} fill="#1F3A5F" w={6} seed={seed + 6} />
    {[-100, -130, -150].map((y, i) => <Line key={i} pts={[[46, y], [98, y]]} w={3} seed={seed + 8 + i} taper={0.2} color="#5E8AC0" />)}
    {[100, 130, 150].map((y, i) => <Line key={`b${i}`} pts={[[46, y], [98, y]]} w={3} seed={seed + 12 + i} taper={0.2} color="#5E8AC0" />)}
    <Line pts={[[-150, -90], [-230, -150]]} w={6} seed={seed + 16} taper={0.4} />
  </g>
);

export const Proton: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => {
  const a = t * 6;
  return (
    <g>
      <Shape pts={ellPts(0, 0, 330, 190, 20)} fill="none" w={0} seed={seed} />
      <ellipse cx={0} cy={0} rx={330} ry={190} fill="none" stroke={INK} strokeWidth={44} />
      <ellipse cx={0} cy={0} rx={330} ry={190} fill="none" stroke="#6BA3D8" strokeWidth={30} />
      <ellipse cx={0} cy={0} rx={330} ry={190} fill="none" stroke="#C9E2F6" strokeWidth={8} />
      {Array.from({length: 16}).map((_, i) => {
        const th = (i / 16) * Math.PI * 2;
        return <circle key={i} cx={330 * Math.cos(th)} cy={190 * Math.sin(th)} r={13} fill="#D9402C" stroke={INK} strokeWidth={4} />;
      })}
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const th = a - k * 0.16;
        return <circle key={k} cx={330 * Math.cos(th)} cy={190 * Math.sin(th)} r={24 - k * 3} fill="#FFF6C8" opacity={1 - k * 0.15} stroke={k ? 'none' : INK} strokeWidth={4} />;
      })}
    </g>
  );
};

export const LightBeam: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => (
  <g>
    <circle cx={0} cy={0} r={250} fill="#FFF3B0" opacity={0.2} />
    <g transform={`rotate(${t * 20})`}>
      <Shape pts={rays(0, 0, 120, 270, 14)} fill="#FFE27A" w={6} seed={seed} />
    </g>
    <Shape pts={circlePts(0, 0, 120, seed + 1, 14)} fill="#FFF8D6" w={8} seed={seed + 1} />
    {[-60, 0, 60].map((y, i) => <Line key={i} pts={[[-380, y], [-130, y]]} w={10} seed={seed + 2 + i} taper={0.9} color="#FFF8D6" />)}
  </g>
);

/* ======================= COLDEST ======================= */
export const Snow: React.FC<{t: number; n?: number; w?: number; h?: number; seed?: number}> = ({t, n = 24, w = 800, h = 600}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const r = (k: number) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
      const y = ((r(2) * h + t * (30 + r(3) * 40)) % h) - h / 2;
      return <circle key={i} cx={-w / 2 + r(1) * w + Math.sin(t * 1.5 + i) * 10} cy={y} r={3 + r(4) * 5} fill="#FFFFFF" opacity={0.8} />;
    })}
  </g>
);

export const Antarctica: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => (
  <g>
    <Shape pts={[[-380, 100], [-200, 60], [0, 80], [220, 50], [380, 90], [400, 170], [-400, 170]]} fill="#E8F2FA" w={7} seed={seed} />
    <Shape pts={[[-120, 70], [80, 70], [80, -40], [-20, -90], [-120, -40]]} fill="#D9402C" w={7} seed={seed + 1} />
    <Shape pts={[[-60, 70], [10, 70], [10, 10], [-60, 10]]} fill="#27415E" w={5} seed={seed + 2} />
    <Line pts={[[130, 70], [130, -150]]} w={8} seed={seed + 3} taper={0.3} />
    <Shape pts={[[130, -150], [210, -130], [130, -108]]} fill="#2E7DD1" w={5} seed={seed + 4} />
    <g transform="translate(-250 -10)">
      <Shape pts={[[-18, -200], [18, -200], [20, 60], [-20, 60]]} fill={WHITE} w={6} seed={seed + 5} />
      <Shape pts={circlePts(0, 80, 40, seed + 6, 10)} fill="#E26F2E" w={6} seed={seed + 6} />
      <Shape pts={[[-9, 20], [9, 20], [9, 70], [-9, 70]]} fill="#6BA3D8" w={3} seed={seed + 7} />
      {[0, 1, 2, 3].map((i) => <Line key={i} pts={[[20, -150 + i * 40], [38, -150 + i * 40]]} w={4} seed={seed + 8 + i} taper={0.3} />)}
    </g>
    <Snow t={t} />
  </g>
);

export const Nitrogen: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => (
  <g>
    <Shape pts={[[-110, -150], [110, -150], [140, 150], [-140, 150]]} fill="#B9C3CF" w={8} seed={seed} />
    <Shape pts={[[-110, -150], [110, -150], [116, -118], [-116, -118]]} fill="#E6ECF2" w={6} seed={seed + 1} />
    <Shape pts={[[-80, -20], [80, -20], [96, 130], [-96, 130]]} fill="#E4F4FF" w={4} seed={seed + 2} />
    {[0, 1, 2, 3, 4].map((i) => {
      const u = ((t * 0.5 + i * 0.22) % 1);
      return <circle key={i} cx={-60 + i * 30 + Math.sin(t * 2 + i) * 20} cy={-170 - u * 240} r={34 + u * 40} fill="#F4FAFF" opacity={0.85 * (1 - u)} stroke={INK} strokeWidth={4} />;
    })}
    <Line pts={[[-90, 10], [90, 10]]} w={5} seed={seed + 3} taper={0.3} />
    <Shape pts={[[-40, 60], [40, 60], [40, 100], [-40, 100]]} fill="#FFFFFF" w={4} seed={seed + 4} />
    <Line pts={[[-24, 80], [24, 80]]} w={4} seed={seed + 5} taper={0.2} color="#2E7DD1" />
  </g>
);

export const Pluto: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => (
  <g>
    <circle cx={0} cy={0} r={234} fill="#9CC8E8" opacity={0.22} />
    <circle cx={0} cy={0} r={210} fill="#9CC8E8" opacity={0.25} />
    <Shape pts={circlePts(0, 0, 190, seed, 14)} fill="#C9A98A" w={8} seed={seed} />
    <Shape pts={[[-20, -60], [40, -100], [110, -70], [120, 0], [80, 70], [10, 130], [-30, 70], [-90, 40], [-80, -30]]} fill="#F3E6D3" w={5} seed={seed + 1} />
    {[[-110, -80, 26], [-130, 40, 18], [90, 100, 20], [120, -20, 14]].map(([x, y, r], i) => <Shape key={i} pts={circlePts(x, y, r, seed + 4 + i, 8, 0.05)} fill="#A07E62" w={3} seed={seed + 4 + i} />)}
  </g>
);

export const MoonCrater: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => (
  <g>
    <Shape pts={circlePts(0, 0, 200, seed, 14)} fill="#B9BCC4" w={8} seed={seed} />
    {[[-120, -90, 30], [110, -110, 24], [-130, 90, 20], [140, 50, 28]].map(([x, y, r], i) => <Shape key={i} pts={circlePts(x, y, r, seed + 3 + i, 9, 0.04)} fill="#9DA1AB" w={3.5} seed={seed + 3 + i} />)}
    <Shape pts={circlePts(10, 10, 96, seed + 10, 12, 0.03)} fill="#2B3344" w={7} seed={seed + 10} />
    <path d="M -70 -10 A 84 84 0 0 1 80 -30" fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={0.8} />
    {[[-20, 30], [30, 50], [-50, 60], [50, 0]].map(([x, y], i) => <Line key={i} pts={[[x - 8, y - 8], [x + 8, y + 8]]} w={4} seed={seed + 14 + i} taper={0.2} color="#BFE3FF" />)}
  </g>
);

export const Boomerang: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => (
  <g>
    <Shape pts={[[-40, -20], [-120, -120], [-250, -200], [-330, -110], [-280, -10], [-180, 20], [-60, 14]]} fill="#C6B5F2" w={7} seed={seed} />
    <Shape pts={[[40, 20], [120, 120], [250, 200], [330, 110], [280, 10], [180, -20], [60, -14]]} fill="#F2B5D2" w={7} seed={seed + 1} />
    <Shape pts={[[-40, -20], [-130, -90], [-230, -140], [-270, -80], [-210, -20], [-90, 4]]} fill="#E1D7FF" w={4} seed={seed + 2} />
    <Shape pts={[[40, 20], [130, 90], [230, 140], [270, 80], [210, 20], [90, -4]]} fill="#FFD9EA" w={4} seed={seed + 3} />
    <circle cx={0} cy={0} r={40} fill="#FFF6C8" opacity={0.6} />
    <Shape pts={circlePts(0, 0, 20, seed + 4, 8)} fill="#FFFFFF" w={5} seed={seed + 4} />
    {Array.from({length: 22}).map((_, i) => { const v = (k: number) => { const q = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return q - Math.floor(q); }; return <circle key={i} cx={-380 + v(1) * 760} cy={-240 + v(2) * 480} r={2 + v(3) * 3} fill="#FFFFFF" opacity={0.7} />; })}
  </g>
);

export const AbsZero: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => (
  <g>
    <circle cx={0} cy={0} r={240} fill="#BFE3FF" opacity={0.2} />
    <g transform={`rotate(${t * 6})`}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} transform={`rotate(${i * 60})`}>
          <Line pts={[[0, 0], [0, -210]]} w={14} seed={seed + i} taper={0.4} color="#DFF1FF" />
          <Line pts={[[0, -90], [-50, -140]]} w={10} seed={seed + 8 + i} taper={0.4} color="#DFF1FF" />
          <Line pts={[[0, -90], [50, -140]]} w={10} seed={seed + 16 + i} taper={0.4} color="#DFF1FF" />
          <Line pts={[[0, -150], [-34, -186]]} w={8} seed={seed + 24 + i} taper={0.4} color="#DFF1FF" />
          <Line pts={[[0, -150], [34, -186]]} w={8} seed={seed + 32 + i} taper={0.4} color="#DFF1FF" />
        </g>
      ))}
    </g>
    <Shape pts={circlePts(0, 0, 36, seed + 40, 10)} fill="#FFFFFF" w={6} seed={seed + 40} />
    <text x={0} y={14} textAnchor="middle" fontFamily="FredokaCaps" fontWeight={700} fontSize={44} fill={INK}>0 K</text>
  </g>
);
