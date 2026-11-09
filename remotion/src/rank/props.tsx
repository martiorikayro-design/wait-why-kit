import React from 'react';
import {Line, P, Shape, circlePts, ellPts} from '../stick/ink';
import {INK, CREAM, TAN, TAN_D, SAGE, SAGE_D, OLIVE_D, MUSTARD, MUSTARD_D, WHITE, NAVY, NAVY_D, BROWN, BROWN_D, BRICK, DUST} from '../stick/style';

/** Props for "Animals that live the longest" (ranking), hand-inked stickman style. */
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const hash = (i: number, k = 0) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };

export const WATER_TOP = 1700;
export const SKY = '#E8DDC4';

/** Grassy island hill. Origin = top centre on the waterline. */
export const Island: React.FC<{seed?: number}> = ({seed = 1}) => (
  <g>
    <Shape pts={[[-700, 40], [-560, -120], [-300, -240], [0, -280], [300, -240], [520, -130], [660, 40]]} fill={SAGE} w={7} seed={seed} />
    <Shape pts={[[-700, 40], [-600, -40], [-300, -90], [100, -70], [460, -40], [660, 40]]} fill={SAGE_D} w={5} seed={seed + 1} />
    {[[-380, -210], [-120, -262], [180, -250], [360, -190]].map(([x, y], i) => (
      <g key={i}>{[[-14, -30], [0, -44], [14, -28]].map(([dx, dy], j) => <Line key={j} pts={[[x + dx * 0.3, y], [x + dx, y + dy]]} w={5} seed={seed + 10 + i * 3 + j} taper={0.8} color={OLIVE_D} />)}</g>
    ))}
  </g>
);

export const Waves: React.FC<{t: number; x0: number; x1: number; seed?: number}> = ({t, x0, x1, seed = 1}) => {
  const pts: P[] = [];
  for (let x = x0; x <= x1; x += 40) pts.push([x, Math.sin(x * 0.02 + t * 2.4) * 8]);
  return <Line pts={pts} w={7} seed={seed} taper={0.95} color={WHITE} />;
};

export const IceFloe: React.FC<{w: number; seed?: number}> = ({w, seed = 1}) => (
  <g>
    <Shape pts={[[-w / 2, 0], [-w / 2 + 20, -30], [-w / 6, -42], [w / 4, -36], [w / 2, -12], [w / 2 - 10, 30], [-w / 2 + 14, 34]]} fill={WHITE} w={5} seed={seed} />
    <Line pts={[[-w / 2 + 10, 4], [w / 2 - 12, 6]]} w={3} seed={seed + 1} taper={0.9} color="#B9CDD3" />
  </g>
);

/** Giant tortoise facing LEFT. Origin = ground under the shell. */
export const Tortoise: React.FC<{t: number; seed?: number; chew?: number}> = ({t, seed = 1, chew = 0}) => {
  const nod = Math.sin(t * 2.2) * 4;
  const skin = '#A39C8A';
  return (
    <g>
      {[[-120, 0], [-40, 6], [70, 6], [140, 0]].map(([x, y], i) => (
        <Shape key={i} pts={[[x - 26, y], [x - 30, -70], [x + 26, -70], [x + 28, y]]} fill={skin} w={5.5} seed={seed + i} />
      ))}
      <g transform={`rotate(${nod * 0.3} -150 -100)`}>
        <Shape pts={[[-140, -96], [-210, -150], [-238, -186], [-196, -204], [-160, -170], [-110, -130]]} fill={skin} w={5.5} seed={seed + 5} />
        {[[-200, -160, -180, -150], [-190, -176, -168, -160]].map(([a, b, c, d], i) => <Line key={i} pts={[[a, b], [c, d]]} w={3} seed={seed + 6 + i} taper={0.6} color="#7D7766" />)}
        <Shape pts={circlePts(-262, -204, 48, seed, 12)} fill={skin} w={6} seed={seed + 8} />
        <ellipse cx={-280} cy={-216} rx={6} ry={8} fill={INK} />
        <Line pts={[[-292, -230], [-278, -238], [-266, -232]]} w={3.5} seed={seed + 9} taper={0.3} />
        <Line pts={[[-306, -190], [-286, -186 + chew * 6], [-264, -192]]} w={4} seed={seed + 10} taper={0.3} />
        {[[-250, -170], [-240, -182]].map(([x, y], i) => <Line key={i} pts={[[x - 10, y], [x + 10, y + 2]]} w={2.5} seed={seed + 11 + i} taper={0.6} color="#7D7766" />)}
      </g>
      <Shape pts={[[-190, -60], [-180, -150], [-120, -230], [-20, -268], [90, -256], [170, -190], [200, -100], [196, -60]]} fill={BROWN} w={7} seed={seed + 12} />
      {[[[-150, -120], [-90, -190], [-10, -210], [10, -150], [-60, -110]], [[10, -150], [-10, -210], [80, -220], [130, -160], [70, -120]],
        [[130, -160], [80, -220], [150, -190], [180, -120]], [[-160, -80], [-60, -110], [70, -120], [180, -100], [190, -70], [-180, -66]]].map((pl, i) => (
        <Shape key={i} pts={pl as P[]} fill={i % 2 ? '#8E6D4D' : '#6F5338'} w={3.5} seed={seed + 20 + i} />
      ))}
      <Shape pts={[[-200, -66], [204, -66], [204, -44], [-200, -44]]} fill="#5E4430" w={5} seed={seed + 30} />
    </g>
  );
};

