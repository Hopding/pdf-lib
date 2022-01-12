"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../errors");
var PDFName_1 = tslib_1.__importDefault(require("./PDFName"));
var PDFNumber_1 = tslib_1.__importDefault(require("./PDFNumber"));
var PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var PDFStream = /** @class */ (function (_super) {
    tslib_1.__extends(PDFStream, _super);
    function PDFStream(dict) {
        var _this = _super.call(this) || this;
        _this.dict = dict;
        return _this;
    }
    PDFStream.prototype.clone = function (_context) {
        throw new errors_1.MethodNotImplementedError(this.constructor.name, 'clone');
    };
    PDFStream.prototype.getContentsString = function () {
        throw new errors_1.MethodNotImplementedError(this.constructor.name, 'getContentsString');
    };
    PDFStream.prototype.getContents = function () {
        throw new errors_1.MethodNotImplementedError(this.constructor.name, 'getContents');
    };
    PDFStream.prototype.getContentsSize = function () {
        throw new errors_1.MethodNotImplementedError(this.constructor.name, 'getContentsSize');
    };
    PDFStream.prototype.updateDict = function () {
        var contentsSize = this.getContentsSize();
        this.dict.set(PDFName_1.default.Length, PDFNumber_1.default.of(contentsSize));
    };
    PDFStream.prototype.sizeInBytes = function () {
        this.updateDict();
        return this.dict.sizeInBytes() + this.getContentsSize() + 18;
    };
    PDFStream.prototype.toString = function () {
        this.updateDict();
        var streamString = this.dict.toString();
        streamString += '\nstream\n';
        streamString += this.getContentsString();
        streamString += '\nendstream';
        return streamString;
    };
    PDFStream.prototype.copyBytesInto = function (buffer, offset) {
        this.updateDict();
        var initialOffset = offset;
        offset += this.dict.copyBytesInto(buffer, offset);
        buffer[offset++] = CharCodes_1.default.Newline;
        buffer[offset++] = CharCodes_1.default.s;
        buffer[offset++] = CharCodes_1.default.t;
        buffer[offset++] = CharCodes_1.default.r;
        buffer[offset++] = CharCodes_1.default.e;
        buffer[offset++] = CharCodes_1.default.a;
        buffer[offset++] = CharCodes_1.default.m;
        buffer[offset++] = CharCodes_1.default.Newline;
        var contents = this.getContents();
        for (var idx = 0, len = contents.length; idx < len; idx++) {
            buffer[offset++] = contents[idx];
        }
        buffer[offset++] = CharCodes_1.default.Newline;
        buffer[offset++] = CharCodes_1.default.e;
        buffer[offset++] = CharCodes_1.default.n;
        buffer[offset++] = CharCodes_1.default.d;
        buffer[offset++] = CharCodes_1.default.s;
        buffer[offset++] = CharCodes_1.default.t;
        buffer[offset++] = CharCodes_1.default.r;
        buffer[offset++] = CharCodes_1.default.e;
        buffer[offset++] = CharCodes_1.default.a;
        buffer[offset++] = CharCodes_1.default.m;
        return offset - initialOffset;
    };
    return PDFStream;
}(PDFObject_1.default));
exports.default = PDFStream;
//# sourceMappingURL=PDFStream.js.map