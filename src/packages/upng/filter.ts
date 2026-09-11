import type { DecodeState } from './types';

/** Paeth predictor (PNG filter type 4). */
export function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = p - a;
  const pb = p - b;
  const pc = p - c;
  if (pa * pa <= pb * pb && pa * pa <= pc * pc) return a;
  if (pb * pb <= pc * pc) return b;
  return c;
}

/** Bits per pixel for a PNG color type + bit depth. */
export function getBPP(out: { ctype: number; depth: number }): number {
  const channels = [1, 0, 3, 1, 2, 0, 4][out.ctype];
  return channels * out.depth;
}

/**
 * Unfilter scanlines in place (PNG filter method 0).
 *
 * Ported from UPNG.js including the first-row type remapping quirks:
 * type 2/3 → None, type 4 → Sub, plus the special Average first-row pass
 * that indexes from absolute offset 0 (only correct when `off === 0`).
 */
export function filterZero(
  data: Uint8Array,
  out: { ctype: number; depth: number },
  off: number,
  w: number,
  h: number,
): Uint8Array {
  let bpp = getBPP(out);
  const bpl = Math.ceil((w * bpp) / 8);
  bpp = Math.ceil(bpp / 8);

  let type = data[off];
  let x = 0;

  if (type > 1) data[off] = [0, 0, 1][type - 2];
  if (type === 3) {
    for (x = bpp; x < bpl; x++) {
      data[x + 1] = (data[x + 1] + (data[x + 1 - bpp] >>> 1)) & 255;
    }
  }

  for (let y = 0; y < h; y++) {
    const i = off + y * bpl;
    const di = i + y + 1;
    type = data[di - 1];
    x = 0;

    if (type === 0) {
      for (; x < bpl; x++) data[i + x] = data[di + x];
    } else if (type === 1) {
      for (; x < bpp; x++) data[i + x] = data[di + x];
      for (; x < bpl; x++) data[i + x] = data[di + x] + data[i + x - bpp];
    } else if (type === 2) {
      for (; x < bpl; x++) data[i + x] = data[di + x] + data[i + x - bpl];
    } else if (type === 3) {
      for (; x < bpp; x++) {
        data[i + x] = data[di + x] + (data[i + x - bpl] >>> 1);
      }
      for (; x < bpl; x++) {
        data[i + x] =
          data[di + x] + ((data[i + x - bpl] + data[i + x - bpp]) >>> 1);
      }
    } else {
      for (; x < bpp; x++) {
        data[i + x] = data[di + x] + paeth(0, data[i + x - bpl], 0);
      }
      for (; x < bpl; x++) {
        data[i + x] =
          data[di + x] +
          paeth(data[i + x - bpp], data[i + x - bpl], data[i + x - bpp - bpl]);
      }
    }
  }
  return data;
}

/** Adam7 deinterlace → tightly packed unfiltered image bytes. */
export function readInterlace(data: Uint8Array, out: DecodeState): Uint8Array {
  const w = out.width;
  const h = out.height;
  const bpp = getBPP(out);
  const cbpp = bpp >> 3;
  const bpl = Math.ceil((w * bpp) / 8);
  const img = new Uint8Array(h * bpl);
  let di = 0;

  const starting_row = [0, 0, 4, 0, 2, 0, 1];
  const starting_col = [0, 4, 0, 2, 0, 1, 0];
  const row_increment = [8, 8, 8, 4, 4, 2, 2];
  const col_increment = [8, 8, 4, 4, 2, 2, 1];

  for (let pass = 0; pass < 7; pass++) {
    const ri = row_increment[pass];
    const ci = col_increment[pass];
    let sw = 0;
    let sh = 0;
    let cr = starting_row[pass];
    while (cr < h) {
      cr += ri;
      sh++;
    }
    let cc = starting_col[pass];
    while (cc < w) {
      cc += ci;
      sw++;
    }
    const bpll = Math.ceil((sw * bpp) / 8);
    filterZero(data, out, di, sw, sh);

    let y = 0;
    let row = starting_row[pass];
    while (row < h) {
      let col = starting_col[pass];
      let cdi = (di + y * bpll) << 3;

      while (col < w) {
        if (bpp === 1) {
          let val = data[cdi >> 3];
          val = (val >> (7 - (cdi & 7))) & 1;
          img[row * bpl + (col >> 3)] |= val << (7 - (col & 7));
        }
        if (bpp === 2) {
          let val = data[cdi >> 3];
          val = (val >> (6 - (cdi & 7))) & 3;
          img[row * bpl + (col >> 2)] |= val << (6 - ((col & 3) << 1));
        }
        if (bpp === 4) {
          let val = data[cdi >> 3];
          val = (val >> (4 - (cdi & 7))) & 15;
          img[row * bpl + (col >> 1)] |= val << (4 - ((col & 1) << 2));
        }
        if (bpp >= 8) {
          const ii = row * bpl + col * cbpp;
          for (let j = 0; j < cbpp; j++) img[ii + j] = data[(cdi >> 3) + j];
        }
        cdi += bpp;
        col += ci;
      }
      y++;
      row += ri;
    }
    if (sw * sh !== 0) di += sh * (1 + bpll);
  }
  return img;
}

/** Apply PNG filter type to one scanline into `data` (encode path). */
export function filterLine(
  data: Uint8Array,
  img: Uint8Array,
  y: number,
  bpl: number,
  bpp: number,
  type: number,
): void {
  const i = y * bpl;
  let di = i + y;
  data[di] = type;
  di++;

  if (type === 0) {
    if (bpl < 500) {
      for (let x = 0; x < bpl; x++) data[di + x] = img[i + x];
    } else {
      data.set(img.subarray(i, i + bpl), di);
    }
  } else if (type === 1) {
    for (let x = 0; x < bpp; x++) data[di + x] = img[i + x];
    for (let x = bpp; x < bpl; x++) {
      data[di + x] = (img[i + x] - img[i + x - bpp] + 256) & 255;
    }
  } else if (y === 0) {
    for (let x = 0; x < bpp; x++) data[di + x] = img[i + x];
    if (type === 2) {
      for (let x = bpp; x < bpl; x++) data[di + x] = img[i + x];
    }
    if (type === 3) {
      for (let x = bpp; x < bpl; x++) {
        data[di + x] = (img[i + x] - (img[i + x - bpp] >> 1) + 256) & 255;
      }
    }
    if (type === 4) {
      for (let x = bpp; x < bpl; x++) {
        data[di + x] = (img[i + x] - paeth(img[i + x - bpp], 0, 0) + 256) & 255;
      }
    }
  } else {
    if (type === 2) {
      for (let x = 0; x < bpl; x++) {
        data[di + x] = (img[i + x] + 256 - img[i + x - bpl]) & 255;
      }
    }
    if (type === 3) {
      for (let x = 0; x < bpp; x++) {
        data[di + x] = (img[i + x] + 256 - (img[i + x - bpl] >> 1)) & 255;
      }
      for (let x = bpp; x < bpl; x++) {
        data[di + x] =
          (img[i + x] + 256 - ((img[i + x - bpl] + img[i + x - bpp]) >> 1)) &
          255;
      }
    }
    if (type === 4) {
      for (let x = 0; x < bpp; x++) {
        data[di + x] = (img[i + x] + 256 - paeth(0, img[i + x - bpl], 0)) & 255;
      }
      for (let x = bpp; x < bpl; x++) {
        data[di + x] =
          (img[i + x] +
            256 -
            paeth(img[i + x - bpp], img[i + x - bpl], img[i + x - bpp - bpl])) &
          255;
      }
    }
  }
}
