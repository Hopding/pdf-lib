"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFAcroButton_1 = tslib_1.__importDefault(require("./PDFAcroButton"));
var errors_1 = require("../errors");
var PDFAcroCheckBox = /** @class */ (function (_super) {
    tslib_1.__extends(PDFAcroCheckBox, _super);
    function PDFAcroCheckBox() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PDFAcroCheckBox.prototype.setValue = function (value) {
        var _a;
        var onValue = (_a = this.getOnValue()) !== null && _a !== void 0 ? _a : PDFName_1.default.of('Yes');
        if (value !== onValue && value !== PDFName_1.default.of('Off')) {
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
    PDFAcroCheckBox.prototype.getValue = function () {
        var v = this.V();
        if (v instanceof PDFName_1.default)
            return v;
        return PDFName_1.default.of('Off');
    };
    PDFAcroCheckBox.prototype.getOnValue = function () {
        var widget = this.getWidgets()[0];
        return widget === null || widget === void 0 ? void 0 : widget.getOnValue();
    };
    PDFAcroCheckBox.fromDict = function (dict, ref) {
        return new PDFAcroCheckBox(dict, ref);
    };
    PDFAcroCheckBox.create = function (context) {
        var dict = context.obj({
            FT: 'Btn',
            Kids: [],
        });
        var ref = context.register(dict);
        return new PDFAcroCheckBox(dict, ref);
    };
    return PDFAcroCheckBox;
}(PDFAcroButton_1.default));
exports.default = PDFAcroCheckBox;
//# sourceMappingURL=PDFAcroCheckBox.js.map