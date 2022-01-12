"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var utils_1 = require("../../utils");
var errors_1 = require("../errors");
var PDFString = /** @class */ (function (_super) {
    tslib_1.__extends(PDFString, _super);
    function PDFString(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    PDFString.prototype.asBytes = function () {
        var bytes = [];
        var octal = '';
        var escaped = false;
        var pushByte = function (byte) {
            if (byte !== undefined)
                bytes.push(byte);
            escaped = false;
        };
        for (var idx = 0, len = this.value.length; idx < len; idx++) {
            var char = this.value[idx];
            var byte = utils_1.toCharCode(char);
            var nextChar = this.value[idx + 1];
            if (!escaped) {
                if (byte === CharCodes_1.default.BackSlash)
                    escaped = true;
                else
                    pushByte(byte);
            }
            else {
                if (byte === CharCodes_1.default.Newline)
                    pushByte();
                else if (byte === CharCodes_1.default.CarriageReturn)
                    pushByte();
                else if (byte === CharCodes_1.default.n)
                    pushByte(CharCodes_1.default.Newline);
                else if (byte === CharCodes_1.default.r)
                    pushByte(CharCodes_1.default.CarriageReturn);
                else if (byte === CharCodes_1.default.t)
                    pushByte(CharCodes_1.default.Tab);
                else if (byte === CharCodes_1.default.b)
                    pushByte(CharCodes_1.default.Backspace);
                else if (byte === CharCodes_1.default.f)
                    pushByte(CharCodes_1.default.FormFeed);
                else if (byte === CharCodes_1.default.LeftParen)
                    pushByte(CharCodes_1.default.LeftParen);
                else if (byte === CharCodes_1.default.RightParen)
                    pushByte(CharCodes_1.default.RightParen);
                else if (byte === CharCodes_1.default.Backspace)
                    pushByte(CharCodes_1.default.BackSlash);
                else if (byte >= CharCodes_1.default.Zero && byte <= CharCodes_1.default.Seven) {
                    octal += char;
                    if (octal.length === 3 || !(nextChar >= '0' && nextChar <= '7')) {
                        pushByte(parseInt(octal, 8));
                        octal = '';
                    }
                }
                else {
                    pushByte(byte);
                }
            }
        }
        return new Uint8Array(bytes);
    };
    PDFString.prototype.decodeText = function () {
        var bytes = this.asBytes();
        if (utils_1.hasUtf16BOM(bytes))
            return utils_1.utf16Decode(bytes);
        return utils_1.pdfDocEncodingDecode(bytes);
    };
    PDFString.prototype.decodeDate = function () {
        var text = this.decodeText();
        var date = utils_1.parseDate(text);
        if (!date)
            throw new errors_1.InvalidPDFDateStringError(text);
        return date;
    };
    PDFString.prototype.asString = function () {
        return this.value;
    };
    PDFString.prototype.clone = function () {
        return PDFString.of(this.value);
    };
    PDFString.prototype.toString = function () {
        return "(" + this.value + ")";
    };
    PDFString.prototype.sizeInBytes = function () {
        return this.value.length + 2;
    };
    PDFString.prototype.copyBytesInto = function (buffer, offset) {
        buffer[offset++] = CharCodes_1.default.LeftParen;
        offset += utils_1.copyStringIntoBuffer(this.value, buffer, offset);
        buffer[offset++] = CharCodes_1.default.RightParen;
        return this.value.length + 2;
    };
    // The PDF spec allows newlines and parens to appear directly within a literal
    // string. These character _may_ be escaped. But they do not _have_ to be. So
    // for simplicity, we will not bother escaping them.
    PDFString.of = function (value) { return new PDFString(value); };
    PDFString.fromDate = function (date) {
        var year = utils_1.padStart(String(date.getUTCFullYear()), 4, '0');
        var month = utils_1.padStart(String(date.getUTCMonth() + 1), 2, '0');
        var day = utils_1.padStart(String(date.getUTCDate()), 2, '0');
        var hours = utils_1.padStart(String(date.getUTCHours()), 2, '0');
        var mins = utils_1.padStart(String(date.getUTCMinutes()), 2, '0');
        var secs = utils_1.padStart(String(date.getUTCSeconds()), 2, '0');
        return new PDFString("D:" + year + month + day + hours + mins + secs + "Z");
    };
    return PDFString;
}(PDFObject_1.default));
exports.default = PDFString;
//# sourceMappingURL=PDFString.js.map