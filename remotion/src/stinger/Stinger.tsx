import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stick} from '../stick/Stick';
import {Line, Shape, circlePts} from '../stick/ink';
import {INK, CREAM, WHITE, GLASS, BROWN_D} from '../stick/style';
import {FAMILY} from '../stick/fonts';

/** Series title stinger: "WAIT, WHY?" / "WAIT, WHO?" / "WAIT, HOW?" with the detective investigating. */
export type Series = 'why' | 'who' | 'how';
export const SERIES: Record<Series, {word: string; color: string}> = {
  why: {word: 'WHY?', color: '#D4A743'},
  who: {word: 'WHO?', color: '#C9563F'},
  how: {word: 'HOW?', color: '#4F9C93'},
};
export const STING_DUR = 1.35;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const inv = (a: number, b: number, x: number) => clamp((x - a) / (b - a));
const ss = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
const back = (u: number) => 1 + 2.4 * Math.pow(u - 1, 3) + 1.4 * Math.pow(u - 1, 2);
const wob = (t: number, t0: number, a: number, hz = 4, dec = 7) => (t < t0 ? 0 : a * Math.exp(-dec * (t - t0)) * Math.cos(2 * Math.PI * hz * (t - t0)));

/** u = seconds since the stinger started. */
export const Stinger: React.FC<{u: number; series: Series; dur?: number}> = ({u, series, dur = STING_DUR}) => {
  if (u < 0 || u > dur) return null;
  const S = SERIES[series];
  const out = ss(inv(dur - 0.24, dur, u));
  const dim = Math.min(1, u / 0.08) * (1 - out);
  const up = u < 0.03 ? 0 : back(inv(0.03, 0.26, u));
  const scan = u > 0.65 ? Math.sin((u - 0.65) * 9) : 0;
  const waitS = back(inv(0.12, 0.3, u));
  const T_STAMP = 0.52, T_LAND = 0.63;
  const stamp = inv(T_STAMP, T_LAND, u);
  const howS = u < T_STAMP ? 0 : 1 + 0.9 * (1 - ss(stamp));
  const howRot = -5 - 9 * (1 - ss(stamp)) + wob(u, T_LAND, 3, 6, 9);
  const splat = inv(T_LAND, 0.92, u);
  // magnifier held over the detective's right eye (stick coordinates)
  const lens = {x: 40 + scan * 6, y: -570, r: 50};
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 58%, rgba(30,36,54,0.35) 0%, rgba(20,19,17,0.78) 75%)', opacity: dim}} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        {/* drifting question marks */}
        {[[170, 1250, 0.0, 1.1], [905, 1180, 0.12, 0.9], [230, 900, 0.25, 0.8], [860, 860, 0.05, 1.0]].map(([x, y, d, s], i) => {
          const a = inv(0.3 + d, 0.5 + d, u) * (1 - out);
          if (a <= 0) return null;
          return (
            <text key={i} x={x + Math.sin(u * 3 + i) * 10} y={y - (u - 0.3) * 90} textAnchor="middle" fontFamily={FAMILY} fontWeight={700}
              fontSize={110 * s} fill={CREAM} stroke={INK} strokeWidth={14} paintOrder="stroke" opacity={a} transform={`rotate(${i % 2 ? 10 : -12} ${x} ${y})`}>?</text>
          );
        })}
        {/* the detective pops up and scans with the magnifier */}
        <g transform={`translate(540 ${2010 + (1 - up) * 720 + out * 900}) rotate(${scan * 3}) scale(1.55)`}>
          <Stick outfit="detective" expr="surprised" look={0.35 + scan * 0.35} armR={{elbow: [150, -420], hand: [118, -496]}} prop={false} seed={7} opts={{hatLift: 10 * Math.max(0, wob(u, T_LAND, 1, 4, 6))}} />
          <Line pts={[[lens.x + 34, lens.y + 40], [118, -488]]} w={13} seed={4} taper={0.85} color={BROWN_D} />
          <defs><clipPath id="stlens"><circle cx={lens.x} cy={lens.y} r={lens.r} /></clipPath></defs>
          <circle cx={lens.x} cy={lens.y} r={lens.r} fill={WHITE} />
          <g clipPath="url(#stlens)">
            <ellipse cx={lens.x - 4 + scan * 7} cy={lens.y + 4} rx={17} ry={25} fill={INK} />
            <circle cx={lens.x + 3 + scan * 7} cy={lens.y - 6} r={5.5} fill={WHITE} />
            <Line pts={[[lens.x - 36, lens.y - 38], [lens.x - 2, lens.y - 52], [lens.x + 30, lens.y - 44]]} w={7} seed={9} taper={0.3} />
            <circle cx={lens.x} cy={lens.y} r={lens.r} fill={GLASS} opacity={0.3} />
          </g>
          <Shape pts={circlePts(lens.x, lens.y, lens.r, 3, 14, 0.004)} fill="none" w={10} seed={5} />
          <Line pts={[[lens.x - 30, lens.y - 22], [lens.x - 16, lens.y - 36]]} w={6} seed={6} taper={0.5} color={WHITE} />
        </g>
        {/* ink burst when the series word lands */}
        {splat > 0 && splat < 1 && (
          <g transform="translate(560 700)" opacity={1 - splat}>
            {Array.from({length: 12}).map((_, i) => {
              const a = (i / 12) * Math.PI * 2 + 0.2;
              const r0 = 230 + 40 * splat, r1 = r0 + 60 + 50 * splat;
              return <Line key={i} pts={[[Math.cos(a) * r0 * 1.3, Math.sin(a) * r0 * 0.7], [Math.cos(a) * r1 * 1.3, Math.sin(a) * r1 * 0.7]]} w={12} seed={i} taper={0.5} color={i % 3 ? INK : S.color} />;
            })}
          </g>
        )}
      </svg>
      {/* title */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 360 - out * 700, display: 'flex', flexDirection: 'column', alignItems: 'center',
        fontFamily: FAMILY, fontWeight: 700, letterSpacing: '0.02em', filter: `drop-shadow(0px 12px 0px ${INK})`, opacity: 1 - out}}>
        <div style={{fontSize: 150, lineHeight: 1.0, color: CREAM, WebkitTextStroke: `22px ${INK}`, paintOrder: 'stroke fill',
          transform: `scale(${waitS}) rotate(-4deg)`, opacity: u > 0.12 ? 1 : 0}}>WAIT,</div>
        <div style={{fontSize: 250, lineHeight: 1.0, marginTop: 10, color: S.color, WebkitTextStroke: `26px ${INK}`, paintOrder: 'stroke fill',
          transform: `scale(${howS}) rotate(${howRot}deg)`, opacity: u > T_STAMP ? Math.min(1, (u - T_STAMP) / 0.05) : 0}}>{S.word}</div>
      </div>
    </AbsoluteFill>
  );
};
