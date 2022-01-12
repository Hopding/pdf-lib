"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../errors");
var Stream_1 = tslib_1.__importDefault(require("./Stream"));
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
var emptyBuffer = new Uint8Array(0);
/**
 * Super class for the decoding streams
 */
var DecodeStream = /** @class */ (function () {
    function DecodeStream(maybeMinBufferLength) {
        this.pos = 0;
        this.bufferLength = 0;
        this.eof = false;
        this.buffer = emptyBuffer;
        this.minBufferLength = 512;
        if (maybeMinBufferLength) {
            // Compute the first power of two that is as big as maybeMinBufferLength.
            while (this.minBufferLength < maybeMinBufferLength) {
                this.minBufferLength *= 2;
            }
        }
    }
    Object.defineProperty(DecodeStream.prototype, "isEmpty", {
        get: function () {
            while (!this.eof && this.bufferLength === 0) {
                this.readBlock();
            }
            return this.bufferLength === 0;
        },
        enumerable: false,
        configurable: true
    });
    DecodeStream.prototype.getByte = function () {
        var pos = this.pos;
        while (this.bufferLength <= pos) {
            if (this.eof) {
                return -1;
            }
            this.readBlock();
        }
        return this.buffer[this.pos++];
    };
    DecodeStream.prototype.getUint16 = function () {
        var b0 = this.getByte();
        var b1 = this.getByte();
        if (b0 === -1 || b1 === -1) {
            return -1;
        }
        return (b0 << 8) + b1;
    };
    DecodeStream.prototype.getInt32 = function () {
        var b0 = this.getByte();
        var b1 = this.getByte();
        var b2 = this.getByte();
        var b3 = this.getByte();
        return (b0 << 24) + (b1 << 16) + (b2 << 8) + b3;
    };
    DecodeStream.prototype.getBytes = function (length, forceClamped) {
        if (forceClamped === void 0) { forceClamped = false; }
        var end;
        var pos = this.pos;
        if (length) {
            this.ensureBuffer(pos + length);
            end = pos + length;
            while (!this.eof && this.bufferLength < end) {
                this.readBlock();
            }
            var bufEnd = this.bufferLength;
            if (end > bufEnd) {
                end = bufEnd;
            }
        }
        else {
            while (!this.eof) {
                this.readBlock();
            }
            end = this.bufferLength;
        }
        this.pos = end;
        var subarray = this.buffer.subarray(pos, end);
        // `this.buffer` is either a `Uint8Array` or `Uint8ClampedArray` here.
        return forceClamped && !(subarray instanceof Uint8ClampedArray)
            ? new Uint8ClampedArray(subarray)
            : subarray;
    };
    DecodeStream.prototype.peekByte = function () {
        var peekedByte = this.getByte();
        this.pos--;
        return peekedByte;
    };
    DecodeStream.prototype.peekBytes = function (length, forceClamped) {
        if (forceClamped === void 0) { forceClamped = false; }
        var bytes = this.getBytes(length, forceClamped);
        this.pos -= bytes.length;
        return bytes;
    };
    DecodeStream.prototype.skip = function (n) {
        if (!n) {
            n = 1;
        }
        this.pos += n;
    };
    DecodeStream.prototype.reset = function () {
        this.pos = 0;
    };
    DecodeStream.prototype.makeSubStream = function (start, length /* dict */) {
        var end = start + length;
        while (this.bufferLength <= end && !this.eof) {
            this.readBlock();
        }
        return new Stream_1.default(this.buffer, start, length /* dict */);
    };
    DecodeStream.prototype.decode = function () {
        while (!this.eof)
            this.readBlock();
        return this.buffer.subarray(0, this.bufferLength);
    };
    DecodeStream.prototype.readBlock = function () {
        throw new errors_1.MethodNotImplementedError(this.constructor.name, 'readBlock');
    };
    DecodeStream.prototype.ensureBuffer = function (requested) {
        var buffer = this.buffer;
        if (requested <= buffer.byteLength) {
            return buffer;
        }
        var size = this.minBufferLength;
        while (size < requested) {
            size *= 2;
        }
        var buffer2 = new Uint8Array(size);
        buffer2.set(buffer);
        return (this.buffer = buffer2);
    };
    return DecodeStream;
}());
exports.default = DecodeStream;
//# sourceMappingURL=DecodeStream.js.map