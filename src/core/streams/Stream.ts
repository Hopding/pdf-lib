/*
 * Copyright 2012 Mozilla Foundation
 *
 * The Stream class contained in this file is a TypeScript port of the
 * JavaScript Stream class in Mozilla's pdf.js project, made available
 * under the Apache 2.0 open source license.
 */

export interface StreamType {
  isEmpty: boolean;
  getByte(): number;
  getUint16(): number;
  getInt32(): number;
  getBytes(
    length: number,
    forceClamped?: boolean,
  ): Uint8Array | Uint8ClampedArray;
  peekByte(): number;
  peekBytes(
    length: number,
    forceClamped?: boolean,
  ): Uint8Array | Uint8ClampedArray;
  skip(n: number): void;
  reset(): void;
  makeSubStream(start: number, length: number): StreamType;
  decode(): Uint8Array;
}

class Stream implements StreamType {
  private bytes: Uint8Array;
  private start: number;
  private pos: number;
  private end: number;

  constructor(buffer: Uint8Array, start?: number, length?: number) {
    this.bytes = buffer;
    this.start = start || 0;
    this.pos = this.start;
    this.end = !!start && !!length ? start + length : this.bytes.length;
  }

  get length() {
    return this.end - this.start;
  }

  get isEmpty() {
    return this.length === 0;
  }

  getByte() {
    if (this.pos >= this.end) {
      return -1;
    }
    return this.bytes[this.pos++];
  }

  getUint16() {
    const b0 = this.getByte();
    const b1 = this.getByte();
    if (b0 === -1 || b1 === -1) {
      return -1;
    }
    return (b0 << 8) + b1;
  }

  getInt32() {
    const b0 = this.getByte();
    const b1 = this.getByte();
    const b2 = this.getByte();
    const b3 = this.getByte();
    return (b0 << 24) + (b1 << 16) + (b2 << 8) + b3;
  }

  // Returns subarray of original buffer, should only be read.
  getBytes(length: number, forceClamped = false) {
    const bytes = this.bytes;
    const pos = this.pos;
    const strEnd = this.end;

    if (!length) {
      const subarray = bytes.subarray(pos, strEnd);
      // `this.bytes` is always a `Uint8Array` here.
      return forceClamped ? new Uint8ClampedArray(subarray) : subarray;
    } else {
      let end = pos + length;
      if (end > strEnd) {
        end = strEnd;
      }
      this.pos = end;
      const subarray = bytes.subarray(pos, end);
      // `this.bytes` is always a `Uint8Array` here.
      return forceClamped ? new Uint8ClampedArray(subarray) : subarray;
    }
  }

  peekByte() {
    const peekedByte = this.getByte();
    this.pos--;
    return peekedByte;
  }

  peekBytes(length: number, forceClamped = false) {
    const bytes = this.getBytes(length, forceClamped);
    this.pos -= bytes.length;
    return bytes;
  }

  skip(n: number) {
    if (!n) {
      n = 1;
    }
    this.pos += n;
  }

  reset() {
    this.pos = this.start;
  }

  moveStart() {
    this.start = this.pos;
  }

  makeSubStream(start: number, length: number) {
    return new Stream(this.bytes, start, length);
  }

  decode(): Uint8Array {
    return this.bytes;
  }
}

export default Stream;
