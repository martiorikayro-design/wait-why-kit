import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

/** Fredoka (SIL Open Font License, free for commercial use), loaded once per page before any frame renders. */
export const FAMILY = 'FredokaCaps';
if (typeof window !== 'undefined' && !(window as unknown as {__capsFont?: boolean}).__capsFont) {
  (window as unknown as {__capsFont?: boolean}).__capsFont = true;
  const handle = delayRender('Loading Fredoka');
  const face = new FontFace(FAMILY, `url('${staticFile('fonts/Fredoka.ttf')}') format('truetype')`, {weight: '300 700'});
  face.load().then((f) => {
    (document.fonts as unknown as {add: (x: FontFace) => void}).add(f);
    continueRender(handle);
  }).catch((e) => cancelRender(e));
}
