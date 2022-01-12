"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var index_1 = require("../../utils/index");
var PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
var PDFNumber = /** @class */ (function (_super) {
    tslib_1.__extends(PDFNumber, _super);
    function PDFNumber(value) {
        var _this = _super.call(this) || this;
        _this.numberValue = value;
        _this.stringValue = index_1.numberToString(value);
        return _this;
    }
    PDFNumber.prototype.asNumber = function () {
        return this.numberValue;
    };
    /** @deprecated in favor of [[PDFNumber.asNumber]] */
    PDFNumber.prototype.value = function () {
        return this.numberValue;
    };
    PDFNumber.prototype.clone = function () {
        return PDFNumber.of(this.numberValue);
    };
    PDFNumber.prototype.toString = function () {
        return this.stringValue;
    };
    PDFNumber.prototype.sizeInBytes = function () {
        return this.stringValue.length;
    };
    PDFNumber.prototype.copyBytesInto = function (buffer, offset) {
        offset += index_1.copyStringIntoBuffer(this.stringValue, buffer, offset);
        return this.stringValue.length;
    };
    PDFNumber.of = function (value) { return new PDFNumber(value); };
    return PDFNumber;
}(PDFObject_1.default));
exports.default = PDFNumber;
//# sourceMappingURL=PDFNumber.js.map