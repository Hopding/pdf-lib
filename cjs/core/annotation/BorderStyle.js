"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
// TODO: Also handle the `/S` and `/D` entries
var BorderStyle = /** @class */ (function () {
    function BorderStyle(dict) {
        this.dict = dict;
    }
    BorderStyle.prototype.W = function () {
        var W = this.dict.lookup(PDFName_1.default.of('W'));
        if (W instanceof PDFNumber_1.default)
            return W;
        return undefined;
    };
    BorderStyle.prototype.getWidth = function () {
        var _a, _b;
        return (_b = (_a = this.W()) === null || _a === void 0 ? void 0 : _a.asNumber()) !== null && _b !== void 0 ? _b : 1;
    };
    BorderStyle.prototype.setWidth = function (width) {
        var W = this.dict.context.obj(width);
        this.dict.set(PDFName_1.default.of('W'), W);
    };
    BorderStyle.fromDict = function (dict) { return new BorderStyle(dict); };
    return BorderStyle;
}());
exports.default = BorderStyle;
//# sourceMappingURL=BorderStyle.js.map