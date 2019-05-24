/*
 * Copyright 2012 Mozilla Foundation
 *
 * The RunLengthStream class contained in this file is a TypeScript port of the
 * JavaScript RunLengthStream class in Mozilla's pdf.js project, made available
 * under the Apache 2.0 open source license.
 */

import DecodeStream from 'src/core/streams/DecodeStream';
import { StreamType } from 'src/core/streams/Stream';

class RunLengthStream extends DecodeStream {
  private stream: StreamType;

  constructor(stream: StreamType, maybeLength?: number) {
    super(maybeLength);
    this.stream = stream;
  }

  protected readBlock() {
    // The repeatHeader has following format. The first byte defines type of run
    // and amount of bytes to repeat/copy: n = 0 through 127 - copy next n bytes
    // (in addition to the second byte from the header), n = 129 through 255 -
    // duplicate the second byte from the header (257 - n) times, n = 128 - end.
    const repeatHeader = this.stream.getBytes(2);
    if (!repeatHeader || repeatHeader.length < 2 || repeatHeader[0] === 128) {
      this.eof = true;
      return;
    }

    let buffer;
    let bufferLength = this.bufferLength;
    let n = repeatHeader[0];
    if (n < 128) {
      // copy n bytes
      buffer = this.ensureBuffer(bufferLength + n + 1);
      buffer[bufferLength++] = repeatHeader[1];
      if (n > 0) {
        const source = this.stream.getBytes(n);
        buffer.set(source, bufferLength);
        bufferLength += n;
      }
    } else {
      n = 257 - n;
      const b = repeatHeader[1];
      buffer = this.ensureBuffer(bufferLength + n + 1);
      for (let i = 0; i < n; i++) {
        buffer[bufferLength++] = b;
      }
    }
    this.bufferLength = bufferLength;
  }
}

export default RunLengthStream;
