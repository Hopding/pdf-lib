"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFRef_1 = tslib_1.__importDefault(require("../objects/PDFRef"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var utils_1 = require("../../utils");
/**
 * Entries should be added using the [[addEntry]] and [[addDeletedEntry]]
 * methods **in order of ascending object number**.
 */
var PDFCrossRefSection = /** @class */ (function () {
    function PDFCrossRefSection(firstEntry) {
        this.subsections = firstEntry ? [[firstEntry]] : [];
        this.chunkIdx = 0;
        this.chunkLength = firstEntry ? 1 : 0;
    }
    PDFCrossRefSection.prototype.addEntry = function (ref, offset) {
        this.append({ ref: ref, offset: offset, deleted: false });
    };
    PDFCrossRefSection.prototype.addDeletedEntry = function (ref, nextFreeObjectNumber) {
        this.append({ ref: ref, offset: nextFreeObjectNumber, deleted: true });
    };
    PDFCrossRefSection.prototype.toString = function () {
        var section = "xref\n";
        for (var rangeIdx = 0, rangeLen = this.subsections.length; rangeIdx < rangeLen; rangeIdx++) {
            var range = this.subsections[rangeIdx];
            section += range[0].ref.objectNumber + " " + range.length + "\n";
            for (var entryIdx = 0, entryLen = range.length; entryIdx < entryLen; entryIdx++) {
                var entry = range[entryIdx];
                section += utils_1.padStart(String(entry.offset), 10, '0');
                section += ' ';
                section += utils_1.padStart(String(entry.ref.generationNumber), 5, '0');
                section += ' ';
                section += entry.deleted ? 'f' : 'n';
                section += ' \n';
            }
        }
        return section;
    };
    PDFCrossRefSection.prototype.sizeInBytes = function () {
        var size = 5;
        for (var idx = 0, len = this.subsections.length; idx < len; idx++) {
            var subsection = this.subsections[idx];
            var subsectionLength = subsection.length;
            var firstEntry = subsection[0];
            size += 2;
            size += String(firstEntry.ref.objectNumber).length;
            size += String(subsectionLength).length;
            size += 20 * subsectionLength;
        }
        return size;
    };
    PDFCrossRefSection.prototype.copyBytesInto = function (buffer, offset) {
        var initialOffset = offset;
        buffer[offset++] = CharCodes_1.default.x;
        buffer[offset++] = CharCodes_1.default.r;
        buffer[offset++] = CharCodes_1.default.e;
        buffer[offset++] = CharCodes_1.default.f;
        buffer[offset++] = CharCodes_1.default.Newline;
        offset += this.copySubsectionsIntoBuffer(this.subsections, buffer, offset);
        return offset - initialOffset;
    };
    PDFCrossRefSection.prototype.copySubsectionsIntoBuffer = function (subsections, buffer, offset) {
        var initialOffset = offset;
        var length = subsections.length;
        for (var idx = 0; idx < length; idx++) {
            var subsection = this.subsections[idx];
            var firstObjectNumber = String(subsection[0].ref.objectNumber);
            offset += utils_1.copyStringIntoBuffer(firstObjectNumber, buffer, offset);
            buffer[offset++] = CharCodes_1.default.Space;
            var rangeLength = String(subsection.length);
            offset += utils_1.copyStringIntoBuffer(rangeLength, buffer, offset);
            buffer[offset++] = CharCodes_1.default.Newline;
            offset += this.copyEntriesIntoBuffer(subsection, buffer, offset);
        }
        return offset - initialOffset;
    };
    PDFCrossRefSection.prototype.copyEntriesIntoBuffer = function (entries, buffer, offset) {
        var length = entries.length;
        for (var idx = 0; idx < length; idx++) {
            var entry = entries[idx];
            var entryOffset = utils_1.padStart(String(entry.offset), 10, '0');
            offset += utils_1.copyStringIntoBuffer(entryOffset, buffer, offset);
            buffer[offset++] = CharCodes_1.default.Space;
            var entryGen = utils_1.padStart(String(entry.ref.generationNumber), 5, '0');
            offset += utils_1.copyStringIntoBuffer(entryGen, buffer, offset);
            buffer[offset++] = CharCodes_1.default.Space;
            buffer[offset++] = entry.deleted ? CharCodes_1.default.f : CharCodes_1.default.n;
            buffer[offset++] = CharCodes_1.default.Space;
            buffer[offset++] = CharCodes_1.default.Newline;
        }
        return 20 * length;
    };
    PDFCrossRefSection.prototype.append = function (currEntry) {
        if (this.chunkLength === 0) {
            this.subsections.push([currEntry]);
            this.chunkIdx = 0;
            this.chunkLength = 1;
            return;
        }
        var chunk = this.subsections[this.chunkIdx];
        var prevEntry = chunk[this.chunkLength - 1];
        if (currEntry.ref.objectNumber - prevEntry.ref.objectNumber > 1) {
            this.subsections.push([currEntry]);
            this.chunkIdx += 1;
            this.chunkLength = 1;
        }
        else {
            chunk.push(currEntry);
            this.chunkLength += 1;
        }
    };
    PDFCrossRefSection.create = function () {
        return new PDFCrossRefSection({
            ref: PDFRef_1.default.of(0, 65535),
            offset: 0,
            deleted: true,
        });
    };
    PDFCrossRefSection.createEmpty = function () { return new PDFCrossRefSection(); };
    return PDFCrossRefSection;
}());
exports.default = PDFCrossRefSection;
//# sourceMappingURL=PDFCrossRefSection.js.map