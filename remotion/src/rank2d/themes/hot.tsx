import React from 'react';
import {Line, Shape, ellPts} from '../../stick/ink';
import {INK} from '../../stick/style';
import {Expr} from '../../stick/Stick';
import {DeathValley, Mercury, Venus, Sun, Lightning, SunCore} from '../../world3d/hotProps';
import {Theme} from '../Rank2D';
import CAPS from '../../hot/captions.json';

/** "The hottest things, ranked": word times are the voice take's times + 0.15 s (the take starts at 0.15). */
const O = 0.15;
const T = [7.766, 14.43, 18.1, 25.433, 29.192, 31.926].map((x) => x + O);
export const HOT_DUR = 37.7;
const HOOK_BEATS = [1.035 + O, 2.017 + O, 5.117 + O];
const FLASH_AT = [HOOK_BEATS[0], HOOK_BEATS[1], 3.1, 29.898 + O, 30.7 + O, 31.2 + O];
const flashAt = (t: number) => FLASH_AT.reduce((m, c) => { const e = t - c; return e >= 0 && e < 0.28 ? Math.max(m, Math.exp(-e * 11) * (Math.round(e * 30) % 2 ? 0.6 : 1)) : m; }, 0);

const drop = (x: number, y: number, k: number) => (
  <Shape key={`${x}${y}`} pts={[[x, y - 24 * k], [x + 12 * k, y], [x + 10 * k, y + 14 * k], [x, y + 20 * k], [x - 10 * k, y + 14 * k], [x - 12 * k, y]]} fill="#8FD0F0" w={3} seed={Math.abs(x + y) | 0} />
);
const Heat: React.FC<{lv: number}> = ({lv}) => (
  <g>
    {lv >= 2 && [drop(-108, -612, 1), drop(110, -596, 1)]}
    {lv >= 3 && [drop(-98, -540, 0.9), drop(100, -528, 0.9)]}
    {lv >= 4 && [0, 1, 2].map((i) => <Line key={`st${i}`} pts={[[-50 + i * 50, -690], [-60 + i * 50, -730], [-42 + i * 50, -770], [-54 + i * 50, -810]]} w={6} seed={40 + i} taper={0.8} color="#E4DFD2" />)}
    {lv >= 6 && (
      <g>
        <Shape pts={ellPts(-35, -566, 31, 21)} fill={INK} w={4} seed={61} />
        <Shape pts={ellPts(35, -566, 31, 21)} fill={INK} w={4} seed={62} />
        <Line pts={[[-6, -572], [6, -572]]} w={5} seed={63} />
        <Line pts={[[-66, -574], [-104, -586]]} w={5} seed={64} />
        <Line pts={[[66, -574], [104, -586]]} w={5} seed={65} />
      </g>
    )}
  </g>
);

const hostExpr = (t: number, lv: number): Expr => {
  if (t < T[0] - 0.2) return t < HOOK_BEATS[1] ? 'happy' : t < 3.4 ? 'surprised' : t < HOOK_BEATS[2] ? 'worried' : 'smug';
  if (T.some((c) => t > c && t < c + 0.6)) return lv >= 6 ? 'smug' : lv >= 4 ? 'shock' : 'surprised';
  return lv <= 1 ? 'neutral' : lv <= 3 ? 'worried' : lv <= 5 ? 'shock' : 'smug';
};

const Stars: React.FC<{t: number; y0: number; y1: number}> = ({y0, y1}) => (
  <g>
    {Array.from({length: 150}).map((_, i) => {
      const h = (n: number) => { const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); };
      const y = y0 + 1800 + h(1) * (y1 - y0 - 1500);
      return <circle key={i} cx={-1800 + h(2) * 3600} cy={y} r={1.5 + h(3) * 3.5} fill="#FFF6D8" opacity={0.25 + 0.5 * h(4)} />;
    })}
  </g>
);

const HookLightning: React.FC<{t: number}> = ({t}) => <Lightning t={t} seed={11} flash={flashAt(t)} />;
const LightningEntry: React.FC<{t: number}> = ({t}) => <Lightning t={t} seed={11} flash={flashAt(t)} />;
const CoreEntry: React.FC<{t: number}> = ({t}) => <SunCore t={t} seed={13} pulse={Math.max(0, Math.min(1, (t - T[5]) / 3))} />;

export const hotTheme: Theme = {
  dur: HOT_DUR,
  cut: T[0] - 0.2,
  hook: {Prop: HookLightning, scale: 1.0, z: 330},
  entries: [
    {Prop: ({t}) => <g transform="translate(0 140)"><DeathValley t={t} seed={3} /></g>, t0: T[0], c0: 10.07, c1: 11.0, v: 134, pre: '', post: '°F', z: 250, scale: 1.3},
    {Prop: ({t}) => <Mercury t={t} seed={5} />, t0: T[1], c0: 17.3, c1: 17.95, v: 800, pre: '~', post: '°F', z: 400},
    {Prop: ({t}) => <Venus t={t} seed={7} />, t0: T[2], c0: 20.1, c1: 21.0, v: 860, pre: '~', post: '°F', z: 380},
    {Prop: ({t}) => <Sun t={t} seed={9} />, t0: T[3], c0: 27.9, c1: 28.9, v: 10000, pre: '~', post: '°F', z: 320},
    {Prop: LightningEntry, t0: T[4], c0: 30.85, c1: 31.8, v: 50000, pre: '~', post: '°F', z: 330},
    {Prop: CoreEntry, t0: T[5], c0: 35.15, c1: 36.8, v: 27000000, pre: '>', post: '°F', z: 320},
  ],
  bg: ['#3b4a6b', '#F4C98A', '#1b2440', '#2a2f55', '#33264f', '#35446a', '#3a1a22'],
  Far: Stars,
  captions: (CAPS as Theme['captions']).map((c, i) => (i === 0 ? {...c, start: 0} : c)), // title text is already up on frame 0 (cover)
  hostExpr,
  hostFlush: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1],
  HostOverlay: Heat,
  hostPoint: true,
  vignette: {from: T[3], to: T[5] + 2, rgb: '255,90,20', max: 0.5},
  whiteOut: {from: 36.55, to: 37.35, rgb: '#FFF3C8'},
  voice: 'hot/voice.mp3',
};
