"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFCrossRefSection_1 = tslib_1.__importDefault(require("../document/PDFCrossRefSection"));
var PDFHeader_1 = tslib_1.__importDefault(require("../document/PDFHeader"));
var PDFTrailer_1 = tslib_1.__importDefault(require("../document/PDFTrailer"));
var errors_1 = require("../errors");
var PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
var PDFInvalidObject_1 = tslib_1.__importDefault(require("../objects/PDFInvalidObject"));
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFRawStream_1 = tslib_1.__importDefault(require("../objects/PDFRawStream"));
var PDFRef_1 = tslib_1.__importDefault(require("../objects/PDFRef"));
var ByteStream_1 = tslib_1.__importDefault(require("./ByteStream"));
var PDFObjectParser_1 = tslib_1.__importDefault(require("./PDFObjectParser"));
var PDFObjectStreamParser_1 = tslib_1.__importDefault(require("./PDFObjectStreamParser"));
var PDFXRefStreamParser_1 = tslib_1.__importDefault(require("./PDFXRefStreamParser"));
var PDFContext_1 = tslib_1.__importDefault(require("../PDFContext"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var Keywords_1 = require("../syntax/Keywords");
var Numeric_1 = require("../syntax/Numeric");
var utils_1 = require("../../utils");
var PDFParser = /** @class */ (function (_super) {
    tslib_1.__extends(PDFParser, _super);
    function PDFParser(pdfBytes, objectsPerTick, throwOnInvalidObject, capNumbers) {
        if (objectsPerTick === void 0) { objectsPerTick = Infinity; }
        if (throwOnInvalidObject === void 0) { throwOnInvalidObject = false; }
        if (capNumbers === void 0) { capNumbers = false; }
        var _this = _super.call(this, ByteStream_1.default.of(pdfBytes), PDFContext_1.default.create(), capNumbers) || this;
        _this.alreadyParsed = false;
        _this.parsedObjects = 0;
        _this.shouldWaitForTick = function () {
            _this.parsedObjects += 1;
            return _this.parsedObjects % _this.objectsPerTick === 0;
        };
        _this.objectsPerTick = objectsPerTick;
        _this.throwOnInvalidObject = throwOnInvalidObject;
        return _this;
    }
    PDFParser.prototype.parseDocument = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var prevOffset, offset;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.alreadyParsed) {
                            throw new errors_1.ReparseError('PDFParser', 'parseDocument');
                        }
                        this.alreadyParsed = true;
                        this.context.header = this.parseHeader();
                        _a.label = 1;
                    case 1:
                        if (!!this.bytes.done()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.parseDocumentSection()];
                    case 2:
                        _a.sent();
                        offset = this.bytes.offset();
                        if (offset === prevOffset) {
                            throw new errors_1.StalledParserError(this.bytes.position());
                        }
                        prevOffset = offset;
                        return [3 /*break*/, 1];
                    case 3:
                        this.maybeRecoverRoot();
                        if (this.context.lookup(PDFRef_1.default.of(0))) {
                            console.warn('Removing parsed object: 0 0 R');
                            this.context.delete(PDFRef_1.default.of(0));
                        }
                        return [2 /*return*/, this.context];
                }
            });
        });
    };
    PDFParser.prototype.maybeRecoverRoot = function () {
        var isValidCatalog = function (obj) {
            return obj instanceof PDFDict_1.default &&
                obj.lookup(PDFName_1.default.of('Type')) === PDFName_1.default.of('Catalog');
        };
        var catalog = this.context.lookup(this.context.trailerInfo.Root);
        if (!isValidCatalog(catalog)) {
            var indirectObjects = this.context.enumerateIndirectObjects();
            for (var idx = 0, len = indirectObjects.length; idx < len; idx++) {
                var _a = indirectObjects[idx], ref = _a[0], object = _a[1];
                if (isValidCatalog(object)) {
                    this.context.trailerInfo.Root = ref;
                }
            }
        }
    };
    PDFParser.prototype.parseHeader = function () {
        while (!this.bytes.done()) {
            if (this.matchKeyword(Keywords_1.Keywords.header)) {
                var major = this.parseRawInt();
                this.bytes.assertNext(CharCodes_1.default.Period);
                var minor = this.parseRawInt();
                var header = PDFHeader_1.default.forVersion(major, minor);
                this.skipBinaryHeaderComment();
                return header;
            }
            this.bytes.next();
        }
        throw new errors_1.MissingPDFHeaderError(this.bytes.position());
    };
    PDFParser.prototype.parseIndirectObjectHeader = function () {
        this.skipWhitespaceAndComments();
        var objectNumber = this.parseRawInt();
        this.skipWhitespaceAndComments();
        var generationNumber = this.parseRawInt();
        this.skipWhitespaceAndComments();
        if (!this.matchKeyword(Keywords_1.Keywords.obj)) {
            throw new errors_1.MissingKeywordError(this.bytes.position(), Keywords_1.Keywords.obj);
        }
        return PDFRef_1.default.of(objectNumber, generationNumber);
    };
    PDFParser.prototype.matchIndirectObjectHeader = function () {
        var initialOffset = this.bytes.offset();
        try {
            this.parseIndirectObjectHeader();
            return true;
        }
        catch (e) {
            this.bytes.moveTo(initialOffset);
            return false;
        }
    };
    PDFParser.prototype.parseIndirectObject = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var ref, object;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ref = this.parseIndirectObjectHeader();
                        this.skipWhitespaceAndComments();
                        object = this.parseObject();
                        this.skipWhitespaceAndComments();
                        // if (!this.matchKeyword(Keywords.endobj)) {
                        // throw new MissingKeywordError(this.bytes.position(), Keywords.endobj);
                        // }
                        // TODO: Log a warning if this fails...
                        this.matchKeyword(Keywords_1.Keywords.endobj);
                        if (!(object instanceof PDFRawStream_1.default &&
                            object.dict.lookup(PDFName_1.default.of('Type')) === PDFName_1.default.of('ObjStm'))) return [3 /*break*/, 2];
                        return [4 /*yield*/, PDFObjectStreamParser_1.default.forStream(object, this.shouldWaitForTick).parseIntoContext()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        if (object instanceof PDFRawStream_1.default &&
                            object.dict.lookup(PDFName_1.default.of('Type')) === PDFName_1.default.of('XRef')) {
                            PDFXRefStreamParser_1.default.forStream(object).parseIntoContext();
                        }
                        else {
                            this.context.assign(ref, object);
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/, ref];
                }
            });
        });
    };
    // TODO: Improve and clean this up
    PDFParser.prototype.tryToParseInvalidIndirectObject = function () {
        var startPos = this.bytes.position();
        var msg = "Trying to parse invalid object: " + JSON.stringify(startPos) + ")";
        if (this.throwOnInvalidObject)
            throw new Error(msg);
        console.warn(msg);
        var ref = this.parseIndirectObjectHeader();
        console.warn("Invalid object ref: " + ref);
        this.skipWhitespaceAndComments();
        var start = this.bytes.offset();
        var failed = true;
        while (!this.bytes.done()) {
            if (this.matchKeyword(Keywords_1.Keywords.endobj)) {
                failed = false;
            }
            if (!failed)
                break;
            this.bytes.next();
        }
        if (failed)
            throw new errors_1.PDFInvalidObjectParsingError(startPos);
        var end = this.bytes.offset() - Keywords_1.Keywords.endobj.length;
        var object = PDFInvalidObject_1.default.of(this.bytes.slice(start, end));
        this.context.assign(ref, object);
        return ref;
    };
    PDFParser.prototype.parseIndirectObjects = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var initialOffset, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.skipWhitespaceAndComments();
                        _a.label = 1;
                    case 1:
                        if (!(!this.bytes.done() && Numeric_1.IsDigit[this.bytes.peek()])) return [3 /*break*/, 8];
                        initialOffset = this.bytes.offset();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.parseIndirectObject()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        // TODO: Add tracing/logging mechanism to track when this happens!
                        this.bytes.moveTo(initialOffset);
                        this.tryToParseInvalidIndirectObject();
                        return [3 /*break*/, 5];
                    case 5:
                        this.skipWhitespaceAndComments();
                        // TODO: Can this be done only when needed, to avoid harming performance?
                        this.skipJibberish();
                        if (!this.shouldWaitForTick()) return [3 /*break*/, 7];
                        return [4 /*yield*/, utils_1.waitForTick()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    PDFParser.prototype.maybeParseCrossRefSection = function () {
        this.skipWhitespaceAndComments();
        if (!this.matchKeyword(Keywords_1.Keywords.xref))
            return;
        this.skipWhitespaceAndComments();
        var objectNumber = -1;
        var xref = PDFCrossRefSection_1.default.createEmpty();
        while (!this.bytes.done() && Numeric_1.IsDigit[this.bytes.peek()]) {
            var firstInt = this.parseRawInt();
            this.skipWhitespaceAndComments();
            var secondInt = this.parseRawInt();
            this.skipWhitespaceAndComments();
            var byte = this.bytes.peek();
            if (byte === CharCodes_1.default.n || byte === CharCodes_1.default.f) {
                var ref = PDFRef_1.default.of(objectNumber, secondInt);
                if (this.bytes.next() === CharCodes_1.default.n) {
                    xref.addEntry(ref, firstInt);
                }
                else {
                    // this.context.delete(ref);
                    xref.addDeletedEntry(ref, firstInt);
                }
                objectNumber += 1;
            }
            else {
                objectNumber = firstInt;
            }
            this.skipWhitespaceAndComments();
        }
        return xref;
    };
    PDFParser.prototype.maybeParseTrailerDict = function () {
        this.skipWhitespaceAndComments();
        if (!this.matchKeyword(Keywords_1.Keywords.trailer))
            return;
        this.skipWhitespaceAndComments();
        var dict = this.parseDict();
        var context = this.context;
        context.trailerInfo = {
            Root: dict.get(PDFName_1.default.of('Root')) || context.trailerInfo.Root,
            Encrypt: dict.get(PDFName_1.default.of('Encrypt')) || context.trailerInfo.Encrypt,
            Info: dict.get(PDFName_1.default.of('Info')) || context.trailerInfo.Info,
            ID: dict.get(PDFName_1.default.of('ID')) || context.trailerInfo.ID,
        };
    };
    PDFParser.prototype.maybeParseTrailer = function () {
        this.skipWhitespaceAndComments();
        if (!this.matchKeyword(Keywords_1.Keywords.startxref))
            return;
        this.skipWhitespaceAndComments();
        var offset = this.parseRawInt();
        this.skipWhitespace();
        this.matchKeyword(Keywords_1.Keywords.eof);
        this.skipWhitespaceAndComments();
        this.matchKeyword(Keywords_1.Keywords.eof);
        this.skipWhitespaceAndComments();
        return PDFTrailer_1.default.forLastCrossRefSectionOffset(offset);
    };
    PDFParser.prototype.parseDocumentSection = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parseIndirectObjects()];
                    case 1:
                        _a.sent();
                        this.maybeParseCrossRefSection();
                        this.maybeParseTrailerDict();
                        this.maybeParseTrailer();
                        // TODO: Can this be done only when needed, to avoid harming performance?
                        this.skipJibberish();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This operation is not necessary for valid PDF files. But some invalid PDFs
     * contain jibberish in between indirect objects. This method is designed to
     * skip past that jibberish, should it exist, until it reaches the next
     * indirect object header, an xref table section, or the file trailer.
     */
    PDFParser.prototype.skipJibberish = function () {
        this.skipWhitespaceAndComments();
        while (!this.bytes.done()) {
            var initialOffset = this.bytes.offset();
            var byte = this.bytes.peek();
            var isAlphaNumeric = byte >= CharCodes_1.default.Space && byte <= CharCodes_1.default.Tilde;
            if (isAlphaNumeric) {
                if (this.matchKeyword(Keywords_1.Keywords.xref) ||
                    this.matchKeyword(Keywords_1.Keywords.trailer) ||
                    this.matchKeyword(Keywords_1.Keywords.startxref) ||
                    this.matchIndirectObjectHeader()) {
                    this.bytes.moveTo(initialOffset);
                    break;
                }
            }
            this.bytes.next();
        }
    };
    /**
     * Skips the binary comment following a PDF header. The specification
     * defines this binary comment (section 7.5.2 File Header) as a sequence of 4
     * or more bytes that are 128 or greater, and which are preceded by a "%".
     *
     * This would imply that to strip out this binary comment, we could check for
     * a sequence of bytes starting with "%", and remove all subsequent bytes that
     * are 128 or greater. This works for many documents that properly comply with
     * the spec. But in the wild, there are PDFs that omit the leading "%", and
     * include bytes that are less than 128 (e.g. 0 or 1). So in order to parse
     * these headers correctly, we just throw out all bytes leading up to the
     * first indirect object header.
     */
    PDFParser.prototype.skipBinaryHeaderComment = function () {
        this.skipWhitespaceAndComments();
        try {
            var initialOffset = this.bytes.offset();
            this.parseIndirectObjectHeader();
            this.bytes.moveTo(initialOffset);
        }
        catch (e) {
            this.bytes.next();
            this.skipWhitespaceAndComments();
        }
    };
    PDFParser.forBytesWithOptions = function (pdfBytes, objectsPerTick, throwOnInvalidObject, capNumbers) {
        return new PDFParser(pdfBytes, objectsPerTick, throwOnInvalidObject, capNumbers);
    };
    return PDFParser;
}(PDFObjectParser_1.default));
exports.default = PDFParser;
//# sourceMappingURL=PDFParser.js.map