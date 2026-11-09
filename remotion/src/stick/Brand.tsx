import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Stick, Arm, ARM_REST_L, ARM_REST_R, Expr} from './Stick';
import {Line, P, Shape, circlePts, ellPts} from './ink';
import {FAMILY} from './fonts';
import {INK, PAPER, MUSTARD, MUSTARD_D, BRICK, SAGE, CREAM, TAN, WHITE, BROWN_D, NAVY, GLASS} from './style';

/** Brand art for the detective mascot: character sheet, profile picture, banner. */
const POSES: {label: string; armL: Arm; armR: Arm; expr: Expr; prop: boolean}[] = [
  {label: 'parado', armL: ARM_REST_L, armR: ARM_REST_R, expr: 'neutral', prop: false},
  {label: 'investigando', armL: ARM_REST_L, armR: {elbow: [104, -352], hand: [112, -420]}, expr: 'happy', prop: true},
  {label: 'explicando', armL: ARM_REST_L, armR: {elbow: [112, -430], hand: [172, -478]}, expr: 'happy', prop: false},
  {label: '"why?!"', armL: {elbow: [-108, -378], hand: [-134, -444]}, armR: {elbow: [108, -378], hand: [134, -444]}, expr: 'worried', prop: false},
  {label: 'pensando', armL: {elbow: [-40, -318], hand: [36, -334]}, armR: {elbow: [74, -360], hand: [30, -462]}, expr: 'smug', prop: false},
];
const EXPRS: {e: Expr; label: string}[] = [
  {e: 'neutral', label: 'neutro'}, {e: 'happy', label: 'feliz'}, {e: 'surprised', label: 'surpreso'},
  {e: 'worried', label: 'preocupado'}, {e: 'smug', label: 'convencido'},
];

const Label: React.FC<{x: number; y: number; w: number; size: number; children: React.ReactNode; weight?: number; op?: number}> = ({x, y, w, size, children, weight = 600, op = 0.8}) => (
  <div style={{position: 'absolute', left: x - w / 2, width: w, top: y, textAlign: 'center', fontFamily: FAMILY, fontSize: size, fontWeight: weight, color: INK, opacity: op}}>{children}</div>
);

export const CharacterSheet: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {POSES.map((p, i) => (
        <g key={i} transform={`translate(${230 + i * 365} 600) scale(0.64)`}>
          <Stick outfit="detective" expr={p.expr} armL={p.armL} armR={p.armR} prop={p.prop} seed={i * 7 + 2} />
        </g>
      ))}
      {EXPRS.map((x, i) => (
        <g key={i} transform={`translate(${230 + i * 365} ${1290}) scale(0.58)`}>
          <Stick outfit="detective" expr={x.e} headOnly seed={i * 5 + 40} />
        </g>
      ))}
      <line x1={80} y1={690} x2={1840} y2={690} stroke={INK} strokeOpacity={0.15} strokeWidth={3} strokeDasharray="10 12" />
    </svg>
    <Label x={960} y={14} w={1600} size={46} weight={700} op={1}>The Detective · Wait, Why?</Label>
    {POSES.map((p, i) => <Label key={i} x={230 + i * 365} y={612} w={340} size={26}>{p.label}</Label>)}
    {EXPRS.map((x, i) => <Label key={i} x={230 + i * 365} y={1030} w={340} size={26}>{x.label}</Label>)}
    <Img src={staticFile('stick/paper_wide.png')} style={{position: 'absolute', inset: 0, width: 1920, height: 1080, mixBlendMode: 'multiply'}} />
  </AbsoluteFill>
);

