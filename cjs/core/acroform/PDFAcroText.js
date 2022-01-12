"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
var PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
var PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFAcroTerminal_1 = tslib_1.__importDefault(require("./PDFAcroTerminal"));
var PDFAcroText = /** @class */ (function (_super) {
    tslib_1.__extends(PDFAcroText, _super);
    function PDFAcroText() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PDFAcroText.prototype.MaxLen = function () {
        var maxLen = this.dict.lookup(PDFName_1.default.of('MaxLen'));
        if (maxLen instanceof PDFNumber_1.default)
            return maxLen;
        return undefined;
    };
    PDFAcroText.prototype.Q = function () {
        var q = this.dict.lookup(PDFName_1.default.of('Q'));
        if (q instanceof PDFNumber_1.default)
            return q;
        return undefined;
    };
    PDFAcroText.prototype.setMaxLength = function (maxLength) {
        this.dict.set(PDFName_1.default.of('MaxLen'), PDFNumber_1.default.of(maxLength));
    };
    PDFAcroText.prototype.removeMaxLength = function () {
        this.dict.delete(PDFName_1.default.of('MaxLen'));
    };
    PDFAcroText.prototype.getMaxLength = function () {
        var _a;
        return (_a = this.MaxLen()) === null || _a === void 0 ? void 0 : _a.asNumber();
    };
    PDFAcroText.prototype.setQuadding = function (quadding) {
        this.dict.set(PDFName_1.default.of('Q'), PDFNumber_1.default.of(quadding));
    };
    PDFAcroText.prototype.getQuadding = function () {
        var _a;
        return (_a = this.Q()) === null || _a === void 0 ? void 0 : _a.asNumber();
    };
    PDFAcroText.prototype.setValue = function (value) {
        this.dict.set(PDFName_1.default.of('V'), value);
        // const widgets = this.getWidgets();
        // for (let idx = 0, len = widgets.length; idx < len; idx++) {
        //   const widget = widgets[idx];
        //   const state = widget.getOnValue() === value ? value : PDFName.of('Off');
        //   widget.setAppearanceState(state);
        // }
    };
    PDFAcroText.prototype.removeValue = function () {
        this.dict.delete(PDFName_1.default.of('V'));
    };
    PDFAcroText.prototype.getValue = function () {
        var v = this.V();
        if (v instanceof PDFString_1.default || v instanceof PDFHexString_1.default)
            return v;
        return undefined;
    };
    PDFAcroText.fromDict = function (dict, ref) { return new PDFAcroText(dict, ref); };
    PDFAcroText.create = function (context) {
        var dict = context.obj({
            FT: 'Tx',
            Kids: [],
        });
        var ref = context.register(dict);
        return new PDFAcroText(dict, ref);
    };
    return PDFAcroText;
}(PDFAcroTerminal_1.default));
exports.default = PDFAcroText;
//# sourceMappingURL=PDFAcroText.js.map