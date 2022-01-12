"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodePDFRawStream = void 0;
var tslib_1 = require("tslib");
var errors_1 = require("../errors");
var PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
var PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
var Ascii85Stream_1 = tslib_1.__importDefault(require("./Ascii85Stream"));
var AsciiHexStream_1 = tslib_1.__importDefault(require("./AsciiHexStream"));
var FlateStream_1 = tslib_1.__importDefault(require("./FlateStream"));
var LZWStream_1 = tslib_1.__importDefault(require("./LZWStream"));
var RunLengthStream_1 = tslib_1.__importDefault(require("./RunLengthStream"));
var Stream_1 = tslib_1.__importDefault(require("./Stream"));
var decodeStream = function (stream, encoding, params) {
    if (encoding === PDFName_1.default.of('FlateDecode')) {
        return new FlateStream_1.default(stream);
    }
    if (encoding === PDFName_1.default.of('LZWDecode')) {
        var earlyChange = 1;
        if (params instanceof PDFDict_1.default) {
            var EarlyChange = params.lookup(PDFName_1.default.of('EarlyChange'));
            if (EarlyChange instanceof PDFNumber_1.default) {
                earlyChange = EarlyChange.asNumber();
            }
        }
        return new LZWStream_1.default(stream, undefined, earlyChange);
    }
    if (encoding === PDFName_1.default.of('ASCII85Decode')) {
        return new Ascii85Stream_1.default(stream);
    }
    if (encoding === PDFName_1.default.of('ASCIIHexDecode')) {
        return new AsciiHexStream_1.default(stream);
    }
    if (encoding === PDFName_1.default.of('RunLengthDecode')) {
        return new RunLengthStream_1.default(stream);
    }
    throw new errors_1.UnsupportedEncodingError(encoding.asString());
};
exports.decodePDFRawStream = function (_a) {
    var dict = _a.dict, contents = _a.contents;
    var stream = new Stream_1.default(contents);
    var Filter = dict.lookup(PDFName_1.default.of('Filter'));
    var DecodeParms = dict.lookup(PDFName_1.default.of('DecodeParms'));
    if (Filter instanceof PDFName_1.default) {
        stream = decodeStream(stream, Filter, DecodeParms);
    }
    else if (Filter instanceof PDFArray_1.default) {
        for (var idx = 0, len = Filter.size(); idx < len; idx++) {
            stream = decodeStream(stream, Filter.lookup(idx, PDFName_1.default), DecodeParms && DecodeParms.lookupMaybe(idx, PDFDict_1.default));
        }
    }
    else if (!!Filter) {
        throw new errors_1.UnexpectedObjectTypeError([PDFName_1.default, PDFArray_1.default], Filter);
    }
    return stream;
};
//# sourceMappingURL=decode.js.map