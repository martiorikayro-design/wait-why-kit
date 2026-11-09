import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stick} from '../stick/Stick';
import {Line, Shape} from '../stick/ink';
import {INK, CREAM, WHITE, BROWN, BROWN_D, TAN} from '../stick/style';
import {FAMILY} from '../stick/fonts';

/** End card: the detective pulls in a corkboard; SUBSCRIBE / LIKE / SEND TO A FRIEND pop in and keep bouncing. u = seconds since start. */
export const OUTRO_DUR = 3.2;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const inv = (a: number, b: number, x: number) => clamp((x - a) / (b - a));
const back = (u: number) => 1 + 2.4 * Math.pow(u - 1, 3) + 1.4 * Math.pow(u - 1, 2);
const ss = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);

const WORDS = [
  {text: 'SUBSCRIBE', color: '#D4A743', t0: 0.55, size: 118, rot: -4},
  {text: 'LIKE', color: '#C9563F', t0: 0.85, size: 140, rot: 3},
  {text: 'SEND TO A FRIEND', color: '#4F9C93', t0: 1.15, size: 84, rot: -2},
];

export const Outro: React.FC<{u: number}> = ({u}) => {
  if (u < 0) return null;
  const dim = Math.min(1, u / 0.25);
  const slide = ss(inv(0.0, 0.45, u));           // the board is dragged in from the right
  const boardX = 1500 - 960 * slide;
  const pull = Math.sin(Math.PI * inv(0.0, 0.45, u));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(30,36,54,0.25) 0%, rgba(20,19,17,0.7) 80%)', opacity: dim}} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        {/* corkboard on an easel */}
        <g transform={`translate(${boardX} 880) rotate(${-3 * pull})`}>
          <Line pts={[[-300, 380], [-230, -360]]} w={18} seed={1} taper={0.9} color={BROWN_D} />
          <Line pts={[[300, 380], [230, -360]]} w={18} seed={2} taper={0.9} color={BROWN_D} />
          <Shape pts={[[-410, -400], [410, -400], [410, 330], [-410, 330]]} fill={BROWN} w={10} seed={3} />
          <Shape pts={[[-375, -365], [375, -365], [375, 295], [-375, 295]]} fill="#C9A675" w={6} seed={4} />
          {[[-320, -320], [320, -320], [-320, 250], [320, 250]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={12} fill="#B8432F" stroke={INK} strokeWidth={4} />)}
        </g>
        {/* the detective tugging the board in */}
        <g transform={`translate(${170 + 30 * pull} 2010) scale(1.15)`}>
          <Stick outfit="detective" expr={u > 1.2 ? 'happy' : 'smug'} armR={{elbow: [120, -440], hand: [190 + 40 * (1 - slide), -500]}} prop={false} seed={7} />
        </g>
      </svg>
      {/* the words, popping in and then bouncing on their own rhythm */}
      <div style={{position: 'absolute', left: boardX - 540, top: 560, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34,
        fontFamily: FAMILY, fontWeight: 700, letterSpacing: '0.02em', filter: `drop-shadow(0px 9px 0px ${INK})`}}>
        {WORDS.map((w, i) => {
          const p = u < w.t0 ? 0 : back(inv(w.t0, w.t0 + 0.28, u));
          const hop = u > w.t0 + 0.3 ? Math.abs(Math.sin((u - w.t0) * 5.2 + i * 1.1)) * 22 : 0;
          return (
            <div key={i} style={{fontSize: w.size, lineHeight: 1, color: w.color, WebkitTextStroke: `18px ${INK}`, paintOrder: 'stroke fill',
              transform: `translateY(${-hop}px) scale(${p}) rotate(${w.rot + Math.sin(u * 4 + i) * 2}deg)`}}>{w.text}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export {CREAM, WHITE, TAN};
