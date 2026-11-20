import React from 'react';
import {Line, Shape} from '../../stick/ink';
import {Expr} from '../../stick/Stick';
import {Theme} from '../Rank2D';
import {Antarctica, Nitrogen, Pluto, MoonCrater, Boomerang, AbsZero} from '../props';
import {Stars, arrivals, counters, endOf, Tok} from '../auto';
import TAKE from '../../cold/take.json';
import CAPS from '../../cold/captions.json';

/** "The coldest things, ranked": the host gets a frosty face, breath clouds and a shiver. */
const take = TAKE as Tok[];
const T = arrivals(take);
export const COLD_DUR = endOf(take) + 0.7;
const C = counters(take, T, [
  {after: 'Number', word: 'minus', v: -129, post: '°F', lead: 0.25},
  {after: 'Five', word: 'minus', v: -321, post: '°F', lead: 0.25},
  {after: 'Four', word: 'minus', v: -393, post: '°F', lead: 0.25},
  {after: 'Three', word: 'minus', v: -397, pre: '~', post: '°F', lead: 0.25},
  {after: 'Two', word: 'minus', v: -458, post: '°F', lead: 0.25},
  {after: 'And', word: 'minus', v: -460, post: '°F', lead: 0.25},
]);
const Chill: React.FC<{lv: number}> = ({lv}) => (
  <g>
    {lv >= 3 && <circle cx={0} cy={-559} r={104} fill="#BFE3FF" opacity={Math.min(0.5, 0.12 * (lv - 2))} />}
    {lv >= 1 && [[96, -498, 16], [128, -514, 22], [166, -532, 28]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#F4FAFF" stroke="#1C1A17" strokeWidth={4} opacity={0.9} />)}
    {lv >= 4 && [-70, -20, 30, 80].map((x, i) => <Shape key={i} pts={[[x - 9, -470], [x + 9, -470], [x, -440 + (i % 2) * 14]]} fill="#BFE3FF" w={3} seed={90 + i} />)}
    {lv >= 6 && <Line pts={[[-102, -600], [102, -600]]} w={8} seed={95} taper={0.2} color="#BFE3FF" />}
  </g>
);
const hostExpr = (t: number, lv: number): Expr => {
  if (t < T[0] - 0.2) return t < 3 ? 'happy' : t < 5 ? 'surprised' : 'worried';
  if (T.some((c) => t > c && t < c + 0.6)) return 'surprised';
  return lv <= 2 ? 'neutral' : lv <= 5 ? 'worried' : 'shock';
};
export const coldTheme: Theme = {
  dur: COLD_DUR,
  cut: T[0] - 0.2,
  hook: {Prop: ({t}) => <Boomerang t={t} seed={3} />, scale: 1, z: 300},
  entries: [
    {Prop: ({t}) => <Antarctica t={t} seed={3} />, t0: T[0], ...C[0], z: 280},
    {Prop: ({t}) => <Nitrogen t={t} seed={5} />, t0: T[1], ...C[1], z: 330},
    {Prop: ({t}) => <Pluto t={t} seed={7} />, t0: T[2], ...C[2], z: 360},
    {Prop: ({t}) => <MoonCrater t={t} seed={9} />, t0: T[3], ...C[3], z: 360},
    {Prop: ({t}) => <Boomerang t={t} seed={11} />, t0: T[4], ...C[4], z: 280},
    {Prop: ({t}) => <AbsZero t={t} seed={13} />, t0: T[5], ...C[5], z: 330},
  ],
  bg: ['#14213D', '#DCEBF6', '#B4D2EA', '#7FA6CC', '#4A6490', '#2B3568', '#161A3C'],
  Far: () => <Stars from={6200} />,
  captions: (CAPS as Theme['captions']).map((c, i) => (i === 0 ? {...c, start: 0} : c)),
  hostExpr,
  hostPoint: true,
  HostOverlay: Chill,
  vignette: {from: T[2], to: T[5] + 2, rgb: '150,200,255', max: 0.4},
  whiteOut: {from: COLD_DUR - 1.0, to: COLD_DUR - 0.1, rgb: '#E8F6FF'},
  voice: 'cold/voice.mp3',
};
