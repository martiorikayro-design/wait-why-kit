import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {renderToStaticMarkup} from 'react-dom/server';
import {Stick, walkLegs, ARM_REST_L, ARM_REST_R, Expr, Arm} from '../stick/Stick';
import {Line, Shape, ellPts} from '../stick/ink';
import {INK, CREAM, MUSTARD, WHITE} from '../stick/style';
import {FAMILY} from '../stick/fonts';
import {DeathValley, Mercury, Venus, Sun, Lightning, SunCore} from './hotProps';
import {smooth, lerp, clamp01} from './Scene3D';
import {
  DET_VB, S, PX, svgUrl, ZS, Z_INTRO, GLIDE, GEND, ss, inv, easeOut, WALK_N, walkArms, measure, load, PX_POD, CAM_X, DET_X, DET_SCALE,
  Hall, Exhibit, Podium, Ex,
} from './Rank3D';
import CAPS from '../hot/captions.json';

/**
 * "The hottest things, ranked" in the 3D hall. Same engine as Rank3D (see that file); the voice is a take that starts
 * at 0.15 s, so word times below are the take's times + 0.15. The host heats up at every entry: flushed face, sweat,
 * steam, and finally sunglasses.
 */
export const HOT_FPS = 30;
export const HOT_DUR = 37.7;
const FRAMES = Math.round(HOT_DUR * HOT_FPS);

const O = 0.15;
const T0 = [7.766, 14.43, 18.1, 25.433, 29.192, 31.926].map((x) => x + O); // "Number six" ... "And number one"
const HOOK = T0[0] - 0.2; // the long hook is one slow push-in, then a soft cut to #6
const HOOK_BEATS = [1.035 + O, 2.017 + O, 5.117 + O]; // "lightning", "five times hotter", "Here are the hottest things"
const FLASH_AT = [HOOK_BEATS[0], HOOK_BEATS[1], 3.1, 29.898 + O, 30.7 + O, 31.2 + O];
const lvAt = (t: number) => T0.filter((c) => t >= c).length;
const FLUSH = [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1]; // lv0 = hook, lv1 = #6 ... lv6 = #1

/* ---------- timeline (same grammar as Rank3D: glide between stations, creep while holding) ---------- */
const track = (t: number) => {
  if (t < HOOK) return {z: Z_INTRO, i: -1, moving: false, u: 0, from: Z_INTRO, hold: t / HOOK};
  let i = 0;
  while (i < 5 && t >= T0[i + 1] - GLIDE) i++;
  if (i === 0 || t >= T0[i] - GEND) return {z: ZS[i], i, moving: false, u: 1, from: ZS[i], hold: t - (T0[i] - GEND)};
  const u = ss(inv(T0[i] - GLIDE, T0[i] - GEND, t));
  return {z: lerp(ZS[i - 1], ZS[i], u), i, moving: true, u, from: ZS[i - 1], hold: 0};
};
const stationHold = (t: number) => { const k = track(t); return k.i >= 0 && !k.moving ? t - (T0[k.i] - GEND) : 0; };

type Det = {key: string; z: number; hop: number; pop: number};
const detAt = (t: number): Det => {
  const k = track(t);
  const lv = lvAt(t);
  const lc = T0.filter((c) => t >= c).pop() ?? -10;
  const pop = t - lc < 0.35 ? 1 - (t - lc) / 0.35 : 0;
  const hop = [...T0, ...HOOK_BEATS.slice(0, 2)].reduce((m, c) => { const e = t - c; return e >= 0 && e < 0.35 ? 0.14 * Math.sin((Math.PI * e) / 0.35) : m; }, 0);
  let expr: Expr = lv <= 1 ? 'neutral' : lv <= 3 ? 'worried' : lv <= 5 ? 'shock' : 'smug';
  if (t < HOOK) expr = t < HOOK_BEATS[1] ? 'happy' : t < 3.4 ? 'surprised' : t < HOOK_BEATS[2] ? 'worried' : 'smug';
  else if (T0.some((c) => t > c && t < c + 0.6)) expr = lv >= 6 ? 'smug' : lv >= 4 ? 'shock' : 'surprised';
  if (k.moving) {
    const ph = (Math.abs(k.z - k.from) / 1.15) % 1;
    return {key: `w${lv}_${Math.floor(ph * WALK_N) % WALK_N}`, z: k.z, hop, pop};
  }
  // acting beat after the surprise: point at the exhibit, or wipe the brow, alternating
  let pose = 'n';
  for (let i = 0; i < 6; i++) if (t >= T0[i] + 0.6 && t < T0[i] + 1.9) pose = i % 2 === 0 ? 'point' : 'brow';
  if (t >= HOOK_BEATS[2] && t < HOOK) pose = 'point';
  return {key: `s${lv}_${expr}_${pose}`, z: k.z, hop, pop};
};