/** Profile picture: the detective's head with the magnifier blowing up one eye. Reads as a 98 px circle. */
export const ProfileStick: React.FC = () => {
  const s = 2.35, hx = 360, hy = 450;          // head centre on the canvas
  const lens = {x: hx + 33 * s + 6, y: hy - 4, r: 96};
  return (
    <AbsoluteFill style={{background: MUSTARD}}>
      <svg width={800} height={800} viewBox="0 0 800 800">
        {Array.from({length: 18}).map((_, i) => {
          const a0 = (i / 18) * Math.PI * 2, a1 = a0 + Math.PI / 18;
          return <path key={i} d={`M 400 400 L ${400 + Math.cos(a0) * 700} ${400 + Math.sin(a0) * 700} L ${400 + Math.cos(a1) * 700} ${400 + Math.sin(a1) * 700} Z`} fill="#DDB458" />;
        })}
        <g transform={`translate(${hx} ${hy + 565 * s}) scale(${s})`}>
          <Stick outfit="detective" expr="happy" seed={11} />
        </g>
        {/* magnifier over his right eye: the eye looks huge through the glass */}
        <Line pts={[[lens.x + 60, lens.y + 74], [lens.x + 150, lens.y + 210]]} w={34} seed={4} taper={0.85} color={BROWN_D} />
        <defs><clipPath id="lensclip"><circle cx={lens.x} cy={lens.y} r={lens.r} /></clipPath></defs>
        <circle cx={lens.x} cy={lens.y} r={lens.r} fill={WHITE} />
        <g clipPath="url(#lensclip)">
          <ellipse cx={lens.x - 6} cy={lens.y + 4} rx={30} ry={44} fill={INK} />
          <circle cx={lens.x + 4} cy={lens.y - 12} r={9} fill={WHITE} />
          <Line pts={[[lens.x - 64, lens.y - 70], [lens.x - 6, lens.y - 92], [lens.x + 50, lens.y - 78]]} w={12} seed={9} taper={0.3} />
          <circle cx={lens.x} cy={lens.y} r={lens.r} fill={GLASS} opacity={0.32} />
        </g>
        <Shape pts={circlePts(lens.x, lens.y, lens.r, 3, 14, 0.004)} fill="none" w={20} seed={5} />
        <Line pts={[[lens.x - 52, lens.y - 40], [lens.x - 30, lens.y - 62]]} w={10} seed={6} taper={0.5} color={WHITE} />
      </svg>
      <Img src={staticFile('stick/paper_square.png')} style={{position: 'absolute', inset: 0, width: 800, height: 800, mixBlendMode: 'multiply'}} />
    </AbsoluteFill>
  );
};

/* small hand-inked doodles for the banner: the kind of things the channel asks "why?" about */
const Doodle: React.FC<{kind: string; seed: number}> = ({kind, seed}) => {
  if (kind === 'q') return <g><Line pts={[[-20, -30], [-14, -52], [8, -58], [24, -44], [16, -24], [2, -14], [2, 6]]} w={12} seed={seed} taper={0.5} /><circle cx={2} cy={28} r={7} fill={INK} /></g>;
  if (kind === 'chili') return (
    <g transform="rotate(-25)">
      <Shape pts={[[-18, -44], [16, -46], [22, 0], [8, 50], [0, 62], [-6, 44], [-16, 0]]} fill={BRICK} w={6} seed={seed} />
      <Shape pts={[[-22, -48], [22, -50], [12, -36], [-12, -36]]} fill={SAGE} w={5} seed={seed + 1} />
      <Line pts={[[0, -50], [6, -70], [18, -78]]} w={6} seed={seed + 2} taper={0.4} />
    </g>
  );
  if (kind === 'frame') return (
    <g>
      <Shape pts={[[-48, -62], [48, -62], [48, 62], [-48, 62]]} fill={MUSTARD_D} w={7} seed={seed} />
      <Shape pts={[[-34, -48], [34, -48], [34, 48], [-34, 48]]} fill="#8B8A63" w={4} seed={seed + 1} />
      <Shape pts={circlePts(0, -12, 13, seed, 8)} fill={TAN} w={3.5} seed={seed + 2} />
      <Shape pts={[[-22, 48], [-18, 14], [0, 4], [18, 14], [22, 48]]} fill="#4A3B2E" w={3.5} seed={seed + 3} />
    </g>
  );
  if (kind === 'bulb') return (
    <g>
      <Shape pts={circlePts(0, -16, 34, seed, 10)} fill={CREAM} w={6} seed={seed} />
      <Shape pts={[[-16, 14], [16, 14], [14, 34], [-14, 34]]} fill={TAN} w={5} seed={seed + 1} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = -Math.PI / 2 + (i - 2) * 0.55;
        return <Line key={i} pts={[[Math.cos(a) * 46, -16 + Math.sin(a) * 46], [Math.cos(a) * 64, -16 + Math.sin(a) * 64]]} w={5} seed={seed + 5 + i} taper={0.5} />;
      })}
    </g>
  );
  if (kind === 'globe') return (
    <g>
      <Shape pts={circlePts(0, 0, 44, seed, 12)} fill={NAVY} w={6} seed={seed} />
      <Shape pts={[[-26, -20], [-4, -30], [6, -12], [-10, 4], [-24, 0]]} fill={SAGE} w={3.5} seed={seed + 1} />
      <Shape pts={[[8, 8], [26, 4], [30, 22], [14, 30]]} fill={SAGE} w={3.5} seed={seed + 2} />
    </g>
  );
  return <Shape pts={ellPts(0, 0, 30, 30)} fill={TAN} w={5} seed={seed} />;
};

