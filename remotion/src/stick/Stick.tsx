import React from 'react';
import {Line, P, Shape, circlePts, ellPts} from './ink';
import {
  INK, WHITE, TAN, TAN_D, KHAKI, KHAKI_D, BROWN, BROWN_D, BRICK, NAVY, NAVY_D, MUSTARD, MUSTARD_D, CREAM, GLASS,
} from './style';

/**
 * Stickman (front view). Feet at the origin, y up is negative.
 * Large round white head, small black oval eyes, thin brows, one-line mouth, no nose, stick limbs,
 * minimal torso in flat muted clothing.
 */
export type Outfit = 'detective' | 'explorer' | 'professor' | 'hoodie' | 'smock' | 'shirt' | 'guard' | 'visitor';
export type Expr = 'neutral' | 'happy' | 'surprised' | 'worried' | 'smug' | 'shock';
export type Arm = {elbow: P; hand: P};
export type Legs = {l: [P, P]; r: [P, P]}; // [knee, foot]
export type Hat = 'bowler' | 'boater' | 'cloche' | 'none';
export type Opts = {coat?: string; hat?: Hat; dress?: boolean; mustache?: boolean; hatLift?: number; flush?: number};

const HEAD: P = [0, -565];
const HR = 115;
const SHOE = '#2E2A26';

export const ARM_REST_L: Arm = {elbow: [-76, -330], hand: [-84, -246]};
export const ARM_REST_R: Arm = {elbow: [76, -330], hand: [84, -246]};
export const LEGS_STAND: Legs = {l: [[-24, -122], [-30, -22]], r: [[24, -122], [30, -22]]};

/** walking legs (front-on stickman walk): phase in cycles */
export const walkLegs = (phase: number, stride = 1): Legs => {
  const a = Math.sin(phase * Math.PI * 2);
  const liftL = Math.max(0, Math.sin(phase * Math.PI * 2)) * 26 * stride;
  const liftR = Math.max(0, -Math.sin(phase * Math.PI * 2)) * 26 * stride;
  return {
    l: [[-22 + 10 * a * stride, -124 - liftL * 0.6], [-28 + 26 * a * stride, -22 - liftL]],
    r: [[22 - 10 * a * stride, -124 - liftR * 0.6], [28 - 26 * a * stride, -22 - liftR]],
  };
};

const Face: React.FC<{expr: Expr; seed: number; look: number}> = ({expr, seed, look}) => {
  const big = expr === 'surprised' || expr === 'shock';
  const lx = look * 14;
  const ex = 33, ey = -568;
  const brow = (sgn: number): P[] => {
    const lift = big ? -22 : expr === 'smug' ? 6 : 0;
    const tilt = expr === 'worried' || expr === 'shock' ? 9 : expr === 'smug' ? -3 : 0;
    const x0 = sgn * 52 + lx, x1 = sgn * 34 + lx, x2 = sgn * 16 + lx;
    return [[x0, -596 + lift + tilt], [x1, -604 + lift - (big ? 6 : 0)], [x2, -598 + lift - tilt]];
  };
  return (
    <g>
      {[-1, 1].map((sgn) => (
        <g key={sgn}>
          {expr === 'smug' ? (
            <g>
              <ellipse cx={sgn * ex + lx} cy={ey + 4} rx={9.5} ry={8} fill={INK} />
              <Line pts={[[sgn * ex - 13 + lx, ey - 3], [sgn * ex + 13 + lx, ey - 5]]} w={4.5} seed={seed + sgn} taper={0.6} />
            </g>
          ) : (
            <ellipse cx={sgn * ex + lx} cy={ey} rx={big ? 11 : 9.5} ry={big ? 17 : 13.5} fill={INK} />
          )}
          <Line pts={brow(sgn)} w={4.6} seed={seed + 3 + sgn} taper={0.25} />
        </g>
      ))}
      {expr === 'neutral' && <Line pts={[[-24 + lx, -512], [lx, -503], [24 + lx, -512]]} w={4.6} seed={seed + 7} taper={0.3} />}
      {expr === 'happy' && <Line pts={[[-34 + lx, -516], [lx, -494], [34 + lx, -516]]} w={5.2} seed={seed + 7} taper={0.3} />}
      {expr === 'surprised' && <Shape pts={ellPts(lx, -500, 12, 16)} fill="#3B2B27" w={4.2} seed={seed + 7} />}
      {expr === 'shock' && <Shape pts={ellPts(lx, -496, 20, 26)} fill="#3B2B27" w={4.6} seed={seed + 7} />}
      {expr === 'worried' && <Line pts={[[-24 + lx, -506], [-8 + lx, -512], [8 + lx, -504], [24 + lx, -510]]} w={4.6} seed={seed + 7} taper={0.3} />}
      {expr === 'smug' && <Line pts={[[-22 + lx, -508], [4 + lx, -504], [28 + lx, -518]]} w={4.8} seed={seed + 7} taper={0.3} />}
    </g>
  );
};

