# Wait, Why? — Shorts toolkit

Everything used to make the channel's Shorts with free tools: a Remotion 4 project (SVG stickman engine + three
finished scenes), a free voice pipeline (Kokoro-82M), caption chunker, synthesized music/SFX and the 50 % mixer.

## Layout
```
remotion/            Remotion project (npm install, then render)
  src/stick/         Stick.tsx (stickman: outfits, expressions, arms/legs), ink.tsx (hand-inked brush shapes),
                     style.ts (palette), fonts.ts (Fredoka loader), Brand.tsx / MascotSheet.tsx (channel art)
  src/mona/          "The Theft That Made the Mona Lisa Famous" (history)
  src/chili2/        "Why Birds Can Eat the Hottest Chilies" (curiosity)
  src/rank/          "Animals That Live the Longest" (ranking 6 -> 1, the detective ages each entry)
  scripts/           stills.mjs (half-size stills), grid.py (contact sheet), paper.py (paper grain overlay)
  public/            fonts/Fredoka.ttf (OFL), stick/paper*.png
audio/               synth.py (instruments + SFX), mix.py (voice chain, 50 % lock, -14 LUFS true-peak finish)
captions.py          word times -> caption chunks JSON + SRT (merges spoken numbers into digits)
voice/               tts.py (one pass), tts_gaps.py (sentence by sentence with pauses)
examples/            audio scripts + voice scripts of the three finished videos
```

## Setup (Linux/macOS)
```
cd remotion && npm install
uv venv tts --python 3.12 && . tts/bin/activate
uv pip install torch --index-url https://download.pytorch.org/whl/cpu
uv pip install kokoro soundfile scipy faster-whisper matplotlib
```

## Make a video
1. `python voice/tts_gaps.py script.txt am_fenrir 1.08 take.wav "0.35,0.28,..."` (or tts.py for one pass)
2. Pad the voice into the composition (e.g. +0.15 s) and build captions:
   `python captions.py take.json 0.15 remotion/src/<scene>/captions.json out.srt merges.json`
3. Write `remotion/src/<scene>/Scene.tsx` (copy one of the three as a template), register it in `src/Root.tsx`
   with a 30 fps (stills) and a 60 fps (final) composition.
4. Look check: `node scripts/stills.mjs <Comp> 0.3 1.2 ...` then `python3 scripts/grid.py <Comp> out/sheet.jpg 8 0.3 1.2 ...`
5. Sound: copy an `examples/*_audio.py`, edit the cue list, run it (writes `public/<scene>/mix.wav`).
   It prints the levels: music -6.0 dB vs voice, SFX <= -6 dB, peaks <= 0.7x voice, ~-14 LUFS, <= -1.5 dBTP.
6. Render 4K60 without audio, then mux the mix:
   `npx remotion render src/index.ts <Comp60> out/x-silent.mp4 --scale=2 --concurrency=2 --muted --crf=16 --gl=swangle`
   `ffmpeg -i out/x-silent.mp4 -i public/<scene>/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/x.mp4`
7. QA: `ffmpeg -i out/x.mp4 -vf freezedetect=n=0.001:d=0.4,blackdetect=d=0.1 -af ebur128=peak=true -f null -`

Licenses: Kokoro-82M Apache-2.0; Fredoka SIL OFL 1.1; all music/SFX synthesized here (no samples).

## Extras (v2)
- Font: `base64 -d remotion/public/fonts_Fredoka.ttf.b64 > remotion/public/fonts/Fredoka.ttf` (SIL OFL).
- Paper overlay: `python3 remotion/scripts/paper.py 1080 1920 remotion/public/stick/paper.png`.
- Series intro: `remotion/src/stinger/Stinger.tsx` ("WAIT, WHY?" mustard / "WAIT, WHO?" brick / "WAIT, HOW?" teal), placed right after the hook over a frozen frame; see `src/stinger/Preview.tsx` and `examples/intro_audio.py`.
- Music (owner approved): Kevin MacLeod, CC BY 4.0, from https://incompetech.com/music/royalty-free/mp3-royaltyfree/<Title>.mp3
  ("Investigations" = ranking, "Sneaky Snitch" = history, "Fluffing a Duck" = curiosity). `python audio/bed.py track.mp3 DUR bed.wav`,
  then `mix.main(..., music_ratio=0.18)` (about -15 dB under the voice). Credit line in every description:
  Music: "<Title>" Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 (creativecommons.org/licenses/by/4.0/)
- Previews at 144p (144x256) for approval; finals at 1080x1920 60 fps.
- End card (v3): `remotion/src/stinger/Outro.tsx` (3.2 s after the last line; the detective drags in a corkboard and SUBSCRIBE / LIKE / SEND TO A FRIEND pop in and bounce, with pop + boing SFX). Example: `OutroPreview` in `src/stinger/Preview.tsx`.
- Levels (v3, owner's choice): SFX 30 % of the voice (~ -10.5 dB, peaks <= 0.5x voice), music ~ -15 dB (music_ratio=0.18).
- 144p previews: render with `--scale=0.25` and scale to 144x256 with ffmpeg (Remotion refuses non-integer heights).

## Atualização 2026-11-09 (GitHub)
- Baixe com: `git clone https://github.com/martiorikayro-design/wait-why-kit.git` (público, sem senha).
- A fonte já vem pronta em `remotion/public/fonts/Fredoka.ttf` (o .b64 continua como reserva).
- As 3 músicas de Kevin MacLeod (CC BY 4.0) já vêm em `music/` — não precisa baixar do incompetech. Crédito obrigatório na descrição.
- Voz: edge-tts `en-US-AndrewMultilingualNeural`, rate +8% (`pip install edge-tts`; se der erro SSL no container, copie /root/.ccr/ca-bundle.crt por cima do certifi.where() do venv). Plano B: Kokoro `am_fenrir` 1.08.
- `refazer/refazer-3-videos.md`: tempos antigos das palavras dos 3 primeiros vídeos.
- As decisões do canal ficam no projeto YOUTUBE (claude/canal-shorts.md); elas valem mais que este README.
