"use strict";
/*
 * Copyright 2012 Mozilla Foundation
 *
 * The AsciiHexStream class contained in this file is a TypeScript port of the
 * JavaScript AsciiHexStream class in Mozilla's pdf.js project, made available
 * under the Apache 2.0 open source license.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DecodeStream_1 = tslib_1.__importDefault(require("./DecodeStream"));
var AsciiHexStream = /** @class */ (function (_super) {
    tslib_1.__extends(AsciiHexStream, _super);
    function AsciiHexStream(stream, maybeLength) {
        var _this = _super.call(this, maybeLength) || this;
        _this.stream = stream;
        _this.firstDigit = -1;
        // Most streams increase in size when decoded, but AsciiHex streams shrink
        // by 50%.
        if (maybeLength) {
            maybeLength = 0.5 * maybeLength;
        }
        return _this;
    }
    AsciiHexStream.prototype.readBlock = function () {
        var UPSTREAM_BLOCK_SIZE = 8000;
        var bytes = this.stream.getBytes(UPSTREAM_BLOCK_SIZE);
        if (!bytes.length) {
            this.eof = true;
            return;
        }
        var maxDecodeLength = (bytes.length + 1) >> 1;
        var buffer = this.ensureBuffer(this.bufferLength + maxDecodeLength);
        var bufferLength = this.bufferLength;
        var firstDigit = this.firstDigit;
        for (var i = 0, ii = bytes.length; i < ii; i++) {
            var ch = bytes[i];
            var digit = void 0;
            if (ch >= 0x30 && ch <= 0x39) {
                // '0'-'9'
                digit = ch & 0x0f;
            }
            else if ((ch >= 0x41 && ch <= 0x46) || (ch >= 0x61 && ch <= 0x66)) {
                // 'A'-'Z', 'a'-'z'
                digit = (ch & 0x0f) + 9;
            }
            else if (ch === 0x3e) {
                // '>'
                this.eof = true;
                break;
            }
            else {
                // probably whitespace
                continue; // ignoring
            }
            if (firstDigit < 0) {
                firstDigit = digit;
            }
            else {
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
    };
    return AsciiHexStream;
}(DecodeStream_1.default));
exports.default = AsciiHexStream;
//# sourceMappingURL=AsciiHexStream.js.map