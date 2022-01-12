"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../errors");
var decode_1 = require("../streams/decode");
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
// TODO: See how line/col tracking affects performance
var ByteStream = /** @class */ (function () {
    function ByteStream(bytes) {
        this.idx = 0;
        this.line = 0;
        this.column = 0;
        this.bytes = bytes;
        this.length = this.bytes.length;
    }
    ByteStream.prototype.moveTo = function (offset) {
        this.idx = offset;
    };
    ByteStream.prototype.next = function () {
        var byte = this.bytes[this.idx++];
        if (byte === CharCodes_1.default.Newline) {
            this.line += 1;
            this.column = 0;
        }
        else {
            this.column += 1;
        }
        return byte;
    };
    ByteStream.prototype.assertNext = function (expected) {
        if (this.peek() !== expected) {
            throw new errors_1.NextByteAssertionError(this.position(), expected, this.peek());
        }
        return this.next();
    };
    ByteStream.prototype.peek = function () {
        return this.bytes[this.idx];
    };
    ByteStream.prototype.peekAhead = function (steps) {
        return this.bytes[this.idx + steps];
    };
    ByteStream.prototype.peekAt = function (offset) {
        return this.bytes[offset];
    };
    ByteStream.prototype.done = function () {
        return this.idx >= this.length;
    };
    ByteStream.prototype.offset = function () {
        return this.idx;
    };
    ByteStream.prototype.slice = function (start, end) {
        return this.bytes.slice(start, end);
    };
    ByteStream.prototype.position = function () {
        return { line: this.line, column: this.column, offset: this.idx };
    };
    ByteStream.of = function (bytes) { return new ByteStream(bytes); };
    ByteStream.fromPDFRawStream = function (rawStream) {
        return ByteStream.of(decode_1.decodePDFRawStream(rawStream).decode());
    };
    return ByteStream;
}());
exports.default = ByteStream;
//# sourceMappingURL=ByteStream.js.map