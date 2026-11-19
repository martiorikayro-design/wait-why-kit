import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {renderToStaticMarkup} from 'react-dom/server';
import {Stick, walkLegs, ARM_REST_L, ARM_REST_R, Expr, Arm} from '../stick/Stick';
import {Tortoise, Bowhead, Shark, Clam, GlassSponge, Jelly, Polyp} from '../rank/props';
import {Aging, BabyDetective, Badge, Captions, W, levelAt} from '../rank/Scene';
import {Box, Ball, toon, gradient, floorTex, wallTex, frameTex, smooth, lerp, clamp01} from './Scene3D';

/**
 * "Animals that live the longest" in the 3D hall: six stations down a corridor, one per rank.
 * Same script, timings, captions and age counters as the 2D version; the animals are the channel's inked SVG
 * props baked to textures and stood on podiums, and the detective (also a 2D card) ages at every station.
 */
export const RANK3D_FPS = 30;
export const RANK3D_DUR = 25;
const FRAMES = RANK3D_DUR * RANK3D_FPS;

const DET_VB = {x: -190, y: -745, w: 420, h: 770}; // wider on the right so a pointing arm fits
const BABY_VB = {x: -150, y: -340, w: 300, h: 370};
const S = 2.15 / DET_VB.h; // metres per svg unit
const PX = 1.35; // texture pixels per svg unit

const svgUrl = (inner: React.ReactElement, vb: {x: number; y: number; w: number; h: number}) =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" width={Math.round(vb.w * PX)} height={Math.round(vb.h * PX)} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}>{inner}</svg>)
  );

/* ---------- timeline ---------- */
const T0 = [W.six, W.five, W.four, W.three, W.two, 17.96]; // arrival word of each station (#6 .. #1)
const ZS = [-4, -12, -20, -28, -36, -44]; // station z
const Z_INTRO = 2;
const GLIDE = 1.9, GEND = 0.15;
const PX_POD = 1.15; // podium centre (right of the camera/host path, nothing ever crosses it)
const CAM_X = 0.15;
const DET_X = -0.95;
const DET_SCALE = 0.85; // host is a bit smaller than the exhibit
const ss = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
const inv = (a: number, b: number, x: number) => clamp01((x - a) / (b - a));

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

type Det = {key: string; z: number; x: number; lv: number; pop: number; hop: number};
const WALK_N = 6;
const detAt = (t: number): Det => {
  const k = track(t);
  const lv = levelAt(t);
  const changes = [W.six, W.five, W.four, W.three, W.two, W.baby];
  const lc = changes.filter((c) => t >= c).pop() ?? -10;
  const pop = t - lc < 0.35 ? 1 - (t - lc) / 0.35 : 0;
  // little hop on arrival at each station and when the hook lands
  const hop = [...T0.slice(0, 5), W.die].reduce((m, c) => { const e = t - c; return e >= 0 && e < 0.35 ? 0.14 * Math.sin((Math.PI * e) / 0.35) : m; }, 0);
  if (t >= W.baby) return {key: 'baby', z: ZS[5], x: DET_X, lv, pop, hop};
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
    return {key: `w${lv}_${Math.floor(ph * WALK_N) % WALK_N}`, z: k.z, x, lv, pop, hop};
  }
  return {key: `s${lv}_${expr}_${pose}`, z: k.z, x, lv, pop, hop};
};

/* ---------- textures ---------- */
const walkArms = (ph: number): [Arm, Arm] => {
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

type Ex = {tex: THREE.Texture; w: number; h: number; pad: number};
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
const measure = (el: React.ReactElement) => {
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden';
  host.innerHTML = renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" width={2000} height={2000} viewBox="-1000 -1000 2000 2000"><g>{el}</g></svg>);
  document.body.appendChild(host);
  const bb = (host.querySelector('svg > g') as unknown as SVGGraphicsElement).getBBox();
  document.body.removeChild(host);
  return bb;
};

const load = (loader: THREE.TextureLoader, url: string) =>
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

const Hall: React.FC = () => {
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

const Podium: React.FC<{z: number; c: string; back?: boolean}> = ({z, c}) => (
  <group position={[PX_POD, 0, z]}>
    <Box p={[0, 0.4, 0]} s={[1.7, 0.8, 1.1]} c={c} />
    <Box p={[0, 0.84, 0]} s={[1.82, 0.08, 1.22]} c="#fff6df" t={0.025} />
    {/* small light aquarium window instead of a wall-sized dark panel */}
    <Box p={[0, 1.66, -0.5]} s={[1.9, 1.5, 0.06]} c="#7db4b8" t={0.03} />
    <Box p={[0, 1.66, -0.55]} s={[2.04, 1.64, 0.04]} c="#d9a43a" t={0.03} />
  </group>
);

const Exhibit: React.FC<{z: number; ex: Ex; t: number; scale?: number; lift?: number}> = ({z, ex, t, scale = 1, lift = 0}) => {
  const tw = 1.65 * scale;
  const maxH = 1.4 * scale;
  let w = tw, h = (tw * ex.h) / ex.w;
  if (h > maxH) { h = maxH; w = (h * ex.w) / ex.h; }
  const bottom = 0.89 - (ex.pad * w) / (ex.w - 2 * ex.pad) * 0.5;
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
  const sc = 1 + 0.14 * d.pop;
  const cx = (m.vb.x + m.vb.w / 2) * S;
  return (
    <group position={[d.x, d.hop, d.z + 0.3]} scale={[DET_SCALE, DET_SCALE, DET_SCALE]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.08, 0.012, 0]}><circleGeometry args={[0.5, 32]} /><meshBasicMaterial color="#3a2a40" transparent opacity={0.36} /></mesh>
      <group position={[cx, cy + bob, 0]} rotation={[0, 0, lean]} scale={[sc, sc, 1]}>
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
  const dist = intro ? lerp(10.5, 6.2, ih) : 6.5 - Math.min(hold, 3.2) * 0.14;
  const cz = k.z + dist;
  const swing = !intro && k.moving ? 1.25 * Math.sin(Math.PI * k.u) : 0;
  const cx = intro ? lerp(-0.2, CAM_X, ih) : CAM_X - swing;
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
                <Exhibit z={z} ex={a.ex[e.key]} t={t} scale={e.scale} lift={e.lift} />
              </group>
            );
          })}
          <Detective t={t} a={a} />
        </ThreeCanvas>
      )}
      <Badge t={t} />
      {flash > 0 && <AbsoluteFill style={{background: '#FBF8F1', opacity: flash}} />}
      {!hideCaptions && <Captions t={t} />}
      {k.i < -5 && null}
    </AbsoluteFill>
  );
};
