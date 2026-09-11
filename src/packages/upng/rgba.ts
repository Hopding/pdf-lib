import { readUshort } from './binary';
import { getBPP } from './filter';
import type { Image } from './types';

/**
 * Copy / blend a tile of RGBA pixels.
 * mode 0: overwrite, 1: over blend, 2: keep diffs else zero, 3: blendability check.
 */
export function copyTile(
  sb: Uint8Array,
  sw: number,
  sh: number,
  tb: Uint8Array,
  tw: number,
  th: number,
  xoff: number,
  yoff: number,
  mode: number,
): boolean {
  const w = Math.min(sw, tw);
  const h = Math.min(sh, th);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let si: number;
      let ti: number;
      if (xoff >= 0 && yoff >= 0) {
        si = (y * sw + x) << 2;
        ti = ((yoff + y) * tw + xoff + x) << 2;
      } else {
        si = ((-yoff + y) * sw - xoff + x) << 2;
        ti = (y * tw + x) << 2;
      }

      if (mode === 0) {
        tb[ti] = sb[si];
        tb[ti + 1] = sb[si + 1];
        tb[ti + 2] = sb[si + 2];
        tb[ti + 3] = sb[si + 3];
      } else if (mode === 1) {
        const fa = sb[si + 3] * (1 / 255);
        const fr = sb[si] * fa;
        const fg = sb[si + 1] * fa;
        const fb = sb[si + 2] * fa;
        const ba = tb[ti + 3] * (1 / 255);
        const br = tb[ti] * ba;
        const bg = tb[ti + 1] * ba;
        const bb = tb[ti + 2] * ba;

        const ifa = 1 - fa;
        const oa = fa + ba * ifa;
        const ioa = oa === 0 ? 0 : 1 / oa;
        tb[ti + 3] = 255 * oa;
        tb[ti] = (fr + br * ifa) * ioa;
        tb[ti + 1] = (fg + bg * ifa) * ioa;
        tb[ti + 2] = (fb + bb * ifa) * ioa;
      } else if (mode === 2) {
        const fa = sb[si + 3];
        const fr = sb[si];
        const fg = sb[si + 1];
        const fb = sb[si + 2];
        const ba = tb[ti + 3];
        const br = tb[ti];
        const bg = tb[ti + 1];
        const bb = tb[ti + 2];
        if (fa === ba && fr === br && fg === bg && fb === bb) {
          tb[ti] = 0;
          tb[ti + 1] = 0;
          tb[ti + 2] = 0;
          tb[ti + 3] = 0;
        } else {
          tb[ti] = fr;
          tb[ti + 1] = fg;
          tb[ti + 2] = fb;
          tb[ti + 3] = fa;
        }
      } else if (mode === 3) {
        const fa = sb[si + 3];
        const fr = sb[si];
        const fg = sb[si + 1];
        const fb = sb[si + 2];
        const ba = tb[ti + 3];
        const br = tb[ti];
        const bg = tb[ti + 1];
        const bb = tb[ti + 2];
        if (fa === ba && fr === br && fg === bg && fb === bb) continue;
        if (fa < 220 && ba > 20) return false;
      }
    }
  }
  return true;
}

