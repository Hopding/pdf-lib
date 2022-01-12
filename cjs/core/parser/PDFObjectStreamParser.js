"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../errors");
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
var PDFRef_1 = tslib_1.__importDefault(require("../objects/PDFRef"));
var ByteStream_1 = tslib_1.__importDefault(require("./ByteStream"));
var PDFObjectParser_1 = tslib_1.__importDefault(require("./PDFObjectParser"));
var utils_1 = require("../../utils");
var PDFObjectStreamParser = /** @class */ (function (_super) {
    tslib_1.__extends(PDFObjectStreamParser, _super);
    function PDFObjectStreamParser(rawStream, shouldWaitForTick) {
        var _this = _super.call(this, ByteStream_1.default.fromPDFRawStream(rawStream), rawStream.dict.context) || this;
        var dict = rawStream.dict;
        _this.alreadyParsed = false;
        _this.shouldWaitForTick = shouldWaitForTick || (function () { return false; });
        _this.firstOffset = dict.lookup(PDFName_1.default.of('First'), PDFNumber_1.default).asNumber();
        _this.objectCount = dict.lookup(PDFName_1.default.of('N'), PDFNumber_1.default).asNumber();
        return _this;
    }
    PDFObjectStreamParser.prototype.parseIntoContext = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var offsetsAndObjectNumbers, idx, len, _a, objectNumber, offset, object, ref;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.alreadyParsed) {
                            throw new errors_1.ReparseError('PDFObjectStreamParser', 'parseIntoContext');
                        }
                        this.alreadyParsed = true;
                        offsetsAndObjectNumbers = this.parseOffsetsAndObjectNumbers();
                        idx = 0, len = offsetsAndObjectNumbers.length;
                        _b.label = 1;
                    case 1:
                        if (!(idx < len)) return [3 /*break*/, 4];
                        _a = offsetsAndObjectNumbers[idx], objectNumber = _a.objectNumber, offset = _a.offset;
                        this.bytes.moveTo(this.firstOffset + offset);
                        object = this.parseObject();
                        ref = PDFRef_1.default.of(objectNumber, 0);
                        this.context.assign(ref, object);
                        if (!this.shouldWaitForTick()) return [3 /*break*/, 3];
                        return [4 /*yield*/, utils_1.waitForTick()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        idx++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PDFObjectStreamParser.prototype.parseOffsetsAndObjectNumbers = function () {
        var offsetsAndObjectNumbers = [];
        for (var idx = 0, len = this.objectCount; idx < len; idx++) {
            this.skipWhitespaceAndComments();
            var objectNumber = this.parseRawInt();
            this.skipWhitespaceAndComments();
            var offset = this.parseRawInt();
            offsetsAndObjectNumbers.push({ objectNumber: objectNumber, offset: offset });
        }
        return offsetsAndObjectNumbers;
    };
    PDFObjectStreamParser.forStream = function (rawStream, shouldWaitForTick) { return new PDFObjectStreamParser(rawStream, shouldWaitForTick); };
    return PDFObjectStreamParser;
}(PDFObjectParser_1.default));
exports.default = PDFObjectStreamParser;
//# sourceMappingURL=PDFObjectStreamParser.js.map