export const BannerStick: React.FC<{guides?: boolean}> = ({guides = false}) => {
  const doodles: {k: string; x: number; y: number; s: number; r: number}[] = [
    {k: 'q', x: 230, y: 330, s: 1.6, r: -12}, {k: 'chili', x: 330, y: 1120, s: 1.3, r: 0}, {k: 'frame', x: 2300, y: 330, s: 1.3, r: 8},
    {k: 'bulb', x: 2210, y: 1130, s: 1.3, r: 10}, {k: 'globe', x: 120, y: 760, s: 1.2, r: 0}, {k: 'q', x: 2440, y: 780, s: 1.3, r: 14},
    {k: 'q', x: 1300, y: 230, s: 1.1, r: 6}, {k: 'chili', x: 1700, y: 1240, s: 1.0, r: 0}, {k: 'bulb', x: 820, y: 220, s: 0.95, r: -8},
  ];
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <svg width={2560} height={1440} viewBox="0 0 2560 1440">
        {doodles.map((d, i) => (
          <g key={i} transform={`translate(${d.x} ${d.y}) rotate(${d.r}) scale(${d.s})`} opacity={0.9}><Doodle kind={d.k} seed={i * 3 + 1} /></g>
        ))}
        <g transform="translate(780 1130) scale(0.86)">
          <Stick outfit="detective" expr="happy" armL={ARM_REST_L} armR={{elbow: [112, -400], hand: [150, -452]}} seed={21} />
        </g>
        {/* magnifier aimed at the title */}
        <g transform="translate(780 1130) scale(0.86)">
          <Line pts={[[156, -458], [184, -488]]} w={12} seed={31} taper={0.8} color={BROWN_D} />
          <Shape pts={circlePts(214, -520, 36, 32, 12)} fill="rgba(214,226,223,0.55)" w={8} seed={33} />
        </g>
        {guides && <rect x={507} y={508} width={1546} height={423} fill="none" stroke="#FF00AA" strokeWidth={4} strokeDasharray="20 12" />}
      </svg>
      <div style={{position: 'absolute', left: 1450, top: 640, transform: 'translate(-50%, -50%) rotate(-2deg)', whiteSpace: 'nowrap',
        filter: `drop-shadow(0px 10px 0px ${INK})`}}>
        <span style={{fontFamily: FAMILY, fontWeight: 700, fontSize: 158, letterSpacing: '0.03em', color: CREAM, WebkitTextStroke: `22px ${INK}`, paintOrder: 'stroke fill'}}>WAIT, </span>
        <span style={{fontFamily: FAMILY, fontWeight: 700, fontSize: 158, letterSpacing: '0.03em', color: MUSTARD, WebkitTextStroke: `22px ${INK}`, paintOrder: 'stroke fill'}}>WHY?</span>
      </div>
      <div style={{position: 'absolute', left: 1450, top: 820, transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap', fontFamily: FAMILY, fontWeight: 600, fontSize: 56, color: INK}}>
        Curious questions. Real answers.
      </div>
      <Img src={staticFile('stick/paper_banner.png')} style={{position: 'absolute', inset: 0, width: 2560, height: 1440, mixBlendMode: 'multiply'}} />
    </AbsoluteFill>
  );
};

export type {P};

/** 150x150 video watermark (rendered at 600 and scaled down): the detective badge on a transparent background. */
export const Watermark: React.FC = () => (
  <AbsoluteFill>
    <svg width={600} height={600} viewBox="0 0 600 600">
      <Shape pts={circlePts(300, 300, 270, 2, 16, 0.003)} fill={MUSTARD} w={26} seed={2} />
      <defs><clipPath id="wmclip"><circle cx={300} cy={300} r={262} /></clipPath></defs>
      <g clipPath="url(#wmclip)">
        <g transform="translate(300 1395) scale(1.92)"><Stick outfit="detective" expr="happy" seed={11} /></g>
      </g>
    </svg>
  </AbsoluteFill>
);
