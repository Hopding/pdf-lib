"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var utils_1 = require("../../utils");
var PDFTrailer = /** @class */ (function () {
    function PDFTrailer(lastXRefOffset) {
        this.lastXRefOffset = String(lastXRefOffset);
    }
    PDFTrailer.prototype.toString = function () {
        return "startxref\n" + this.lastXRefOffset + "\n%%EOF";
    };
    PDFTrailer.prototype.sizeInBytes = function () {
        return 16 + this.lastXRefOffset.length;
    };
    PDFTrailer.prototype.copyBytesInto = function (buffer, offset) {
        var initialOffset = offset;
        buffer[offset++] = CharCodes_1.default.s;
        buffer[offset++] = CharCodes_1.default.t;
        buffer[offset++] = CharCodes_1.default.a;
        buffer[offset++] = CharCodes_1.default.r;
        buffer[offset++] = CharCodes_1.default.t;
        buffer[offset++] = CharCodes_1.default.x;
        buffer[offset++] = CharCodes_1.default.r;
        buffer[offset++] = CharCodes_1.default.e;
        buffer[offset++] = CharCodes_1.default.f;
        buffer[offset++] = CharCodes_1.default.Newline;
        offset += utils_1.copyStringIntoBuffer(this.lastXRefOffset, buffer, offset);
        buffer[offset++] = CharCodes_1.default.Newline;
        buffer[offset++] = CharCodes_1.default.Percent;
        buffer[offset++] = CharCodes_1.default.Percent;
        buffer[offset++] = CharCodes_1.default.E;
        buffer[offset++] = CharCodes_1.default.O;
        buffer[offset++] = CharCodes_1.default.F;
        return offset - initialOffset;
    };
    PDFTrailer.forLastCrossRefSectionOffset = function (offset) {
        return new PDFTrailer(offset);
    };
    return PDFTrailer;
}());
exports.default = PDFTrailer;
//# sourceMappingURL=PDFTrailer.js.map