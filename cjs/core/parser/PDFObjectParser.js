"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../errors");
var PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
var PDFBool_1 = tslib_1.__importDefault(require("../objects/PDFBool"));
var PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
var PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFNull_1 = tslib_1.__importDefault(require("../objects/PDFNull"));
var PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
var PDFRawStream_1 = tslib_1.__importDefault(require("../objects/PDFRawStream"));
var PDFRef_1 = tslib_1.__importDefault(require("../objects/PDFRef"));
var PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
var BaseParser_1 = tslib_1.__importDefault(require("./BaseParser"));
var ByteStream_1 = tslib_1.__importDefault(require("./ByteStream"));
var PDFCatalog_1 = tslib_1.__importDefault(require("../structures/PDFCatalog"));
var PDFPageLeaf_1 = tslib_1.__importDefault(require("../structures/PDFPageLeaf"));
var PDFPageTree_1 = tslib_1.__importDefault(require("../structures/PDFPageTree"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var Delimiters_1 = require("../syntax/Delimiters");
var Keywords_1 = require("../syntax/Keywords");
var Numeric_1 = require("../syntax/Numeric");
var Whitespace_1 = require("../syntax/Whitespace");
var utils_1 = require("../../utils");
// TODO: Throw error if eof is reached before finishing object parse...
var PDFObjectParser = /** @class */ (function (_super) {
    tslib_1.__extends(PDFObjectParser, _super);
    function PDFObjectParser(byteStream, context, capNumbers) {
        if (capNumbers === void 0) { capNumbers = false; }
        var _this = _super.call(this, byteStream, capNumbers) || this;
        _this.context = context;
        return _this;
    }
    // TODO: Is it possible to reduce duplicate parsing for ref lookaheads?
    PDFObjectParser.prototype.parseObject = function () {
        this.skipWhitespaceAndComments();
        if (this.matchKeyword(Keywords_1.Keywords.true))
            return PDFBool_1.default.True;
        if (this.matchKeyword(Keywords_1.Keywords.false))
            return PDFBool_1.default.False;
        if (this.matchKeyword(Keywords_1.Keywords.null))
            return PDFNull_1.default;
        var byte = this.bytes.peek();
        if (byte === CharCodes_1.default.LessThan &&
            this.bytes.peekAhead(1) === CharCodes_1.default.LessThan) {
            return this.parseDictOrStream();
        }
        if (byte === CharCodes_1.default.LessThan)
            return this.parseHexString();
        if (byte === CharCodes_1.default.LeftParen)
            return this.parseString();
        if (byte === CharCodes_1.default.ForwardSlash)
            return this.parseName();
        if (byte === CharCodes_1.default.LeftSquareBracket)
            return this.parseArray();
        if (Numeric_1.IsNumeric[byte])
            return this.parseNumberOrRef();
        throw new errors_1.PDFObjectParsingError(this.bytes.position(), byte);
    };
    PDFObjectParser.prototype.parseNumberOrRef = function () {
        var firstNum = this.parseRawNumber();
        this.skipWhitespaceAndComments();
        var lookaheadStart = this.bytes.offset();
        if (Numeric_1.IsDigit[this.bytes.peek()]) {
            var secondNum = this.parseRawNumber();
            this.skipWhitespaceAndComments();
            if (this.bytes.peek() === CharCodes_1.default.R) {
                this.bytes.assertNext(CharCodes_1.default.R);
                return PDFRef_1.default.of(firstNum, secondNum);
            }
        }
        this.bytes.moveTo(lookaheadStart);
        return PDFNumber_1.default.of(firstNum);
    };
    // TODO: Maybe update PDFHexString.of() logic to remove whitespace and validate input?
    PDFObjectParser.prototype.parseHexString = function () {
        var value = '';
        this.bytes.assertNext(CharCodes_1.default.LessThan);
        while (!this.bytes.done() && this.bytes.peek() !== CharCodes_1.default.GreaterThan) {
            value += utils_1.charFromCode(this.bytes.next());
        }
        this.bytes.assertNext(CharCodes_1.default.GreaterThan);
        return PDFHexString_1.default.of(value);
    };
    PDFObjectParser.prototype.parseString = function () {
        var nestingLvl = 0;
        var isEscaped = false;
        var value = '';
        while (!this.bytes.done()) {
            var byte = this.bytes.next();
            value += utils_1.charFromCode(byte);
            // Check for unescaped parenthesis
            if (!isEscaped) {
                if (byte === CharCodes_1.default.LeftParen)
                    nestingLvl += 1;
                if (byte === CharCodes_1.default.RightParen)
                    nestingLvl -= 1;
            }
            // Track whether current character is being escaped or not
            if (byte === CharCodes_1.default.BackSlash) {
                isEscaped = !isEscaped;
            }
            else if (isEscaped) {
                isEscaped = false;
            }
            // Once (if) the unescaped parenthesis balance out, return their contents
            if (nestingLvl === 0) {
                // Remove the outer parens so they aren't part of the contents
                return PDFString_1.default.of(value.substring(1, value.length - 1));
            }
        }
        throw new errors_1.UnbalancedParenthesisError(this.bytes.position());
    };
    // TODO: Compare performance of string concatenation to charFromCode(...bytes)
    // TODO: Maybe preallocate small Uint8Array if can use charFromCode?
    PDFObjectParser.prototype.parseName = function () {
        this.bytes.assertNext(CharCodes_1.default.ForwardSlash);
        var name = '';
        while (!this.bytes.done()) {
            var byte = this.bytes.peek();
            if (Whitespace_1.IsWhitespace[byte] || Delimiters_1.IsDelimiter[byte])
                break;
            name += utils_1.charFromCode(byte);
            this.bytes.next();
        }
        return PDFName_1.default.of(name);
    };
    PDFObjectParser.prototype.parseArray = function () {
        this.bytes.assertNext(CharCodes_1.default.LeftSquareBracket);
        this.skipWhitespaceAndComments();
        var pdfArray = PDFArray_1.default.withContext(this.context);
        while (this.bytes.peek() !== CharCodes_1.default.RightSquareBracket) {
            var element = this.parseObject();
            pdfArray.push(element);
            this.skipWhitespaceAndComments();
        }
        this.bytes.assertNext(CharCodes_1.default.RightSquareBracket);
        return pdfArray;
    };
    PDFObjectParser.prototype.parseDict = function () {
        this.bytes.assertNext(CharCodes_1.default.LessThan);
        this.bytes.assertNext(CharCodes_1.default.LessThan);
        this.skipWhitespaceAndComments();
        var dict = new Map();
        while (!this.bytes.done() &&
            this.bytes.peek() !== CharCodes_1.default.GreaterThan &&
            this.bytes.peekAhead(1) !== CharCodes_1.default.GreaterThan) {
            var key = this.parseName();
            var value = this.parseObject();
            dict.set(key, value);
            this.skipWhitespaceAndComments();
        }
        this.skipWhitespaceAndComments();
        this.bytes.assertNext(CharCodes_1.default.GreaterThan);
        this.bytes.assertNext(CharCodes_1.default.GreaterThan);
        var Type = dict.get(PDFName_1.default.of('Type'));
        if (Type === PDFName_1.default.of('Catalog')) {
            return PDFCatalog_1.default.fromMapWithContext(dict, this.context);
        }
        else if (Type === PDFName_1.default.of('Pages')) {
            return PDFPageTree_1.default.fromMapWithContext(dict, this.context);
        }
        else if (Type === PDFName_1.default.of('Page')) {
            return PDFPageLeaf_1.default.fromMapWithContext(dict, this.context);
        }
        else {
            return PDFDict_1.default.fromMapWithContext(dict, this.context);
        }
    };
    PDFObjectParser.prototype.parseDictOrStream = function () {
        var startPos = this.bytes.position();
        var dict = this.parseDict();
        this.skipWhitespaceAndComments();
        if (!this.matchKeyword(Keywords_1.Keywords.streamEOF1) &&
            !this.matchKeyword(Keywords_1.Keywords.streamEOF2) &&
            !this.matchKeyword(Keywords_1.Keywords.streamEOF3) &&
            !this.matchKeyword(Keywords_1.Keywords.streamEOF4) &&
            !this.matchKeyword(Keywords_1.Keywords.stream)) {
            return dict;
        }
        var start = this.bytes.offset();
        var end;
        var Length = dict.get(PDFName_1.default.of('Length'));
        if (Length instanceof PDFNumber_1.default) {
            end = start + Length.asNumber();
            this.bytes.moveTo(end);
            this.skipWhitespaceAndComments();
            if (!this.matchKeyword(Keywords_1.Keywords.endstream)) {
                this.bytes.moveTo(start);
                end = this.findEndOfStreamFallback(startPos);
            }
        }
        else {
            end = this.findEndOfStreamFallback(startPos);
        }
        var contents = this.bytes.slice(start, end);
        return PDFRawStream_1.default.of(dict, contents);
    };
    PDFObjectParser.prototype.findEndOfStreamFallback = function (startPos) {
        // Move to end of stream, while handling nested streams
        var nestingLvl = 1;
        var end = this.bytes.offset();
        while (!this.bytes.done()) {
            end = this.bytes.offset();
            if (this.matchKeyword(Keywords_1.Keywords.stream)) {
                nestingLvl += 1;
            }
            else if (this.matchKeyword(Keywords_1.Keywords.EOF1endstream) ||
                this.matchKeyword(Keywords_1.Keywords.EOF2endstream) ||
                this.matchKeyword(Keywords_1.Keywords.EOF3endstream) ||
                this.matchKeyword(Keywords_1.Keywords.endstream)) {
                nestingLvl -= 1;
            }
            else {
                this.bytes.next();
            }
            if (nestingLvl === 0)
                break;
        }
        if (nestingLvl !== 0)
            throw new errors_1.PDFStreamParsingError(startPos);
        return end;
    };
    PDFObjectParser.forBytes = function (bytes, context, capNumbers) { return new PDFObjectParser(ByteStream_1.default.of(bytes), context, capNumbers); };
    PDFObjectParser.forByteStream = function (byteStream, context, capNumbers) {
        if (capNumbers === void 0) { capNumbers = false; }
        return new PDFObjectParser(byteStream, context, capNumbers);
    };
    return PDFObjectParser;
}(BaseParser_1.default));
exports.default = PDFObjectParser;
//# sourceMappingURL=PDFObjectParser.js.map