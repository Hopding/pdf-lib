"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFRef_1 = tslib_1.__importDefault(require("../objects/PDFRef"));
var PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
var PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
var BorderStyle_1 = tslib_1.__importDefault(require("./BorderStyle"));
var PDFAnnotation_1 = tslib_1.__importDefault(require("./PDFAnnotation"));
var AppearanceCharacteristics_1 = tslib_1.__importDefault(require("./AppearanceCharacteristics"));
var PDFWidgetAnnotation = /** @class */ (function (_super) {
    tslib_1.__extends(PDFWidgetAnnotation, _super);
    function PDFWidgetAnnotation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PDFWidgetAnnotation.prototype.MK = function () {
        var MK = this.dict.lookup(PDFName_1.default.of('MK'));
        if (MK instanceof PDFDict_1.default)
            return MK;
        return undefined;
    };
    PDFWidgetAnnotation.prototype.BS = function () {
        var BS = this.dict.lookup(PDFName_1.default.of('BS'));
        if (BS instanceof PDFDict_1.default)
            return BS;
        return undefined;
    };
    PDFWidgetAnnotation.prototype.DA = function () {
        var da = this.dict.lookup(PDFName_1.default.of('DA'));
        if (da instanceof PDFString_1.default || da instanceof PDFHexString_1.default)
            return da;
        return undefined;
    };
    PDFWidgetAnnotation.prototype.P = function () {
        var P = this.dict.get(PDFName_1.default.of('P'));
        if (P instanceof PDFRef_1.default)
            return P;
        return undefined;
    };
    PDFWidgetAnnotation.prototype.setP = function (page) {
        this.dict.set(PDFName_1.default.of('P'), page);
    };
    PDFWidgetAnnotation.prototype.setDefaultAppearance = function (appearance) {
        this.dict.set(PDFName_1.default.of('DA'), PDFString_1.default.of(appearance));
    };
    PDFWidgetAnnotation.prototype.getDefaultAppearance = function () {
        var DA = this.DA();
        if (DA instanceof PDFHexString_1.default) {
            return DA.decodeText();
        }
        return DA === null || DA === void 0 ? void 0 : DA.asString();
    };
    PDFWidgetAnnotation.prototype.getAppearanceCharacteristics = function () {
        var MK = this.MK();
        if (MK)
            return AppearanceCharacteristics_1.default.fromDict(MK);
        return undefined;
    };
    PDFWidgetAnnotation.prototype.getOrCreateAppearanceCharacteristics = function () {
        var MK = this.MK();
        if (MK)
            return AppearanceCharacteristics_1.default.fromDict(MK);
        var ac = AppearanceCharacteristics_1.default.fromDict(this.dict.context.obj({}));
        this.dict.set(PDFName_1.default.of('MK'), ac.dict);
        return ac;
    };
    PDFWidgetAnnotation.prototype.getBorderStyle = function () {
        var BS = this.BS();
        if (BS)
            return BorderStyle_1.default.fromDict(BS);
        return undefined;
    };
    PDFWidgetAnnotation.prototype.getOrCreateBorderStyle = function () {
        var BS = this.BS();
        if (BS)
            return BorderStyle_1.default.fromDict(BS);
        var bs = BorderStyle_1.default.fromDict(this.dict.context.obj({}));
        this.dict.set(PDFName_1.default.of('BS'), bs.dict);
        return bs;
    };
    PDFWidgetAnnotation.prototype.getOnValue = function () {
        var _a;
        var normal = (_a = this.getAppearances()) === null || _a === void 0 ? void 0 : _a.normal;
        if (normal instanceof PDFDict_1.default) {
            var keys = normal.keys();
            for (var idx = 0, len = keys.length; idx < len; idx++) {
                var key = keys[idx];
                if (key !== PDFName_1.default.of('Off'))
                    return key;
            }
        }
        return undefined;
    };
    PDFWidgetAnnotation.fromDict = function (dict) {
        return new PDFWidgetAnnotation(dict);
    };
    PDFWidgetAnnotation.create = function (context, parent) {
        var dict = context.obj({
            Type: 'Annot',
            Subtype: 'Widget',
            Rect: [0, 0, 0, 0],
            Parent: parent,
        });
        return new PDFWidgetAnnotation(dict);
    };
    return PDFWidgetAnnotation;
}(PDFAnnotation_1.default));
exports.default = PDFWidgetAnnotation;
//# sourceMappingURL=PDFWidgetAnnotation.js.map