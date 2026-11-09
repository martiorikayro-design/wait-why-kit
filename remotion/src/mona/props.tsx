import React from 'react';
import {Line, P, Shape, circlePts, ellPts} from '../stick/ink';
import {INK, CREAM, TAN, TAN_D, SAGE, SAGE_D, BROWN, BROWN_D, MUSTARD, MUSTARD_D, NAVY, WHITE, GLASS, BRICK} from '../stick/style';

/** Props for "The Mona Lisa" short, in the hand-inked stickman style. */

/** Simplified rendition of the (public-domain) Mona Lisa. Origin = centre of the panel, 200x280. */
export const MonaLisa: React.FC<{look?: number; smile?: number; seed?: number}> = ({look = 0, smile = 0, seed = 1}) => (
  <g>
    <rect x={-100} y={-140} width={200} height={280} fill="#7D8A69" />
    <rect x={-100} y={-140} width={200} height={110} fill="#9AA587" />
    <path d="M -100,-40 C -60,-60 -30,-30 0,-50 C 40,-70 70,-40 100,-56 L 100,140 L -100,140 Z" fill="#5F6B4B" />
    <Line pts={[[-96, -20], [-70, -30], [-56, -12], [-76, 4]]} w={4} seed={seed} taper={0.4} color={TAN} />
    <Line pts={[[64, -36], [80, -24], [70, -4], [92, 6]]} w={4} seed={seed + 1} taper={0.4} color={TAN} />
    <Shape pts={[[-92, 140], [-84, 64], [-52, 30], [-20, 22], [20, 22], [52, 30], [84, 64], [92, 140]]} fill="#3A3226" w={4} seed={seed + 2} />
    <Shape pts={[[-46, -76], [-52, -26], [-50, 30], [-38, 40], [-30, -8], [-28, -62], [0, -86], [28, -62], [30, -8], [38, 40], [50, 30], [52, -26], [46, -76], [20, -96], [-20, -96]]} fill="#2B231B" w={3.5} seed={seed + 3} />
    <Shape pts={ellPts(0, -38, 27, 36)} fill="#D6B487" w={3.5} seed={seed + 4} />
    <ellipse cx={-10 + look * 4} cy={-44} rx={4} ry={2.8} fill={INK} />
    <ellipse cx={11 + look * 4} cy={-44} rx={4} ry={2.8} fill={INK} />
    <Line pts={[[-11, -18 + smile], [0, -15 + smile * 1.6], [11, -18 + smile]]} w={2.8} seed={seed + 5} taper={0.4} />
    <Line pts={[[-14, 22], [0, 32], [14, 22]]} w={2.5} seed={seed + 6} taper={0.4} color="#2B231B" />
    <Shape pts={ellPts(14, 112, 34, 12, 10, -0.1)} fill="#D6B487" w={3} seed={seed + 7} />
    <Shape pts={ellPts(-10, 120, 30, 11, 10, 0.1)} fill="#D6B487" w={3} seed={seed + 8} />
  </g>
);

/** The painting in its gilt frame. Origin = centre. */
export const Framed: React.FC<{look?: number; smile?: number; seed?: number}> = ({look, smile, seed = 1}) => (
  <g>
    <Shape pts={[[-124, -164], [124, -164], [124, 164], [-124, 164]]} fill={MUSTARD_D} w={8} seed={seed + 10} />
    <Shape pts={[[-110, -150], [110, -150], [110, 150], [-110, 150]]} fill={MUSTARD} w={5} seed={seed + 11} />
    <MonaLisa look={look} smile={smile} seed={seed} />
    <rect x={-100} y={-140} width={200} height={280} fill="none" stroke={INK} strokeWidth={4} />
  </g>
);

/** Protective glass case, drawn over the frame. */
export const GlassCase: React.FC<{shine?: number; seed?: number}> = ({shine = 0, seed = 1}) => (
  <g>
    <rect x={-150} y={-192} width={300} height={384} fill={GLASS} opacity={0.22} />
    <Shape pts={[[-150, -192], [150, -192], [150, 192], [-150, 192]]} fill="none" w={5} seed={seed} />
    <g opacity={0.75 + 0.25 * shine}>
      <Line pts={[[-120 + shine * 160, -170], [-40 + shine * 160, -90]]} w={9} seed={seed + 1} taper={0.4} color={WHITE} />
      <Line pts={[[-96 + shine * 160, -172], [-56 + shine * 160, -132]]} w={5} seed={seed + 2} taper={0.4} color={WHITE} />
    </g>
  </g>
);

