import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {renderToStaticMarkup} from 'react-dom/server';
import {Stick, walkLegs, ARM_REST_L, ARM_REST_R, Expr, Arm} from '../stick/Stick';

/**
 * 3D world + 2D stickman. The corridor is real geometry (toon-shaded boxes with an inverted-hull ink outline);
 * the detective is the channel's own SVG stickman baked to a texture and stood up as a camera-facing card.
 */
export const W3D_FPS = 30;
export const W3D_DUR = 5; // seconds
const FRAMES = W3D_DUR * W3D_FPS;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------- stickman -> texture ---------- */
const VB = {x: -190, y: -745, w: 380, h: 770};
const svgUrl = (inner: React.ReactElement) => {
  const s = renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" width={760} height={1540} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}>{inner}</svg>
  );
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
};

const WALK_N = 8;
const walkArms = (ph: number): [Arm, Arm] => {
  const a = Math.sin(ph * Math.PI * 2);
  return [
    {elbow: [-74, -330 + 10 * a], hand: [-80 - 4 * a, -250 + 24 * a]},
    {elbow: [74, -330 - 10 * a], hand: [80 + 4 * a, -250 - 24 * a]},
  ];
};
type Pose = {expr: Expr; ph?: number; hat?: number; up?: boolean};
const poseUrl = ({expr, ph, hat = 0, up}: Pose) => {
  const legs = ph === undefined ? undefined : walkLegs(ph, 1);
  const [aL, aR] = ph === undefined ? [ARM_REST_L, ARM_REST_R] : walkArms(ph);
  const armR: Arm = up ? {elbow: [108, -360], hand: [118, -450]} : aR;
  return svgUrl(<Stick outfit="detective" expr={expr} legs={legs} armL={aL} armR={armR} prop={false} seed={7} opts={{hatLift: hat}} />);
};

const useTextures = () => {
  const [tex, setTex] = useState<Record<string, THREE.Texture> | null>(null);
  const [handle] = useState(() => delayRender('stick textures'));
  useEffect(() => {
    const defs: Record<string, string> = {};
    for (let i = 0; i < WALK_N; i++) defs['w' + i] = poseUrl({expr: 'neutral', ph: i / WALK_N});
    defs.stand = poseUrl({expr: 'neutral'});
    defs.surprised = poseUrl({expr: 'surprised', hat: 18});
    defs.shock = poseUrl({expr: 'shock', hat: 26, up: true});
    const loader = new THREE.TextureLoader();
    Promise.all(
      Object.entries(defs).map(
        ([k, u]) =>
          new Promise<[string, THREE.Texture]>((res, rej) =>
            loader.load(u, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res([k, t]); }, undefined, rej)
          )
      )
    ).then((es) => { setTex(Object.fromEntries(es)); continueRender(handle); });
  }, [handle]);
  return tex;
};

/* ---------- toon materials ---------- */
export const gradient = (() => {
  const d = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
export const toon = (c: string) => new THREE.MeshToonMaterial({color: c, gradientMap: gradient});
const INKMAT = new THREE.MeshBasicMaterial({color: '#0b0a0c', side: THREE.BackSide});

/** Box with an inverted-hull ink outline of constant world thickness. */
export const Box: React.FC<{p: [number, number, number]; s: [number, number, number]; c: string; t?: number}> = ({p, s, c, t = 0.035}) => {
  const m = useMemo(() => toon(c), [c]);
  return (
    <group position={p}>
      <mesh material={m}><boxGeometry args={s} /></mesh>
      <mesh material={INKMAT} scale={[(s[0] + 2 * t) / s[0], (s[1] + 2 * t) / s[1], (s[2] + 2 * t) / s[2]]}>
        <boxGeometry args={s} />
      </mesh>
    </group>
  );
};
export const Ball: React.FC<{p: [number, number, number]; r: number; c: string}> = ({p, r, c}) => {
  const m = useMemo(() => toon(c), [c]);
  return (
    <group position={p}>
      <mesh material={m}><sphereGeometry args={[r, 24, 18]} /></mesh>
      <mesh material={INKMAT} scale={1 + 0.035 / r}><sphereGeometry args={[r, 24, 18]} /></mesh>
    </group>
  );
};

/* ---------- painted textures ---------- */
export const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, rep?: [number, number]) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); }
  return t;
};
export const floorTex = () => canvasTex(512, 512, (g) => {
  g.fillStyle = '#f3ecd8'; g.fillRect(0, 0, 512, 512);
  g.fillStyle = '#e4d9bd'; g.fillRect(0, 0, 256, 256); g.fillRect(256, 256, 256, 256);
  g.strokeStyle = '#d9a43a'; g.lineWidth = 5; g.strokeRect(2, 2, 508, 508);
  const cols = ['#e0554a', '#2f9e9a', '#d9a43a'];
  for (let i = 0; i < 90; i++) { g.fillStyle = cols[i % 3]; g.beginPath(); g.arc(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 2.5, 0, 7); g.fill(); }
}, [3, 14]);
export const wallTex = () => canvasTex(512, 512, (g) => {
  g.fillStyle = '#f2b81f'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,226,120' : '200,130,10'},${0.05 + Math.random() * 0.07})`; g.fillRect(Math.random() * 512, Math.random() * 512, 3 + Math.random() * 22, 2 + Math.random() * 10); }
}, [4, 1]);
export const frameTex = (i: number) => canvasTex(256, 320, (g) => {
  g.fillStyle = '#fff6df'; g.fillRect(0, 0, 256, 320);
  const cols = ['#e0554a', '#2f9e9a', '#6c4bb8', '#4aa54a'];
  g.fillStyle = cols[i % 4]; g.fillRect(70, 150, 116, 150);
  g.fillStyle = '#fbf8f1'; g.beginPath(); g.arc(128, 100, 46, 0, 7); g.fill();
  g.strokeStyle = '#241726'; g.lineWidth = 7; g.stroke();
  g.fillStyle = '#241726'; g.beginPath(); g.arc(112, 96, 6, 0, 7); g.arc(144, 96, 6, 0, 7); g.fill();
  g.fillStyle = '#1b2a6b'; g.font = '800 30px sans-serif'; g.textAlign = 'center'; g.fillText(['$25K', '$5K', '$10K', '$50K'][i % 4], 128, 40);
});
const questionTex = () => canvasTex(256, 256, (g) => {
  g.font = '900 230px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 26; g.strokeStyle = '#0b0a0c'; g.lineJoin = 'round'; g.strokeText('?', 128, 138);
  g.fillStyle = '#ffd23f'; g.fillText('?', 128, 138);
});

