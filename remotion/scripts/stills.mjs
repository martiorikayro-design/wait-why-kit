// node scripts/stills.mjs <comp> t1 t2 ... -> out/stills/<comp>_<t>.png (half size)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const [comp, ...ts] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir: path.resolve('out/bundle'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id: comp});
fs.mkdirSync('out/stills', {recursive: true});
for (const t of ts.map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  await renderStill({composition, serveUrl, frame, output: `out/stills/${comp}_${t.toFixed(2)}.png`, scale: 0.5, chromiumOptions: {gl: 'swangle'}});
}
console.log('rendered', ts.length);