/** The four iron pegs left on the wall. Origin = where the painting's centre was. */
export const Hooks: React.FC<{seed?: number}> = ({seed = 1}) => (
  <g>
    {[[-104, -168], [104, -168], [-104, 168], [104, 168]].map(([x, y], i) => (
      <g key={i}>
        <Shape pts={circlePts(x, y, 7, seed + i, 8)} fill="#4A443C" w={3} seed={seed + i} />
        <Line pts={[[x, y], [x, y + (y < 0 ? 18 : -18)], [x + 8, y + (y < 0 ? 24 : -24)]]} w={6} seed={seed + 5 + i} taper={0.6} />
      </g>
    ))}
  </g>
);

/** A generic framed painting for the gallery wall (no real artwork). */
export const WallArt: React.FC<{w: number; h: number; kind: 'land' | 'still' | 'portrait'; seed: number}> = ({w, h, kind, seed}) => (
  <g>
    <Shape pts={[[-w / 2 - 16, -h / 2 - 16], [w / 2 + 16, -h / 2 - 16], [w / 2 + 16, h / 2 + 16], [-w / 2 - 16, h / 2 + 16]]} fill={BROWN} w={6} seed={seed} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={kind === 'portrait' ? '#6B5A48' : '#A7B39A'} />
    {kind === 'land' && <path d={`M ${-w / 2},${h * 0.1} C ${-w / 4},${-h * 0.15} ${w / 6},${h * 0.2} ${w / 2},${-h * 0.05} L ${w / 2},${h / 2} L ${-w / 2},${h / 2} Z`} fill={SAGE_D} />}
    {kind === 'still' && <Shape pts={ellPts(0, h * 0.1, w * 0.22, h * 0.22)} fill={BRICK} w={3.5} seed={seed + 2} />}
    {kind === 'portrait' && <Shape pts={[[-w * 0.3, h / 2], [-w * 0.24, h * 0.1], [0, -h * 0.02], [w * 0.24, h * 0.1], [w * 0.3, h / 2]]} fill="#3D3229" w={3} seed={seed + 3} />}
    {kind === 'portrait' && <Shape pts={circlePts(0, -h * 0.18, w * 0.18, seed, 8)} fill="#CDB08A" w={3} seed={seed + 4} />}
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke={INK} strokeWidth={3.5} />
  </g>
);

export const Doorway: React.FC<{seed: number}> = ({seed}) => (
  <g>
    <Shape pts={[[-110, 0], [-110, -330], [-80, -400], [0, -432], [80, -400], [110, -330], [110, 0]]} fill={TAN_D} w={8} seed={seed} />
    <Shape pts={[[-84, 0], [-84, -318], [-60, -372], [0, -398], [60, -372], [84, -318], [84, 0]]} fill="#4E443A" w={6} seed={seed + 1} />
  </g>
);

export const Clock: React.FC<{t: number; speed?: number; seed?: number}> = ({t, speed = 0, seed = 1}) => {
  const hm = (t * speed * 360) % 360, hh = (t * speed * 30) % 360;
  return (
    <g>
      <Shape pts={circlePts(0, 0, 52, seed, 12)} fill={CREAM} w={7} seed={seed} />
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 40} cy={Math.sin(a) * 40} r={2.6} fill={INK} />;
      })}
      <Line pts={[[0, 0], [Math.sin((hm * Math.PI) / 180) * 36, -Math.cos((hm * Math.PI) / 180) * 36]]} w={5} seed={seed + 1} taper={0.5} />
      <Line pts={[[0, 0], [Math.sin(((hh + 120) * Math.PI) / 180) * 24, -Math.cos(((hh + 120) * Math.PI) / 180) * 24]]} w={6.5} seed={seed + 2} taper={0.5} />
    </g>
  );
};

