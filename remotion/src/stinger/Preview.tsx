import React from 'react';
import {AbsoluteFill, Freeze, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {MonaLisaShort} from '../mona/Scene';
import {ChiliShort} from '../chili2/Scene';
import {RankShort} from '../rank/Scene';
import {Stinger, STING_DUR, Series} from './Stinger';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const inv = (a: number, b: number, x: number) => clamp((x - a) / (b - a));
const ss = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);

/** Mona Lisa intro test: hook -> "WAIT, HOW?" stinger over the frozen hook -> the story resumes. */
export const HOOK_END = 2.833;
export const RESUME_AT = 2.93;   // the story picks up here (silence before "In August")
export const PREVIEW_DUR = HOOK_END + STING_DUR + 3.2;

export const IntroHowPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hookF = Math.round(HOOK_END * fps);
  const stingF = Math.round(STING_DUR * fps);
  const u = (frame - hookF) / fps;
  const punch = 1 + 0.06 * ss(inv(0, 0.14, u));
  return (
    <AbsoluteFill style={{background: '#EFE6D2'}}>
      <Sequence from={0} durationInFrames={hookF}><MonaLisaShort muted /></Sequence>
      <Sequence from={hookF} durationInFrames={stingF}>
        <AbsoluteFill style={{transform: `scale(${punch})`}}>
          <Freeze frame={hookF - 1}><MonaLisaShort muted hideCaptions hideHost /></Freeze>
        </AbsoluteFill>
        <Stinger u={u} series="how" />
      </Sequence>
      <Sequence from={hookF + stingF}>
        <Sequence from={-Math.round(RESUME_AT * fps)}><MonaLisaShort muted /></Sequence>
      </Sequence>
    </AbsoluteFill>
  );
};

/** Still mock-ups: each series card over the hook of the video it would open. */
export const StingerCard: React.FC<{series: Series}> = ({series}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const u = frame / fps;
  const bg = series === 'how' ? <Freeze frame={84}><MonaLisaShort muted hideCaptions hideHost /></Freeze>
    : series === 'why' ? <Freeze frame={82}><ChiliShort muted hideCaptions hideHost /></Freeze>
      : <Freeze frame={48}><RankShort muted hideCaptions hideHost /></Freeze>;
  return <AbsoluteFill style={{background: '#EFE6D2'}}><AbsoluteFill style={{transform: 'scale(1.06)'}}>{bg}</AbsoluteFill><Stinger u={u} series={series} /></AbsoluteFill>;
};

/** Ending test: the last 3 s of the Mona Lisa, then the end card over the frozen final frame. */
import {Outro, OUTRO_DUR} from './Outro';
export const OUTRO_PREVIEW_DUR = 3.0 + OUTRO_DUR;
export const OutroPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const startF = Math.round(21.0 * fps), endF = Math.round(24.0 * fps) - 1;
  const tailF = Math.round(3.0 * fps);
  const u = (frame - tailF) / fps;
  return (
    <AbsoluteFill style={{background: '#EFE6D2'}}>
      <Sequence from={0} durationInFrames={tailF}><Sequence from={-startF}><MonaLisaShort muted /></Sequence></Sequence>
      <Sequence from={tailF}>
        <Freeze frame={endF}><MonaLisaShort muted hideCaptions hideHost /></Freeze>
        <Outro u={u} />
      </Sequence>
    </AbsoluteFill>
  );
};
