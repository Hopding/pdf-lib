"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../errors");
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var Numeric_1 = require("../syntax/Numeric");
var Whitespace_1 = require("../syntax/Whitespace");
var utils_1 = require("../../utils");
var Newline = CharCodes_1.default.Newline, CarriageReturn = CharCodes_1.default.CarriageReturn;
// TODO: Throw error if eof is reached before finishing object parse...
var BaseParser = /** @class */ (function () {
    function BaseParser(bytes, capNumbers) {
        if (capNumbers === void 0) { capNumbers = false; }
        this.bytes = bytes;
        this.capNumbers = capNumbers;
    }
    BaseParser.prototype.parseRawInt = function () {
        var value = '';
        while (!this.bytes.done()) {
            var byte = this.bytes.peek();
            if (!Numeric_1.IsDigit[byte])
                break;
            value += utils_1.charFromCode(this.bytes.next());
        }
        var numberValue = Number(value);
        if (!value || !isFinite(numberValue)) {
            throw new errors_1.NumberParsingError(this.bytes.position(), value);
        }
        return numberValue;
    };
    // TODO: Maybe handle exponential format?
    // TODO: Compare performance of string concatenation to charFromCode(...bytes)
    BaseParser.prototype.parseRawNumber = function () {
        var value = '';
        // Parse integer-part, the leading (+ | - | . | 0-9)
        while (!this.bytes.done()) {
            var byte = this.bytes.peek();
            if (!Numeric_1.IsNumeric[byte])
                break;
            value += utils_1.charFromCode(this.bytes.next());
            if (byte === CharCodes_1.default.Period)
                break;
        }
        // Parse decimal-part, the trailing (0-9)
        while (!this.bytes.done()) {
            var byte = this.bytes.peek();
            if (!Numeric_1.IsDigit[byte])
                break;
            value += utils_1.charFromCode(this.bytes.next());
        }
        var numberValue = Number(value);
        if (!value || !isFinite(numberValue)) {
            throw new errors_1.NumberParsingError(this.bytes.position(), value);
        }
        if (numberValue > Number.MAX_SAFE_INTEGER) {
            if (this.capNumbers) {
                var msg = "Parsed number that is too large for some PDF readers: " + value + ", using Number.MAX_SAFE_INTEGER instead.";
                console.warn(msg);
                return Number.MAX_SAFE_INTEGER;
            }
            else {
                var msg = "Parsed number that is too large for some PDF readers: " + value + ", not capping.";
                console.warn(msg);
            }
        }
        return numberValue;
    };
    BaseParser.prototype.skipWhitespace = function () {
        while (!this.bytes.done() && Whitespace_1.IsWhitespace[this.bytes.peek()]) {
            this.bytes.next();
        }
    };
    BaseParser.prototype.skipLine = function () {
        while (!this.bytes.done()) {
            var byte = this.bytes.peek();
            if (byte === Newline || byte === CarriageReturn)
                return;
            this.bytes.next();
        }
    };
    BaseParser.prototype.skipComment = function () {
        if (this.bytes.peek() !== CharCodes_1.default.Percent)
            return false;
        while (!this.bytes.done()) {
            var byte = this.bytes.peek();
            if (byte === Newline || byte === CarriageReturn)
                return true;
            this.bytes.next();
        }
        return true;
    };
    BaseParser.prototype.skipWhitespaceAndComments = function () {
        this.skipWhitespace();
        while (this.skipComment())
            this.skipWhitespace();
    };
    BaseParser.prototype.matchKeyword = function (keyword) {
        var initialOffset = this.bytes.offset();
        for (var idx = 0, len = keyword.length; idx < len; idx++) {
            if (this.bytes.done() || this.bytes.next() !== keyword[idx]) {
                this.bytes.moveTo(initialOffset);
                return false;
            }
        }
        return true;
    };
    return BaseParser;
}());
exports.default = BaseParser;
//# sourceMappingURL=BaseParser.js.map