"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFName_1 = tslib_1.__importDefault(require("./PDFName"));
var PDFNull_1 = tslib_1.__importDefault(require("./PDFNull"));
var PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var PDFDict = /** @class */ (function (_super) {
    tslib_1.__extends(PDFDict, _super);
    function PDFDict(map, context) {
        var _this = _super.call(this) || this;
        _this.dict = map;
        _this.context = context;
        return _this;
    }
    PDFDict.prototype.keys = function () {
        return Array.from(this.dict.keys());
    };
    PDFDict.prototype.values = function () {
        return Array.from(this.dict.values());
    };
    PDFDict.prototype.entries = function () {
        return Array.from(this.dict.entries());
    };
    PDFDict.prototype.set = function (key, value) {
        this.dict.set(key, value);
    };
    PDFDict.prototype.get = function (key, 
    // TODO: `preservePDFNull` is for backwards compatibility. Should be
    // removed in next breaking API change.
    preservePDFNull) {
        if (preservePDFNull === void 0) { preservePDFNull = false; }
        var value = this.dict.get(key);
        if (value === PDFNull_1.default && !preservePDFNull)
            return undefined;
        return value;
    };
    PDFDict.prototype.has = function (key) {
        var value = this.dict.get(key);
        return value !== undefined && value !== PDFNull_1.default;
    };
    PDFDict.prototype.lookupMaybe = function (key) {
        var _a;
        var types = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            types[_i - 1] = arguments[_i];
        }
        // TODO: `preservePDFNull` is for backwards compatibility. Should be
        // removed in next breaking API change.
        var preservePDFNull = types.includes(PDFNull_1.default);
        var value = (_a = this.context).lookupMaybe.apply(_a, tslib_1.__spreadArrays([this.get(key, preservePDFNull)], types));
        if (value === PDFNull_1.default && !preservePDFNull)
            return undefined;
        return value;
    };
    PDFDict.prototype.lookup = function (key) {
        var _a;
        var types = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            types[_i - 1] = arguments[_i];
        }
        // TODO: `preservePDFNull` is for backwards compatibility. Should be
        // removed in next breaking API change.
        var preservePDFNull = types.includes(PDFNull_1.default);
        var value = (_a = this.context).lookup.apply(_a, tslib_1.__spreadArrays([this.get(key, preservePDFNull)], types));
        if (value === PDFNull_1.default && !preservePDFNull)
            return undefined;
        return value;
    };
    PDFDict.prototype.delete = function (key) {
        return this.dict.delete(key);
    };
    PDFDict.prototype.asMap = function () {
        return new Map(this.dict);
    };
    /** Generate a random key that doesn't exist in current key set */
    PDFDict.prototype.uniqueKey = function (tag) {
        if (tag === void 0) { tag = ''; }
        var existingKeys = this.keys();
        var key = PDFName_1.default.of(this.context.addRandomSuffix(tag, 10));
        while (existingKeys.includes(key)) {
            key = PDFName_1.default.of(this.context.addRandomSuffix(tag, 10));
        }
        return key;
    };
    PDFDict.prototype.clone = function (context) {
        var clone = PDFDict.withContext(context || this.context);
        var entries = this.entries();
        for (var idx = 0, len = entries.length; idx < len; idx++) {
            var _a = entries[idx], key = _a[0], value = _a[1];
            clone.set(key, value);
        }
        return clone;
    };
    PDFDict.prototype.toString = function () {
        var dictString = '<<\n';
        var entries = this.entries();
        for (var idx = 0, len = entries.length; idx < len; idx++) {
            var _a = entries[idx], key = _a[0], value = _a[1];
            dictString += key.toString() + ' ' + value.toString() + '\n';
        }
        dictString += '>>';
        return dictString;
    };
    PDFDict.prototype.sizeInBytes = function () {
        var size = 5;
        var entries = this.entries();
        for (var idx = 0, len = entries.length; idx < len; idx++) {
            var _a = entries[idx], key = _a[0], value = _a[1];
            size += key.sizeInBytes() + value.sizeInBytes() + 2;
        }
        return size;
    };
    PDFDict.prototype.copyBytesInto = function (buffer, offset) {
        var initialOffset = offset;
        buffer[offset++] = CharCodes_1.default.LessThan;
        buffer[offset++] = CharCodes_1.default.LessThan;
        buffer[offset++] = CharCodes_1.default.Newline;
        var entries = this.entries();
        for (var idx = 0, len = entries.length; idx < len; idx++) {
            var _a = entries[idx], key = _a[0], value = _a[1];
            offset += key.copyBytesInto(buffer, offset);
            buffer[offset++] = CharCodes_1.default.Space;
            offset += value.copyBytesInto(buffer, offset);
            buffer[offset++] = CharCodes_1.default.Newline;
        }
        buffer[offset++] = CharCodes_1.default.GreaterThan;
        buffer[offset++] = CharCodes_1.default.GreaterThan;
        return offset - initialOffset;
    };
    PDFDict.withContext = function (context) { return new PDFDict(new Map(), context); };
    PDFDict.fromMapWithContext = function (map, context) {
        return new PDFDict(map, context);
    };
    return PDFDict;
}(PDFObject_1.default));
exports.default = PDFDict;
//# sourceMappingURL=PDFDict.js.map