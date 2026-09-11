import { inflateSync, unzlibSync } from 'fflate';

import {
  nextZero,
  readASCII,
  readBytes,
  readUint,
  readUshort,
  readUTF8,
} from './binary';
import { filterZero, readInterlace } from './filter';
import type { DecodeState, Image, ImageFrame } from './types';

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function readIHDR(data: Uint8Array, offset: number, out: DecodeState): void {
  out.width = readUint(data, offset);
  offset += 4;
  out.height = readUint(data, offset);
  offset += 4;
  out.depth = data[offset++];
  out.ctype = data[offset++];
  out.compress = data[offset++];
  out.filter = data[offset++];
  out.interlace = data[offset++];
}

function inflateZlib(data: Uint8Array): Uint8Array {
  return unzlibSync(data);
}

function decompress(
  out: DecodeState,
  dd: Uint8Array,
  w: number,
  h: number,
): Uint8Array {
  const inflated = out.tabs.CgBI ? inflateSync(dd) : inflateZlib(dd);

  if (out.interlace === 0) return filterZero(inflated, out, 0, w, h);
  if (out.interlace === 1) return readInterlace(inflated, out);
  return inflated;
}

/** Decode a PNG / APNG `ArrayBuffer` into raw samples + ancillary tabs. */
export function decode(buff: ArrayBuffer): Image {
  const data = new Uint8Array(buff);
  let offset = 8;

  for (let i = 0; i < 8; i++) {
    if (data[i] !== PNG_SIG[i]) {
      throw new Error('The input is not a PNG file!');
    }
  }

  const out = {
    tabs: {},
    frames: [] as ImageFrame[],
  } as DecodeState;

  const dd = new Uint8Array(data.length);
  let doff = 0;
  let fd: Uint8Array | undefined;
  let foff = 0;

  while (offset < data.length) {
    const len = readUint(data, offset);
    offset += 4;
    const type = readASCII(data, offset, 4);
    offset += 4;

    if (type === 'IHDR') {
      readIHDR(data, offset, out);
    } else if (type === 'CgBI') {
      out.tabs.CgBI = data.slice(offset, offset + 4);
    } else if (type === 'IDAT') {
      for (let i = 0; i < len; i++) dd[doff + i] = data[offset + i];
      doff += len;
    } else if (type === 'acTL') {
      out.tabs.acTL = {
        num_frames: readUint(data, offset),
        num_plays: readUint(data, offset + 4),
      };
      fd = new Uint8Array(data.length);
    } else if (type === 'fcTL') {
      if (foff !== 0 && fd) {
        const fr = out.frames[out.frames.length - 1];
        fr.data = decompress(
          out,
          fd.slice(0, foff),
          fr.rect.width,
          fr.rect.height,
        );
        foff = 0;
      }
      const rct = {
        x: readUint(data, offset + 12),
        y: readUint(data, offset + 16),
        width: readUint(data, offset + 4),
        height: readUint(data, offset + 8),
      };
      let del = readUshort(data, offset + 22);
      del = readUshort(data, offset + 20) / (del === 0 ? 100 : del);
      out.frames.push({
        rect: rct,
        delay: Math.round(del * 1000),
        dispose: data[offset + 24],
        blend: data[offset + 25],
      });
    } else if (type === 'fdAT') {
      if (!fd) fd = new Uint8Array(data.length);
      for (let i = 0; i < len - 4; i++) fd[foff + i] = data[offset + i + 4];
      foff += len - 4;
    } else if (type === 'pHYs') {
      out.tabs.pHYs = [
        readUint(data, offset),
        readUint(data, offset + 4),
        data[offset + 8],
      ];
    } else if (type === 'cHRM') {
      out.tabs.cHRM = [];
      for (let i = 0; i < 8; i++) {
        out.tabs.cHRM.push(readUint(data, offset + i * 4));
      }
    } else if (type === 'tEXt' || type === 'zTXt') {
      const textTab = type === 'tEXt' ? 'tEXt' : 'zTXt';
      if (out.tabs[textTab] === undefined) out.tabs[textTab] = {};
      const nz = nextZero(data, offset);
      const keyw = readASCII(data, offset, nz - offset);
      const tl = offset + len - nz - 1;
      let text: string;
      if (type === 'tEXt') {
        text = readASCII(data, nz + 1, tl);
      } else {
        const bfr = inflateZlib(data.subarray(nz + 2, offset + len));
        text = readUTF8(bfr, 0, bfr.length);
      }
      out.tabs[textTab]![keyw] = text;
    } else if (type === 'iTXt') {
      if (out.tabs.iTXt === undefined) out.tabs.iTXt = {};
      let off = offset;
      let nz = nextZero(data, off);
      const keyw = readASCII(data, off, nz - off);
      off = nz + 1;
      const cflag = data[off];
      off += 2;
      nz = nextZero(data, off);
      off = nz + 1;
      nz = nextZero(data, off);
      off = nz + 1;
      const tl = len - (off - offset);
      let text: string;
      if (cflag === 0) text = readUTF8(data, off, tl);
      else {
        const bfr = inflateZlib(data.subarray(off, off + tl));
        text = readUTF8(bfr, 0, bfr.length);
      }
      out.tabs.iTXt[keyw] = text;
    } else if (type === 'PLTE') {
      out.tabs.PLTE = readBytes(data, offset, len);
    } else if (type === 'hIST') {
      const pl = out.tabs.PLTE!.length / 3;
      out.tabs.hIST = [];
      for (let i = 0; i < pl; i++) {
        out.tabs.hIST.push(readUshort(data, offset + i * 2));
      }
    } else if (type === 'tRNS') {
      if (out.ctype === 3) out.tabs.tRNS = readBytes(data, offset, len);
      else if (out.ctype === 0) out.tabs.tRNS = readUshort(data, offset);
      else if (out.ctype === 2) {
        out.tabs.tRNS = [
          readUshort(data, offset),
          readUshort(data, offset + 2),
          readUshort(data, offset + 4),
        ];
      }
    } else if (type === 'gAMA') {
      out.tabs.gAMA = readUint(data, offset) / 100000;
    } else if (type === 'sRGB') {
      out.tabs.sRGB = data[offset];
    } else if (type === 'bKGD') {
      if (out.ctype === 0 || out.ctype === 4) {
        out.tabs.bKGD = [readUshort(data, offset)];
      } else if (out.ctype === 2 || out.ctype === 6) {
        out.tabs.bKGD = [
          readUshort(data, offset),
          readUshort(data, offset + 2),
          readUshort(data, offset + 4),
        ];
      } else if (out.ctype === 3) {
        out.tabs.bKGD = data[offset];
      }
    } else if (type === 'IEND') {
      break;
    }

    offset += len;
    offset += 4; // CRC
  }

  if (foff !== 0 && fd) {
    const fr = out.frames[out.frames.length - 1];
    fr.data = decompress(out, fd.slice(0, foff), fr.rect.width, fr.rect.height);
  }

  out.data = decompress(out, dd.subarray(0, doff), out.width, out.height);

  const { compress: _c, filter: _f, interlace: _i, ...image } = out;
  return image;
}