/** Little birthday cake with candles. Origin = bottom centre. */
export const Cake: React.FC<{t: number; candles?: number; seed?: number}> = ({t, candles = 5, seed = 1}) => (
  <g>
    <Shape pts={[[-90, 0], [-90, -70], [90, -70], [90, 0]]} fill="#E9D3C0" w={5.5} seed={seed} />
    <Shape pts={[[-62, -70], [-62, -126], [62, -126], [62, -70]]} fill="#E9D3C0" w={5.5} seed={seed + 1} />
    <Line pts={[[-90, -54], [-60, -44], [-30, -56], [0, -44], [30, -56], [60, -44], [90, -54]]} w={6} seed={seed + 2} taper={0.9} color={BRICK} />
    <Line pts={[[-62, -112], [-30, -102], [0, -114], [30, -102], [62, -112]]} w={6} seed={seed + 3} taper={0.9} color={BRICK} />
    {Array.from({length: candles}).map((_, i) => {
      const x = -44 + (88 * i) / Math.max(1, candles - 1);
      return (
        <g key={i}>
          <Line pts={[[x, -126], [x, -168]]} w={8} seed={seed + 10 + i} taper={0.95} color={i % 2 ? SAGE : MUSTARD} />
          <Shape pts={[[x, -200 - Math.sin(t * 14 + i) * 4], [x + 8, -180], [x, -170], [x - 8, -180]]} fill={MUSTARD} w={3} seed={seed + 20 + i} />
        </g>
      );
    })}
  </g>
);

/** Bowhead whale facing RIGHT. Origin = body centre. */
export const Bowhead: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => {
  const sway = Math.sin(t * 1.6);
  return (
    <g>
      <g transform={`rotate(${sway * 8} -330 -10)`}>
        <Shape pts={[[-330, -10], [-470, -90 + sway * 10], [-500, -40], [-430, 0], [-500, 40], [-470, 90 - sway * 10]]} fill={NAVY_D} w={6} seed={seed} />
      </g>
      <Shape pts={[[-340, -30], [-200, -120], [20, -160], [210, -170], [330, -140], [400, -60], [410, 40], [330, 120], [120, 150], [-120, 120], [-300, 40]]} fill="#34405A" w={8} seed={seed + 1} />
      <Shape pts={[[260, 70], [330, 30], [400, 40], [380, 110], [300, 130], [230, 120]]} fill="#ECE5D6" w={5} seed={seed + 2} />
      <Line pts={[[140, 40], [220, -40], [330, -60], [400, -20]]} w={6} seed={seed + 3} taper={0.5} />
      <ellipse cx={170} cy={30} rx={7} ry={9} fill={WHITE} />
      <circle cx={171} cy={31} r={4} fill={INK} />
      <Shape pts={[[40, 90], [120, 170], [10, 160]]} fill={NAVY_D} w={5} seed={seed + 4} />
      {[[-60, 40], [0, 70], [60, 30]].map(([x, y], i) => <Line key={i} pts={[[x, y], [x + 50, y + 4]]} w={3} seed={seed + 5 + i} taper={0.7} color="#56627C" />)}
    </g>
  );
};