const Hair: React.FC<{seed: number; messy?: boolean}> = ({seed, messy}) => {
  const strokes: P[][] = messy
    ? [[[-62, -652], [-48, -682], [-30, -690]], [[-34, -672], [-18, -700], [0, -706]], [[-6, -676], [10, -706], [28, -712]],
      [[18, -672], [38, -696], [56, -696]], [[44, -660], [64, -678], [80, -672]], [[-84, -630], [-76, -656], [-62, -668]]]
    : [[[-40, -674], [-24, -690], [-6, -686]], [[-10, -680], [8, -698], [26, -692]], [[18, -676], [36, -690], [52, -680]]];
  return <g>{strokes.map((s, i) => <Line key={i} pts={s} w={5} seed={seed + i * 1.7} taper={0.15} />)}</g>;
};

const Hand: React.FC<{p: P; seed: number}> = ({p, seed}) => <Shape pts={circlePts(p[0], p[1], 11, seed, 8)} fill={WHITE} w={4.5} seed={seed} />;

const COAT: P[] = [[-30, -438], [-52, -424], [-62, -400], [-63, -330], [-66, -240], [-72, -150], [-75, -126], [-38, -122], [0, -125],
  [38, -122], [75, -126], [72, -150], [66, -240], [63, -330], [62, -400], [52, -424], [30, -438], [0, -432]];
const SHIRT: P[] = [[-30, -438], [-54, -424], [-64, -396], [-62, -300], [-60, -228], [0, -222], [60, -228], [62, -300], [64, -396], [54, -424], [30, -438], [0, -430]];
const DRESS: P[] = [[-30, -438], [-52, -424], [-60, -396], [-62, -300], [-80, -90], [-84, -46], [0, -40], [84, -46], [80, -90], [62, -300], [60, -396], [52, -424], [30, -438], [0, -430]];

