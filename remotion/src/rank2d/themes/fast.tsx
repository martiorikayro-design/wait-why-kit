import React from 'react';
import {Expr} from '../../stick/Stick';
import {Theme} from '../Rank2D';
import {Runner, Maglev, Spy, Probe, Proton, LightBeam} from '../props';
import {Stars, arrivals, counters, endOf, Tok} from '../auto';
import TAKE from '../../fast/take.json';
import CAPS from '../../fast/captions.json';

/** "The fastest things, ranked" - voice take + captions come from src/fast (regenerate them when the real voice exists). */
const take = TAKE as Tok[];
const T = arrivals(take);
export const FAST_DUR = endOf(take) + 0.7;
const C = counters(take, T, [
  {after: 'Number', word: 'twenty-eight', v: 28, post: ' MPH'},
  {after: 'Five', word: 'three', v: 375, post: ' MPH'},
  {after: 'Four', word: 'two', v: 2193, post: ' MPH'},
  {after: 'Three', word: 'four', v: 430000, post: ' MPH'},
  {after: 'Two', word: 'just', v: 1, fmt: (p) => `${(99.9999991 * p).toFixed(7)}%`, lead: 0.2},
  {after: 'And', word: 'six', v: 670616629, post: ' MPH', dur: 1.4},
]);
const hostExpr = (t: number, lv: number): Expr => {
  if (t < T[0] - 0.2) return t < 3 ? 'happy' : t < 5 ? 'surprised' : 'smug';
  if (T.some((c) => t > c && t < c + 0.6)) return lv >= 5 ? 'shock' : 'surprised';
  return lv <= 2 ? 'neutral' : lv <= 4 ? 'smug' : 'shock';
};
export const fastTheme: Theme = {
  dur: FAST_DUR,
  cut: T[0] - 0.2,
  hook: {Prop: ({t}) => <LightBeam t={t} seed={3} />, scale: 1, z: 330},
  entries: [
    {Prop: ({t}) => <Runner t={t} seed={3} />, t0: T[0], ...C[0], z: 300},
    {Prop: ({t}) => <Maglev t={t} seed={5} />, t0: T[1], ...C[1], z: 250},
    {Prop: ({t}) => <Spy t={t} seed={7} />, t0: T[2], ...C[2], z: 250},
    {Prop: ({t}) => <Probe t={t} seed={9} />, t0: T[3], ...C[3], z: 260},
    {Prop: ({t}) => <Proton t={t} seed={11} />, t0: T[4], ...C[4], z: 250},
    {Prop: ({t}) => <LightBeam t={t} seed={13} />, t0: T[5], ...C[5], z: 330},
  ],
  bg: ['#101a3a', '#9BD0A8', '#8FC6EA', '#5E9BD6', '#1B1F45', '#2A1850', '#0E0C26'],
  Far: () => <Stars from={5400} />,
  captions: (CAPS as Theme['captions']).map((c, i) => (i === 0 ? {...c, start: 0} : c)),
  hostExpr,
  hostPoint: true,
  shake: false,
  whiteOut: {from: FAST_DUR - 1.0, to: FAST_DUR - 0.1, rgb: '#FFFFFF'},
  voice: 'fast/voice.mp3',
};