const Hall: React.FC = () => {
  const floor = useMemo(floorTex, []);
  const wall = useMemo(wallTex, []);
  const frames = useMemo(() => [0, 1, 2, 3].map(frameTex), []);
  const fm = useMemo(() => new THREE.MeshToonMaterial({map: floor, gradientMap: gradient}), [floor]);
  const wm = useMemo(() => new THREE.MeshToonMaterial({map: wall, gradientMap: gradient}), [wall]);
  const L = 22, Z0 = -17; // hall from z=5 to z=-17
  return (
    <group>
      <mesh material={fm} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, Z0 + L / 2]}><planeGeometry args={[6, L]} /></mesh>
      <mesh material={wm} rotation={[0, Math.PI / 2, 0]} position={[-3, 1.6, Z0 + L / 2]}><planeGeometry args={[L, 3.2]} /></mesh>
      <mesh material={wm} rotation={[0, -Math.PI / 2, 0]} position={[3, 1.6, Z0 + L / 2]}><planeGeometry args={[L, 3.2]} /></mesh>
      <mesh material={wm} position={[0, 1.6, Z0]}><planeGeometry args={[6, 3.2]} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, Z0 + L / 2]}><planeGeometry args={[6, L]} /><meshBasicMaterial color="#fbf1d2" /></mesh>
      {/* baseboards */}
      <Box p={[-2.97, 0.17, Z0 + L / 2]} s={[0.1, 0.34, L]} c="#1f8f8a" />
      <Box p={[2.97, 0.17, Z0 + L / 2]} s={[0.1, 0.34, L]} c="#1f8f8a" />
      {/* end door */}
      <Box p={[0, 1.15, Z0 + 0.06]} s={[1.5, 2.3, 0.12]} c="#c24a3b" />
      <Ball p={[0.5, 1.1, Z0 + 0.2]} r={0.07} c="#ffd23f" />
      {/* framed portraits along both walls */}
      {[-14, -10.5, -7, -3.5, 0].map((z, i) => (
        <group key={z}>
          {[-1, 1].map((side, j) => (
            <group key={side} position={[side * 2.93, 1.75, z - (side > 0 ? 0.8 : 0)]} rotation={[0, -side * Math.PI / 2, 0]}>
              <Box p={[0, 0, 0]} s={[0.78, 0.98, 0.07]} c="#d9a43a" t={0.03} />
              <mesh position={[0, 0, 0.045]}><planeGeometry args={[0.66, 0.86]} /><meshBasicMaterial map={frames[(i + j) % 4]} /></mesh>
            </group>
          ))}
        </group>
      ))}
      {/* waiting-room benches */}
      {[-9, -3.5].map((z, i) => (
        <group key={z} position={[i ? -2.1 : 2.1, 0, z]}>
          <Box p={[0, 0.34, 0]} s={[0.7, 0.14, 1.6]} c={i ? '#2f9e9a' : '#e0554a'} />
          <Box p={[i ? -0.3 : 0.3, 0.7, 0]} s={[0.12, 0.6, 1.6]} c={i ? '#2f9e9a' : '#e0554a'} />
          <Box p={[0, 0.14, -0.7]} s={[0.5, 0.28, 0.1]} c="#2b2723" t={0.02} />
          <Box p={[0, 0.14, 0.7]} s={[0.5, 0.28, 0.1]} c="#2b2723" t={0.02} />
        </group>
      ))}
      {/* hanging lamps */}
      {[-12, -7.5, -3, 1.5].map((z) => (
        <group key={z}>
          <Box p={[0, 3.05, z]} s={[0.04, 0.4, 0.04]} c="#2b2723" t={0.015} />
          <Ball p={[0, 2.78, z]} r={0.26} c="#fff3c4" />
        </group>
      ))}
    </group>
  );
};

