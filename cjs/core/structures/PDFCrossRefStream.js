"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryType = void 0;
var tslib_1 = require("tslib");
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFRef_1 = tslib_1.__importDefault(require("../objects/PDFRef"));
var PDFFlateStream_1 = tslib_1.__importDefault(require("./PDFFlateStream"));
var utils_1 = require("../../utils");
var EntryType;
(function (EntryType) {
    EntryType[EntryType["Deleted"] = 0] = "Deleted";
    EntryType[EntryType["Uncompressed"] = 1] = "Uncompressed";
    EntryType[EntryType["Compressed"] = 2] = "Compressed";
})(EntryType = exports.EntryType || (exports.EntryType = {}));
/**
 * Entries should be added using the [[addDeletedEntry]],
 * [[addUncompressedEntry]], and [[addCompressedEntry]] methods
 * **in order of ascending object number**.
 */
var PDFCrossRefStream = /** @class */ (function (_super) {
    tslib_1.__extends(PDFCrossRefStream, _super);
    function PDFCrossRefStream(dict, entries, encode) {
        if (encode === void 0) { encode = true; }
        var _this = _super.call(this, dict, encode) || this;
        // Returns an array of integer pairs for each subsection of the cross ref
        // section, where each integer pair represents:
        //   firstObjectNumber(OfSection), length(OfSection)
        _this.computeIndex = function () {
            var subsections = [];
            var subsectionLength = 0;
            for (var idx = 0, len = _this.entries.length; idx < len; idx++) {
                var currEntry = _this.entries[idx];
                var prevEntry = _this.entries[idx - 1];
                if (idx === 0) {
                    subsections.push(currEntry.ref.objectNumber);
                }
                else if (currEntry.ref.objectNumber - prevEntry.ref.objectNumber > 1) {
                    subsections.push(subsectionLength);
                    subsections.push(currEntry.ref.objectNumber);
                    subsectionLength = 0;
                }
                subsectionLength += 1;
            }
            subsections.push(subsectionLength);
            return subsections;
        };
        _this.computeEntryTuples = function () {
            var entryTuples = new Array(_this.entries.length);
            for (var idx = 0, len = _this.entries.length; idx < len; idx++) {
                var entry = _this.entries[idx];
                if (entry.type === EntryType.Deleted) {
                    var type = entry.type, nextFreeObjectNumber = entry.nextFreeObjectNumber, ref = entry.ref;
                    entryTuples[idx] = [type, nextFreeObjectNumber, ref.generationNumber];
                }
                if (entry.type === EntryType.Uncompressed) {
                    var type = entry.type, offset = entry.offset, ref = entry.ref;
                    entryTuples[idx] = [type, offset, ref.generationNumber];
                }
                if (entry.type === EntryType.Compressed) {
                    var type = entry.type, objectStreamRef = entry.objectStreamRef, index = entry.index;
                    entryTuples[idx] = [type, objectStreamRef.objectNumber, index];
                }
            }
            return entryTuples;
        };
        _this.computeMaxEntryByteWidths = function () {
            var entryTuples = _this.entryTuplesCache.access();
            var widths = [0, 0, 0];
            for (var idx = 0, len = entryTuples.length; idx < len; idx++) {
                var _a = entryTuples[idx], first = _a[0], second = _a[1], third = _a[2];
                var firstSize = utils_1.sizeInBytes(first);
                var secondSize = utils_1.sizeInBytes(second);
                var thirdSize = utils_1.sizeInBytes(third);
                if (firstSize > widths[0])
                    widths[0] = firstSize;
                if (secondSize > widths[1])
                    widths[1] = secondSize;
                if (thirdSize > widths[2])
                    widths[2] = thirdSize;
            }
            return widths;
        };
        _this.entries = entries || [];
        _this.entryTuplesCache = utils_1.Cache.populatedBy(_this.computeEntryTuples);
        _this.maxByteWidthsCache = utils_1.Cache.populatedBy(_this.computeMaxEntryByteWidths);
        _this.indexCache = utils_1.Cache.populatedBy(_this.computeIndex);
        dict.set(PDFName_1.default.of('Type'), PDFName_1.default.of('XRef'));
        return _this;
    }
    PDFCrossRefStream.prototype.addDeletedEntry = function (ref, nextFreeObjectNumber) {
        var type = EntryType.Deleted;
        this.entries.push({ type: type, ref: ref, nextFreeObjectNumber: nextFreeObjectNumber });
        this.entryTuplesCache.invalidate();
        this.maxByteWidthsCache.invalidate();
        this.indexCache.invalidate();
        this.contentsCache.invalidate();
    };
    PDFCrossRefStream.prototype.addUncompressedEntry = function (ref, offset) {
        var type = EntryType.Uncompressed;
        this.entries.push({ type: type, ref: ref, offset: offset });
        this.entryTuplesCache.invalidate();
        this.maxByteWidthsCache.invalidate();
        this.indexCache.invalidate();
        this.contentsCache.invalidate();
    };
    PDFCrossRefStream.prototype.addCompressedEntry = function (ref, objectStreamRef, index) {
        var type = EntryType.Compressed;
        this.entries.push({ type: type, ref: ref, objectStreamRef: objectStreamRef, index: index });
        this.entryTuplesCache.invalidate();
        this.maxByteWidthsCache.invalidate();
        this.indexCache.invalidate();
        this.contentsCache.invalidate();
    };
    PDFCrossRefStream.prototype.clone = function (context) {
        var _a = this, dict = _a.dict, entries = _a.entries, encode = _a.encode;
        return PDFCrossRefStream.of(dict.clone(context), entries.slice(), encode);
    };
    PDFCrossRefStream.prototype.getContentsString = function () {
        var entryTuples = this.entryTuplesCache.access();
        var byteWidths = this.maxByteWidthsCache.access();
        var value = '';
        for (var entryIdx = 0, entriesLen = entryTuples.length; entryIdx < entriesLen; entryIdx++) {
            var _a = entryTuples[entryIdx], first = _a[0], second = _a[1], third = _a[2];
            var firstBytes = utils_1.reverseArray(utils_1.bytesFor(first));
            var secondBytes = utils_1.reverseArray(utils_1.bytesFor(second));
            var thirdBytes = utils_1.reverseArray(utils_1.bytesFor(third));
            for (var idx = byteWidths[0] - 1; idx >= 0; idx--) {
                value += (firstBytes[idx] || 0).toString(2);
            }
            for (var idx = byteWidths[1] - 1; idx >= 0; idx--) {
                value += (secondBytes[idx] || 0).toString(2);
            }
            for (var idx = byteWidths[2] - 1; idx >= 0; idx--) {
                value += (thirdBytes[idx] || 0).toString(2);
            }
        }
        return value;
    };
    PDFCrossRefStream.prototype.getUnencodedContents = function () {
        var entryTuples = this.entryTuplesCache.access();
        var byteWidths = this.maxByteWidthsCache.access();
        var buffer = new Uint8Array(this.getUnencodedContentsSize());
        var offset = 0;
        for (var entryIdx = 0, entriesLen = entryTuples.length; entryIdx < entriesLen; entryIdx++) {
            var _a = entryTuples[entryIdx], first = _a[0], second = _a[1], third = _a[2];
            var firstBytes = utils_1.reverseArray(utils_1.bytesFor(first));
            var secondBytes = utils_1.reverseArray(utils_1.bytesFor(second));
            var thirdBytes = utils_1.reverseArray(utils_1.bytesFor(third));
            for (var idx = byteWidths[0] - 1; idx >= 0; idx--) {
                buffer[offset++] = firstBytes[idx] || 0;
            }
            for (var idx = byteWidths[1] - 1; idx >= 0; idx--) {
                buffer[offset++] = secondBytes[idx] || 0;
            }
            for (var idx = byteWidths[2] - 1; idx >= 0; idx--) {
                buffer[offset++] = thirdBytes[idx] || 0;
            }
        }
        return buffer;
    };
    PDFCrossRefStream.prototype.getUnencodedContentsSize = function () {
        var byteWidths = this.maxByteWidthsCache.access();
        var entryWidth = utils_1.sum(byteWidths);
        return entryWidth * this.entries.length;
    };
    PDFCrossRefStream.prototype.updateDict = function () {
        _super.prototype.updateDict.call(this);
        var byteWidths = this.maxByteWidthsCache.access();
        var index = this.indexCache.access();
        var context = this.dict.context;
        this.dict.set(PDFName_1.default.of('W'), context.obj(byteWidths));
        this.dict.set(PDFName_1.default.of('Index'), context.obj(index));
    };
    PDFCrossRefStream.create = function (dict, encode) {
        if (encode === void 0) { encode = true; }
        var stream = new PDFCrossRefStream(dict, [], encode);
        stream.addDeletedEntry(PDFRef_1.default.of(0, 65535), 0);
        return stream;
    };
    PDFCrossRefStream.of = function (dict, entries, encode) {
        if (encode === void 0) { encode = true; }
        return new PDFCrossRefStream(dict, entries, encode);
    };
    return PDFCrossRefStream;
}(PDFFlateStream_1.default));
exports.default = PDFCrossRefStream;
//# sourceMappingURL=PDFCrossRefStream.js.map