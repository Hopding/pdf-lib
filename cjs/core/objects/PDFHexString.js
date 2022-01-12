"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var utils_1 = require("../../utils");
var errors_1 = require("../errors");
var PDFHexString = /** @class */ (function (_super) {
    tslib_1.__extends(PDFHexString, _super);
    function PDFHexString(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    PDFHexString.prototype.asBytes = function () {
        // Append a zero if the number of digits is odd. See PDF spec 7.3.4.3
        var hex = this.value + (this.value.length % 2 === 1 ? '0' : '');
        var hexLength = hex.length;
        var bytes = new Uint8Array(hex.length / 2);
        var hexOffset = 0;
        var bytesOffset = 0;
        // Interpret each pair of hex digits as a single byte
        while (hexOffset < hexLength) {
            var byte = parseInt(hex.substring(hexOffset, hexOffset + 2), 16);
            bytes[bytesOffset] = byte;
            hexOffset += 2;
            bytesOffset += 1;
        }
        return bytes;
    };
    PDFHexString.prototype.decodeText = function () {
        var bytes = this.asBytes();
        if (utils_1.hasUtf16BOM(bytes))
            return utils_1.utf16Decode(bytes);
        return utils_1.pdfDocEncodingDecode(bytes);
    };
    PDFHexString.prototype.decodeDate = function () {
        var text = this.decodeText();
        var date = utils_1.parseDate(text);
        if (!date)
            throw new errors_1.InvalidPDFDateStringError(text);
        return date;
    };
    PDFHexString.prototype.asString = function () {
        return this.value;
    };
    PDFHexString.prototype.clone = function () {
        return PDFHexString.of(this.value);
    };
    PDFHexString.prototype.toString = function () {
        return "<" + this.value + ">";
    };
    PDFHexString.prototype.sizeInBytes = function () {
        return this.value.length + 2;
    };
    PDFHexString.prototype.copyBytesInto = function (buffer, offset) {
        buffer[offset++] = CharCodes_1.default.LessThan;
        offset += utils_1.copyStringIntoBuffer(this.value, buffer, offset);
        buffer[offset++] = CharCodes_1.default.GreaterThan;
        return this.value.length + 2;
    };
    PDFHexString.of = function (value) { return new PDFHexString(value); };
    PDFHexString.fromText = function (value) {
        var encoded = utils_1.utf16Encode(value);
        var hex = '';
        for (var idx = 0, len = encoded.length; idx < len; idx++) {
            hex += utils_1.toHexStringOfMinLength(encoded[idx], 4);
        }
        return new PDFHexString(hex);
    };
    return PDFHexString;
}(PDFObject_1.default));
exports.default = PDFHexString;
//# sourceMappingURL=PDFHexString.js.map