import { zlibSync } from 'fflate';

import PDFArray from '../../core/objects/PDFArray';
import PDFDict from '../../core/objects/PDFDict';
import PDFName from '../../core/objects/PDFName';
import PDFNumber from '../../core/objects/PDFNumber';
import PDFRawStream from '../../core/objects/PDFRawStream';
import PDFStream from '../../core/objects/PDFStream';
import { decodePDFRawStream } from '../../core/streams/decode';
import PDFContentStream from '../../core/structures/PDFContentStream';

export type ExtractedImageBytes = {
  width: number;
  height: number;
  mimeType: 'image/jpeg' | 'image/png';
  bytes: Uint8Array;
};

/**
 * Convert an Image XObject stream into usable image file bytes.
 * - DCTDecode → JPEG bytes as stored
 * - DeviceRGB / DeviceGray 8-bit (typically Flate) → PNG
 * Returns undefined for unsupported color spaces / filters.
 */
export const extractImageBytes = (
  stream: PDFStream,
): ExtractedImageBytes | undefined => {
  const dict = stream.dict;
  const width = dict.lookup(PDFName.of('Width'), PDFNumber).asNumber();
  const height = dict.lookup(PDFName.of('Height'), PDFNumber).asNumber();
  const bits =
    dict.lookupMaybe(PDFName.of('BitsPerComponent'), PDFNumber)?.asNumber() ??
    8;

  if (hasFilter(dict, 'DCTDecode')) {
    const bytes = getRawContents(stream);
    return { width, height, mimeType: 'image/jpeg', bytes };
  }

  if (hasFilter(dict, 'JPXDecode')) {
    return undefined;
  }

  const colorSpace = dict.lookup(PDFName.of('ColorSpace'));
  let csName: string | undefined;
  if (colorSpace instanceof PDFName) {
    csName = colorSpace.decodeText();
  } else if (colorSpace instanceof PDFArray) {
    csName = colorSpace.lookupMaybe(0, PDFName)?.decodeText();
  }

  if (bits !== 8) return undefined;
  if (
    csName !== 'DeviceRGB' &&
    csName !== 'DeviceGray' &&
    csName !== 'CalRGB'
  ) {
    return undefined;
  }

  let pixels: Uint8Array;
  try {
    pixels = getDecodedContents(stream);
  } catch {
    return undefined;
  }

  const channels = csName === 'DeviceGray' ? 1 : 3;
  const expected = width * height * channels;
  if (pixels.length < expected) return undefined;
  if (pixels.length > expected) pixels = pixels.subarray(0, expected);

  let smaskPixels: Uint8Array | undefined;
  const smask = dict.lookup(PDFName.of('SMask'));
  if (smask instanceof PDFStream) {
    try {
      smaskPixels = getDecodedContents(smask);
      if (smaskPixels.length >= width * height) {
        smaskPixels = smaskPixels.subarray(0, width * height);
      } else {
        smaskPixels = undefined;
      }
    } catch {
      smaskPixels = undefined;
    }
  }

  const pngBytes = encodePng(pixels, width, height, channels, smaskPixels);
  return { width, height, mimeType: 'image/png', bytes: pngBytes };
};

const hasFilter = (dict: PDFDict, name: string): boolean => {
  const filter = dict.lookup(PDFName.of('Filter'));
  const target = PDFName.of(name);
  if (filter === target) return true;
  if (filter instanceof PDFArray) {
    for (let i = 0, len = filter.size(); i < len; i++) {
      if (filter.lookup(i) === target) return true;
    }
  }
  return false;
};

const getRawContents = (stream: PDFStream): Uint8Array => {
  if (stream instanceof PDFRawStream) {
    return new Uint8Array(stream.contents);
  }
  if (stream instanceof PDFContentStream) {
    return new Uint8Array(stream.getContents());
  }
  return new Uint8Array(stream.getContents());
};

const getDecodedContents = (stream: PDFStream): Uint8Array => {
  if (stream instanceof PDFRawStream) {
    return decodePDFRawStream(stream).decode();
  }
  if (stream instanceof PDFContentStream) {
    return stream.getUnencodedContents();
  }
  return stream.getContents();
};

/** Minimal PNG encoder (8-bit Gray / RGB / RGBA, filter none). */
const encodePng = (
  pixels: Uint8Array,
  width: number,
  height: number,
  channels: number,
  alpha?: Uint8Array,
): Uint8Array => {
  const colorType = alpha ? 6 : channels === 1 ? 0 : 2; // Gray / RGB / RGBA
  const outChannels = alpha ? 4 : channels;
  const stride = width * outChannels;
  const raw = new Uint8Array((stride + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter: None
    if (alpha) {
      for (let x = 0; x < width; x++) {
        const dst = rowStart + 1 + x * 4;
        if (channels === 1) {
          const g = pixels[y * width + x];
          raw[dst] = g;
          raw[dst + 1] = g;
          raw[dst + 2] = g;
        } else {
          const src = (y * width + x) * 3;
          raw[dst] = pixels[src];
          raw[dst + 1] = pixels[src + 1];
          raw[dst + 2] = pixels[src + 2];
        }
        raw[dst + 3] = alpha[y * width + x];
      }
    } else {
      raw.set(pixels.subarray(y * stride, y * stride + stride), rowStart + 1);
    }
  }

  const compressed = zlibSync(raw);

  const signature = Uint8Array.of(
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a,
  );
  const ihdr = new Uint8Array(13);
  writeUint32(ihdr, 0, width);
  writeUint32(ihdr, 4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = colorType;
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const parts = [
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', new Uint8Array(0)),
  ];

  let total = 0;
  for (let i = 0; i < parts.length; i++) total += parts[i].length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (let i = 0; i < parts.length; i++) {
    out.set(parts[i], offset);
    offset += parts[i].length;
  }
  return out;
};

const pngChunk = (type: string, data: Uint8Array): Uint8Array => {
  const chunk = new Uint8Array(12 + data.length);
  writeUint32(chunk, 0, data.length);
  chunk[4] = type.charCodeAt(0);
  chunk[5] = type.charCodeAt(1);
  chunk[6] = type.charCodeAt(2);
  chunk[7] = type.charCodeAt(3);
  chunk.set(data, 8);
  const crc = crc32(chunk.subarray(4, 8 + data.length));
  writeUint32(chunk, 8 + data.length, crc);
  return chunk;
};

const writeUint32 = (bytes: Uint8Array, offset: number, value: number) => {
  bytes[offset] = (value >>> 24) & 0xff;
  bytes[offset + 1] = (value >>> 16) & 0xff;
  bytes[offset + 2] = (value >>> 8) & 0xff;
  bytes[offset + 3] = value & 0xff;
};

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

const crc32 = (data: Uint8Array): number => {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c = crcTable[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
};
