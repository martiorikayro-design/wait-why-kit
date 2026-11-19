import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {renderToStaticMarkup} from 'react-dom/server';
import {Stick, walkLegs, ARM_REST_L, ARM_REST_R, Expr, Arm} from '../stick/Stick';
import {Tortoise, Bowhead, Shark, Clam, GlassSponge, Jelly, Polyp} from '../rank/props';
import {Aging, BabyDetective, Badge, Captions, W, levelAt} from '../rank/Scene';
import {Box, Ball, toon, gradient, floorTex, wallTex, frameTex, canvasTex, smooth, lerp, clamp01} from './Scene3D';

/**
 * "Animals that live the longest" in the 3D hall: six stations down a corridor, one per rank.
 * Same script, timings, captions and age counters as the 2D version; the animals are the channel's inked SVG
 * props baked to textures and stood on podiums, and the detective (also a 2D card) ages at every station.
 */
export const RANK3D_FPS = 30;
export const RANK3D_DUR = 25;
const FRAMES = RANK3D_DUR * RANK3D_FPS;

export const DET_VB = {x: -190, y: -745, w: 420, h: 770}; // wider on the right so a pointing arm fits
export const BABY_VB = {x: -150, y: -340, w: 300, h: 370};
export const S = 2.15 / DET_VB.h; // metres per svg unit
export const PX = 1.35; // texture pixels per svg unit

export const svgUrl = (inner: React.ReactElement, vb: {x: number; y: number; w: number; h: number}) =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" width={Math.round(vb.w * PX)} height={Math.round(vb.h * PX)} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}>{inner}</svg>)
  );

/* ---------- timeline ---------- */
const T0 = [W.six, W.five, W.four, W.three, W.two, 17.96]; // arrival word of each station (#6 .. #1)
export const ZS = [-4, -12, -20, -28, -36, -44]; // station z
export const Z_INTRO = 2;
export const GLIDE = 1.9, GEND = 0.15;
export const PX_POD = 1.15; // podium centre (right of the camera/host path, nothing ever crosses it)
export const CAM_X = 0.15;
export const DET_X = -0.95;
export const DET_SCALE = 0.85; // host is a bit smaller than the exhibit
export const ss = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
export const inv = (a: number, b: number, x: number) => clamp01((x - a) / (b - a));
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 3;
const BABY_T = W.baby + 0.05; // the host has shrunk into a baby by now (a smoke puff hides the swap)

/** which station the camera is heading to / at, and how far through the glide */
const track = (t: number) => {
  if (t < 2.0) return {z: Z_INTRO, i: -1, moving: false, u: 0, from: Z_INTRO, hold: t / 2.0};
  let i = 0;
  while (i < 5 && t >= T0[i + 1] - GLIDE) i++;
  if (i === 0 || t >= T0[i] - GEND) return {z: ZS[i], i, moving: false, u: 1, from: ZS[i], hold: t - (T0[i] - GEND)};
  const u = ss(inv(T0[i] - GLIDE, T0[i] - GEND, t));
  return {z: lerp(ZS[i - 1], ZS[i], u), i, moving: true, u, from: ZS[i - 1], hold: 0};
};
const stationHold = (t: number) => {
  const k = track(t);
  return k.i >= 0 && !k.moving ? t - (T0[k.i] - GEND) : 0;
};