/** Expand raw decoded samples to RGBA8 (one frame / region). */
export function decodeImage(
  data: Uint8Array,
  w: number,
  h: number,
  out: Image,
): Uint8Array {
  const area = w * h;
  const bpp = getBPP(out);
  const bpl = Math.ceil((w * bpp) / 8);

  const bf = new Uint8Array(area * 4);
  const bf32 = new Uint32Array(bf.buffer);
  const ctype = out.ctype;
  const depth = out.depth;

  if (ctype === 6) {
    const qarea = area << 2;
    if (depth === 8) {
      for (let i = 0; i < qarea; i += 4) {
        bf[i] = data[i];
        bf[i + 1] = data[i + 1];
        bf[i + 2] = data[i + 2];
        bf[i + 3] = data[i + 3];
      }
    }
    if (depth === 16) {
      for (let i = 0; i < qarea; i++) bf[i] = data[i << 1];
    }
  } else if (ctype === 2) {
    const ts = out.tabs.tRNS as number[] | undefined;
    if (ts === undefined) {
      if (depth === 8) {
        for (let i = 0; i < area; i++) {
          const ti = i * 3;
          bf32[i] =
            (255 << 24) | (data[ti + 2] << 16) | (data[ti + 1] << 8) | data[ti];
        }
      }
      if (depth === 16) {
        for (let i = 0; i < area; i++) {
          const ti = i * 6;
          bf32[i] =
            (255 << 24) | (data[ti + 4] << 16) | (data[ti + 2] << 8) | data[ti];
        }
      }
    } else {
      const tr = ts[0];
      const tg = ts[1];
      const tb = ts[2];
      if (depth === 8) {
        for (let i = 0; i < area; i++) {
          const qi = i << 2;
          const ti = i * 3;
          bf32[i] =
            (255 << 24) | (data[ti + 2] << 16) | (data[ti + 1] << 8) | data[ti];
          if (data[ti] === tr && data[ti + 1] === tg && data[ti + 2] === tb) {
            bf[qi + 3] = 0;
          }
        }
      }
      if (depth === 16) {
        for (let i = 0; i < area; i++) {
          const qi = i << 2;
          const ti = i * 6;
          bf32[i] =
            (255 << 24) | (data[ti + 4] << 16) | (data[ti + 2] << 8) | data[ti];
          if (
            readUshort(data, ti) === tr &&
            readUshort(data, ti + 2) === tg &&
            readUshort(data, ti + 4) === tb
          ) {
            bf[qi + 3] = 0;
          }
        }
      }
    }
  } else if (ctype === 3) {
    const p = out.tabs.PLTE!;
    const ap = out.tabs.tRNS as number[] | undefined;
    const tl = ap ? ap.length : 0;
    if (depth === 1) {
      for (let y = 0; y < h; y++) {
        const s0 = y * bpl;
        const t0 = y * w;
        for (let i = 0; i < w; i++) {
          const qi = (t0 + i) << 2;
          const j = (data[s0 + (i >> 3)] >> (7 - (i & 7))) & 1;
          const cj = 3 * j;
          bf[qi] = p[cj];
          bf[qi + 1] = p[cj + 1];
          bf[qi + 2] = p[cj + 2];
          bf[qi + 3] = j < tl ? ap![j] : 255;
        }
      }
    }
    if (depth === 2) {
      for (let y = 0; y < h; y++) {
        const s0 = y * bpl;
        const t0 = y * w;
        for (let i = 0; i < w; i++) {
          const qi = (t0 + i) << 2;
          const j = (data[s0 + (i >> 2)] >> (6 - ((i & 3) << 1))) & 3;
          const cj = 3 * j;
          bf[qi] = p[cj];
          bf[qi + 1] = p[cj + 1];
          bf[qi + 2] = p[cj + 2];
          bf[qi + 3] = j < tl ? ap![j] : 255;
        }
      }
    }
    if (depth === 4) {
      for (let y = 0; y < h; y++) {
        const s0 = y * bpl;
        const t0 = y * w;
        for (let i = 0; i < w; i++) {
          const qi = (t0 + i) << 2;
          const j = (data[s0 + (i >> 1)] >> (4 - ((i & 1) << 2))) & 15;
          const cj = 3 * j;
          bf[qi] = p[cj];
          bf[qi + 1] = p[cj + 1];
          bf[qi + 2] = p[cj + 2];
          bf[qi + 3] = j < tl ? ap![j] : 255;
        }
      }
    }
    if (depth === 8) {
      for (let i = 0; i < area; i++) {
        const qi = i << 2;
        const j = data[i];
        const cj = 3 * j;
        bf[qi] = p[cj];
        bf[qi + 1] = p[cj + 1];
        bf[qi + 2] = p[cj + 2];
        bf[qi + 3] = j < tl ? ap![j] : 255;
      }
    }
  } else if (ctype === 4) {
    if (depth === 8) {
      for (let i = 0; i < area; i++) {
        const qi = i << 2;
        const di = i << 1;
        const gr = data[di];
        bf[qi] = gr;
        bf[qi + 1] = gr;
        bf[qi + 2] = gr;
        bf[qi + 3] = data[di + 1];
      }
    }
    if (depth === 16) {
      for (let i = 0; i < area; i++) {
        const qi = i << 2;
        const di = i << 2;
        const gr = data[di];
        bf[qi] = gr;
        bf[qi + 1] = gr;
        bf[qi + 2] = gr;
        bf[qi + 3] = data[di + 2];
      }
    }
  } else if (ctype === 0) {
    const tr = out.tabs.tRNS !== undefined ? (out.tabs.tRNS as number) : -1;
    for (let y = 0; y < h; y++) {
      const off = y * bpl;
      const to = y * w;
      if (depth === 1) {
        for (let x = 0; x < w; x++) {
          const gr = 255 * ((data[off + (x >>> 3)] >>> (7 - (x & 7))) & 1);
          const al = gr === tr * 255 ? 0 : 255;
          bf32[to + x] = (al << 24) | (gr << 16) | (gr << 8) | gr;
        }
      } else if (depth === 2) {
        for (let x = 0; x < w; x++) {
          const gr =
            85 * ((data[off + (x >>> 2)] >>> (6 - ((x & 3) << 1))) & 3);
          const al = gr === tr * 85 ? 0 : 255;
          bf32[to + x] = (al << 24) | (gr << 16) | (gr << 8) | gr;
        }
      } else if (depth === 4) {
        for (let x = 0; x < w; x++) {
          const gr =
            17 * ((data[off + (x >>> 1)] >>> (4 - ((x & 1) << 2))) & 15);
          const al = gr === tr * 17 ? 0 : 255;
          bf32[to + x] = (al << 24) | (gr << 16) | (gr << 8) | gr;
        }
      } else if (depth === 8) {
        for (let x = 0; x < w; x++) {
          const gr = data[off + x];
          const al = gr === tr ? 0 : 255;
          bf32[to + x] = (al << 24) | (gr << 16) | (gr << 8) | gr;
        }
      } else if (depth === 16) {
        for (let x = 0; x < w; x++) {
          const gr = data[off + (x << 1)];
          const al = readUshort(data, off + (x << 1)) === tr ? 0 : 255;
          bf32[to + x] = (al << 24) | (gr << 16) | (gr << 8) | gr;
        }
      }
    }
  }

  return bf;
}

