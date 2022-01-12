"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFFlateStream_1 = tslib_1.__importDefault(require("./PDFFlateStream"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var PDFContentStream = /** @class */ (function (_super) {
    tslib_1.__extends(PDFContentStream, _super);
    function PDFContentStream(dict, operators, encode) {
        if (encode === void 0) { encode = true; }
        var _this = _super.call(this, dict, encode) || this;
        _this.operators = operators;
        return _this;
    }
    PDFContentStream.prototype.push = function () {
        var _a;
        var operators = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operators[_i] = arguments[_i];
        }
        (_a = this.operators).push.apply(_a, operators);
    };
    PDFContentStream.prototype.clone = function (context) {
        var operators = new Array(this.operators.length);
        for (var idx = 0, len = this.operators.length; idx < len; idx++) {
            operators[idx] = this.operators[idx].clone(context);
        }
        var _a = this, dict = _a.dict, encode = _a.encode;
        return PDFContentStream.of(dict.clone(context), operators, encode);
    };
    PDFContentStream.prototype.getContentsString = function () {
        var value = '';
        for (var idx = 0, len = this.operators.length; idx < len; idx++) {
            value += this.operators[idx] + "\n";
        }
        return value;
    };
    PDFContentStream.prototype.getUnencodedContents = function () {
        var buffer = new Uint8Array(this.getUnencodedContentsSize());
        var offset = 0;
        for (var idx = 0, len = this.operators.length; idx < len; idx++) {
            offset += this.operators[idx].copyBytesInto(buffer, offset);
            buffer[offset++] = CharCodes_1.default.Newline;
        }
        return buffer;
    };
    PDFContentStream.prototype.getUnencodedContentsSize = function () {
        var size = 0;
        for (var idx = 0, len = this.operators.length; idx < len; idx++) {
            size += this.operators[idx].sizeInBytes() + 1;
        }
        return size;
    };
    PDFContentStream.of = function (dict, operators, encode) {
        if (encode === void 0) { encode = true; }
        return new PDFContentStream(dict, operators, encode);
    };
    return PDFContentStream;
}(PDFFlateStream_1.default));
exports.default = PDFContentStream;
//# sourceMappingURL=PDFContentStream.js.map