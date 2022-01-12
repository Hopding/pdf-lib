"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFAcroChoice_1 = tslib_1.__importDefault(require("./PDFAcroChoice"));
var flags_1 = require("./flags");
var PDFAcroComboBox = /** @class */ (function (_super) {
    tslib_1.__extends(PDFAcroComboBox, _super);
    function PDFAcroComboBox() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PDFAcroComboBox.fromDict = function (dict, ref) {
        return new PDFAcroComboBox(dict, ref);
    };
    PDFAcroComboBox.create = function (context) {
        var dict = context.obj({
            FT: 'Ch',
            Ff: flags_1.AcroChoiceFlags.Combo,
            Kids: [],
        });
        var ref = context.register(dict);
        return new PDFAcroComboBox(dict, ref);
    };
    return PDFAcroComboBox;
}(PDFAcroChoice_1.default));
exports.default = PDFAcroComboBox;
//# sourceMappingURL=PDFAcroComboBox.js.map