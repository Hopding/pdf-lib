import { MethodNotImplementedError } from 'src/core/errors';
import Stream, { StreamType } from 'src/core/streams/Stream';

/*
 * Copyright 2012 Mozilla Foundation
 *
 * The DecodeStream class contained in this file is a TypeScript port of the
 * JavaScript DecodeStream class in Mozilla's pdf.js project, made available
 * under the Apache 2.0 open source license.
 */

// Lots of DecodeStreams are created whose buffers are never used.  For these
// we share a single empty buffer. This is (a) space-efficient and (b) avoids
// having special cases that would be required if we used |null| for an empty
// buffer.
const emptyBuffer = new Uint8Array(0);

/**
 * Default maximum decompressed size (100 MB). Prevents decompression bomb
 * attacks where a small compressed payload expands into gigabytes of memory.
 */
const DEFAULT_MAX_DECOMPRESSED_SIZE = 100 * 1024 * 1024; // 100 MB

/**
 * Super class for the decoding streams
 */
class DecodeStream implements StreamType {
  protected bufferLength: number;
  protected buffer: Uint8Array;
  protected eof: boolean;

  private pos: number;
  private minBufferLength: number;
  private maxDecompressedSize: number;

  constructor(
    maybeMinBufferLength?: number,
    maxDecompressedSize: number = DEFAULT_MAX_DECOMPRESSED_SIZE,
  ) {
    this.pos = 0;
    this.bufferLength = 0;
    this.eof = false;
    this.buffer = emptyBuffer;
    this.minBufferLength = 512;
    this.maxDecompressedSize = maxDecompressedSize;
    if (maybeMinBufferLength) {
      // Compute the first power of two that is as big as maybeMinBufferLength.
      while (this.minBufferLength < maybeMinBufferLength) {
        this.minBufferLength *= 2;
      }
    }
  }

  get isEmpty() {
    while (!this.eof && this.bufferLength === 0) {
      this.readBlock();
    }
    return this.bufferLength === 0;
  }

  getByte() {
    const pos = this.pos;
    while (this.bufferLength <= pos) {
      if (this.eof) {
        return -1;
      }
      this.readBlock();
    }
    return this.buffer[this.pos++];
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

  getBytes(length: number, forceClamped = false) {
    let end;
    const pos = this.pos;

    if (length) {
      this.ensureBuffer(pos + length);
      end = pos + length;

      while (!this.eof && this.bufferLength < end) {
        this.readBlock();
      }
      const bufEnd = this.bufferLength;
      if (end > bufEnd) {
        end = bufEnd;
      }
    } else {
      while (!this.eof) {
        this.readBlock();
      }
      end = this.bufferLength;
    }

    this.pos = end;
    const subarray = this.buffer.subarray(pos, end);
    // `this.buffer` is either a `Uint8Array` or `Uint8ClampedArray` here.
    return forceClamped && !(subarray instanceof Uint8ClampedArray)
      ? new Uint8ClampedArray(subarray)
      : subarray;
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
    this.pos = 0;
  }

  makeSubStream(start: number, length: number /* dict */) {
    const end = start + length;
    while (this.bufferLength <= end && !this.eof) {
      this.readBlock();
    }
    return new Stream(this.buffer, start, length /* dict */);
  }

  decode(): Uint8Array {
    while (!this.eof) this.readBlock();
    return this.buffer.subarray(0, this.bufferLength);
  }

  protected readBlock(): void {
    throw new MethodNotImplementedError(this.constructor.name, 'readBlock');
  }

  protected ensureBuffer(requested: number) {
    if (requested > this.maxDecompressedSize) {
      throw new Error(
        `Decompressed stream size exceeds the allowed limit of ` +
          `${this.maxDecompressedSize} bytes. This may indicate a ` +
          `decompression bomb attack. If this is a legitimate file, ` +
          `increase the limit via the maxDecompressedSize option.`,
      );
    }

    const buffer = this.buffer;
    if (requested <= buffer.byteLength) {
      return buffer;
    }
    let size = this.minBufferLength;
    while (size < requested) {
      size *= 2;
    }
    const buffer2 = new Uint8Array(size);
    buffer2.set(buffer);
    return (this.buffer = buffer2);
  }

  // getBaseStreams() {
  //   if (this.str && this.str.getBaseStreams) {
  //     return this.str.getBaseStreams();
  //   }
  //   return [];
  // }
}

export default DecodeStream;
