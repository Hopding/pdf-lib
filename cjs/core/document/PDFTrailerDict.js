"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var PDFTrailerDict = /** @class */ (function () {
    function PDFTrailerDict(dict) {
        this.dict = dict;
    }
    PDFTrailerDict.prototype.toString = function () {
        return "trailer\n" + this.dict.toString();
    };
    PDFTrailerDict.prototype.sizeInBytes = function () {
        return 8 + this.dict.sizeInBytes();
    };
    PDFTrailerDict.prototype.copyBytesInto = function (buffer, offset) {
        var initialOffset = offset;
        buffer[offset++] = CharCodes_1.default.t;
        buffer[offset++] = CharCodes_1.default.r;
        buffer[offset++] = CharCodes_1.default.a;
        buffer[offset++] = CharCodes_1.default.i;
        buffer[offset++] = CharCodes_1.default.l;
        buffer[offset++] = CharCodes_1.default.e;
        buffer[offset++] = CharCodes_1.default.r;
        buffer[offset++] = CharCodes_1.default.Newline;
        offset += this.dict.copyBytesInto(buffer, offset);
        return offset - initialOffset;
    };
    PDFTrailerDict.of = function (dict) { return new PDFTrailerDict(dict); };
    return PDFTrailerDict;
}());
exports.default = PDFTrailerDict;
//# sourceMappingURL=PDFTrailerDict.js.map