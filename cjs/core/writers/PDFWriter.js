"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFCrossRefSection_1 = tslib_1.__importDefault(require("../document/PDFCrossRefSection"));
var PDFHeader_1 = tslib_1.__importDefault(require("../document/PDFHeader"));
var PDFTrailer_1 = tslib_1.__importDefault(require("../document/PDFTrailer"));
var PDFTrailerDict_1 = tslib_1.__importDefault(require("../document/PDFTrailerDict"));
var PDFObjectStream_1 = tslib_1.__importDefault(require("../structures/PDFObjectStream"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var utils_1 = require("../../utils");
var PDFWriter = /** @class */ (function () {
    function PDFWriter(context, objectsPerTick) {
        var _this = this;
        this.parsedObjects = 0;
        this.shouldWaitForTick = function (n) {
            _this.parsedObjects += n;
            return _this.parsedObjects % _this.objectsPerTick === 0;
        };
        this.context = context;
        this.objectsPerTick = objectsPerTick;
    }
    PDFWriter.prototype.serializeToBuffer = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, size, header, indirectObjects, xref, trailerDict, trailer, offset, buffer, idx, len, _b, ref, object, objectNumber, generationNumber, n;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.computeBufferSize()];
                    case 1:
                        _a = _c.sent(), size = _a.size, header = _a.header, indirectObjects = _a.indirectObjects, xref = _a.xref, trailerDict = _a.trailerDict, trailer = _a.trailer;
                        offset = 0;
                        buffer = new Uint8Array(size);
                        offset += header.copyBytesInto(buffer, offset);
                        buffer[offset++] = CharCodes_1.default.Newline;
                        buffer[offset++] = CharCodes_1.default.Newline;
                        idx = 0, len = indirectObjects.length;
                        _c.label = 2;
                    case 2:
                        if (!(idx < len)) return [3 /*break*/, 5];
                        _b = indirectObjects[idx], ref = _b[0], object = _b[1];
                        objectNumber = String(ref.objectNumber);
                        offset += utils_1.copyStringIntoBuffer(objectNumber, buffer, offset);
                        buffer[offset++] = CharCodes_1.default.Space;
                        generationNumber = String(ref.generationNumber);
                        offset += utils_1.copyStringIntoBuffer(generationNumber, buffer, offset);
                        buffer[offset++] = CharCodes_1.default.Space;
                        buffer[offset++] = CharCodes_1.default.o;
                        buffer[offset++] = CharCodes_1.default.b;
                        buffer[offset++] = CharCodes_1.default.j;
                        buffer[offset++] = CharCodes_1.default.Newline;
                        offset += object.copyBytesInto(buffer, offset);
                        buffer[offset++] = CharCodes_1.default.Newline;
                        buffer[offset++] = CharCodes_1.default.e;
                        buffer[offset++] = CharCodes_1.default.n;
                        buffer[offset++] = CharCodes_1.default.d;
                        buffer[offset++] = CharCodes_1.default.o;
                        buffer[offset++] = CharCodes_1.default.b;
                        buffer[offset++] = CharCodes_1.default.j;
                        buffer[offset++] = CharCodes_1.default.Newline;
                        buffer[offset++] = CharCodes_1.default.Newline;
                        n = object instanceof PDFObjectStream_1.default ? object.getObjectsCount() : 1;
                        if (!this.shouldWaitForTick(n)) return [3 /*break*/, 4];
                        return [4 /*yield*/, utils_1.waitForTick()];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        idx++;
                        return [3 /*break*/, 2];
                    case 5:
                        if (xref) {
                            offset += xref.copyBytesInto(buffer, offset);
                            buffer[offset++] = CharCodes_1.default.Newline;
                        }
                        if (trailerDict) {
                            offset += trailerDict.copyBytesInto(buffer, offset);
                            buffer[offset++] = CharCodes_1.default.Newline;
                            buffer[offset++] = CharCodes_1.default.Newline;
                        }
                        offset += trailer.copyBytesInto(buffer, offset);
                        return [2 /*return*/, buffer];
                }
            });
        });
    };
    PDFWriter.prototype.computeIndirectObjectSize = function (_a) {
        var ref = _a[0], object = _a[1];
        var refSize = ref.sizeInBytes() + 3; // 'R' -> 'obj\n'
        var objectSize = object.sizeInBytes() + 9; // '\nendobj\n\n'
        return refSize + objectSize;
    };
    PDFWriter.prototype.createTrailerDict = function () {
        return this.context.obj({
            Size: this.context.largestObjectNumber + 1,
            Root: this.context.trailerInfo.Root,
            Encrypt: this.context.trailerInfo.Encrypt,
            Info: this.context.trailerInfo.Info,
            ID: this.context.trailerInfo.ID,
        });
    };
    PDFWriter.prototype.computeBufferSize = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var header, size, xref, indirectObjects, idx, len, indirectObject, ref, xrefOffset, trailerDict, trailer;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        header = PDFHeader_1.default.forVersion(1, 7);
                        size = header.sizeInBytes() + 2;
                        xref = PDFCrossRefSection_1.default.create();
                        indirectObjects = this.context.enumerateIndirectObjects();
                        idx = 0, len = indirectObjects.length;
                        _a.label = 1;
                    case 1:
                        if (!(idx < len)) return [3 /*break*/, 4];
                        indirectObject = indirectObjects[idx];
                        ref = indirectObject[0];
                        xref.addEntry(ref, size);
                        size += this.computeIndirectObjectSize(indirectObject);
                        if (!this.shouldWaitForTick(1)) return [3 /*break*/, 3];
                        return [4 /*yield*/, utils_1.waitForTick()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        idx++;
                        return [3 /*break*/, 1];
                    case 4:
                        xrefOffset = size;
                        size += xref.sizeInBytes() + 1; // '\n'
                        trailerDict = PDFTrailerDict_1.default.of(this.createTrailerDict());
                        size += trailerDict.sizeInBytes() + 2; // '\n\n'
                        trailer = PDFTrailer_1.default.forLastCrossRefSectionOffset(xrefOffset);
                        size += trailer.sizeInBytes();
                        return [2 /*return*/, { size: size, header: header, indirectObjects: indirectObjects, xref: xref, trailerDict: trailerDict, trailer: trailer }];
                }
            });
        });
    };
    PDFWriter.forContext = function (context, objectsPerTick) {
        return new PDFWriter(context, objectsPerTick);
    };
    return PDFWriter;
}());
exports.default = PDFWriter;
//# sourceMappingURL=PDFWriter.js.map