/**
 * Convert a decoded image to one RGBA8 `ArrayBuffer` per frame.
 * Static PNGs return a single-element array.
 */
export function toRGBA8(out: Image): ArrayBuffer[] {
  const w = out.width;
  const h = out.height;
  if (out.tabs.acTL === undefined) {
    return [decodeImage(out.data, w, h, out).buffer as ArrayBuffer];
  }

  const frms: ArrayBuffer[] = [];
  if (out.frames[0].data === undefined) out.frames[0].data = out.data;

  const len = w * h * 4;
  const img = new Uint8Array(len);
  const empty = new Uint8Array(len);
  const prev = new Uint8Array(len);

  for (let i = 0; i < out.frames.length; i++) {
    const frm = out.frames[i];
    const fx = frm.rect.x;
    const fy = frm.rect.y;
    const fw = frm.rect.width;
    const fh = frm.rect.height;
    const fdata = decodeImage(frm.data!, fw, fh, out);

    if (i !== 0) for (let j = 0; j < len; j++) prev[j] = img[j];

    if (frm.blend === 0) copyTile(fdata, fw, fh, img, w, h, fx, fy, 0);
    else if (frm.blend === 1) copyTile(fdata, fw, fh, img, w, h, fx, fy, 1);

    frms.push(img.buffer.slice(0));

    if (frm.dispose === 1) {
      copyTile(empty, fw, fh, img, w, h, fx, fy, 0);
    } else if (frm.dispose === 2) {
      for (let j = 0; j < len; j++) img[j] = prev[j];
    }
  }
  return frms;
}
