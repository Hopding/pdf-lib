"use strict";
/*
 * Copyright 2012 Mozilla Foundation
 *
 * The Stream class contained in this file is a TypeScript port of the
 * JavaScript Stream class in Mozilla's pdf.js project, made available
 * under the Apache 2.0 open source license.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Stream = /** @class */ (function () {
    function Stream(buffer, start, length) {
        this.bytes = buffer;
        this.start = start || 0;
        this.pos = this.start;
        this.end = !!start && !!length ? start + length : this.bytes.length;
    }
    Object.defineProperty(Stream.prototype, "length", {
        get: function () {
            return this.end - this.start;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Stream.prototype, "isEmpty", {
        get: function () {
            return this.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    Stream.prototype.getByte = function () {
        if (this.pos >= this.end) {
            return -1;
        }
        return this.bytes[this.pos++];
    };
    Stream.prototype.getUint16 = function () {
        var b0 = this.getByte();
        var b1 = this.getByte();
        if (b0 === -1 || b1 === -1) {
            return -1;
        }
        return (b0 << 8) + b1;
    };
    Stream.prototype.getInt32 = function () {
        var b0 = this.getByte();
        var b1 = this.getByte();
        var b2 = this.getByte();
        var b3 = this.getByte();
        return (b0 << 24) + (b1 << 16) + (b2 << 8) + b3;
    };
    // Returns subarray of original buffer, should only be read.
    Stream.prototype.getBytes = function (length, forceClamped) {
        if (forceClamped === void 0) { forceClamped = false; }
        var bytes = this.bytes;
        var pos = this.pos;
        var strEnd = this.end;
        if (!length) {
            var subarray = bytes.subarray(pos, strEnd);
            // `this.bytes` is always a `Uint8Array` here.
            return forceClamped ? new Uint8ClampedArray(subarray) : subarray;
        }
        else {
            var end = pos + length;
            if (end > strEnd) {
                end = strEnd;
            }
            this.pos = end;
            var subarray = bytes.subarray(pos, end);
            // `this.bytes` is always a `Uint8Array` here.
            return forceClamped ? new Uint8ClampedArray(subarray) : subarray;
        }
    };
    Stream.prototype.peekByte = function () {
        var peekedByte = this.getByte();
        this.pos--;
        return peekedByte;
    };
    Stream.prototype.peekBytes = function (length, forceClamped) {
        if (forceClamped === void 0) { forceClamped = false; }
        var bytes = this.getBytes(length, forceClamped);
        this.pos -= bytes.length;
        return bytes;
    };
    Stream.prototype.skip = function (n) {
        if (!n) {
            n = 1;
        }
        this.pos += n;
    };
    Stream.prototype.reset = function () {
        this.pos = this.start;
    };
    Stream.prototype.moveStart = function () {
        this.start = this.pos;
    };
    Stream.prototype.makeSubStream = function (start, length) {
        return new Stream(this.bytes, start, length);
    };
    Stream.prototype.decode = function () {
        return this.bytes;
    };
    return Stream;
}());
exports.default = Stream;
//# sourceMappingURL=Stream.js.map