"use strict";
/*
 * Copyright 2012 Mozilla Foundation
 *
 * The Ascii85Stream class contained in this file is a TypeScript port of the
 * JavaScript Ascii85Stream class in Mozilla's pdf.js project, made available
 * under the Apache 2.0 open source license.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DecodeStream_1 = tslib_1.__importDefault(require("./DecodeStream"));
var isSpace = function (ch) {
    return ch === 0x20 || ch === 0x09 || ch === 0x0d || ch === 0x0a;
};
var Ascii85Stream = /** @class */ (function (_super) {
    tslib_1.__extends(Ascii85Stream, _super);
    function Ascii85Stream(stream, maybeLength) {
        var _this = _super.call(this, maybeLength) || this;
        _this.stream = stream;
        _this.input = new Uint8Array(5);
        // Most streams increase in size when decoded, but Ascii85 streams
        // typically shrink by ~20%.
        if (maybeLength) {
            maybeLength = 0.8 * maybeLength;
        }
        return _this;
    }
    Ascii85Stream.prototype.readBlock = function () {
        var TILDA_CHAR = 0x7e; // '~'
        var Z_LOWER_CHAR = 0x7a; // 'z'
        var EOF = -1;
        var stream = this.stream;
        var c = stream.getByte();
        while (isSpace(c)) {
            c = stream.getByte();
        }
        if (c === EOF || c === TILDA_CHAR) {
            this.eof = true;
            return;
        }
        var bufferLength = this.bufferLength;
        var buffer;
        var i;
        // special code for z
        if (c === Z_LOWER_CHAR) {
            buffer = this.ensureBuffer(bufferLength + 4);
            for (i = 0; i < 4; ++i) {
                buffer[bufferLength + i] = 0;
            }
            this.bufferLength += 4;
        }
        else {
            var input = this.input;
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
            var t = 0;
            for (i = 0; i < 5; ++i) {
                t = t * 85 + (input[i] - 0x21);
            }
            for (i = 3; i >= 0; --i) {
                buffer[bufferLength + i] = t & 0xff;
                t >>= 8;
            }
        }
    };
    return Ascii85Stream;
}(DecodeStream_1.default));
exports.default = Ascii85Stream;
//# sourceMappingURL=Ascii85Stream.js.map