type Det = {key: string; z: number; x: number; lv: number; pop: number; hop: number; sc2: number; rot: number};
export const WALK_N = 6;
const detAt = (t: number): Det => {
  const k = track(t);
  const lv = levelAt(t);
  const changes = [W.six, W.five, W.four, W.three, W.two, W.baby];
  const lc = changes.filter((c) => t >= c).pop() ?? -10;
  const pop = t - lc < 0.35 ? 1 - (t - lc) / 0.35 : 0;
  // little hop on arrival at each station and when the hook lands
  const hop = [...T0.slice(0, 5), W.die].reduce((m, c) => { const e = t - c; return e >= 0 && e < 0.35 ? 0.14 * Math.sin((Math.PI * e) / 0.35) : m; }, 0);
  // old host spins and shrinks, then the baby springs up out of the puff
  const e1 = inv(BABY_T - 0.35, BABY_T, t);
  const ab = inv(BABY_T, BABY_T + 0.5, t);
  const sc2 = t < BABY_T ? 1 - 0.88 * ss(e1) : Math.max(0.05, 1 - Math.exp(-6 * ab) * Math.cos(10 * ab));
  const rot = t < BABY_T ? Math.PI * 2 * ss(e1) : 0;
  if (t >= BABY_T) return {key: 'baby', z: ZS[5], x: DET_X + 0.75 * ss(inv(23.0, 24.3, t)), lv, pop: 0, hop: 0, sc2, rot};
  const react = (t0: number) => t > t0 && t < t0 + 0.6;
  let expr: Expr = 'neutral';
  if (t < 2.0) expr = t > W.die - 0.1 ? 'surprised' : 'happy';
  else if ([W.six, W.five, W.four, W.three, W.two].some(react)) expr = 'surprised';
  else if (t > W.and1 && t < W.jelly) expr = 'worried';
  else if (t >= W.jelly && t < W.hurt) expr = 'shock';
  else if (lv >= 5) expr = 'smug';
  // acting beat after the surprise: point at the animal (#6, #4, #2) or stroke the chin (#5, #3)
  let pose = 'n';
  for (let i = 0; i < 5; i++) if (t >= T0[i] + 0.6 && t < T0[i] + 1.7) pose = i % 2 === 0 ? 'point' : 'chin';
  const x = DET_X;
  if (k.moving) {
    const dist = Math.abs(k.z - k.from);
    const ph = (dist / 1.15) % 1;
    return {key: `w${lv}_${Math.floor(ph * WALK_N) % WALK_N}`, z: k.z, x, lv, pop, hop, sc2, rot};
  }
  return {key: `s${lv}_${expr}_${pose}`, z: k.z, x, lv, pop, hop, sc2, rot};
};

/* ---------- textures ---------- */
export const walkArms = (ph: number): [Arm, Arm] => {
  const a = Math.sin(ph * Math.PI * 2);
  return [{elbow: [-74, -330 + 10 * a], hand: [-80 - 4 * a, -250 + 24 * a]}, {elbow: [74, -330 - 10 * a], hand: [80 + 4 * a, -250 - 24 * a]}];
};
const detSvg = (key: string): {url: string; vb: typeof DET_VB} => {
  if (key === 'baby') return {url: svgUrl(<BabyDetective t={0} />, BABY_VB), vb: BABY_VB};
  const lv = Number(key[1]);
  if (key[0] === 'w') {
    const ph = Number(key.split('_')[1]) / WALK_N;
    const [aL, aR] = walkArms(ph);
    return {url: svgUrl(<g><Stick outfit="detective" expr="neutral" legs={walkLegs(ph, 1.3)} armL={aL} armR={aR} prop={false} seed={7} /><Aging lv={lv} t={0} /></g>, DET_VB), vb: DET_VB};
  }
  const [, e, pose] = key.split('_');
  const expr = e as Expr;
  const act = pose === 'point' || pose === 'chin';
  const hold = lv <= 2 && !act;
  let armR: Arm = hold ? {elbow: [104, -352], hand: [112, -420]} : ARM_REST_R;
  if (pose === 'point') armR = {elbow: [122, -400], hand: [206, -452]};
  if (pose === 'chin') armR = {elbow: [74, -392], hand: [26, -484]};
  const armL: Arm = lv >= 3 ? {elbow: [-84, -330], hand: [-96, -256]} : ARM_REST_L;
  return {url: svgUrl(<g><Stick outfit="detective" expr={expr} armL={armL} armR={armR} prop={hold} seed={7} /><Aging lv={lv} t={0} /></g>, DET_VB), vb: DET_VB};
};

