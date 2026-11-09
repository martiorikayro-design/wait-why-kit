import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Stick, Outfit, ARM_REST_L} from './Stick';
import {FAMILY} from './fonts';
import {INK, PAPER} from './style';

/** Mascot candidates: full body (with signature item) + a "Wait, why?!" reaction head. */
const OPTIONS: {o: Outfit; label: string; sub: string}[] = [
  {o: 'detective', label: 'A · Detetive', sub: 'chapéu de detetive, sobretudo, lupa'},
  {o: 'explorer', label: 'B · Explorador', sub: 'capacete de safári, lenço vermelho, bolsa'},
  {o: 'professor', label: 'C · Professor', sub: 'óculos redondos, gravata-borboleta, cabelo bagunçado'},
  {o: 'hoodie', label: 'D · Moletom e gorro', sub: 'gorro mostarda com pompom, moletom com "?"'},
];
export const MascotSheet: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {OPTIONS.map((op, i) => {
        const cx = 240 + i * 480;
        const detectiveArm = {elbow: [104, -352] as [number, number], hand: [112, -420] as [number, number]};
        return (
          <g key={op.o}>
            <g transform={`translate(${cx} 655) scale(0.76)`}>
              <Stick outfit={op.o} expr="happy" seed={i * 10 + 1} armL={ARM_REST_L} armR={op.o === 'detective' ? detectiveArm : undefined} />
            </g>
            <g transform={`translate(${cx} ${1290}) scale(0.62)`}>
              <Stick outfit={op.o} expr="surprised" seed={i * 10 + 5} headOnly />
            </g>
            {i > 0 && <line x1={i * 480} y1={40} x2={i * 480} y2={1040} stroke={INK} strokeOpacity={0.15} strokeWidth={3} strokeDasharray="10 12" />}
          </g>
        );
      })}
    </svg>
    {OPTIONS.map((op, i) => (
      <div key={op.o} style={{position: 'absolute', left: i * 480, width: 480, top: 18, textAlign: 'center', fontFamily: FAMILY, color: INK}}>
        <div style={{fontSize: 40, fontWeight: 700}}>{op.label}</div>
        <div style={{fontSize: 21, fontWeight: 500, opacity: 0.75, marginTop: 2}}>{op.sub}</div>
      </div>
    ))}
    <div style={{position: 'absolute', left: 0, width: 1920, top: 1036, textAlign: 'center', fontFamily: FAMILY, fontSize: 22, color: INK, opacity: 0.6}}>
      embaixo: reação "Wait, why?!"
    </div>
    <Img src={staticFile('stick/paper.png')} style={{position: 'absolute', inset: 0, width: 1920, height: 1080, mixBlendMode: 'multiply', opacity: 0.9}} />
  </AbsoluteFill>
);
