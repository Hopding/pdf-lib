/*
 * Copyright 2012 Mozilla Foundation
 *
 * The AsciiHexStream class contained in this file is a TypeScript port of the
 * JavaScript AsciiHexStream class in Mozilla's pdf.js project, made available
 * under the Apache 2.0 open source license.
 */

import DecodeStream from 'src/core/streams/DecodeStream';
import { StreamType } from 'src/core/streams/Stream';

class AsciiHexStream extends DecodeStream {
  private stream: StreamType;
  private firstDigit: number;

  constructor(stream: StreamType, maybeLength?: number) {
    super(maybeLength);

    this.stream = stream;

    this.firstDigit = -1;

    // Most streams increase in size when decoded, but AsciiHex streams shrink
    // by 50%.
    if (maybeLength) {
      maybeLength = 0.5 * maybeLength;
    }
  }

  protected readBlock() {
    const UPSTREAM_BLOCK_SIZE = 8000;
    const bytes = this.stream.getBytes(UPSTREAM_BLOCK_SIZE);
    if (!bytes.length) {
      this.eof = true;
      return;
    }

    const maxDecodeLength = (bytes.length + 1) >> 1;
    const buffer = this.ensureBuffer(this.bufferLength + maxDecodeLength);
    let bufferLength = this.bufferLength;

    let firstDigit = this.firstDigit;
    for (let i = 0, ii = bytes.length; i < ii; i++) {
      const ch = bytes[i];
      let digit;
      if (ch >= 0x30 && ch <= 0x39) {
        // '0'-'9'
        digit = ch & 0x0f;
      } else if ((ch >= 0x41 && ch <= 0x46) || (ch >= 0x61 && ch <= 0x66)) {
        // 'A'-'Z', 'a'-'z'
        digit = (ch & 0x0f) + 9;
      } else if (ch === 0x3e) {
        // '>'
        this.eof = true;
        break;
      } else {
        // probably whitespace
        continue; // ignoring
      }
      if (firstDigit < 0) {
        firstDigit = digit;
      } else {
        buffer[bufferLength++] = (firstDigit << 4) | digit;
        firstDigit = -1;
      }
    }
    if (firstDigit >= 0 && this.eof) {
      // incomplete byte
      buffer[bufferLength++] = firstDigit << 4;
      firstDigit = -1;
    }
    this.firstDigit = firstDigit;
    this.bufferLength = bufferLength;
  }
}

export default AsciiHexStream;
