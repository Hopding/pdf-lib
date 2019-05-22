/*
 * Copyright 2012 Mozilla Foundation
 *
 * The Stream class contained in this file is a TypeScript port of the
 * JavaScript Stream class in Mozilla's pdf.js project, made available
 * under the Apache 2.0 open source license.
 */

/* tslint:disable */
// prettier-ignore

var Stream = (function StreamClosure() {
  function Stream(arrayBuffer, start, length, dict) {
    this.bytes = (arrayBuffer instanceof Uint8Array ?
                  arrayBuffer : new Uint8Array(arrayBuffer));
    this.start = start || 0;
    this.pos = this.start;
    this.end = (start + length) || this.bytes.length;
    this.dict = dict;
  }

  // required methods for a stream. if a particular stream does not
  // implement these, an error should be thrown
  Stream.prototype = {
    get length() {
      return this.end - this.start;
    },
    get isEmpty() {
      return this.length === 0;
    },
    getByte: function Stream_getByte() {
      if (this.pos >= this.end) {
        return -1;
      }
      return this.bytes[this.pos++];
    },
    getUint16: function Stream_getUint16() {
      var b0 = this.getByte();
      var b1 = this.getByte();
      if (b0 === -1 || b1 === -1) {
        return -1;
      }
      return (b0 << 8) + b1;
    },
    getInt32: function Stream_getInt32() {
      var b0 = this.getByte();
      var b1 = this.getByte();
      var b2 = this.getByte();
      var b3 = this.getByte();
      return (b0 << 24) + (b1 << 16) + (b2 << 8) + b3;
    },
    // Returns subarray of original buffer, should only be read.
    getBytes(length, forceClamped = false) {
      var bytes = this.bytes;
      var pos = this.pos;
      var strEnd = this.end;

      if (!length) {
        let subarray = bytes.subarray(pos, strEnd);
        // `this.bytes` is always a `Uint8Array` here.
        return (forceClamped ? new Uint8ClampedArray(subarray) : subarray);
      }
      var end = pos + length;
      if (end > strEnd) {
        end = strEnd;
      }
      this.pos = end;
      let subarray = bytes.subarray(pos, end);
      // `this.bytes` is always a `Uint8Array` here.
      return (forceClamped ? new Uint8ClampedArray(subarray) : subarray);
    },
    peekByte: function Stream_peekByte() {
      var peekedByte = this.getByte();
      this.pos--;
      return peekedByte;
    },
    peekBytes(length, forceClamped = false) {
      var bytes = this.getBytes(length, forceClamped);
      this.pos -= bytes.length;
      return bytes;
    },
    skip: function Stream_skip(n) {
      if (!n) {
        n = 1;
      }
      this.pos += n;
    },
    reset: function Stream_reset() {
      this.pos = this.start;
    },
    moveStart: function Stream_moveStart() {
      this.start = this.pos;
    },
    makeSubStream: function Stream_makeSubStream(start, length, dict) {
      return new Stream(this.bytes.buffer, start, length, dict);
    },
  };

  return Stream;
})();

module.exports = { Stream };