/** Greenland shark facing RIGHT. Origin = body centre. */
export const Shark: React.FC<{t: number; seed?: number}> = ({t, seed = 1}) => {
  const sway = Math.sin(t * 2.0);
  const c = '#6F6A60', d = '#57534B';
  return (
    <g>
      <g transform={`rotate(${sway * 10} -240 0)`}>
        <Shape pts={[[-240, -6], [-330, -110], [-300, -10], [-330, 70], [-250, 14]]} fill={d} w={5.5} seed={seed} />
      </g>
      <Shape pts={[[-250, 0], [-150, -60], [40, -80], [200, -64], [280, -24], [292, 10], [250, 44], [60, 70], [-140, 50]]} fill={c} w={7} seed={seed + 1} />
      <Shape pts={[[-20, -76], [20, -110], [50, -78]]} fill={d} w={5} seed={seed + 2} />
      <Shape pts={[[-150, -56], [-130, -80], [-110, -54]]} fill={d} w={4} seed={seed + 3} />
      <Shape pts={[[90, 50], [70, 110], [150, 60]]} fill={d} w={5} seed={seed + 4} />
      {[120, 140, 160].map((x, i) => <Line key={i} pts={[[x, -10], [x - 6, 24]]} w={3} seed={seed + 5 + i} taper={0.6} color={INK} />)}
      <ellipse cx={226} cy={-14} rx={6} ry={6} fill="#D8E4E2" />
      <circle cx={227} cy={-14} r={3.2} fill={INK} />
      <Line pts={[[250, 22], [280, 18]]} w={3.5} seed={seed + 9} taper={0.5} />
      {Array.from({length: 7}).map((_, i) => <circle key={i} cx={-120 + i * 46} cy={-30 + (i % 3) * 14} r={3} fill="#827C71" />)}
    </g>
  );
};

/** Ocean quahog clam with growth rings. `count` 0..1 lights the rings from the hinge out. Origin = bottom centre. */
export const Clam: React.FC<{t: number; count?: number; seed?: number}> = ({t, count = 0, seed = 1}) => {
  const rings = 14;
  return (
    <g>
      <Shape pts={[[-120, -10], [-110, -80], [-60, -140], [0, -160], [60, -140], [110, -80], [120, -10], [60, 6], [-60, 6]]} fill="#CDBA98" w={7} seed={seed} />
      {Array.from({length: rings}).map((_, i) => {
        const u = (i + 1) / (rings + 1);
        const lit = count * rings > i;
        const pts: P[] = [[-120 * u, -10 - 60 * u * 0.5 - 14], [-110 * u, -80 * u - 14], [-60 * u, -140 * u - 10], [0, -160 * u - 6], [60 * u, -140 * u - 10], [110 * u, -80 * u - 14], [120 * u, -10 - 60 * u * 0.5 - 14]];
        return <Line key={i} pts={pts.map(([x, y]) => [x, y + 150 * (1 - u) * 0.0 + (1 - u) * -6] as P)} w={lit ? 5 : 3} seed={seed + 2 + i} taper={0.7} color={lit ? MUSTARD : '#8C6E4E'} />;
      })}
      <Shape pts={[[-20, -150], [0, -172], [20, -150], [0, -140]]} fill="#8C6E4E" w={4} seed={seed + 30} />
      <Line pts={[[-120, -8], [120, -8]]} w={5} seed={seed + 31} taper={0.9} color="#6E553A" />
    </g>
  );
};