/* ---------- host textures ---------- */
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
        <Line pts={[[-52, -578], [-34, -584]]} w={3} seed={66} taper={0.5} color="#6B7890" />
        <Line pts={[[18, -578], [36, -584]]} w={3} seed={67} taper={0.5} color="#6B7890" />
      </g>
    )}
  </g>
);

const detSvg = (key: string): string => {
  const lv = Number(key[1]);
  const opts = {flush: FLUSH[lv]};
  if (key[0] === 'w') {
    const ph = Number(key.split('_')[1]) / WALK_N;
    const [aL, aR] = walkArms(ph);
    return svgUrl(<g><Stick outfit="detective" expr={lv >= 2 ? 'worried' : 'neutral'} legs={walkLegs(ph, 1.3)} armL={aL} armR={aR} prop={false} seed={7} opts={opts} /><Heat lv={lv} /></g>, DET_VB);
  }
  const [, e, pose] = key.split('_');
  let armR: Arm = ARM_REST_R;
  if (pose === 'point') armR = {elbow: [122, -400], hand: [206, -452]};
  if (pose === 'brow') armR = {elbow: [100, -470], hand: [50, -648]};
  const armL: Arm = ARM_REST_L;
  return svgUrl(<g><Stick outfit="detective" expr={e as Expr} armL={armL} armR={armR} prop={false} seed={7} opts={opts} /><Heat lv={lv} /></g>, DET_VB);
};

/* ---------- exhibits ---------- */
const EXHIBITS: Record<string, () => React.ReactElement> = {
  deathValley: () => <DeathValley t={0} seed={3} />,
  mercury: () => <Mercury t={0} seed={5} />,
  venus: () => <Venus t={0} seed={7} />,
  sun: () => <Sun t={0} seed={9} />,
  lightning: () => <Lightning t={0} seed={11} />,
  core: () => <SunCore t={0} seed={13} />,
};
const EX_KEYS = ['deathValley', 'mercury', 'venus', 'sun', 'lightning', 'core'];
const PANEL = ['#f4c98a', '#26324f', '#26324f', '#26324f', '#4a5878', '#3a2236'];
const POD = ['#e0554a', '#2f9e9a', '#6c4bb8', '#4aa54a', '#d9a43a', '#e0554a'];

type Assets = {det: Record<string, THREE.Texture>; ex: Record<string, Ex>};
const useAssets = (): Assets | null => {
  const [a, setA] = useState<Assets | null>(null);
  const [handle] = useState(() => delayRender('hot3d assets'));
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const keys = new Set<string>();
    for (let f = 0; f < FRAMES; f++) keys.add(detAt(f / 30).key);
    (async () => {
      const det: Assets['det'] = {};
      await Promise.all([...keys].map(async (k) => { det[k] = await load(loader, detSvg(k)); }));
      const ex: Assets['ex'] = {};
      await Promise.all(Object.entries(EXHIBITS).map(async ([k, mk]) => {
        const el = mk();
        const bb = measure(el);
        const pad = 14;
        const vb = {x: bb.x - pad, y: bb.y - pad, w: bb.width + 2 * pad, h: bb.height + 2 * pad};
        ex[k] = {tex: await load(loader, svgUrl(<g>{el}</g>, vb)), w: vb.w, h: vb.h, pad};
      }));
      setA({det, ex}); continueRender(handle);
    })();
  }, [handle]);
  return a;
};

const flashAt = (t: number) => FLASH_AT.reduce((m, c) => { const e = t - c; return e >= 0 && e < 0.28 ? Math.max(m, Math.exp(-e * 11) * (Math.round(e * 30) % 2 ? 0.6 : 1)) : m; }, 0);

const LightningFlash: React.FC<{z: number; t: number}> = ({z, t}) => {
  const f = flashAt(t);
  if (f <= 0.02) return null;
  return (
    <mesh position={[PX_POD, 1.66, z - 0.46]}>
      <planeGeometry args={[1.9, 1.5]} />
      <meshBasicMaterial color="#FFF6C8" transparent opacity={0.85 * f} toneMapped={false} />
    </mesh>
  );
};