/** Old box camera on a tripod, with an optional flash puff. */
export const BoxCamera: React.FC<{flash?: number; seed?: number}> = ({flash = 0, seed = 1}) => (
  <g>
    <Line pts={[[0, 20], [-40, 130]]} w={6} seed={seed} taper={0.6} />
    <Line pts={[[0, 20], [40, 130]]} w={6} seed={seed + 1} taper={0.6} />
    <Line pts={[[0, 20], [0, 130]]} w={6} seed={seed + 2} taper={0.6} />
    <Shape pts={[[-46, -36], [40, -36], [40, 26], [-46, 26]]} fill={BROWN} w={6} seed={seed + 3} />
    <Shape pts={[[40, -22], [74, -30], [74, 22], [40, 14]]} fill={BROWN_D} w={5} seed={seed + 4} />
    <Shape pts={circlePts(-2, -6, 12, seed, 8)} fill={GLASS} w={4} seed={seed + 5} />
    <Line pts={[[-36, -36], [-36, -70]]} w={5} seed={seed + 6} taper={0.6} />
    {flash > 0 && <Shape pts={circlePts(-36, -84, 26 * flash, seed + 1, 10, 0.18)} fill={WHITE} w={5} seed={seed + 7} />}
  </g>
);

export const Newspaper: React.FC<{seed?: number}> = ({seed = 1}) => (
  <g>
    <Shape pts={[[-70, -50], [70, -54], [74, 50], [-66, 54]]} fill={CREAM} w={5} seed={seed} />
    <Shape pts={[[-56, -36], [-6, -38], [-4, 30], [-54, 32]]} fill="#7D8A69" w={3.5} seed={seed + 1} />
    {[-30, -16, -2, 12, 26].map((y, i) => <Line key={i} pts={[[6, y], [58, y - 1]]} w={3.5} seed={seed + 2 + i} taper={0.7} />)}
    <Line pts={[[-56, -46], [56, -48]]} w={6} seed={seed + 8} taper={0.7} />
  </g>
);

/** Wooden travel trunk; lid opens around its back hinge (0..1). */
export const Trunk: React.FC<{open?: number; seed?: number}> = ({open = 0, seed = 1}) => (
  <g>
    <Shape pts={[[-150, 0], [-150, -120], [150, -120], [150, 0]]} fill={BROWN} w={7} seed={seed} />
    {[-100, 100].map((x, i) => <Shape key={i} pts={[[x - 12, 0], [x - 12, -120], [x + 12, -120], [x + 12, 0]]} fill={BROWN_D} w={4} seed={seed + 1 + i} />)}
    <g transform={`translate(0 -120) rotate(${-open * 28} 150 0)`}>
      <Shape pts={[[-156, 0], [-156, -40], [-120, -64], [120, -64], [156, -40], [156, 0]]} fill={BROWN} w={7} seed={seed + 4} />
      <Shape pts={[[-16, -6], [16, -6], [16, 18], [-16, 18]]} fill={MUSTARD} w={4} seed={seed + 5} />
    </g>
  </g>
);

export const Candle: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => {
  const f = 1 + 0.12 * Math.sin(t * 23) + 0.06 * Math.sin(t * 37 + 1);
  return (
    <g>
      <Shape pts={[[-40, 0], [-40, -90], [40, -90], [40, 0]]} fill={BROWN_D} w={6} seed={seed} />
      <Shape pts={[[-14, -90], [-14, -150], [14, -150], [14, -90]]} fill={CREAM} w={5} seed={seed + 1} />
      <circle cx={0} cy={-176} r={70} fill="#F6D27A" opacity={0.18} />
      <path d={`M 0,${-152} C -12,-164 -8,${-186 * f + 10} 0,${-196 * f + 14} C 8,${-186 * f + 10} 12,-164 0,-152 Z`} fill="#F2B544" />
    </g>
  );
};

export const MoonWindow: React.FC<{seed?: number}> = ({seed = 1}) => (
  <g>
    <Shape pts={[[-120, -160], [120, -160], [120, 160], [-120, 160]]} fill="#1F2A40" w={8} seed={seed} />
    <Shape pts={circlePts(40, -60, 42, seed, 10)} fill="#EFE3C2" w={5} seed={seed + 1} />
    <Line pts={[[0, -160], [0, 160]]} w={7} seed={seed + 2} taper={0.9} color={TAN_D} />
    <Line pts={[[-120, 0], [120, 0]]} w={7} seed={seed + 3} taper={0.9} color={TAN_D} />
  </g>
);

export {SAGE, NAVY, TAN};
export type {P};