/* ---------- the detective card ---------- */
const CARD_H = 2.15;
const CARD_W = CARD_H * (VB.w / VB.h);
const STRIDE = 1.5; // metres per walk cycle

const Detective: React.FC<{frame: number; tex: Record<string, THREE.Texture>}> = ({frame, tex}) => {
  const walkEnd = 100;
  const u = clamp01(frame / walkEnd);
  const dist = 11 * (1 - (1 - u) ** 1.6); // eases to a stop
  const z = -12.5 + dist;
  const walking = frame < walkEnd;
  const ph = (dist / STRIDE) % 1;
  let key = 'stand';
  if (walking) key = 'w' + (Math.floor(ph * WALK_N) % WALK_N);
  else if (frame >= 118) key = 'shock';
  else if (frame >= 108) key = 'surprised';
  const bob = walking ? Math.abs(Math.sin(ph * Math.PI * 2)) * 0.07 : 0;
  const lean = walking ? Math.sin(ph * Math.PI * 2) * 0.05 : 0;
  const hop = frame >= 118 ? Math.max(0, 0.22 * Math.sin(clamp01((frame - 118) / 10) * Math.PI)) : 0;
  const s = CARD_H / VB.h;
  const cardCenterY = (VB.h / 2 - 25) * s; // feet sit 25 svg-units above the bottom edge
  const qIn = clamp01((frame - 120) / 8);
  const qTex = useMemo(questionTex, []);
  return (
    <group position={[0, hop, z]}>
      {/* contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, 0.012, 0]}>
        <circleGeometry args={[0.55, 32]} /><meshBasicMaterial color="#3a2a40" transparent opacity={0.38 - hop * 0.6} />
      </mesh>
      <group position={[0, cardCenterY + bob, 0]} rotation={[0, 0, lean]}>
        <mesh>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshBasicMaterial map={tex[key]} transparent alphaTest={0.02} toneMapped={false} />
        </mesh>
      </group>
      {qIn > 0 && (
        <mesh position={[0.15, CARD_H + 0.45 + 0.1 * Math.sin(frame * 0.35), 0.05]} scale={[smooth(qIn) * 0.8, smooth(qIn) * 0.8, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={qTex} transparent toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

/* ---------- camera ---------- */
const Rig: React.FC<{frame: number}> = ({frame}) => {
  const {camera} = useThree();
  const p = smooth(frame / 110);
  const creep = frame / FRAMES; // every hold keeps pushing in
  const kick = frame >= 118 && frame < 125 ? (frame % 2 ? 1 : -1) * 0.03 * (1 - (frame - 118) / 7) : 0;
  const pos = new THREE.Vector3(lerp(1.5, 0.15, p), lerp(0.55, 1.35, p) + kick, lerp(5.2, 1.6, p) - creep * 0.5);
  const look = new THREE.Vector3(lerp(0.2, 0, p), lerp(1.0, 1.45, p), lerp(-5, -3.5, p));
  camera.position.copy(pos);
  camera.lookAt(look);
  const roll = THREE.MathUtils.degToRad(lerp(4.5, 0, smooth(frame / 100)) + (frame >= 118 ? 3 * smooth((frame - 118) / 12) : 0));
  camera.rotateZ(roll);
  (camera as THREE.PerspectiveCamera).fov = lerp(52, 44, p) - (frame >= 118 ? 3 * smooth((frame - 118) / 30) : 0);
  camera.updateProjectionMatrix();
  return null;
};

export const World3D: React.FC = () => {
  const frame = useCurrentFrame();
  const tex = useTextures();
  return (
    <AbsoluteFill style={{background: '#b8d0ec'}}>
      {tex && (
        <ThreeCanvas width={1080} height={1920} camera={{fov: 50, near: 0.1, far: 80, position: [0, 1, 5]}} gl={{antialias: true}}>
          <color attach="background" args={['#f7e6b5']} />
          <fog attach="fog" args={['#f7e6b5', 12, 30]} />
          <ambientLight intensity={1.15} color="#cfd8ff" />
          <directionalLight position={[3, 6, 4]} intensity={2.2} color="#ffd9a0" />
          <Rig frame={frame} />
          <Hall />
          <Detective frame={frame} tex={tex} />
        </ThreeCanvas>
      )}
    </AbsoluteFill>
  );
};
