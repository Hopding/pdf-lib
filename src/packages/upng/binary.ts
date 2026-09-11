/** PNG binary read/write helpers and CRC32. */

export function nextZero(data: Uint8Array, p: number): number {
  while (data[p] !== 0) p++;
  return p;
}

export function readUshort(buff: Uint8Array, p: number): number {
  return (buff[p] << 8) | buff[p + 1];
}

export function writeUshort(buff: Uint8Array, p: number, n: number): void {
  buff[p] = (n >> 8) & 255;
  buff[p + 1] = n & 255;
}

export function readUint(buff: Uint8Array, p: number): number {
  return (
    buff[p] * (256 * 256 * 256) +
    ((buff[p + 1] << 16) | (buff[p + 2] << 8) | buff[p + 3])
  );
}

export function writeUint(buff: Uint8Array, p: number, n: number): void {
  buff[p] = (n >> 24) & 255;
  buff[p + 1] = (n >> 16) & 255;
  buff[p + 2] = (n >> 8) & 255;
  buff[p + 3] = n & 255;
}

export function readASCII(buff: Uint8Array, p: number, l: number): string {
  let s = '';
  for (let i = 0; i < l; i++) s += String.fromCharCode(buff[p + i]);
  return s;
}

export function writeASCII(data: Uint8Array, p: number, s: string): void {
  for (let i = 0; i < s.length; i++) data[p + i] = s.charCodeAt(i);
}

export function readBytes(buff: Uint8Array, p: number, l: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < l; i++) arr.push(buff[p + i]);
  return arr;
}

function padHex(n: string): string {
  return n.length < 2 ? '0' + n : n;
}

export function readUTF8(buff: Uint8Array, p: number, l: number): string {
  let s = '';
  for (let i = 0; i < l; i++) {
    s += '%' + padHex(buff[p + i].toString(16));
  }
  try {
    return decodeURIComponent(s);
  } catch {
    return readASCII(buff, p, l);
  }
}

const CRC_TABLE = (() => {
  const tab = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    tab[n] = c;
  }
  return tab;
})();

function crcUpdate(
  c: number,
  buf: Uint8Array,
  off: number,
  len: number,
): number {
  for (let i = 0; i < len; i++) {
    c = CRC_TABLE[(c ^ buf[off + i]) & 0xff] ^ (c >>> 8);
  }
  return c;
}

/** PNG-style CRC32 over `buf[off .. off+len)`. */
export function crc(buf: Uint8Array, off: number, len: number): number {
  return crcUpdate(0xffffffff, buf, off, len) ^ 0xffffffff;
}