export type Ex = {tex: THREE.Texture; w: number; h: number; pad: number};
const EXHIBITS: Record<string, () => React.ReactElement> = {
  tortoise: () => <Tortoise t={0} seed={9} />,
  bowhead: () => <Bowhead t={0} seed={11} />,
  shark: () => <Shark t={0} seed={13} />,
  clam: () => <Clam t={0} count={1} seed={15} />,
  sponge: () => <GlassSponge t={0} glow={0.9} seed={17} />,
  jellyDark: () => <Jelly t={0} dark={1} seed={3} />,
  jelly: () => <Jelly t={0} seed={3} />,
  jellyDroop: () => <Jelly t={0} droop={1} seed={3} />,
  polyp: () => <Polyp t={0} grow={1} seed={7} />,
};
export const measure = (el: React.ReactElement) => {
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden';
  host.innerHTML = renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" width={2000} height={2000} viewBox="-1000 -1000 2000 2000"><g>{el}</g></svg>);
  document.body.appendChild(host);
  const bb = (host.querySelector('svg > g') as unknown as SVGGraphicsElement).getBBox();
  document.body.removeChild(host);
  return bb;
};

export const load = (loader: THREE.TextureLoader, url: string) =>
  new Promise<THREE.Texture>((res, rej) => loader.load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }, undefined, rej));

type Assets = {det: Record<string, {tex: THREE.Texture; vb: typeof DET_VB}>; ex: Record<string, Ex>};
const useAssets = (): Assets | null => {
  const [a, setA] = useState<Assets | null>(null);
  const [handle] = useState(() => delayRender('rank3d assets'));
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const keys = new Set<string>();
    for (let f = 0; f < FRAMES; f++) keys.add(detAt(f / 30).key);
    (async () => {
      const det: Assets['det'] = {};
      await Promise.all([...keys].map(async (k) => { const {url, vb} = detSvg(k); det[k] = {tex: await load(loader, url), vb}; }));
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

/* ---------- world ---------- */
const HALL_Z0 = -53, HALL_Z1 = 16, HL = HALL_Z1 - HALL_Z0;
const POD = ['#e0554a', '#2f9e9a', '#6c4bb8', '#4aa54a', '#d9a43a', '#e0554a'];
const EX_KEYS = ['tortoise', 'bowhead', 'shark', 'clam', 'sponge', 'jelly'];

export const Hall: React.FC = () => {
  const floor = useMemo(() => { const t = floorTex(); t.repeat.set(3, 30); return t; }, []);
  const wall = useMemo(wallTex, []);
  const frames = useMemo(() => [0, 1, 2, 3].map(frameTex), []);
  const fm = useMemo(() => new THREE.MeshToonMaterial({map: floor, gradientMap: gradient}), [floor]);
  const wm = useMemo(() => { const t = wall.clone(); t.repeat.set(10, 1); t.needsUpdate = true; return new THREE.MeshToonMaterial({map: t, gradientMap: gradient}); }, [wall]);
  const cz = HALL_Z0 + HL / 2;
  return (
    <group>
      <mesh material={fm} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, cz]}><planeGeometry args={[6, HL]} /></mesh>
      <mesh material={wm} rotation={[0, Math.PI / 2, 0]} position={[-3, 1.6, cz]}><planeGeometry args={[HL, 3.2]} /></mesh>
      <mesh material={wm} rotation={[0, -Math.PI / 2, 0]} position={[3, 1.6, cz]}><planeGeometry args={[HL, 3.2]} /></mesh>
      <mesh material={wm} position={[0, 1.6, HALL_Z0]}><planeGeometry args={[6, 3.2]} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, cz]}><planeGeometry args={[6, HL]} /><meshBasicMaterial color="#fbf1d2" /></mesh>
      <Box p={[-2.97, 0.17, cz]} s={[0.1, 0.34, HL]} c="#1f8f8a" />
      <Box p={[2.97, 0.17, cz]} s={[0.1, 0.34, HL]} c="#1f8f8a" />
      <Box p={[0, 1.15, HALL_Z0 + 0.06]} s={[1.5, 2.3, 0.12]} c="#c24a3b" />
      <Ball p={[0.5, 1.1, HALL_Z0 + 0.2]} r={0.07} c="#ffd23f" />
      {Array.from({length: 17}).map((_, i) => {
        const z = 5 - i * 3.5;
        return [-1, 1].map((side, j) => (
          <group key={`${i}${side}`} position={[side * 2.93, 1.9, z - (side > 0 ? 0.8 : 0)]} rotation={[0, -side * Math.PI / 2, 0]}>
            <Box p={[0, 0, 0]} s={[0.78, 0.98, 0.07]} c="#d9a43a" t={0.03} />
            <mesh position={[0, 0, 0.045]}><planeGeometry args={[0.66, 0.86]} /><meshBasicMaterial map={frames[(i + j) % 4]} /></mesh>
          </group>
        ));
      })}
      {[Z_INTRO, ...ZS].map((z) => (
        <group key={z}>
          <Box p={[0, 3.12, z]} s={[0.04, 0.3, 0.04]} c="#2b2723" t={0.015} />
          <Ball p={[0, 2.88, z]} r={0.24} c="#fff3c4" />
        </group>
      ))}
    </group>
  );
};

