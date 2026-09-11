function clamp255(x: number): number {
  return Math.max(0, Math.min(255, x));
}

function sqDist(a: number[], b: number[]): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  const da = a[3] - b[3];
  return dr * dr + dg * dg + db * db + da * da;
}

function addErr(er: number[], tg: Int16Array, ti: number, f: number): void {
  tg[ti] += (er[0] * f) >> 4;
  tg[ti + 1] += (er[1] * f) >> 4;
  tg[ti + 2] += (er[2] * f) >> 4;
  tg[ti + 3] += (er[3] * f) >> 4;
}

const BAYER_S = 4;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => 255 * (-0.5 + (v + 0.5) / (BAYER_S * BAYER_S)),
);

/**
 * Re-map `sb` onto `plte`, spreading the quantization error.
 * `MTD`: 0 = none, 1 = Floyd-Steinberg (default), 2 = Bayer.
 * Writes colors into `tb` and indices into `oind`.
 */
export function dither(
  sb: Uint8Array,
  w: number,
  h: number,
  plte: number[],
  tb: Uint8Array,
  oind: Uint8Array,
  MTD = 1,
): void {
  const pc = plte.length;
  const nplt: number[][] = [];
  for (let i = 0; i < pc; i++) {
    const c = plte[i];
    nplt.push([c & 255, (c >>> 8) & 255, (c >>> 16) & 255, (c >>> 24) & 255]);
  }

  const tb32 = new Uint32Array(tb.buffer, tb.byteOffset, tb.length >> 2);
  const err = new Int16Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;

      let cc: number[];
      if (MTD !== 2) {
        cc = [
          clamp255(sb[i] + err[i]),
          clamp255(sb[i + 1] + err[i + 1]),
          clamp255(sb[i + 2] + err[i + 2]),
          clamp255(sb[i + 3] + err[i + 3]),
        ];
      } else {
        const ce = BAYER[(y & (BAYER_S - 1)) * BAYER_S + (x & (BAYER_S - 1))];
        cc = [
          clamp255(sb[i] + ce),
          clamp255(sb[i + 1] + ce),
          clamp255(sb[i + 2] + ce),
          clamp255(sb[i + 3] + ce),
        ];
      }

      let ni = 0;
      let nd = 0xffffff;
      for (let j = 0; j < pc; j++) {
        const cd = sqDist(cc, nplt[j]);
        if (cd < nd) {
          nd = cd;
          ni = j;
        }
      }

      const nc = nplt[ni];
      if (MTD === 1) {
        const er = [cc[0] - nc[0], cc[1] - nc[1], cc[2] - nc[2], cc[3] - nc[3]];
        if (x !== w - 1) addErr(er, err, i + 4, 7);
        if (y !== h - 1) {
          if (x !== 0) addErr(er, err, i + 4 * w - 4, 3);
          addErr(er, err, i + 4 * w, 5);
          if (x !== w - 1) addErr(er, err, i + 4 * w + 4, 1);
        }
      }

      oind[i >> 2] = ni;
      tb32[i >> 2] = plte[ni];
    }
  }
}
