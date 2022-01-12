"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFArray_1 = tslib_1.__importDefault(require("./objects/PDFArray"));
var PDFDict_1 = tslib_1.__importDefault(require("./objects/PDFDict"));
var PDFName_1 = tslib_1.__importDefault(require("./objects/PDFName"));
var PDFRef_1 = tslib_1.__importDefault(require("./objects/PDFRef"));
var PDFStream_1 = tslib_1.__importDefault(require("./objects/PDFStream"));
var PDFPageLeaf_1 = tslib_1.__importDefault(require("./structures/PDFPageLeaf"));
/**
 * PDFObjectCopier copies PDFObjects from a src context to a dest context.
 * The primary use case for this is to copy pages between PDFs.
 *
 * _Copying_ an object with a PDFObjectCopier is different from _cloning_ an
 * object with its [[PDFObject.clone]] method:
 *
 * ```
 *   const src: PDFContext = ...
 *   const dest: PDFContext = ...
 *   const originalObject: PDFObject = ...
 *   const copiedObject = PDFObjectCopier.for(src, dest).copy(originalObject);
 *   const clonedObject = originalObject.clone();
 * ```
 *
 * Copying an object is equivalent to cloning it and then copying over any other
 * objects that it references. Note that only dictionaries, arrays, and streams
 * (or structures build from them) can contain indirect references to other
 * objects. Copying a PDFObject that is not a dictionary, array, or stream is
 * supported, but is equivalent to cloning it.
 */
var PDFObjectCopier = /** @class */ (function () {
    function PDFObjectCopier(src, dest) {
        var _this = this;
        this.traversedObjects = new Map();
        // prettier-ignore
        this.copy = function (object) { return (object instanceof PDFPageLeaf_1.default ? _this.copyPDFPage(object)
            : object instanceof PDFDict_1.default ? _this.copyPDFDict(object)
                : object instanceof PDFArray_1.default ? _this.copyPDFArray(object)
                    : object instanceof PDFStream_1.default ? _this.copyPDFStream(object)
                        : object instanceof PDFRef_1.default ? _this.copyPDFIndirectObject(object)
                            : object.clone()); };
        this.copyPDFPage = function (originalPage) {
            var clonedPage = originalPage.clone();
            // Move any entries that the originalPage is inheriting from its parent
            // tree nodes directly into originalPage so they are preserved during
            // the copy.
            var InheritableEntries = PDFPageLeaf_1.default.InheritableEntries;
            for (var idx = 0, len = InheritableEntries.length; idx < len; idx++) {
                var key = PDFName_1.default.of(InheritableEntries[idx]);
                var value = clonedPage.getInheritableAttribute(key);
                if (!clonedPage.get(key) && value)
                    clonedPage.set(key, value);
            }
            // Remove the parent reference to prevent the whole donor document's page
            // tree from being copied when we only need a single page.
            clonedPage.delete(PDFName_1.default.of('Parent'));
            return _this.copyPDFDict(clonedPage);
        };
        this.copyPDFDict = function (originalDict) {
            if (_this.traversedObjects.has(originalDict)) {
                return _this.traversedObjects.get(originalDict);
            }
            var clonedDict = originalDict.clone(_this.dest);
            _this.traversedObjects.set(originalDict, clonedDict);
            var entries = originalDict.entries();
            for (var idx = 0, len = entries.length; idx < len; idx++) {
                var _a = entries[idx], key = _a[0], value = _a[1];
                clonedDict.set(key, _this.copy(value));
            }
            return clonedDict;
        };
        this.copyPDFArray = function (originalArray) {
            if (_this.traversedObjects.has(originalArray)) {
                return _this.traversedObjects.get(originalArray);
            }
            var clonedArray = originalArray.clone(_this.dest);
            _this.traversedObjects.set(originalArray, clonedArray);
            for (var idx = 0, len = originalArray.size(); idx < len; idx++) {
                var value = originalArray.get(idx);
                clonedArray.set(idx, _this.copy(value));
            }
            return clonedArray;
        };
        this.copyPDFStream = function (originalStream) {
            if (_this.traversedObjects.has(originalStream)) {
                return _this.traversedObjects.get(originalStream);
            }
            var clonedStream = originalStream.clone(_this.dest);
            _this.traversedObjects.set(originalStream, clonedStream);
            var entries = originalStream.dict.entries();
            for (var idx = 0, len = entries.length; idx < len; idx++) {
                var _a = entries[idx], key = _a[0], value = _a[1];
                clonedStream.dict.set(key, _this.copy(value));
            }
            return clonedStream;
        };
        this.copyPDFIndirectObject = function (ref) {
            var alreadyMapped = _this.traversedObjects.has(ref);
            if (!alreadyMapped) {
                var newRef = _this.dest.nextRef();
                _this.traversedObjects.set(ref, newRef);
                var dereferencedValue = _this.src.lookup(ref);
                if (dereferencedValue) {
                    var cloned = _this.copy(dereferencedValue);
                    _this.dest.assign(newRef, cloned);
                }
            }
            return _this.traversedObjects.get(ref);
        };
        this.src = src;
        this.dest = dest;
    }
    PDFObjectCopier.for = function (src, dest) {
        return new PDFObjectCopier(src, dest);
    };
    return PDFObjectCopier;
}());
exports.default = PDFObjectCopier;
//# sourceMappingURL=PDFObjectCopier.js.map