export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const inv = (a: number, b: number, x: number) => clamp((x - a) / (b - a));
export const easeInOutCubic = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const easeOutCubic = (u: number) => 1 - Math.pow(1 - u, 3);
export const easeInCubic = (u: number) => u * u * u;
export const easeOutBack = (u: number, s = 1.7) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2);
export const easeInOutSine = (u: number) => -(Math.cos(Math.PI * u) - 1) / 2;

/** progress 0..1 between times a..b with an easing */
export const prog = (t: number, a: number, b: number, ease: (u: number) => number = easeInOutCubic) => ease(inv(a, b, t));

/** damped spring impulse: 0 before t0, then a decaying oscillation starting at amp */
export const wobble = (t: number, t0: number, amp: number, hz = 4, decay = 6) => {
  if (t < t0) return 0;
  const d = t - t0;
  return amp * Math.exp(-decay * d) * Math.cos(2 * Math.PI * hz * d);
};

/** pop-in scale with overshoot: 0 before t0, 1 after t0+dur */
export const popIn = (t: number, t0: number, dur = 0.32) => {
  if (t <= t0) return 0;
  const u = clamp((t - t0) / dur);
  return easeOutBack(u, 2.2);
};
/** pop-out: 1 before t0, 0 after t0+dur (anticipation grow then shrink) */
export const popOut = (t: number, t0: number, dur = 0.22) => {
  if (t <= t0) return 1;
  const u = clamp((t - t0) / dur);
  return u < 0.3 ? 1 + 0.12 * (u / 0.3) : 1.12 * (1 - easeInCubic((u - 0.3) / 0.7));
};

/** deterministic pseudo random */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** smooth shake from sums of sines (never random per frame) */
export const shake = (t: number, amp: number) => ({
  x: amp * (0.6 * Math.sin(2 * Math.PI * 13.3 * t) + 0.4 * Math.sin(2 * Math.PI * 7.1 * t + 1.3)),
  y: amp * (0.6 * Math.sin(2 * Math.PI * 11.7 * t + 0.4) + 0.4 * Math.sin(2 * Math.PI * 5.3 * t + 2.1)),
});

/** projectile with gravity reaching y1 at T, apex at fraction ta (seconds) */
export const arcY = (y0: number, y1: number, T: number, ta: number) => {
  const g = (2 * (y0 - y1)) / (ta * ta - (T - ta) * (T - ta));
  const ya = y0 - 0.5 * g * ta * ta;
  return (tau: number) => ya + 0.5 * g * (tau - ta) * (tau - ta);
};

/** breathing scale about the feet */
/** ~0.6 Hz, tuned to a whole number of breaths over the 20.2 s loop so the last frame matches frame 0 */
export const breathe = (t: number, phase = 0, amt = 0.009) => 1 + amt * Math.sin(2 * Math.PI * (12 / 20.2) * t + phase);