const Host: React.FC<{t: number; a: Assets}> = ({t, a}) => {
  const d = detAt(t);
  const tex = a.det[d.key];
  const w = DET_VB.w * S, h = DET_VB.h * S;
  const cy = -(DET_VB.y + DET_VB.h / 2) * S;
  const cx = (DET_VB.x + DET_VB.w / 2) * S;
  const walking = d.key[0] === 'w';
  const ph = walking ? Number(d.key.split('_')[1]) / WALK_N : 0;
  const bob = walking ? Math.abs(Math.sin(ph * Math.PI * 2)) * 0.08 : 0;
  const lean = walking ? Math.sin(ph * Math.PI * 2) * 0.06 : 0;
  const lv = lvAt(t);
  const shake = lv >= 4 && !walking ? Math.sin(t * 38) * 0.007 * Math.min(3, lv - 3) : 0; // overheating tremble
  const sc = 1 + 0.14 * d.pop;
  return (
    <group position={[DET_X + shake + 0.42 * ss(inv(T0[5], T0[5] + 2, t)), d.hop, d.z + 0.3]} scale={[DET_SCALE, DET_SCALE, DET_SCALE]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.08, 0.012, 0]}><circleGeometry args={[0.5, 32]} /><meshBasicMaterial color="#3a2a40" transparent opacity={0.36} /></mesh>
      <group position={[cx, cy + bob, 0]} rotation={[0, 0, lean]} scale={[sc, sc, 1]}>
        <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex} transparent alphaTest={0.02} toneMapped={false} /></mesh>
      </group>
    </group>
  );
};

const Rig: React.FC<{t: number}> = ({t}) => {
  const {camera} = useThree();
  const k = track(t);
  const hold = stationHold(t);
  const intro = k.i < 0;
  const ih = ss(clamp01(t / HOOK));
  const fin = k.i === 5 ? ss(inv(T0[5], HOT_DUR, t)) : 0; // last act: drift in toward the core
  const dist = (intro ? lerp(11.5, 6.0, ih) : 6.5 - Math.min(hold, 3.2) * 0.14) - 1.0 * fin;
  const swing = !intro && k.moving ? 1.25 * Math.sin(Math.PI * k.u) : 0;
  const cx = (intro ? lerp(-0.3, CAM_X, ih) : CAM_X - swing) + 0.15 * fin;
  const sign = k.i % 2 ? -1 : 1;
  const rollDeg = intro ? lerp(5, 1.5, ih) : sign * 3.2 * (k.moving ? Math.sin(Math.PI * k.u) * 0.6 + 0.4 : 1);
  const kick = [...T0, ...FLASH_AT.slice(3)].reduce((m, c) => {
    const e = t - c; return e >= 0 && e < 0.22 ? (Math.round(e * 30) % 2 ? 1 : -1) * 0.035 * (1 - e / 0.22) : m;
  }, 0);
  camera.position.set(cx, 1.45 + kick, k.z + dist);
  camera.lookAt(cx + swing * 0.3, 1.3, k.z);
  camera.rotateZ(THREE.MathUtils.degToRad(rollDeg));
  (camera as THREE.PerspectiveCamera).fov = 56 - Math.min(hold, 3) * 0.6;
  camera.updateProjectionMatrix();
  return null;
};

