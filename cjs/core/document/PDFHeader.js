"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var utils_1 = require("../../utils");
var PDFHeader = /** @class */ (function () {
    function PDFHeader(major, minor) {
        this.major = String(major);
        this.minor = String(minor);
    }
    PDFHeader.prototype.toString = function () {
        var bc = utils_1.charFromCode(129);
        return "%PDF-" + this.major + "." + this.minor + "\n%" + bc + bc + bc + bc;
    };
    PDFHeader.prototype.sizeInBytes = function () {
        return 12 + this.major.length + this.minor.length;
    };
    PDFHeader.prototype.copyBytesInto = function (buffer, offset) {
        var initialOffset = offset;
        buffer[offset++] = CharCodes_1.default.Percent;
        buffer[offset++] = CharCodes_1.default.P;
        buffer[offset++] = CharCodes_1.default.D;
        buffer[offset++] = CharCodes_1.default.F;
        buffer[offset++] = CharCodes_1.default.Dash;
        offset += utils_1.copyStringIntoBuffer(this.major, buffer, offset);
        buffer[offset++] = CharCodes_1.default.Period;
        offset += utils_1.copyStringIntoBuffer(this.minor, buffer, offset);
        buffer[offset++] = CharCodes_1.default.Newline;
        buffer[offset++] = CharCodes_1.default.Percent;
        buffer[offset++] = 129;
        buffer[offset++] = 129;
        buffer[offset++] = 129;
        buffer[offset++] = 129;
        return offset - initialOffset;
    };
    PDFHeader.forVersion = function (major, minor) {
        return new PDFHeader(major, minor);
    };
    return PDFHeader;
}());
exports.default = PDFHeader;
//# sourceMappingURL=PDFHeader.js.map