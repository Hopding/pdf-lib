"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFStream_1 = tslib_1.__importDefault(require("./PDFStream"));
var utils_1 = require("../../utils");
var PDFRawStream = /** @class */ (function (_super) {
    tslib_1.__extends(PDFRawStream, _super);
    function PDFRawStream(dict, contents) {
        var _this = _super.call(this, dict) || this;
        _this.contents = contents;
        return _this;
    }
    PDFRawStream.prototype.asUint8Array = function () {
        return this.contents.slice();
    };
    PDFRawStream.prototype.clone = function (context) {
        return PDFRawStream.of(this.dict.clone(context), this.contents.slice());
    };
    PDFRawStream.prototype.getContentsString = function () {
        return utils_1.arrayAsString(this.contents);
    };
    PDFRawStream.prototype.getContents = function () {
        return this.contents;
    };
    PDFRawStream.prototype.getContentsSize = function () {
        return this.contents.length;
    };
    PDFRawStream.of = function (dict, contents) {
        return new PDFRawStream(dict, contents);
    };
    return PDFRawStream;
}(PDFStream_1.default));
exports.default = PDFRawStream;
//# sourceMappingURL=PDFRawStream.js.map