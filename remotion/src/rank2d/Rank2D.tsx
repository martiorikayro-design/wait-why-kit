import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {Stick, Arm, Expr, ARM_REST_L, ARM_REST_R} from '../stick/Stick';
import {Shape, circlePts} from '../stick/ink';
import {INK, CREAM, MUSTARD, WHITE} from '../stick/style';
import {FAMILY} from '../stick/fonts';

/**
 * Generic 2D ranking short (6 -> 1) in the channel's hand-inked stickman style.
 * A Theme supplies: timings (arrival word of every entry), one inked prop per entry, a backdrop colour per entry,
 * the captions, and how the host reacts. The camera glides down the world from entry to entry (same grammar as the
 * "longest living animals" video: smootherstep glides, a slow push-in while holding, a soft cut after the hook).
 */
export type Chunk = {start: number; end: number; words: {text: string; at: number}[]};
export type Entry = {
  Prop: React.FC<{t: number}>;
  t0: number; // arrival word ("Number six")
  c0: number; c1: number; v: number; pre: string; post: string; // counter: start/end time, final value, prefix, suffix
  fmt?: (p: number) => string; // custom counter text (p = 0..1)
  z?: number; // camera zoom (0 ~ none, 400 ~ 1.7x)
  scale?: number;
};
export type Theme = {
  dur: number;
  cut: number; // end of the hook (soft cut to #6)
  hook: {Prop: React.FC<{t: number}>; scale?: number; z?: number};
  entries: Entry[]; // #6 .. #1
  bg: string[]; // 7 colours: hook, #6 .. #1
  Far?: React.FC<{t: number; y0: number; y1: number}>;
  captions: Chunk[];
  hostExpr: (t: number, lv: number) => Expr;
  hostFlush?: number[]; // per level 0..6
  HostOverlay?: React.FC<{lv: number}>;
  hostPoint?: boolean; // host acts at every entry (point / wipe brow)
  shake?: boolean; // host trembles in the last levels (default true)
  vignette?: {from: number; to: number; rgb: string; max: number};
  whiteOut?: {from: number; to: number; rgb: string};
  voice?: string;
};

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const inv = (a: number, b: number, x: number) => clamp((x - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ss = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
const back = (u: number) => 1 + 2.4 * Math.pow(u - 1, 3) + 1.4 * Math.pow(u - 1, 2);
const pop = (t: number, t0: number, d = 0.25) => (t <= t0 ? 0 : back(clamp((t - t0) / d)));

const GAP = 1500, Y0 = 2600, HOOK_Y = 1000, LOOK_DY = 110;
const GLIDE = 1.2, GEND = 0.08;
const kOf = (z: number) => 1000 / (1000 - z);

type Pose = {x: number; y: number; z: number};
const posOf = (th: Theme, i: number): Pose =>
  i < 0 ? {x: 0, y: HOOK_Y, z: th.hook.z ?? 380} : {x: (i % 2 ? 60 : -60), y: Y0 + i * GAP, z: th.entries[i].z ?? 380};

const camAt = (th: Theme, t: number) => {
  const T0 = th.entries.map((e) => e.t0);
  const creepOf = (i: number, tt: number) => 40 * clamp((tt - (T0[i] - GEND)) / 3.5);
  if (t < th.cut) {
    const p = posOf(th, -1);
    return {x: p.x, y: p.y + LOOK_DY, z: p.z + 70 * ss(t / th.cut), r: lerp(2.5, 0.5, ss(t / th.cut))};
  }
  let i = 0;
  while (i < 5 && t >= T0[i + 1] - GLIDE) i++;
  const p = posOf(th, i);
  if (i === 0 || t >= T0[i] - GEND) return {x: p.x, y: p.y + LOOK_DY, z: p.z + creepOf(i, t), r: 0};
  const a = posOf(th, i - 1), u = ss(inv(T0[i] - GLIDE, T0[i] - GEND, t));
  const za = a.z + creepOf(i - 1, T0[i] - GLIDE);
  const k = Math.exp(lerp(Math.log(kOf(za)), Math.log(kOf(p.z)), u));
  return {x: lerp(a.x, p.x, u), y: lerp(a.y, p.y, u) + LOOK_DY, z: 1000 - 1000 / k, r: (i % 2 ? -1 : 1) * 1.6 * Math.sin(Math.PI * u)};
};

const Layer: React.FC<{cam: {x: number; y: number; z: number; r: number}; z: number; children: React.ReactNode}> = ({cam, z, children}) => {
  const d = z - cam.z;
  if (d < 150) return null;
  const k = 1000 / d;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g transform={`translate(540 960) rotate(${cam.r}) scale(${k}) translate(${-cam.x} ${-cam.y})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

const Backdrop: React.FC<{th: Theme}> = ({th}) => {
  const ys = [HOOK_Y, ...th.entries.map((_, i) => Y0 + i * GAP)];
  const y0 = HOOK_Y - 1800, y1 = ys[ys.length - 1] + 2200;
  return (
    <g>
      <defs>
        <linearGradient id="bg" x1="0" y1={y0} x2="0" y2={y1} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={th.bg[0]} />
          {ys.map((y, i) => <stop key={i} offset={(y - y0) / (y1 - y0)} stopColor={th.bg[i]} />)}
          <stop offset="1" stopColor={th.bg[th.bg.length - 1]} />
        </linearGradient>
      </defs>
      <rect x={-4000} y={y0} width={9000} height={y1 - y0} fill="url(#bg)" />
    </g>
  );
};

/* ---------------- host (screen space, bottom-left) ---------------- */
const Host: React.FC<{th: Theme; t: number}> = ({th, t}) => {
  const T0 = th.entries.map((e) => e.t0);
  const lv = T0.filter((c) => t >= c).length;
  const expr = th.hostExpr(t, lv);
  let pose: 'n' | 'point' | 'brow' = 'n';
  if (th.hostPoint) for (let i = 0; i < 6; i++) if (t >= T0[i] + 0.6 && t < T0[i] + 1.9) pose = i % 2 === 0 ? 'point' : 'brow';
  const lc = T0.filter((c) => t >= c).pop() ?? -10;
  const hop = t - lc < 0.35 && lc > 0 ? -34 * Math.sin((Math.PI * (t - lc)) / 0.35) : 0;
  let armR: Arm = ARM_REST_R;
  if (pose === 'point') armR = {elbow: [122, -400], hand: [206, -452]};
  if (pose === 'brow') armR = {elbow: [100, -470], hand: [50, -648]};
  const enter = 1; // the first frame is the Short's cover: the host is already on screen
  const sq = 1 + 0.05 * Math.exp(-7 * Math.max(0, t - lc)) * Math.cos(2 * Math.PI * 4 * Math.max(0, t - lc)) * (lc > 0 ? 1 : 0);
  const shake = th.shake !== false && lv >= 4 ? Math.sin(t * 40) * Math.min(3, lv - 3) * 0.8 : 0;
  const flush = th.hostFlush?.[lv] ?? 0;
  const Over = th.HostOverlay;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', overflow: 'visible'}}>
        <g transform={`translate(${235 + shake} ${2010 + (1 - enter) * 300 + hop})`}>
          <g transform={`scale(1 ${(1 + 0.012 * Math.sin(t * 3.1)) * sq})`}>
            <Stick outfit="detective" expr={expr} armL={ARM_REST_L} armR={armR} prop={false} seed={7} opts={{flush}} />
            {Over && <Over lv={lv} />}
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- counter badge + captions ---------------- */
const Badge: React.FC<{th: Theme; t: number}> = ({th, t}) => {
  const idx = th.entries.map((e) => e.t0).filter((c) => t >= c).length - 1;
  if (idx < 0) return null;
  const e = th.entries[idx], n = 6 - idx;
  const s = pop(t, e.t0, 0.3);
  const shown = t >= e.c0, cs = pop(t, e.c0, 0.25);
  const p = ss(inv(e.c0, e.c1, t));
  const val = e.fmt ? e.fmt(p) : `${e.pre}${Math.round(e.v * p).toLocaleString('en-US')}${e.post}`;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <g transform={`translate(128 470) scale(${s}) rotate(${-6 * s})`}>
          <Shape pts={circlePts(0, 0, 76, n, 14, 0.02)} fill={MUSTARD} w={9} seed={n} />
          <text x={2} y={30} textAnchor="middle" fontFamily={FAMILY} fontWeight={700} fontSize={84} fill={INK}>#{n}</text>
        </g>
      </svg>
      {shown && (
        <div style={{position: 'absolute', left: 226, top: 470, transform: `translateY(-50%) scale(${cs})`, transformOrigin: '0% 50%', fontFamily: FAMILY, fontWeight: 700, fontSize: 70,
          color: CREAM, WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill', letterSpacing: '0.03em', filter: `drop-shadow(0px 6px 0px ${INK})`, whiteSpace: 'nowrap'}}>{val}</div>
      )}
    </AbsoluteFill>
  );
};

const Captions: React.FC<{chunks: Chunk[]; t: number}> = ({chunks, t}) => {
  const idx = chunks.findIndex((c) => t >= c.start && t < c.end);
  if (idx < 0) return null;
  const c = chunks[idx];
  const s = idx === 0 ? 1 : 0.86 + 0.14 * pop(t, c.start, 0.16);
  let active = -1;
  c.words.forEach((w, i) => { if (t >= w.at - 0.03) active = i; });
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 245, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center'}}>
      <div style={{maxWidth: 900, textAlign: 'center', transform: `scale(${s})`, filter: `drop-shadow(0px 7px 0px ${INK})`}}>
        {c.words.map((w, i) => {
          const on = i === active;
          return (
            <span key={i} style={{display: 'inline-block', margin: '0 0.17em', fontFamily: FAMILY, fontWeight: 700, fontSize: 80, lineHeight: 1.1, letterSpacing: '0.03em', color: on ? MUSTARD : CREAM,
              WebkitTextStroke: `16px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${on ? 1 + 0.1 * Math.min(1, pop(t, w.at - 0.03, 0.12)) : 1})`, transformOrigin: '50% 60%'}}>{w.text}</span>
          );
        })}
      </div>
    </div>
  );
};

export const Rank2D: React.FC<{theme: Theme; muted?: boolean; hideCaptions?: boolean}> = ({theme: th, muted = true, hideCaptions = false}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cam = camAt(th, t);
  const flash = t >= th.cut && t < th.cut + 0.12 ? 0.32 * (1 - (t - th.cut) / 0.12) : 0;
  const hook = posOf(th, -1);
  const ys = th.entries.map((_, i) => posOf(th, i));
  const v = th.vignette, w = th.whiteOut;
  return (
    <AbsoluteFill style={{background: th.bg[0]}}>
      <Layer cam={cam} z={1000}><Backdrop th={th} /></Layer>
      {th.Far && <Layer cam={cam} z={1500}><th.Far t={t} y0={HOOK_Y} y1={Y0 + 5 * GAP} /></Layer>}
      <Layer cam={cam} z={1000}>
        {t < th.cut + 1.5 && <g transform={`translate(${hook.x} ${hook.y}) scale(${th.hook.scale ?? 1})`}><th.hook.Prop t={t} /></g>}
        {th.entries.map((e, i) => (
          <g key={i} transform={`translate(${ys[i].x} ${ys[i].y}) scale(${e.scale ?? 1})`}><e.Prop t={t} /></g>
        ))}
      </Layer>
      <Badge th={th} t={t} />
      <Host th={th} t={t} />
      {v && <AbsoluteFill style={{pointerEvents: 'none', opacity: v.max * ss(inv(v.from, v.to, t)), background: `radial-gradient(ellipse at 50% 55%, rgba(${v.rgb},0) 40%, rgba(${v.rgb},0.85) 100%)`}} />}
      {w && <AbsoluteFill style={{pointerEvents: 'none', background: w.rgb, opacity: ss(inv(w.from, w.to, t))}} />}
      {flash > 0 && <AbsoluteFill style={{background: WHITE, opacity: flash}} />}
      {!hideCaptions && <Captions chunks={th.captions} t={t} />}
      <Img src={staticFile('stick/paper.png')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, mixBlendMode: 'multiply'}} />
      {!muted && th.voice && <Audio src={staticFile(th.voice)} />}
    </AbsoluteFill>
  );
};
