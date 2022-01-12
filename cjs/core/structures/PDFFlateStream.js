"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var pako_1 = tslib_1.__importDefault(require("pako"));
var errors_1 = require("../errors");
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFStream_1 = tslib_1.__importDefault(require("../objects/PDFStream"));
var utils_1 = require("../../utils");
var PDFFlateStream = /** @class */ (function (_super) {
    tslib_1.__extends(PDFFlateStream, _super);
    function PDFFlateStream(dict, encode) {
        var _this = _super.call(this, dict) || this;
        _this.computeContents = function () {
            var unencodedContents = _this.getUnencodedContents();
            return _this.encode ? pako_1.default.deflate(unencodedContents) : unencodedContents;
        };
        _this.encode = encode;
        if (encode)
            dict.set(PDFName_1.default.of('Filter'), PDFName_1.default.of('FlateDecode'));
        _this.contentsCache = utils_1.Cache.populatedBy(_this.computeContents);
        return _this;
    }
    PDFFlateStream.prototype.getContents = function () {
        return this.contentsCache.access();
    };
    PDFFlateStream.prototype.getContentsSize = function () {
        return this.contentsCache.access().length;
    };
    PDFFlateStream.prototype.getUnencodedContents = function () {
        throw new errors_1.MethodNotImplementedError(this.constructor.name, 'getUnencodedContents');
    };
    return PDFFlateStream;
}(PDFStream_1.default));
exports.default = PDFFlateStream;
//# sourceMappingURL=PDFFlateStream.js.map