export const Stick: React.FC<{
  outfit: Outfit; expr?: Expr; armL?: Arm; armR?: Arm; legs?: Legs; seed?: number; prop?: boolean; headOnly?: boolean; look?: number; opts?: Opts; back?: boolean;
}> = ({outfit, expr = 'neutral', armL = ARM_REST_L, armR = ARM_REST_R, legs = LEGS_STAND, seed = 1, prop = true, headOnly = false, look = 0, opts = {}, back = false}) => {
  const shL: P = [-50, -416], shR: P = [50, -416];
  const torso = (pts: P[], fill: string) => <Shape pts={pts} fill={fill} w={7} seed={seed + 20} />;
  const hatLift = opts.hatLift ?? 0;
  const mustache = !back && (opts.mustache || outfit === 'smock' || outfit === 'shirt');
  return (
    <g>
      {!headOnly && (
        <g>
          {/* legs + shoes */}
          {(['l', 'r'] as const).map((k, i) => {
            const sgn = k === 'l' ? -1 : 1;
            const [knee, foot] = legs[k];
            return (
              <g key={k}>
                <Line pts={[[sgn * 18, -240], knee, foot]} w={8} seed={seed + 30 + i} taper={0.6} />
                <Shape pts={ellPts(foot[0] + sgn * 10, foot[1] + 9, 25, 11)} fill={SHOE} w={4.5} seed={seed + 33 + i} />
              </g>
            );
          })}
          {/* torso clothing */}
          {outfit === 'detective' && (
            <g>
              {torso(COAT, TAN)}
              <Shape pts={[[-64, -314], [64, -314], [64, -293], [-64, -293]]} fill={TAN_D} w={5} seed={seed + 21} />
              <Shape pts={[[-10, -316], [10, -316], [10, -291], [-10, -291]]} fill={MUSTARD} w={4} seed={seed + 22} />
              <Shape pts={[[-30, -438], [-52, -416], [-16, -396]]} fill={TAN_D} w={5} seed={seed + 23} />
              <Shape pts={[[30, -438], [52, -416], [16, -396]]} fill={TAN_D} w={5} seed={seed + 24} />
              <Line pts={[[-16, -396], [0, -354], [16, -396]]} w={4.5} seed={seed + 25} />
              <Line pts={[[0, -292], [2, -128]]} w={4} seed={seed + 26} taper={0.5} />
              {[-262, -236].map((y, i) => <circle key={i} cx={-14} cy={y} r={4.5} fill={INK} />)}
            </g>
          )}
          {outfit === 'smock' && (
            <g>
              {torso(COAT, '#F3EEE2')}
              <Shape pts={[[-30, -438], [-48, -414], [-14, -400]]} fill="#E3DCCB" w={5} seed={seed + 23} />
              <Shape pts={[[30, -438], [48, -414], [14, -400]]} fill="#E3DCCB" w={5} seed={seed + 24} />
              <Line pts={[[0, -400], [2, -128]]} w={4} seed={seed + 26} taper={0.5} />
              <Shape pts={[[18, -280], [52, -280], [52, -244], [18, -244]]} fill="#E3DCCB" w={4} seed={seed + 27} />
              {[-370, -330, -290].map((y, i) => <circle key={i} cx={-10} cy={y} r={4} fill={INK} />)}
            </g>
          )}
          {outfit === 'shirt' && (
            <g>
              {torso(SHIRT, NAVY)}
              <Line pts={[[-30, -430], [-26, -230]]} w={6} seed={seed + 21} taper={0.8} color={BRICK} />
              <Line pts={[[30, -430], [26, -230]]} w={6} seed={seed + 22} taper={0.8} color={BRICK} />
            </g>
          )}
          {outfit === 'guard' && (
            <g>
              {torso(COAT, NAVY)}
              <Shape pts={[[-64, -314], [64, -314], [64, -293], [-64, -293]]} fill={NAVY_D} w={5} seed={seed + 21} />
              {[-390, -360, -330, -270, -240].map((y, i) => (
                <g key={i}>
                  <circle cx={-16} cy={y} r={5} fill={MUSTARD} stroke={INK} strokeWidth={2} />
                  <circle cx={16} cy={y} r={5} fill={MUSTARD} stroke={INK} strokeWidth={2} />
                </g>
              ))}
            </g>
          )}
          {outfit === 'visitor' && (
            <g>
              {torso(opts.dress ? DRESS : COAT, opts.coat ?? BRICK)}
              {!opts.dress && <Line pts={[[0, -420], [2, -128]]} w={4} seed={seed + 26} taper={0.5} />}
              {opts.dress && <Shape pts={[[-28, -438], [28, -438], [0, -404]]} fill={CREAM} w={4} seed={seed + 27} />}
            </g>
          )}
          {outfit === 'explorer' && (
            <g>
              {torso(SHIRT, KHAKI)}
              {[-1, 1].map((sgn) => (
                <Shape key={sgn} pts={[[sgn * 16, -384], [sgn * 44, -384], [sgn * 44, -356], [sgn * 16, -356]]} fill={KHAKI_D} w={4} seed={seed + 40 + sgn} />
              ))}
              <Shape pts={[[-32, -438], [32, -438], [0, -390]]} fill={BRICK} w={5} seed={seed + 43} />
            </g>
          )}
          {outfit === 'professor' && (
            <g>
              {torso(SHIRT, NAVY)}
              <Shape pts={[[-28, -438], [28, -438], [0, -366]]} fill={WHITE} w={4.5} seed={seed + 50} />
              <Shape pts={[[-30, -446], [-2, -432], [-30, -416]]} fill={MUSTARD} w={4.5} seed={seed + 52} />
              <Shape pts={[[30, -446], [2, -432], [30, -416]]} fill={MUSTARD} w={4.5} seed={seed + 53} />
            </g>
          )}
          {outfit === 'hoodie' && (
            <g>
              {torso(SHIRT, NAVY)}
              <Shape pts={[[-44, -304], [44, -304], [54, -244], [-54, -244]]} fill={NAVY_D} w={5} seed={seed + 61} />
            </g>
          )}
          {/* arms (sticks) + hands */}
          {[[shL, armL], [shR, armR]].map(([sh, a], i) => {
            const arm = a as Arm;
            return (
              <g key={i}>
                <Line pts={[sh as P, arm.elbow, arm.hand]} w={7.5} seed={seed + 70 + i} taper={0.55} />
                <Hand p={arm.hand} seed={seed + 72 + i} />
              </g>
            );
          })}
        </g>
      )}
      {/* head */}
      <Shape pts={circlePts(HEAD[0], HEAD[1], HR, seed, 14, 0.006)} fill={WHITE} w={8} seed={seed + 80} />
      {(opts.flush ?? 0) > 0 && <circle cx={HEAD[0]} cy={HEAD[1] + 6} r={HR - 8} fill="#C9553F" opacity={0.6 * (opts.flush ?? 0)} />}
      {mustache && (
        <Shape pts={[[-36 + look * 14, -530], [-18 + look * 14, -541], [look * 14, -534], [18 + look * 14, -541], [36 + look * 14, -530], [18 + look * 14, -523], [look * 14, -527], [-18 + look * 14, -523]]} fill={INK} w={3} seed={seed + 85} />
      )}
      <g transform={`translate(0 ${-hatLift})`}>
        {outfit === 'professor' && <Hair seed={seed + 100} messy />}
        {outfit === 'detective' && (
          <g>
            <Shape pts={[[-112, -618], [-106, -652], [-82, -684], [-44, -702], [0, -708], [44, -702], [82, -684], [106, -652], [112, -618], [60, -628], [0, -632], [-60, -628]]} fill={BROWN} w={7} seed={seed + 110} />
            {[[[-70, -682], [-58, -640], [-56, -626]], [[-20, -704], [-18, -660], [-18, -631]], [[24, -704], [22, -660], [22, -631]], [[70, -682], [60, -640], [58, -626]]].map((s, i) => (
              <Line key={i} pts={s as P[]} w={3} seed={seed + 111 + i} taper={0.6} color={BROWN_D} />
            ))}
            <Line pts={[[-104, -650], [-50, -664], [0, -668], [50, -664], [104, -650]]} w={3} seed={seed + 116} taper={0.6} color={BROWN_D} />
            <Shape pts={[[-62, -630], [0, -637], [62, -630], [46, -611], [0, -605], [-46, -611]]} fill={BROWN_D} w={6} seed={seed + 117} />
            <Shape pts={circlePts(0, -710, 8, seed, 8)} fill={MUSTARD} w={4} seed={seed + 118} />
          </g>
        )}
        {(outfit === 'smock' || outfit === 'shirt') && (
          <g>
            <Shape pts={[[-100, -640], [-92, -676], [-50, -700], [10, -704], [70, -690], [104, -660], [108, -636], [0, -632]]} fill={TAN_D} w={6.5} seed={seed + 120} />
            <Shape pts={[[-60, -640], [40, -634], [118, -630], [70, -616], [-50, -622]]} fill={BROWN_D} w={5.5} seed={seed + 121} />
          </g>
        )}
        {outfit === 'guard' && (
          <g>
            <Shape pts={[[-78, -642], [-74, -722], [74, -722], [78, -642]]} fill={NAVY_D} w={6.5} seed={seed + 125} />
            <Shape pts={[[-78, -666], [78, -666], [78, -650], [-78, -650]]} fill={MUSTARD} w={4} seed={seed + 126} />
            <Shape pts={[[-86, -644], [86, -644], [62, -620], [-62, -620]]} fill={INK} w={4} seed={seed + 127} />
          </g>
        )}
        {outfit === 'visitor' && opts.hat === 'bowler' && (
          <g>
            <Shape pts={[[-70, -650], [-64, -690], [-36, -716], [0, -722], [36, -716], [64, -690], [70, -650]]} fill="#2E2A26" w={6} seed={seed + 130} />
            <Shape pts={[[-102, -652], [-60, -664], [0, -666], [60, -664], [102, -652], [70, -638], [0, -636], [-70, -638]]} fill="#2E2A26" w={6} seed={seed + 131} />
          </g>
        )}
        {outfit === 'visitor' && opts.hat === 'boater' && (
          <g>
            <Shape pts={[[-128, -652], [-90, -666], [0, -670], [90, -666], [128, -652], [90, -640], [0, -637], [-90, -640]]} fill={TAN} w={6} seed={seed + 132} />
            <Shape pts={[[-72, -700], [72, -700], [72, -660], [-72, -660]]} fill={TAN} w={6} seed={seed + 133} />
            <Shape pts={[[-72, -680], [72, -680], [72, -664], [-72, -664]]} fill={BRICK} w={4} seed={seed + 134} />
          </g>
        )}
        {outfit === 'visitor' && opts.hat === 'cloche' && (
          <Shape pts={[[-108, -608], [-104, -650], [-78, -690], [-36, -712], [0, -716], [36, -712], [78, -690], [104, -650], [108, -608], [70, -622], [0, -630], [-70, -622]]} fill={opts.coat === BRICK ? MUSTARD_D : BRICK} w={6.5} seed={seed + 135} />
        )}
        {outfit === 'visitor' && (opts.hat ?? 'none') === 'none' && <Hair seed={seed + 140} />}
      </g>
      {!back && <Face expr={expr} seed={seed + 90} look={look} />}
      {prop && !headOnly && outfit === 'detective' && (
        <g>
          <Line pts={[[armR.hand[0] + 4, armR.hand[1] - 6], [armR.hand[0] + 16, armR.hand[1] - 52]]} w={11} seed={seed + 150} taper={0.8} color={BROWN_D} />
          <Shape pts={circlePts(armR.hand[0] + 24, armR.hand[1] - 86, 34, seed, 12)} fill="rgba(214,226,223,0.55)" w={8} seed={seed + 151} />
          <Line pts={[[armR.hand[0] + 8, armR.hand[1] - 96], [armR.hand[0] + 18, armR.hand[1] - 108]]} w={4} seed={seed + 152} taper={0.6} color={WHITE} />
        </g>
      )}
    </g>
  );
};

export {GLASS, CREAM, KHAKI};
