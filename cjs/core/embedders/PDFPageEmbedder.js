"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../errors");
var PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
var PDFRawStream_1 = tslib_1.__importDefault(require("../objects/PDFRawStream"));
var PDFStream_1 = tslib_1.__importDefault(require("../objects/PDFStream"));
var decode_1 = require("../streams/decode");
var PDFContentStream_1 = tslib_1.__importDefault(require("../structures/PDFContentStream"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var utils_1 = require("../../utils");
var fullPageBoundingBox = function (page) {
    var mediaBox = page.MediaBox();
    var width = mediaBox.lookup(2, PDFNumber_1.default).asNumber() -
        mediaBox.lookup(0, PDFNumber_1.default).asNumber();
    var height = mediaBox.lookup(3, PDFNumber_1.default).asNumber() -
        mediaBox.lookup(1, PDFNumber_1.default).asNumber();
    return { left: 0, bottom: 0, right: width, top: height };
};
// Returns the identity matrix, modified to position the content of the given
// bounding box at (0, 0).
var boundingBoxAdjustedMatrix = function (bb) { return [1, 0, 0, 1, -bb.left, -bb.bottom]; };
var PDFPageEmbedder = /** @class */ (function () {
    function PDFPageEmbedder(page, boundingBox, transformationMatrix) {
        this.page = page;
        var bb = boundingBox !== null && boundingBox !== void 0 ? boundingBox : fullPageBoundingBox(page);
        this.width = bb.right - bb.left;
        this.height = bb.top - bb.bottom;
        this.boundingBox = bb;
        this.transformationMatrix = transformationMatrix !== null && transformationMatrix !== void 0 ? transformationMatrix : boundingBoxAdjustedMatrix(bb);
    }
    PDFPageEmbedder.for = function (page, boundingBox, transformationMatrix) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new PDFPageEmbedder(page, boundingBox, transformationMatrix)];
            });
        });
    };
    PDFPageEmbedder.prototype.embedIntoContext = function (context, ref) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, Contents, Resources, decodedContents, _b, left, bottom, right, top, xObject;
            return tslib_1.__generator(this, function (_c) {
                _a = this.page.normalizedEntries(), Contents = _a.Contents, Resources = _a.Resources;
                if (!Contents)
                    throw new errors_1.MissingPageContentsEmbeddingError();
                decodedContents = this.decodeContents(Contents);
                _b = this.boundingBox, left = _b.left, bottom = _b.bottom, right = _b.right, top = _b.top;
                xObject = context.flateStream(decodedContents, {
                    Type: 'XObject',
                    Subtype: 'Form',
                    FormType: 1,
                    BBox: [left, bottom, right, top],
                    Matrix: this.transformationMatrix,
                    Resources: Resources,
                });
                if (ref) {
                    context.assign(ref, xObject);
                    return [2 /*return*/, ref];
                }
                else {
                    return [2 /*return*/, context.register(xObject)];
                }
                return [2 /*return*/];
            });
        });
    };
    // `contents` is an array of streams which are merged to include them in the XObject.
    // This methods extracts each stream and joins them with a newline character.
    PDFPageEmbedder.prototype.decodeContents = function (contents) {
        var newline = Uint8Array.of(CharCodes_1.default.Newline);
        var decodedContents = [];
        for (var idx = 0, len = contents.size(); idx < len; idx++) {
            var stream = contents.lookup(idx, PDFStream_1.default);
            var content = void 0;
            if (stream instanceof PDFRawStream_1.default) {
                content = decode_1.decodePDFRawStream(stream).decode();
            }
            else if (stream instanceof PDFContentStream_1.default) {
                content = stream.getUnencodedContents();
            }
            else {
                throw new errors_1.UnrecognizedStreamTypeError(stream);
            }
            decodedContents.push(content, newline);
        }
        return utils_1.mergeIntoTypedArray.apply(void 0, decodedContents);
    };
    return PDFPageEmbedder;
}());
exports.default = PDFPageEmbedder;
//# sourceMappingURL=PDFPageEmbedder.js.map