"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFAcroButton_1 = tslib_1.__importDefault(require("./PDFAcroButton"));
var flags_1 = require("./flags");
var errors_1 = require("../errors");
var PDFAcroRadioButton = /** @class */ (function (_super) {
    tslib_1.__extends(PDFAcroRadioButton, _super);
    function PDFAcroRadioButton() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PDFAcroRadioButton.prototype.setValue = function (value) {
        var onValues = this.getOnValues();
        if (!onValues.includes(value) && value !== PDFName_1.default.of('Off')) {
            throw new errors_1.InvalidAcroFieldValueError();
        }
        this.dict.set(PDFName_1.default.of('V'), value);
        var widgets = this.getWidgets();
        for (var idx = 0, len = widgets.length; idx < len; idx++) {
            var widget = widgets[idx];
            var state = widget.getOnValue() === value ? value : PDFName_1.default.of('Off');
            widget.setAppearanceState(state);
        }
    };
    PDFAcroRadioButton.prototype.getValue = function () {
        var v = this.V();
        if (v instanceof PDFName_1.default)
            return v;
        return PDFName_1.default.of('Off');
    };
    PDFAcroRadioButton.prototype.getOnValues = function () {
        var widgets = this.getWidgets();
        var onValues = [];
        for (var idx = 0, len = widgets.length; idx < len; idx++) {
            var onValue = widgets[idx].getOnValue();
            if (onValue)
                onValues.push(onValue);
        }
        return onValues;
    };
    PDFAcroRadioButton.fromDict = function (dict, ref) {
        return new PDFAcroRadioButton(dict, ref);
    };
    PDFAcroRadioButton.create = function (context) {
        var dict = context.obj({
            FT: 'Btn',
            Ff: flags_1.AcroButtonFlags.Radio,
            Kids: [],
        });
        var ref = context.register(dict);
        return new PDFAcroRadioButton(dict, ref);
    };
    return PDFAcroRadioButton;
}(PDFAcroButton_1.default));
exports.default = PDFAcroRadioButton;
//# sourceMappingURL=PDFAcroRadioButton.js.map