/** Deep-sea glass sponge on its giant glass rod. Origin = seafloor. */
export const GlassSponge: React.FC<{t: number; seed?: number; glow?: number}> = ({t, seed = 1, glow = 0.5}) => (
  <g>
    <ellipse cx={0} cy={-300} rx={160} ry={420} fill="#9FD3DA" opacity={0.08 + 0.08 * glow * (0.7 + 0.3 * Math.sin(t * 2))} />
    <Line pts={[[0, 0], [4, -300], [-2, -560], [6, -700]]} w={12} seed={seed} taper={0.6} color="#E6F2F2" />
    <Shape pts={[[-46, -10], [-56, -120], [-50, -230], [-34, -260], [34, -260], [50, -230], [56, -120], [46, -10]]} fill="rgba(207,227,230,0.55)" w={6} seed={seed + 1} />
    {Array.from({length: 6}).map((_, i) => <Line key={`a${i}`} pts={[[-50, -30 - i * 40], [50, -60 - i * 40]]} w={2.5} seed={seed + 2 + i} taper={0.5} color="#F2FAFA" />)}
    {Array.from({length: 6}).map((_, i) => <Line key={`b${i}`} pts={[[-50, -60 - i * 40], [50, -30 - i * 40]]} w={2.5} seed={seed + 10 + i} taper={0.5} color="#F2FAFA" />)}
    {[[-30, -480], [24, -600], [-14, -380]].map(([x, y], i) => <circle key={i} cx={x} cy={y + Math.sin(t * 2 + i) * 6} r={4} fill={WHITE} opacity={0.6 + 0.4 * Math.sin(t * 3 + i)} />)}
  </g>
);

/** The immortal jellyfish (Turritopsis dohrnii): small bell with a bright red stomach. Origin = bell centre. */
export const Jelly: React.FC<{t: number; s?: number; droop?: number; dark?: number; seed?: number}> = ({t, s = 1, droop = 0, dark = 0, seed = 1}) => {
  const pulse = 1 + 0.08 * Math.sin(t * 5) * (1 - droop);
  const fill = dark > 0.5 ? '#22323F' : 'rgba(246,241,230,0.82)';
  return (
    <g transform={`scale(${s})`}>
      {dark < 0.5 && <circle cx={0} cy={10} r={140} fill="#F6E9C8" opacity={0.16} />}
      {Array.from({length: 9}).map((_, i) => {
        const x = -54 + i * 13.5;
        const pts: P[] = [];
        for (let k = 0; k <= 6; k++) pts.push([x + Math.sin(t * 3 + i + k * 0.9) * (6 + k * 2), 18 + k * (22 - droop * 8)]);
        return <Line key={i} pts={pts} w={3} seed={seed + i} taper={0.9} color={dark > 0.5 ? '#16212B' : '#E8DCC6'} />;
      })}
      <g transform={`scale(${pulse * (1 + droop * 0.15)} ${(2 - pulse) * (1 - droop * 0.4)})`}>
        <Shape pts={[[-64, 20], [-60, -20], [-40, -52], [0, -64], [40, -52], [60, -20], [64, 20], [30, 14], [0, 18], [-30, 14]]} fill={fill} w={6} seed={seed + 12} />
        {dark < 0.5 && <Shape pts={[[-18, 6], [-14, -22], [0, -32], [14, -22], [18, 6], [0, 12]]} fill="#D44A36" w={3.5} seed={seed + 13} />}
        {dark < 0.5 && [-30, 30].map((x, i) => <Line key={i} pts={[[x, -30], [x * 0.7, 8]]} w={2.5} seed={seed + 14 + i} taper={0.6} color="#E2B9A8" />)}
      </g>
      {dark > 0.5 && <text x={0} y={-6} textAnchor="middle" fontFamily="FredokaCaps" fontWeight={700} fontSize={64} fill={MUSTARD} stroke={INK} strokeWidth={10} paintOrder="stroke">?</text>}
    </g>
  );
};

