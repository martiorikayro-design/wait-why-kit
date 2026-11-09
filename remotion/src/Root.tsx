import React from 'react';
import {Composition} from 'remotion';
import {MascotSheet} from './stick/MascotSheet';
import {BannerStick, CharacterSheet, ProfileStick, Watermark} from './stick/Brand';
import {MonaLisaShort, MONA_FRAMES} from './mona/Scene';
import {ChiliShort, CHILI_DUR} from './chili2/Scene';
import {RankShort, RANK_DUR} from './rank/Scene';
import {IntroHowPreview, PREVIEW_DUR, StingerCard, OutroPreview, OUTRO_PREVIEW_DUR} from './stinger/Preview';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MonaLisa" component={MonaLisaShort} durationInFrames={MONA_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Chili" component={ChiliShort} durationInFrames={Math.round(CHILI_DUR * 30)} fps={30} width={1080} height={1920} />
    <Composition id="Chili60" component={ChiliShort} durationInFrames={Math.round(CHILI_DUR * 60)} fps={60} width={1080} height={1920} />
    <Composition id="Rank" component={RankShort} durationInFrames={Math.round(RANK_DUR * 30)} fps={30} width={1080} height={1920} />
    <Composition id="Rank60" component={RankShort} durationInFrames={Math.round(RANK_DUR * 60)} fps={60} width={1080} height={1920} />
    <Composition id="IntroHow" component={IntroHowPreview} durationInFrames={Math.round(PREVIEW_DUR * 30)} fps={30} width={1080} height={1920} />
    <Composition id="IntroHow60" component={IntroHowPreview} durationInFrames={Math.round(PREVIEW_DUR * 60)} fps={60} width={1080} height={1920} />
    <Composition id="StingerWhy" component={StingerCard} defaultProps={{series: 'why' as const}} durationInFrames={41} fps={30} width={1080} height={1920} />
    <Composition id="StingerWho" component={StingerCard} defaultProps={{series: 'who' as const}} durationInFrames={41} fps={30} width={1080} height={1920} />
    <Composition id="StingerHow" component={StingerCard} defaultProps={{series: 'how' as const}} durationInFrames={41} fps={30} width={1080} height={1920} />
    <Composition id="OutroPreview" component={OutroPreview} durationInFrames={Math.round(OUTRO_PREVIEW_DUR * 30)} fps={30} width={1080} height={1920} />
    <Composition id="MonaLisa60" component={MonaLisaShort} durationInFrames={MONA_FRAMES * 2} fps={60} width={1080} height={1920} />
    <Composition id="MascotSheet" component={MascotSheet} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="CharacterSheet" component={CharacterSheet} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="Profile" component={ProfileStick} durationInFrames={1} fps={30} width={800} height={800} />
    <Composition id="Watermark" component={Watermark} durationInFrames={1} fps={30} width={600} height={600} />
    <Composition id="Banner" component={BannerStick} durationInFrames={1} fps={30} width={2560} height={1440} defaultProps={{guides: false}} />
  </>
);
