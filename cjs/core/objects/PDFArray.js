"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFNumber_1 = tslib_1.__importDefault(require("./PDFNumber"));
var PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var errors_1 = require("../errors");
var PDFArray = /** @class */ (function (_super) {
    tslib_1.__extends(PDFArray, _super);
    function PDFArray(context) {
        var _this = _super.call(this) || this;
        _this.array = [];
        _this.context = context;
        return _this;
    }
    PDFArray.prototype.size = function () {
        return this.array.length;
    };
    PDFArray.prototype.push = function (object) {
        this.array.push(object);
    };
    PDFArray.prototype.insert = function (index, object) {
        this.array.splice(index, 0, object);
    };
    PDFArray.prototype.indexOf = function (object) {
        var index = this.array.indexOf(object);
        return index === -1 ? undefined : index;
    };
    PDFArray.prototype.remove = function (index) {
        this.array.splice(index, 1);
    };
    PDFArray.prototype.set = function (idx, object) {
        this.array[idx] = object;
    };
    PDFArray.prototype.get = function (index) {
        return this.array[index];
    };
    PDFArray.prototype.lookupMaybe = function (index) {
        var _a;
        var types = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            types[_i - 1] = arguments[_i];
        }
        return (_a = this.context).lookupMaybe.apply(_a, tslib_1.__spreadArrays([this.get(index)], types));
    };
    PDFArray.prototype.lookup = function (index) {
        var _a;
        var types = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            types[_i - 1] = arguments[_i];
        }
        return (_a = this.context).lookup.apply(_a, tslib_1.__spreadArrays([this.get(index)], types));
    };
    PDFArray.prototype.asRectangle = function () {
        if (this.size() !== 4)
            throw new errors_1.PDFArrayIsNotRectangleError(this.size());
        var lowerLeftX = this.lookup(0, PDFNumber_1.default).asNumber();
        var lowerLeftY = this.lookup(1, PDFNumber_1.default).asNumber();
        var upperRightX = this.lookup(2, PDFNumber_1.default).asNumber();
        var upperRightY = this.lookup(3, PDFNumber_1.default).asNumber();
        var x = lowerLeftX;
        var y = lowerLeftY;
        var width = upperRightX - lowerLeftX;
        var height = upperRightY - lowerLeftY;
        return { x: x, y: y, width: width, height: height };
    };
    PDFArray.prototype.asArray = function () {
        return this.array.slice();
    };
    PDFArray.prototype.clone = function (context) {
        var clone = PDFArray.withContext(context || this.context);
        for (var idx = 0, len = this.size(); idx < len; idx++) {
            clone.push(this.array[idx]);
        }
        return clone;
    };
    PDFArray.prototype.toString = function () {
        var arrayString = '[ ';
        for (var idx = 0, len = this.size(); idx < len; idx++) {
            arrayString += this.get(idx).toString();
            arrayString += ' ';
        }
        arrayString += ']';
        return arrayString;
    };
    PDFArray.prototype.sizeInBytes = function () {
        var size = 3;
        for (var idx = 0, len = this.size(); idx < len; idx++) {
            size += this.get(idx).sizeInBytes() + 1;
        }
        return size;
    };
    PDFArray.prototype.copyBytesInto = function (buffer, offset) {
        var initialOffset = offset;
        buffer[offset++] = CharCodes_1.default.LeftSquareBracket;
        buffer[offset++] = CharCodes_1.default.Space;
        for (var idx = 0, len = this.size(); idx < len; idx++) {
            offset += this.get(idx).copyBytesInto(buffer, offset);
            buffer[offset++] = CharCodes_1.default.Space;
        }
        buffer[offset++] = CharCodes_1.default.RightSquareBracket;
        return offset - initialOffset;
    };
    PDFArray.prototype.scalePDFNumbers = function (x, y) {
        for (var idx = 0, len = this.size(); idx < len; idx++) {
            var el = this.lookup(idx);
            if (el instanceof PDFNumber_1.default) {
                var factor = idx % 2 === 0 ? x : y;
                this.set(idx, PDFNumber_1.default.of(el.asNumber() * factor));
            }
        }
    };
    PDFArray.withContext = function (context) { return new PDFArray(context); };
    return PDFArray;
}(PDFObject_1.default));
exports.default = PDFArray;
//# sourceMappingURL=PDFArray.js.map