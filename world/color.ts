/**
 * Colour maths in OKLab.
 *
 * Every colour in the world is mixed at runtime — atmospheric perspective,
 * chapter crossfades, light temperature. Mixing in sRGB turns those blends
 * muddy and grey in the middle; OKLab keeps them perceptually even, which is
 * the difference between a horizon that recedes and a horizon that looks dirty.
 */

export type Rgb = { r: number; g: number; b: number };
export type Lab = { L: number; a: number; b: number };

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function parseHex(hex: string): Rgb {
  const h = hex.trim().replace("#", "");
  const full =
    h.length === 3
      ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
      : h.length === 8
        ? h.slice(0, 6)
        : h;
  const n = parseInt(full, 16);
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

const toHexPair = (v: number) =>
  Math.round(clamp01(v) * 255)
    .toString(16)
    .padStart(2, "0");

export const toHex = ({ r, g, b }: Rgb) =>
  `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`;

const srgbToLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

const linearToSrgb = (c: number) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

export function rgbToLab({ r, g, b }: Rgb): Lab {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

export function labToRgb({ L, a, b }: Lab): Rgb {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: clamp01(linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)),
    g: clamp01(linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)),
    b: clamp01(linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)),
  };
}

/** Small cache — the same handful of hex strings get converted every frame. */
const labCache = new Map<string, Lab>();

export function hexToLab(hex: string): Lab {
  let lab = labCache.get(hex);
  if (!lab) {
    lab = rgbToLab(parseHex(hex));
    labCache.set(hex, lab);
  }
  return lab;
}

/** Perceptually even blend of two hex colours. `t` 0 → a, 1 → b. */
export function mix(a: string, b: string, t: number): string {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const A = hexToLab(a);
  const B = hexToLab(b);
  return toHex(
    labToRgb({
      L: A.L + (B.L - A.L) * t,
      a: A.a + (B.a - A.a) * t,
      b: A.b + (B.b - A.b) * t,
    }),
  );
}

/** Lighten / darken by shifting lightness only — hue and chroma survive. */
export function shade(hex: string, amount: number): string {
  const lab = hexToLab(hex);
  return toHex(labToRgb({ ...lab, L: clamp01(lab.L + amount) }));
}

/** Pull a colour toward or away from neutral. */
export function saturate(hex: string, factor: number): string {
  const lab = hexToLab(hex);
  return toHex(labToRgb({ L: lab.L, a: lab.a * factor, b: lab.b * factor }));
}

export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${alpha})`;
}
