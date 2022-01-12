"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
var PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
var PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
var PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
var AppearanceCharacteristics = /** @class */ (function () {
    function AppearanceCharacteristics(dict) {
        this.dict = dict;
    }
    AppearanceCharacteristics.prototype.R = function () {
        var R = this.dict.lookup(PDFName_1.default.of('R'));
        if (R instanceof PDFNumber_1.default)
            return R;
        return undefined;
    };
    AppearanceCharacteristics.prototype.BC = function () {
        var BC = this.dict.lookup(PDFName_1.default.of('BC'));
        if (BC instanceof PDFArray_1.default)
            return BC;
        return undefined;
    };
    AppearanceCharacteristics.prototype.BG = function () {
        var BG = this.dict.lookup(PDFName_1.default.of('BG'));
        if (BG instanceof PDFArray_1.default)
            return BG;
        return undefined;
    };
    AppearanceCharacteristics.prototype.CA = function () {
        var CA = this.dict.lookup(PDFName_1.default.of('CA'));
        if (CA instanceof PDFHexString_1.default || CA instanceof PDFString_1.default)
            return CA;
        return undefined;
    };
    AppearanceCharacteristics.prototype.RC = function () {
        var RC = this.dict.lookup(PDFName_1.default.of('RC'));
        if (RC instanceof PDFHexString_1.default || RC instanceof PDFString_1.default)
            return RC;
        return undefined;
    };
    AppearanceCharacteristics.prototype.AC = function () {
        var AC = this.dict.lookup(PDFName_1.default.of('AC'));
        if (AC instanceof PDFHexString_1.default || AC instanceof PDFString_1.default)
            return AC;
        return undefined;
    };
    AppearanceCharacteristics.prototype.getRotation = function () {
        var _a;
        return (_a = this.R()) === null || _a === void 0 ? void 0 : _a.asNumber();
    };
    AppearanceCharacteristics.prototype.getBorderColor = function () {
        var BC = this.BC();
        if (!BC)
            return undefined;
        var components = [];
        for (var idx = 0, len = BC === null || BC === void 0 ? void 0 : BC.size(); idx < len; idx++) {
            var component = BC.get(idx);
            if (component instanceof PDFNumber_1.default)
                components.push(component.asNumber());
        }
        return components;
    };
    AppearanceCharacteristics.prototype.getBackgroundColor = function () {
        var BG = this.BG();
        if (!BG)
            return undefined;
        var components = [];
        for (var idx = 0, len = BG === null || BG === void 0 ? void 0 : BG.size(); idx < len; idx++) {
            var component = BG.get(idx);
            if (component instanceof PDFNumber_1.default)
                components.push(component.asNumber());
        }
        return components;
    };
    AppearanceCharacteristics.prototype.getCaptions = function () {
        var CA = this.CA();
        var RC = this.RC();
        var AC = this.AC();
        return {
            normal: CA === null || CA === void 0 ? void 0 : CA.decodeText(),
            rollover: RC === null || RC === void 0 ? void 0 : RC.decodeText(),
            down: AC === null || AC === void 0 ? void 0 : AC.decodeText(),
        };
    };
    AppearanceCharacteristics.prototype.setRotation = function (rotation) {
        var R = this.dict.context.obj(rotation);
        this.dict.set(PDFName_1.default.of('R'), R);
    };
    AppearanceCharacteristics.prototype.setBorderColor = function (color) {
        var BC = this.dict.context.obj(color);
        this.dict.set(PDFName_1.default.of('BC'), BC);
    };
    AppearanceCharacteristics.prototype.setBackgroundColor = function (color) {
        var BG = this.dict.context.obj(color);
        this.dict.set(PDFName_1.default.of('BG'), BG);
    };
    AppearanceCharacteristics.prototype.setCaptions = function (captions) {
        var CA = PDFHexString_1.default.fromText(captions.normal);
        this.dict.set(PDFName_1.default.of('CA'), CA);
        if (captions.rollover) {
            var RC = PDFHexString_1.default.fromText(captions.rollover);
            this.dict.set(PDFName_1.default.of('RC'), RC);
        }
        else {
            this.dict.delete(PDFName_1.default.of('RC'));
        }
        if (captions.down) {
            var AC = PDFHexString_1.default.fromText(captions.down);
            this.dict.set(PDFName_1.default.of('AC'), AC);
        }
        else {
            this.dict.delete(PDFName_1.default.of('AC'));
        }
    };
    AppearanceCharacteristics.fromDict = function (dict) {
        return new AppearanceCharacteristics(dict);
    };
    return AppearanceCharacteristics;
}());
exports.default = AppearanceCharacteristics;
//# sourceMappingURL=AppearanceCharacteristics.js.map