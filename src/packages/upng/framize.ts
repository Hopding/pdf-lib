import { copyTile } from './rgba';
import type { ImageFrameRect } from './types';

/**
 * An APNG frame reduced to its changed region.
 *
 * `dispose`: 0 = no change, 1 = clear to transparent, 2 = restore previous.
 * `blend`: 0 = replace, 1 = blend over.
 */
export interface FramizeFrame {
  rect: ImageFrameRect;
  img: Uint8Array;
  blend: number;
  dispose: number;
}

function prepareDiff(
  cimg: Uint8Array,
  w: number,
  h: number,
  nimg: Uint8Array,
  rec: ImageFrameRect,
): void {
  copyTile(cimg, w, h, nimg, rec.width, rec.height, -rec.x, -rec.y, 2);
}

function updateFrame(
  bufs: ArrayBuffer[],
  w: number,
  h: number,
  frms: FramizeFrame[],
  i: number,
  r: ImageFrameRect,
  evenCrd: boolean,
): void {
  const pimg = new Uint8Array(bufs[i - 1]);
  const pimg32 = new Uint32Array(bufs[i - 1]);
  const nimg = i + 1 < bufs.length ? new Uint8Array(bufs[i + 1]) : null;
  const cimg = new Uint8Array(bufs[i]);
  const cimg32 = new Uint32Array(cimg.buffer);

  let mix = w;
  let miy = h;
  let max = -1;
  let may = -1;
  for (let y = 0; y < r.height; y++) {
    for (let x = 0; x < r.width; x++) {
      const cx = r.x + x;
      const cy = r.y + y;
      const j = cy * w + cx;
      const cc = cimg32[j];
      // Transparency needs neither drawing nor disposing; nor does an
      // unchanged color when the next frame does not need transparency there.
      const skip =
        cc === 0 ||
        (frms[i - 1].dispose === 0 &&
          pimg32[j] === cc &&
          (nimg === null || nimg[j * 4 + 3] !== 0));
      if (skip) continue;
      if (cx < mix) mix = cx;
      if (cx > max) max = cx;
      if (cy < miy) miy = cy;
      if (cy > may) may = cy;
    }
  }
  if (max === -1) mix = miy = max = may = 0;
  if (evenCrd) {
    if ((mix & 1) === 1) mix--;
    if ((miy & 1) === 1) miy--;
  }
  const nr = { x: mix, y: miy, width: max - mix + 1, height: may - miy + 1 };

  const fr = frms[i];
  fr.rect = nr;
  fr.blend = 1;
  fr.img = new Uint8Array(nr.width * nr.height * 4);
  if (frms[i - 1].dispose === 0) {
    copyTile(pimg, w, h, fr.img, nr.width, nr.height, -nr.x, -nr.y, 0);
    prepareDiff(cimg, w, h, fr.img, nr);
  } else {
    copyTile(cimg, w, h, fr.img, nr.width, nr.height, -nr.x, -nr.y, 0);
  }
}

/**
 * Split a sequence of full RGBA8 frames into minimal APNG frames, picking
 * the smallest changed rectangle and a blend / dispose strategy per frame.
 */
export function framize(
  bufs: ArrayBuffer[],
  w: number,
  h: number,
  alwaysBlend: boolean,
  evenCrd: boolean,
  forbidPrev: boolean,
): FramizeFrame[] {
  const frms: FramizeFrame[] = [];

  for (let j = 0; j < bufs.length; j++) {
    const cimg = new Uint8Array(bufs[j]);
    const cimg32 = new Uint32Array(cimg.buffer);
    let nimg: Uint8Array;

    let nx = 0;
    let ny = 0;
    let nw = w;
    let nh = h;
    let blend = alwaysBlend ? 1 : 0;

    if (j !== 0) {
      const tlim =
        forbidPrev || alwaysBlend || j === 1 || frms[j - 2].dispose !== 0
          ? 1
          : 2;
      let tstp = 0;
      let tarea = 1e9;

      for (let it = 0; it < tlim; it++) {
        const p32 = new Uint32Array(bufs[j - 1 - it]);
        let mix = w;
        let miy = h;
        let max = -1;
        let may = -1;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = y * w + x;
            if (cimg32[i] !== p32[i]) {
              if (x < mix) mix = x;
              if (x > max) max = x;
              if (y < miy) miy = y;
              if (y > may) may = y;
            }
          }
        }
        if (max === -1) mix = miy = max = may = 0;
        if (evenCrd) {
          if ((mix & 1) === 1) mix--;
          if ((miy & 1) === 1) miy--;
        }
        const sarea = (max - mix + 1) * (may - miy + 1);
        if (sarea < tarea) {
          tarea = sarea;
          tstp = it;
          nx = mix;
          ny = miy;
          nw = max - mix + 1;
          nh = may - miy + 1;
        }
      }

      const pimg = new Uint8Array(bufs[j - 1 - tstp]);
      if (tstp === 1) frms[j - 1].dispose = 2;

      nimg = new Uint8Array(nw * nh * 4);
      copyTile(pimg, w, h, nimg, nw, nh, -nx, -ny, 0);

      blend = copyTile(cimg, w, h, nimg, nw, nh, -nx, -ny, 3) ? 1 : 0;
      if (blend === 1) {
        prepareDiff(cimg, w, h, nimg, { x: nx, y: ny, width: nw, height: nh });
      } else {
        copyTile(cimg, w, h, nimg, nw, nh, -nx, -ny, 0);
      }
    } else {
      // The image may be rewritten further — don't touch the input.
      nimg = cimg.slice(0);
    }

    frms.push({
      rect: { x: nx, y: ny, width: nw, height: nh },
      img: nimg,
      blend,
      dispose: 0,
    });
  }

  if (alwaysBlend) {
    for (let j = 0; j < frms.length; j++) {
      const frm = frms[j];
      if (frm.blend === 1) continue;
      const r0 = frm.rect;
      const r1 = frms[j - 1].rect;
      const miX = Math.min(r0.x, r1.x);
      const miY = Math.min(r0.y, r1.y);
      const maX = Math.max(r0.x + r0.width, r1.x + r1.width);
      const maY = Math.max(r0.y + r0.height, r1.y + r1.height);
      const r = { x: miX, y: miY, width: maX - miX, height: maY - miY };

      frms[j - 1].dispose = 1;
      if (j - 1 !== 0) updateFrame(bufs, w, h, frms, j - 1, r, evenCrd);
      updateFrame(bufs, w, h, frms, j, r, evenCrd);
    }
  }

  return frms;
}

/** Concatenate RGBA8 buffers, zeroing the color of fully transparent pixels. */
export function concatRGBA(bufs: ArrayBuffer[]): ArrayBuffer {
  let tlen = 0;
  for (let i = 0; i < bufs.length; i++) tlen += bufs[i].byteLength;

  const nimg = new Uint8Array(tlen);
  let noff = 0;
  for (let i = 0; i < bufs.length; i++) {
    const img = new Uint8Array(bufs[i]);
    const il = img.length;
    for (let j = 0; j < il; j += 4) {
      let r = img[j];
      let g = img[j + 1];
      let b = img[j + 2];
      const a = img[j + 3];
      if (a === 0) r = g = b = 0;
      nimg[noff + j] = r;
      nimg[noff + j + 1] = g;
      nimg[noff + j + 2] = b;
      nimg[noff + j + 3] = a;
    }
    noff += il;
  }
  return nimg.buffer;
}