/** Hydroid polyp colony (the jellyfish's "baby stage"). grow 0..1. Origin = attachment point. */
export const Polyp: React.FC<{t: number; grow: number; seed?: number}> = ({t, grow, seed = 1}) => {
  if (grow <= 0) return null;
  const stalks: [number, number, number][] = [[0, -120, 0], [-40, -90, -0.4], [44, -100, 0.45], [-70, -60, -0.8], [70, -64, 0.8]];
  return (
    <g>
      <Shape pts={[[-90, 0], [-80, -10], [80, -10], [90, 0]]} fill="#C9A9A0" w={4} seed={seed} />
      {stalks.map(([x, h, a], i) => {
        const g = clamp(grow * 1.6 - i * 0.15);
        if (g <= 0) return null;
        const top: P = [x * g, h * g];
        const sw = Math.sin(t * 2 + i) * 4;
        return (
          <g key={i}>
            <Line pts={[[x * 0.2, -6], [x * 0.6 * g + sw * 0.5, h * 0.55 * g], [top[0] + sw, top[1]]]} w={4} seed={seed + 1 + i} taper={0.5} color="#C08E85" />
            <Shape pts={circlePts(top[0] + sw, top[1] - 8, 10 * g, seed + i, 8)} fill="#E7B9AC" w={3} seed={seed + 8 + i} />
            {Array.from({length: 5}).map((_, j) => {
              const aa = -Math.PI / 2 + (j - 2) * 0.5 + a * 0.2;
              return <Line key={j} pts={[[top[0] + sw, top[1] - 14 * g], [top[0] + sw + Math.cos(aa) * 22 * g, top[1] - 14 * g + Math.sin(aa) * 22 * g]]} w={2} seed={seed + 20 + j} taper={0.6} color="#C08E85" />;
            })}
          </g>
        );
      })}
    </g>
  );
};

export const Rocks: React.FC<{w: number; seed?: number; fill?: string}> = ({w, seed = 1, fill = '#5D6B74'}) => (
  <Shape pts={[[-w / 2, 0], [-w / 2 + 30, -60], [-w / 5, -90], [w / 6, -70], [w / 2 - 20, -40], [w / 2, 0]]} fill={fill} w={6} seed={seed} />
);

export const Seaweed: React.FC<{t: number; h?: number; seed?: number; color?: string}> = ({t, h = 260, seed = 1, color = '#5F7A52'}) => {
  const pts: P[] = [];
  for (let k = 0; k <= 6; k++) pts.push([Math.sin(t * 1.5 + k * 0.8 + seed) * k * 6, -k * h / 6]);
  return <Line pts={pts} w={14} seed={seed} taper={0.9} color={color} />;
};

export const Fish: React.FC<{s?: number; color?: string; seed?: number}> = ({s = 1, color = '#3E5566', seed = 1}) => (
  <g transform={`scale(${s})`}>
    <Shape pts={[[-40, 0], [-10, -18], [30, -10], [44, 0], [30, 10], [-10, 18]]} fill={color} w={4} seed={seed} />
    <Shape pts={[[-40, 0], [-62, -18], [-56, 0], [-62, 18]]} fill={color} w={4} seed={seed + 1} />
    <circle cx={28} cy={-3} r={3} fill={WHITE} />
  </g>
);

export const Bubbles: React.FC<{t: number; x: number; y: number; n?: number; spread?: number; seed?: number}> = ({t, x, y, n = 6, spread = 200, seed = 1}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const sp = 0.25 + hash(i, seed) * 0.35;
      const u = (t * sp + hash(i, seed + 1)) % 1;
      const r = 6 + hash(i, seed + 2) * 12;
      return <circle key={i} cx={x + (hash(i, seed + 3) - 0.5) * spread + Math.sin(t * 3 + i) * 8} cy={y - u * 600} r={r} fill="none" stroke="rgba(240,248,248,0.75)" strokeWidth={4} />;
    })}
  </g>
);

export const Sunbeams: React.FC<{t: number; seed?: number}> = ({t}) => (
  <g>
    {[[-300, 140], [100, 110], [520, 150], [900, 120], [1300, 140], [1700, 120]].map(([x, w], i) => (
      <path key={i} d={`M ${x} 0 L ${x + w} 0 L ${x + w * 2.6 + Math.sin(t * 0.6 + i) * 40} 1400 L ${x - w * 0.6 + Math.sin(t * 0.6 + i) * 40} 1400 Z`} fill="rgba(255,248,230,0.16)" />
    ))}
  </g>
);

export {CREAM, TAN, TAN_D, DUST, MUSTARD, MUSTARD_D, BROWN_D, NAVY};