/* ---------- temperature badge + captions (same look as the animals ranking) ---------- */
const pop = (t: number, t0: number, d = 0.25) => { const u = clamp01((t - t0) / d); return t <= t0 ? 0 : 1 + 2.4 * Math.pow(u - 1, 3) + 1.4 * Math.pow(u - 1, 2); };
const ENTRIES = [
  {n: 6, t0: T0[0], c0: 10.07, c1: 11.0, v: 134, pre: ''},
  {n: 5, t0: T0[1], c0: 17.3, c1: 17.95, v: 800, pre: '~'},
  {n: 4, t0: T0[2], c0: 20.1, c1: 21.0, v: 860, pre: '~'},
  {n: 3, t0: T0[3], c0: 27.9, c1: 28.9, v: 10000, pre: '~'},
  {n: 2, t0: T0[4], c0: 30.85, c1: 31.8, v: 50000, pre: '~'},
  {n: 1, t0: T0[5], c0: 35.15, c1: 36.8, v: 27000000, pre: '>'},
];
const Badge: React.FC<{t: number}> = ({t}) => {
  const e = [...ENTRIES].reverse().find((x) => t >= x.t0);
  if (!e) return null;
  const s = pop(t, e.t0, 0.3);
  const shown = t >= e.c0;
  const cs = pop(t, e.c0, 0.25);
  const val = `${e.pre}${Math.round(e.v * ss(inv(e.c0, e.c1, t))).toLocaleString('en-US')}°F`;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <g transform={`translate(128 470) scale(${s}) rotate(${-6 * s})`}>
          <Shape pts={Array.from({length: 14}).map((_, i) => [76 * Math.cos((i / 14) * 6.2832), 76 * Math.sin((i / 14) * 6.2832)] as [number, number])} fill={MUSTARD} w={9} seed={e.n} />
          <text x={2} y={30} textAnchor="middle" fontFamily={FAMILY} fontWeight={700} fontSize={84} fill={INK}>#{e.n}</text>
        </g>
      </svg>
      {shown && (
        <div style={{position: 'absolute', left: 226, top: 470, transform: `translateY(-50%) scale(${cs})`, transformOrigin: '0% 50%', fontFamily: FAMILY, fontWeight: 700, fontSize: 70,
          color: CREAM, WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill', letterSpacing: '0.03em', filter: `drop-shadow(0px 6px 0px ${INK})`, whiteSpace: 'nowrap'}}>{val}</div>
      )}
    </AbsoluteFill>
  );
};

type Chunk = {start: number; end: number; words: {text: string; at: number}[]};
const Captions: React.FC<{t: number}> = ({t}) => {
  const chunks = CAPS as Chunk[];
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

export const Hot3D: React.FC<{muted?: boolean; hideCaptions?: boolean}> = ({muted = false, hideCaptions = false}) => {
  const frame = useCurrentFrame();
  const t = frame / HOT_FPS;
  const a = useAssets();
  const cut = HOOK;
  const flash = t >= cut && t < cut + 0.12 ? 0.32 * (1 - (t - cut) / 0.12) : 0;
  const coreGrow = 1 + 0.04 * Math.sin(t * 5) + 0.14 * ss(inv(T0[5], T0[5] + 3.2, t));
  return (
    <AbsoluteFill style={{background: '#f7e6b5'}}>
      {a && (
        <ThreeCanvas width={1080} height={1920} camera={{fov: 56, near: 0.1, far: 90, position: [0, 1.4, 8]}} gl={{antialias: true}}>
          <color attach="background" args={['#f7e6b5']} />
          <fog attach="fog" args={['#f7e6b5', 16, 42]} />
          <ambientLight intensity={1.15} color="#cfd8ff" />
          <directionalLight position={[3, 6, 4]} intensity={2.2} color="#ffd9a0" />
          <Rig t={t} />
          <Hall />
          {t < HOOK && (
            <group>
              <Podium z={Z_INTRO} c="#6c4bb8" panel={PANEL[4]} />
              <Exhibit z={Z_INTRO} ex={a.ex.lightning} t={t} />
              <LightningFlash z={Z_INTRO} t={t} />
            </group>
          )}
          {ZS.map((z, i) => (
            <group key={z}>
              <Podium z={z} c={POD[i]} panel={PANEL[i]} />
              <Exhibit z={z} ex={a.ex[EX_KEYS[i]]} t={t} scale={i === 5 ? coreGrow : 1 + 0.015 * Math.sin(t * 3 + i)} />
              {i === 4 && <LightningFlash z={z} t={t} />}
            </group>
          ))}
          <Host t={t} a={a} />
        </ThreeCanvas>
      )}
      <Badge t={t} />
      <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.55 * ss(inv(T0[3], T0[5] + 2, t)), background: 'radial-gradient(ellipse at 50% 55%, rgba(255,140,40,0) 40%, rgba(255,90,20,0.85) 100%)'}} />
      <AbsoluteFill style={{pointerEvents: 'none', background: '#FFF3C8', opacity: ss(inv(36.55, 37.35, t))}} />
      {flash > 0 && <AbsoluteFill style={{background: WHITE, opacity: flash}} />}
      {!hideCaptions && <Captions t={t} />}
      {!muted && <Audio src={staticFile('hot/voice.mp3')} startFrom={0} />}
    </AbsoluteFill>
  );
};
