// node scripts/frames.mjs <Comp> <everyNth> <scale> -> out/frames/<Comp>/frame-XXXX.jpg
import {bundle} from '@remotion/bundler';
import {renderFrames, selectComposition} from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const [comp, nth = '10', scale = '0.5'] = process.argv.slice(2);
const BROWSER = process.env.BROWSER_EXE || undefined;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir: path.resolve('out/bundle')});
const composition = await selectComposition({serveUrl, id: comp, browserExecutable: BROWSER, chromiumOptions: {gl: 'swangle'}});
const outputDir = path.resolve(`out/frames/${comp}`);
fs.rmSync(outputDir, {recursive: true, force: true});
await renderFrames({composition, serveUrl, outputDir, imageFormat: 'jpeg', jpegQuality: 80, everyNthFrame: Number(nth), scale: Number(scale),
  browserExecutable: BROWSER, chromiumOptions: {gl: 'swangle'}, concurrency: 3, onStart: () => {}, onFrameUpdate: () => {}});
console.log('done', fs.readdirSync(outputDir).length);
