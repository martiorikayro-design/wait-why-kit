import React from 'react';
import {INK} from './style';

/** Hand-inked line helpers: strokes are filled brush shapes whose width varies and tapers, like a real ink pen. */
export type P = [number, number];

const nz = (x: number, s: number) =>
  Math.sin(x * 1.7 + s) * 0.5 + Math.sin(x * 3.13 + s * 2.3) * 0.3 + Math.sin(x * 7.31 + s * 0.71) * 0.2;

/** Catmull-Rom resampling of a polyline (open or closed). */
const sample = (pts: P[], n: number, closed: boolean): P[] => {
  const out: P[] = [];
  const m = pts.length;
  const get = (i: number): P => (closed ? pts[((i % m) + m) % m] : pts[Math.max(0, Math.min(m - 1, i))]);
  const segs = closed ? m : m - 1;
  for (let k = 0; k < n; k++) {
    const u = closed ? (k / n) * segs : (k / (n - 1)) * segs;
    const i = Math.min(Math.floor(u), segs - 1);
    const t = u - i;
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const t2 = t * t, t3 = t2 * t;
    const f = (a: number, b: number, c: number, d: number) =>
      0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
};

const f2 = (v: number) => v.toFixed(1);
const poly = (ps: P[]) => ps.map((p, i) => `${i ? 'L' : 'M'}${f2(p[0])},${f2(p[1])}`).join('');

/** Smooth closed outline path through control points (for fills). */
export const smoothClosed = (pts: P[], n = 48) => poly(sample(pts, n, true)) + 'Z';

/** Brush stroke along a polyline: tapered ends, varying width, a little wobble. */
export const brush = (pts: P[], w: number, seed = 0, opt: {taper?: number; vary?: number; wob?: number; n?: number} = {}) => {
  const {taper = 0.35, vary = 0.22, wob = 0.7, n = Math.max(10, pts.length * 9)} = opt;
  const s = sample(pts, n, false);
  const L: P[] = [], R: P[] = [];
  for (let i = 0; i < s.length; i++) {
    const a = s[Math.max(0, i - 1)], b = s[Math.min(s.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const len = Math.hypot(tx, ty) || 1;
    tx /= len; ty /= len;
    const u = i / (s.length - 1);
    const end = Math.pow(Math.sin(Math.PI * Math.min(0.999, Math.max(0.001, u))), 0.45);
    const ww = w * (taper + (1 - taper) * end) * (1 + vary * nz(u * 5, seed));
    const off = wob * nz(u * 3.3, seed + 9);
    const nx = -ty, ny = tx;
    L.push([s[i][0] + nx * (ww / 2 + off), s[i][1] + ny * (ww / 2 + off)]);
    R.push([s[i][0] - nx * (ww / 2 - off), s[i][1] - ny * (ww / 2 - off)]);
  }
  return poly([...L, ...R.reverse()]) + 'Z';
};

/** Closed brush ring around a closed shape (outer + inner contour, even-odd). */
export const brushRing = (pts: P[], w: number, seed = 0, n = 64) => {
  const s = sample(pts, n, true);
  const O: P[] = [], I: P[] = [];
  for (let i = 0; i < s.length; i++) {
    const a = s[(i - 1 + s.length) % s.length], b = s[(i + 1) % s.length];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const len = Math.hypot(tx, ty) || 1;
    tx /= len; ty /= len;
    const u = i / s.length;
    const ww = w * (1 + 0.28 * nz(u * 9, seed)) * (0.85 + 0.15 * Math.sin(u * Math.PI * 2 + seed));
    const nx = -ty, ny = tx;
    O.push([s[i][0] + nx * ww / 2, s[i][1] + ny * ww / 2]);
    I.push([s[i][0] - nx * ww / 2, s[i][1] - ny * ww / 2]);
  }
  return poly(O) + 'Z' + poly(I.reverse()) + 'Z';
};

export const circlePts = (cx: number, cy: number, r: number, seed = 0, k = 12, wob = 0.01): P[] =>
  Array.from({length: k}, (_, i) => {
    const a = (i / k) * Math.PI * 2;
    const rr = r * (1 + wob * nz(i * 1.3, seed));
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as P;
  });

export const ellPts = (cx: number, cy: number, rx: number, ry: number, k = 12, rot = 0): P[] =>
  Array.from({length: k}, (_, i) => {
    const a = (i / k) * Math.PI * 2;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    const c = Math.cos(rot), s = Math.sin(rot);
    return [cx + x * c - y * s, cy + x * s + y * c] as P;
  });

/** A filled shape with a hand-inked outline. */
export const Shape: React.FC<{pts: P[]; fill: string; w?: number; seed?: number}> = ({pts, fill, w = 7, seed = 0}) => (
  <g>
    <path d={smoothClosed(pts)} fill={fill} />
    <path d={brushRing(pts, w, seed)} fill={INK} fillRule="evenodd" />
  </g>
);

/** An ink stroke. */
export const Line: React.FC<{pts: P[]; w?: number; seed?: number; taper?: number; color?: string}> = ({pts, w = 7, seed = 0, taper, color = INK}) => (
  <path d={brush(pts, w, seed, {taper})} fill={color} />
);
