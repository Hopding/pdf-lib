"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AFRelationship = void 0;
var tslib_1 = require("tslib");
var PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
var PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
/**
 * From the PDF-A3 specification, section **3.1. Requirements - General**.
 * See:
 * * https://www.pdfa.org/wp-content/uploads/2018/10/PDF20_AN002-AF.pdf
 */
var AFRelationship;
(function (AFRelationship) {
    AFRelationship["Source"] = "Source";
    AFRelationship["Data"] = "Data";
    AFRelationship["Alternative"] = "Alternative";
    AFRelationship["Supplement"] = "Supplement";
    AFRelationship["EncryptedPayload"] = "EncryptedPayload";
    AFRelationship["FormData"] = "EncryptedPayload";
    AFRelationship["Schema"] = "Schema";
    AFRelationship["Unspecified"] = "Unspecified";
})(AFRelationship = exports.AFRelationship || (exports.AFRelationship = {}));
var FileEmbedder = /** @class */ (function () {
    function FileEmbedder(fileData, fileName, options) {
        if (options === void 0) { options = {}; }
        this.fileData = fileData;
        this.fileName = fileName;
        this.options = options;
    }
    FileEmbedder.for = function (bytes, fileName, options) {
        if (options === void 0) { options = {}; }
        return new FileEmbedder(bytes, fileName, options);
    };
    FileEmbedder.prototype.embedIntoContext = function (context, ref) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, mimeType, description, creationDate, modificationDate, afRelationship, embeddedFileStream, embeddedFileStreamRef, fileSpecDict;
            return tslib_1.__generator(this, function (_b) {
                _a = this.options, mimeType = _a.mimeType, description = _a.description, creationDate = _a.creationDate, modificationDate = _a.modificationDate, afRelationship = _a.afRelationship;
                embeddedFileStream = context.flateStream(this.fileData, {
                    Type: 'EmbeddedFile',
                    Subtype: mimeType !== null && mimeType !== void 0 ? mimeType : undefined,
                    Params: {
                        Size: this.fileData.length,
                        CreationDate: creationDate
                            ? PDFString_1.default.fromDate(creationDate)
                            : undefined,
                        ModDate: modificationDate
                            ? PDFString_1.default.fromDate(modificationDate)
                            : undefined,
                    },
                });
                embeddedFileStreamRef = context.register(embeddedFileStream);
                fileSpecDict = context.obj({
                    Type: 'Filespec',
                    F: PDFString_1.default.of(this.fileName),
                    UF: PDFHexString_1.default.fromText(this.fileName),
                    EF: { F: embeddedFileStreamRef },
                    Desc: description ? PDFHexString_1.default.fromText(description) : undefined,
                    AFRelationship: afRelationship !== null && afRelationship !== void 0 ? afRelationship : undefined,
                });
                if (ref) {
                    context.assign(ref, fileSpecDict);
                    return [2 /*return*/, ref];
                }
                else {
                    return [2 /*return*/, context.register(fileSpecDict)];
                }
                return [2 /*return*/];
            });
        });
    };
    return FileEmbedder;
}());
exports.default = FileEmbedder;
//# sourceMappingURL=FileEmbedder.js.map