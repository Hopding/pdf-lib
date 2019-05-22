/*
 * Copyright 2012 Mozilla Foundation
 *
 * The RunLengthStream class contained in this file is a TypeScript port of the
 * JavaScript RunLengthStream class in Mozilla's pdf.js project, made available
 * under the Apache 2.0 open source license.
 */

// import { DecodeStream } from 'src/core/streams/DecodeStream';
const { DecodeStream } = require('src/core/streams/DecodeStream');

/* tslint:disable */
// prettier-ignore
var RunLengthStream = (function RunLengthStreamClosure() {
  function RunLengthStream(str, maybeLength) {
    this.str = str;
    this.dict = str.dict;

    DecodeStream.call(this, maybeLength);
  }

  RunLengthStream.prototype = Object.create(DecodeStream.prototype);

  RunLengthStream.prototype.readBlock = function RunLengthStream_readBlock() {
    // The repeatHeader has following format. The first byte defines type of run
    // and amount of bytes to repeat/copy: n = 0 through 127 - copy next n bytes
    // (in addition to the second byte from the header), n = 129 through 255 -
    // duplicate the second byte from the header (257 - n) times, n = 128 - end.
    var repeatHeader = this.str.getBytes(2);
    if (!repeatHeader || repeatHeader.length < 2 || repeatHeader[0] === 128) {
      this.eof = true;
      return;
    }

    var buffer;
    var bufferLength = this.bufferLength;
    var n = repeatHeader[0];
    if (n < 128) {
      // copy n bytes
      buffer = this.ensureBuffer(bufferLength + n + 1);
      buffer[bufferLength++] = repeatHeader[1];
      if (n > 0) {
        var source = this.str.getBytes(n);
        buffer.set(source, bufferLength);
        bufferLength += n;
      }
    } else {
      n = 257 - n;
      var b = repeatHeader[1];
      buffer = this.ensureBuffer(bufferLength + n + 1);
      for (var i = 0; i < n; i++) {
        buffer[bufferLength++] = b;
      }
    }
    this.bufferLength = bufferLength;
  };

  return RunLengthStream;
})();

module.exports = { RunLengthStream };