export const Podium: React.FC<{z: number; c: string; panel?: string}> = ({z, c, panel = '#7db4b8'}) => (
  <group position={[PX_POD, 0, z]}>
    <Box p={[0, 0.4, 0]} s={[1.7, 0.8, 1.1]} c={c} />
    <Box p={[0, 0.84, 0]} s={[1.82, 0.08, 1.22]} c="#fff6df" t={0.025} />
    {/* small light aquarium window instead of a wall-sized dark panel */}
    <Box p={[0, 1.66, -0.5]} s={[1.9, 1.5, 0.06]} c={panel} t={0.03} />
    <Box p={[0, 1.66, -0.55]} s={[2.04, 1.64, 0.04]} c="#d9a43a" t={0.03} />
  </group>
);

export const fitEx = (ex: Ex, scale: number) => {
  const tw = 1.65 * scale, maxH = 1.4 * scale;
  let w = tw, h = (tw * ex.h) / ex.w;
  if (h > maxH) { h = maxH; w = (h * ex.w) / ex.h; }
  return {w, h, bottom: 0.89 - (ex.pad * w) / (ex.w - 2 * ex.pad) * 0.5};
};

/** Cartoon smoke puff (white blobs with ink outline) that covers a swap. */
export const Poof: React.FC<{pos: [number, number, number]; size: number; t: number; t0: number; t1: number}> = ({pos, size, t, t0, t1}) => {
  const tex = useMemo(() => canvasTex(256, 256, (g) => {
    g.lineWidth = 9; g.strokeStyle = '#1C1A17'; g.fillStyle = '#FBF8F1';
    [[128, 64, 56], [62, 112, 52], [194, 112, 52], [88, 178, 50], [168, 178, 50], [128, 124, 58]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); });
    [[128, 64, 56], [62, 112, 52], [194, 112, 52], [88, 178, 50], [168, 178, 50], [128, 124, 58]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r - 4, 0, 7); g.fill(); });
  }), []);
  const p = inv(t0, t1, t);
  if (p <= 0 || p >= 1) return null;
  const sc = size * (0.35 + 1.0 * easeOut(p));
  return (
    <mesh position={pos} scale={[sc, sc, 1]} renderOrder={20}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent opacity={0.9 * Math.pow(Math.sin(Math.PI * p), 0.8)} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

/** #1: the jellyfish droops, shrinks into its polyp, and the polyp buds baby jellyfish - all cross-faded, no swaps. */
const JellyFinale: React.FC<{z: number; a: Assets; t: number}> = ({z, a, t}) => {
  const droop = ss(inv(W.hurt, W.hurt + 0.55, t));
  const toPoly = ss(inv(W.turn, W.turn + 0.8, t));
  const jelly = a.ex.jelly, dr = a.ex.jellyDroop, pp = a.ex.polyp;
  const fj = fitEx(jelly, 1), fd = fitEx(dr, 1), fp = fitEx(pp, 0.7);
  const lift = lerp(0.25, 0, droop) + 0.04 * Math.sin(t * 2.2) * (1 - droop);
  const shrink = 1 - 0.4 * toPoly;
  const tilt = -0.22 * droop * (1 - toPoly);
  const y0 = (f: {h: number; bottom: number}, sc: number) => f.bottom + (f.h * sc) / 2 + lift * (1 - toPoly);
  const planes: {ex: Ex; f: ReturnType<typeof fitEx>; op: number; sc: number; rz: number; ro: number}[] = [
    {ex: jelly, f: fj, op: (1 - droop) * (1 - toPoly), sc: shrink, rz: 0, ro: 1},
    {ex: dr, f: fd, op: droop * (1 - toPoly), sc: shrink, rz: tilt, ro: 2},
    {ex: pp, f: fp, op: toPoly, sc: 0.65 + 0.35 * toPoly, rz: 0, ro: 3},
  ];
  return (
    <group>
      {planes.map(({ex, f, op, sc, rz, ro}) => op > 0.002 && (
        <mesh key={ro} position={[PX_POD, y0(f, sc), z - 0.2]} rotation={[0, 0, rz]} scale={[sc, sc, 1]} renderOrder={ro}>
          <planeGeometry args={[f.w, f.h]} />
          <meshBasicMaterial map={ex.tex} transparent opacity={op} alphaTest={0.01} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => {
        const u = inv(W.start - 0.15 + 0.22 * i, 24.9, t);
        if (u <= 0) return null;
        const sz = 0.3 * Math.min(1, u * 5);
        const f = fitEx(jelly, sz);
        return (
          <mesh key={`b${i}`} position={[PX_POD + (i - 1) * 0.42 + Math.sin(t * 2 + i) * 0.1 * u, 1.2 + 0.85 * easeOut(u) + 0.03 * Math.sin(t * 3 + i), z - 0.15]} renderOrder={5 + i}>
            <planeGeometry args={[f.w, f.h]} />
            <meshBasicMaterial map={jelly.tex} transparent opacity={Math.min(1, u * 6)} alphaTest={0.01} depthWrite={false} toneMapped={false} />
          </mesh>
        );
      })}
      <Poof pos={[PX_POD, 1.65, z + 0.1]} size={1.05} t={t} t0={W.turn + 0.05} t1={W.turn + 0.95} />
    </group>
  );
};

export const Exhibit: React.FC<{z: number; ex: Ex; t: number; scale?: number; lift?: number}> = ({z, ex, t, scale = 1, lift = 0}) => {
  const {w, h, bottom} = fitEx(ex, scale);
  return (
    <mesh position={[PX_POD, bottom + h / 2 + lift + 0.03 * Math.sin(t * 2.2 + z), z - 0.2]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={ex.tex} transparent alphaTest={0.02} toneMapped={false} />
    </mesh>
  );
};

const exhibitFor = (st: number, t: number): {key: string; scale: number; lift: number} => {
  if (st === 5) {
    if (t >= W.turn + 0.2) return {key: 'polyp', scale: 0.7, lift: 0};
    if (t >= W.hurt) return {key: 'jellyDroop', scale: 1, lift: 0};
    return {key: 'jelly', scale: 1, lift: 0.25};
  }
  return {key: EX_KEYS[st], scale: 1, lift: 0};
};

const Detective: React.FC<{t: number; a: Assets}> = ({t, a}) => {
  const d = detAt(t);
  const m = a.det[d.key];
  const w = m.vb.w * S, h = m.vb.h * S;
  const cy = -(m.vb.y + m.vb.h / 2) * S;
  const walking = d.key[0] === 'w';
  const ph = walking ? Number(d.key.split('_')[1]) / WALK_N : 0;
  const bob = walking ? Math.abs(Math.sin(ph * Math.PI * 2)) * 0.08 : 0;
  const lean = walking ? Math.sin(ph * Math.PI * 2) * 0.06 : 0;
  const isBaby = d.key === 'baby';
  const waddle = isBaby && t > 23.0 && t < 24.4 ? Math.sin(t * 13) : 0;
  const idle = isBaby ? Math.abs(Math.sin(t * 7)) * 0.04 : 0;
  const sc = (1 + 0.14 * d.pop) * d.sc2;
  const cx = (m.vb.x + m.vb.w / 2) * S;
  return (
    <group position={[d.x, d.hop + idle + Math.abs(waddle) * 0.05, d.z + 0.3]} scale={[DET_SCALE, DET_SCALE, DET_SCALE]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.08, 0.012, 0]}><circleGeometry args={[0.5, 32]} /><meshBasicMaterial color="#3a2a40" transparent opacity={0.36} /></mesh>
      <group position={[cx * d.sc2, cy * d.sc2 + bob, 0]} rotation={[0, 0, lean + d.rot + waddle * 0.1]} scale={[sc, sc, 1]}>
        <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial map={m.tex} transparent alphaTest={0.02} toneMapped={false} /></mesh>
      </group>
    </group>
  );
};

const Rig: React.FC<{t: number}> = ({t}) => {
  const {camera} = useThree();
  const k = track(t);
  const hold = stationHold(t);
  const intro = k.i < 0;
  const ih = ss(clamp01(t / 2.0));
  // hook: slow push-in from far back; stations: ease in, creep, and swing wide of the podiums while gliding
  const fin = k.i === 5 ? ss(inv(W.turn, 25, t)) : 0; // last act: drift in and slightly right, toward vitrine + baby
  const dist = (intro ? lerp(10.5, 6.2, ih) : 6.5 - Math.min(hold, 3.2) * 0.14) - 1.4 * fin;
  const cz = k.z + dist;
  const swing = !intro && k.moving ? 1.25 * Math.sin(Math.PI * k.u) : 0;
  const cx = (intro ? lerp(-0.2, CAM_X, ih) : CAM_X - swing) + 0.25 * fin;
  const sign = k.i % 2 ? -1 : 1;
  const rollDeg = intro ? lerp(5, 2, ih) : sign * 3.2 * (k.moving ? Math.sin(Math.PI * k.u) * 0.6 + 0.4 : 1);
  const kick = [W.six, W.five, W.four, W.three, W.two, W.jelly].reduce((m, c) => {
    const e = t - c; return e >= 0 && e < 0.22 ? (Math.round(e * 30) % 2 ? 1 : -1) * 0.035 * (1 - e / 0.22) : m;
  }, 0);
  camera.position.set(cx, 1.45 + kick, cz);
  camera.lookAt(cx + swing * 0.3, 1.3, k.z);
  camera.rotateZ(THREE.MathUtils.degToRad(rollDeg));
  (camera as THREE.PerspectiveCamera).fov = 56 - Math.min(hold, 3) * 0.6;
  camera.updateProjectionMatrix();
  return null;
};

export const Rank3D: React.FC<{hideCaptions?: boolean}> = ({hideCaptions = false}) => {
  const frame = useCurrentFrame();
  const t = frame / RANK3D_FPS;
  const a = useAssets();
  const flash = t >= 2.0 && t < 2.12 ? 0.32 * (1 - (t - 2.0) / 0.12) : 0; // soft 3-frame pulse on the cut, never a full-white frame
  const k = track(t);
  return (
    <AbsoluteFill style={{background: '#f7e6b5'}}>
      {a && (
        <ThreeCanvas width={1080} height={1920} camera={{fov: 50, near: 0.1, far: 90, position: [0, 1.4, 8]}} gl={{antialias: true}}>
          <color attach="background" args={['#f7e6b5']} />
          <fog attach="fog" args={['#f7e6b5', 16, 42]} />
          <ambientLight intensity={1.15} color="#cfd8ff" />
          <directionalLight position={[3, 6, 4]} intensity={2.2} color="#ffd9a0" />
          <Rig t={t} />
          <Hall />
          {t < 2.0 && (
            <group>
              <Podium z={Z_INTRO} c="#7a6a8a" />
              <Exhibit z={Z_INTRO} ex={a.ex.jellyDark} t={t} />
            </group>
          )}
          {ZS.map((z, i) => {
            const e = exhibitFor(i, t);
            return (
              <group key={z}>
                <Podium z={z} c={POD[i]} />
                {i === 5 ? <JellyFinale z={z} a={a} t={t} /> : <Exhibit z={z} ex={a.ex[e.key]} t={t} scale={e.scale} lift={e.lift} />}
              </group>
            );
          })}
          <Detective t={t} a={a} />
          <Poof pos={[DET_X, 1.0, ZS[5] + 0.7]} size={0.9} t={t} t0={BABY_T - 0.4} t1={BABY_T + 0.5} />
        </ThreeCanvas>
      )}
      <Badge t={t} />
      {flash > 0 && <AbsoluteFill style={{background: '#FBF8F1', opacity: flash}} />}
      {!hideCaptions && <Captions t={t} />}
      {k.i < -5 && null}
    </AbsoluteFill>
  );
};
