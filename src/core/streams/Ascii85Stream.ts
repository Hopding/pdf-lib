/*
 * Copyright 2012 Mozilla Foundation
 *
 * The Ascii85Stream class contained in this file is a TypeScript port of the
 * JavaScript Ascii85Stream class in Mozilla's pdf.js project, made available
 * under the Apache 2.0 open source license.
 */

import DecodeStream from 'src/core/streams/DecodeStream';
import { StreamType } from 'src/core/streams/Stream';

const isSpace = (ch: number) =>
  ch === 0x20 || ch === 0x09 || ch === 0x0d || ch === 0x0a;

class Ascii85Stream extends DecodeStream {
  private stream: StreamType;
  private input: Uint8Array;

  constructor(stream: StreamType, maybeLength?: number) {
    super(maybeLength);

    this.stream = stream;
    this.input = new Uint8Array(5);

    // Most streams increase in size when decoded, but Ascii85 streams
    // typically shrink by ~20%.
    if (maybeLength) {
      maybeLength = 0.8 * maybeLength;
    }
  }

  protected readBlock() {
    const TILDA_CHAR = 0x7e; // '~'
    const Z_LOWER_CHAR = 0x7a; // 'z'
    const EOF = -1;

    const stream = this.stream;

    let c = stream.getByte();
    while (isSpace(c)) {
      c = stream.getByte();
    }

    if (c === EOF || c === TILDA_CHAR) {
      this.eof = true;
      return;
    }

    const bufferLength = this.bufferLength;
    let buffer;
    let i;

    // special code for z
    if (c === Z_LOWER_CHAR) {
      buffer = this.ensureBuffer(bufferLength + 4);
      for (i = 0; i < 4; ++i) {
        buffer[bufferLength + i] = 0;
      }
      this.bufferLength += 4;
    } else {
      const input = this.input;
      input[0] = c;
      for (i = 1; i < 5; ++i) {
        c = stream.getByte();
        while (isSpace(c)) {
          c = stream.getByte();
        }

        input[i] = c;

        if (c === EOF || c === TILDA_CHAR) {
          break;
        }
      }
      buffer = this.ensureBuffer(bufferLength + i - 1);
      this.bufferLength += i - 1;

      // partial ending;
      if (i < 5) {
        for (; i < 5; ++i) {
          input[i] = 0x21 + 84;
        }
        this.eof = true;
      }
      let t = 0;
      for (i = 0; i < 5; ++i) {
        t = t * 85 + (input[i] - 0x21);
      }

      for (i = 3; i >= 0; --i) {
        buffer[bufferLength + i] = t & 0xff;
        t >>= 8;
      }
    }
  }
}

export default Ascii85Stream;
