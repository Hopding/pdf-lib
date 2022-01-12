"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var PDFNull = /** @class */ (function (_super) {
    tslib_1.__extends(PDFNull, _super);
    function PDFNull() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PDFNull.prototype.asNull = function () {
        return null;
    };
    PDFNull.prototype.clone = function () {
        return this;
    };
    PDFNull.prototype.toString = function () {
        return 'null';
    };
    PDFNull.prototype.sizeInBytes = function () {
        return 4;
    };
    PDFNull.prototype.copyBytesInto = function (buffer, offset) {
        buffer[offset++] = CharCodes_1.default.n;
        buffer[offset++] = CharCodes_1.default.u;
        buffer[offset++] = CharCodes_1.default.l;
        buffer[offset++] = CharCodes_1.default.l;
        return 4;
    };
    return PDFNull;
}(PDFObject_1.default));
exports.default = new PDFNull();
//# sourceMappingURL=PDFNull.js.map