"use strict";
/*
 * Copyright 2012 Mozilla Foundation
 *
 * The LZWStream class contained in this file is a TypeScript port of the
 * JavaScript LZWStream class in Mozilla's pdf.js project, made available
 * under the Apache 2.0 open source license.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DecodeStream_1 = tslib_1.__importDefault(require("./DecodeStream"));
var LZWStream = /** @class */ (function (_super) {
    tslib_1.__extends(LZWStream, _super);
    function LZWStream(stream, maybeLength, earlyChange) {
        var _this = _super.call(this, maybeLength) || this;
        _this.stream = stream;
        _this.cachedData = 0;
        _this.bitsCached = 0;
        var maxLzwDictionarySize = 4096;
        var lzwState = {
            earlyChange: earlyChange,
            codeLength: 9,
            nextCode: 258,
            dictionaryValues: new Uint8Array(maxLzwDictionarySize),
            dictionaryLengths: new Uint16Array(maxLzwDictionarySize),
            dictionaryPrevCodes: new Uint16Array(maxLzwDictionarySize),
            currentSequence: new Uint8Array(maxLzwDictionarySize),
            currentSequenceLength: 0,
        };
        for (var i = 0; i < 256; ++i) {
            lzwState.dictionaryValues[i] = i;
            lzwState.dictionaryLengths[i] = 1;
        }
        _this.lzwState = lzwState;
        return _this;
    }
    LZWStream.prototype.readBlock = function () {
        var blockSize = 512;
        var estimatedDecodedSize = blockSize * 2;
        var decodedSizeDelta = blockSize;
        var i;
        var j;
        var q;
        var lzwState = this.lzwState;
        if (!lzwState) {
            return; // eof was found
        }
        var earlyChange = lzwState.earlyChange;
        var nextCode = lzwState.nextCode;
        var dictionaryValues = lzwState.dictionaryValues;
        var dictionaryLengths = lzwState.dictionaryLengths;
        var dictionaryPrevCodes = lzwState.dictionaryPrevCodes;
        var codeLength = lzwState.codeLength;
        var prevCode = lzwState.prevCode;
        var currentSequence = lzwState.currentSequence;
        var currentSequenceLength = lzwState.currentSequenceLength;
        var decodedLength = 0;
        var currentBufferLength = this.bufferLength;
        var buffer = this.ensureBuffer(this.bufferLength + estimatedDecodedSize);
        for (i = 0; i < blockSize; i++) {
            var code = this.readBits(codeLength);
            var hasPrev = currentSequenceLength > 0;
            if (!code || code < 256) {
                currentSequence[0] = code;
                currentSequenceLength = 1;
            }
            else if (code >= 258) {
                if (code < nextCode) {
                    currentSequenceLength = dictionaryLengths[code];
                    for (j = currentSequenceLength - 1, q = code; j >= 0; j--) {
                        currentSequence[j] = dictionaryValues[q];
                        q = dictionaryPrevCodes[q];
                    }
                }
                else {
                    currentSequence[currentSequenceLength++] = currentSequence[0];
                }
            }
            else if (code === 256) {
                codeLength = 9;
                nextCode = 258;
                currentSequenceLength = 0;
                continue;
            }
            else {
                this.eof = true;
                delete this.lzwState;
                break;
            }
            if (hasPrev) {
                dictionaryPrevCodes[nextCode] = prevCode;
                dictionaryLengths[nextCode] = dictionaryLengths[prevCode] + 1;
                dictionaryValues[nextCode] = currentSequence[0];
                nextCode++;
                codeLength =
                    (nextCode + earlyChange) & (nextCode + earlyChange - 1)
                        ? codeLength
                        : Math.min(Math.log(nextCode + earlyChange) / 0.6931471805599453 + 1, 12) | 0;
            }
            prevCode = code;
            decodedLength += currentSequenceLength;
            if (estimatedDecodedSize < decodedLength) {
                do {
                    estimatedDecodedSize += decodedSizeDelta;
                } while (estimatedDecodedSize < decodedLength);
                buffer = this.ensureBuffer(this.bufferLength + estimatedDecodedSize);
            }
            for (j = 0; j < currentSequenceLength; j++) {
                buffer[currentBufferLength++] = currentSequence[j];
            }
        }
        lzwState.nextCode = nextCode;
        lzwState.codeLength = codeLength;
        lzwState.prevCode = prevCode;
        lzwState.currentSequenceLength = currentSequenceLength;
        this.bufferLength = currentBufferLength;
    };
    LZWStream.prototype.readBits = function (n) {
        var bitsCached = this.bitsCached;
        var cachedData = this.cachedData;
        while (bitsCached < n) {
            var c = this.stream.getByte();
            if (c === -1) {
                this.eof = true;
                return null;
            }
            cachedData = (cachedData << 8) | c;
            bitsCached += 8;
        }
        this.bitsCached = bitsCached -= n;
        this.cachedData = cachedData;
        return (cachedData >>> bitsCached) & ((1 << n) - 1);
    };
    return LZWStream;
}(DecodeStream_1.default));
exports.default = LZWStream;
//# sourceMappingURL=LZWStream.js.map