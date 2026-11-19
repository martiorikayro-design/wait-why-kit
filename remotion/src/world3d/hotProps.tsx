import React from 'react';
import {Line, P, Shape, circlePts, ellPts} from '../stick/ink';
import {INK, WHITE} from '../stick/style';

/** Props for "The hottest things, ranked" - same hand-inked stickman style as the channel's other props. */

const ray = (cx: number, cy: number, r0: number, r1: number, n: number, rot = 0): P[] => {
  const pts: P[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 ? r0 : r1;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
};

export const Thermometer: React.FC<{x: number; level: number; seed?: number}> = ({x, level, seed = 1}) => (
  <g transform={`translate(${x} 0)`}>
    <Shape pts={[[-20, -330], [20, -330], [22, -60], [-22, -60]]} fill={WHITE} w={6} seed={seed} />
    <Shape pts={circlePts(0, -34, 40, seed + 1, 10)} fill={WHITE} w={6} seed={seed + 1} />
    <Shape pts={circlePts(0, -34, 26, seed + 2, 10)} fill="#D9402C" w={3} seed={seed + 2} />
    <Shape pts={[[-9, -60 - 250 * level], [9, -60 - 250 * level], [9, -40], [-9, -40]]} fill="#D9402C" w={3} seed={seed + 3} />
    {[0, 1, 2, 3, 4, 5].map((i) => <Line key={i} pts={[[22, -90 - i * 40], [40, -90 - i * 40]]} w={4} seed={seed + 4 + i} taper={0.3} />)}
  </g>
);

export const DeathValley: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => (
  <g>
    <Shape pts={[[-340, 20], [-260, -30], [-120, -60], [30, -40], [190, -70], [340, -20], [360, 40], [-360, 40]]} fill="#E2C28A" w={7} seed={seed} />
    <Shape pts={[[-340, 20], [-200, 0], [-40, 18], [150, 4], [340, 24], [360, 40], [-360, 40]]} fill="#C9A26A" w={4} seed={seed + 1} />
    {/* saguaro cactus */}
    <Shape pts={[[170, -20], [166, -250], [180, -280], [204, -250], [200, -20]]} fill="#6FA365" w={6.5} seed={seed + 2} />
    <Shape pts={[[166, -140], [120, -150], [108, -210], [128, -216], [136, -174], [166, -170]]} fill="#6FA365" w={6} seed={seed + 3} />
    <Shape pts={[[200, -110], [244, -120], [256, -180], [236, -186], [228, -148], [200, -142]]} fill="#6FA365" w={6} seed={seed + 4} />
    {[[-1, 0], [1, 0]].map((_, i) => <Line key={i} pts={[[183, -230 + i * 70], [183, -190 + i * 70]]} w={3} seed={seed + 5 + i} taper={0.5} color="#4B7E44" />)}
    <Thermometer x={-150} level={0.92} seed={seed + 8} />
    {/* blazing little sun */}
    <g transform={`translate(-250 -330) rotate(${t * 20})`}>
      <Shape pts={ray(0, 0, 70, 104, 9)} fill="#F5B82E" w={5} seed={seed + 20} />
    </g>
    <Shape pts={circlePts(-250, -330, 62, seed + 21, 12)} fill="#FFD54A" w={6} seed={seed + 21} />
  </g>
);

export const Mercury: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => (
  <g>
    <Shape pts={circlePts(0, 0, 190, seed, 14)} fill="#A39A8F" w={8} seed={seed} />
    <path d="M 0 -186 A 186 186 0 0 1 0 186 A 120 186 0 0 0 0 -186 Z" fill="#E8A458" opacity={0.55} />
    {[[-70, -50, 34], [40, -90, 24], [-30, 70, 42], [90, 40, 28], [-110, 40, 20], [60, 120, 18]].map(([x, y, r], i) => (
      <g key={i}>
        <Shape pts={circlePts(x, y, r, seed + 3 + i, 9, 0.04)} fill="#877E73" w={4.5} seed={seed + 3 + i} />
        <Shape pts={circlePts(x + 4, y + 4, r * 0.55, seed + 9 + i, 8, 0.05)} fill="#746C62" w={2.5} seed={seed + 9 + i} />
      </g>
    ))}
  </g>
);

export const Venus: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => (
  <g>
    <circle cx={0} cy={0} r={236} fill="#F6D58A" opacity={0.28} />
    <circle cx={0} cy={0} r={212} fill="#F6D58A" opacity={0.28} />
    <Shape pts={circlePts(0, 0, 190, seed, 14)} fill="#E6B05A" w={8} seed={seed} />
    {[-110, -55, 0, 55, 110].map((y, i) => (
      <Line key={i} pts={[[-150 + Math.abs(y) * 0.25, y], [-60, y - 16 + Math.sin(t * 1.5 + i) * 5], [40, y + 14], [150 - Math.abs(y) * 0.25, y - 6 + Math.cos(t * 1.3 + i) * 5]]} w={9} seed={seed + 4 + i} taper={0.9} color={i % 2 ? '#F5D793' : '#C98B3C'} />
    ))}
    {[[-60, -150], [50, -170], [110, 20]].map(([x, y], i) => <Line key={`h${i}`} pts={[[x - 20, y], [x + 20, y - 6]]} w={4} seed={seed + 14 + i} taper={0.9} color="#FFF1C8" />)}
  </g>
);

export const Sun: React.FC<{t: number; seed?: number; glow?: number}> = ({t, seed = 1, glow = 1}) => (
  <g>
    <circle cx={0} cy={0} r={260} fill="#FFD54A" opacity={0.16 * glow} />
    <g transform={`rotate(${t * 14})`}>
      <Shape pts={ray(0, 0, 196, 250, 12)} fill="#F5A62E" w={6} seed={seed} />
    </g>
    <Shape pts={circlePts(0, 0, 186, seed + 1, 14)} fill="#FFD23F" w={8} seed={seed + 1} />
    {[-1, 1].map((s) => <ellipse key={s} cx={s * 60} cy={-20} rx={12} ry={17} fill={INK} />)}
    <Line pts={[[-52, 50], [0, 76], [52, 50]]} w={7} seed={seed + 5} taper={0.3} />
    {[-1, 1].map((s) => <Shape key={`c${s}`} pts={circlePts(s * 98, 30, 22, seed + 8, 8, 0.03)} fill="#F28B3C" w={0} seed={seed + 8} />)}
  </g>
);

export const Lightning: React.FC<{t: number; seed?: number; flash?: number}> = ({t, seed = 1, flash = 0}) => (
  <g>
    <circle cx={0} cy={120} r={210} fill="#FFF4B0" opacity={0.18 + 0.4 * flash} />
    {[[-150, -160, 90], [-40, -200, 110], [90, -170, 100], [170, -130, 70], [-210, -110, 60]].map(([x, y, r], i) => (
      <Shape key={i} pts={circlePts(x, y, r, seed + i, 10, 0.03)} fill={i % 2 ? '#5C6784' : '#6A7592'} w={6.5} seed={seed + i} />
    ))}
    <Shape pts={[[30, -110], [-70, 30], [-6, 28], [-90, 220], [90, 20], [20, 22], [100, -110]]} fill="#FFD23F" w={7.5} seed={seed + 10} />
    {[[-150, 80], [150, 60], [-120, 170], [130, 170]].map(([x, y], i) => (
      <Line key={i} pts={[[x - 22, y - 10], [x + 22, y + 12]]} w={5} seed={seed + 12 + i} taper={0.8} color="#FFE86B" />
    ))}
  </g>
);

export const SunCore: React.FC<{t: number; seed?: number; pulse?: number}> = ({t, seed = 1, pulse = 0}) => (
  <g transform={`scale(${1 + 0.03 * Math.sin(t * 5) + pulse * 0.05})`}>
    <circle cx={0} cy={0} r={262} fill="#FF8A3C" opacity={0.2} />
    <Shape pts={circlePts(0, 0, 196, seed, 14)} fill="#F5A62E" w={8} seed={seed} />
    <Shape pts={circlePts(0, 0, 142, seed + 1, 12)} fill="#EE7B2A" w={6.5} seed={seed + 1} />
    <Shape pts={circlePts(0, 0, 92, seed + 2, 12)} fill="#E2452B" w={6} seed={seed + 2} />
    <Shape pts={circlePts(0, 0, 46, seed + 3, 10)} fill="#FFF3B0" w={5} seed={seed + 3} />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const a = (i / 8) * Math.PI * 2 + t * 0.6;
      return <Line key={i} pts={[[Math.cos(a) * 60, Math.sin(a) * 60], [Math.cos(a) * 84, Math.sin(a) * 84]]} w={4} seed={seed + 10 + i} taper={0.7} color="#FFF3B0" />;
    })}
  </g>
);
