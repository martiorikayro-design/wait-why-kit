import React from 'react';
import {Chunk, Entry, Theme} from './Rank2D';

/** Helpers to build a Theme from an aligned voice take (tokens {w, s, e}); the voice starts at OFF seconds in the scene. */
export type Tok = {w: string; s: number; e: number};
export const OFF = 0.15;

export const wordTime = (take: Tok[], word: string, after = -1, nth = 0): number => {
  const hits = take.filter((t) => t.w.toLowerCase() === word.toLowerCase() && t.s > after);
  return (hits[nth]?.s ?? NaN) + OFF;
};
/** arrival times of "Number six" .. "And number one" */
export const arrivals = (take: Tok[]): number[] => {
  const iNum = take.findIndex((t) => t.w === 'Number');
  const names = ['Five', 'Four', 'Three', 'Two'];
  const out = [take[iNum].s + OFF];
  for (const n of names) out.push(take.find((t, i) => i > iNum && t.w === n)!.s + OFF);
  const iAnd = take.findIndex((t, i) => t.w === 'And' && take[i + 1]?.w === 'number');
  out.push(take[iAnd].s + OFF);
  return out;
};
export const endOf = (take: Tok[]) => take[take.length - 1].e + OFF;

export const Stars: React.FC<{from: number}> = ({from}) => (
  <g>
    {Array.from({length: 170}).map((_, i) => {
      const h = (n: number) => { const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); };
      return <circle key={i} cx={-1800 + h(2) * 3600} cy={from + h(1) * 5200} r={1.5 + h(3) * 3.5} fill="#FFF6D8" opacity={0.25 + 0.5 * h(4)} />;
    })}
  </g>
);

export type CountSpec = {after: string; word: string; skip?: number; v: number; pre?: string; post?: string; dur?: number; fmt?: (p: number) => string; lead?: number};
export const counters = (take: Tok[], T0: number[], specs: CountSpec[]): Pick<Entry, 'c0' | 'c1' | 'v' | 'pre' | 'post' | 'fmt'>[] =>
  specs.map((sp, i) => {
    const c0 = wordTime(take, sp.word, T0[i] - OFF - 0.0001, sp.skip ?? 0) + (sp.lead ?? 0);
    return {c0, c1: c0 + (sp.dur ?? 0.9), v: sp.v, pre: sp.pre ?? '', post: sp.post ?? '', fmt: sp.fmt};
  });
export type {Chunk, Theme};
