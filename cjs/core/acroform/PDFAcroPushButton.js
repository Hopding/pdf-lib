"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFAcroButton_1 = tslib_1.__importDefault(require("./PDFAcroButton"));
var flags_1 = require("./flags");
var PDFAcroPushButton = /** @class */ (function (_super) {
    tslib_1.__extends(PDFAcroPushButton, _super);
    function PDFAcroPushButton() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PDFAcroPushButton.fromDict = function (dict, ref) {
        return new PDFAcroPushButton(dict, ref);
    };
    PDFAcroPushButton.create = function (context) {
        var dict = context.obj({
            FT: 'Btn',
            Ff: flags_1.AcroButtonFlags.PushButton,
            Kids: [],
        });
        var ref = context.register(dict);
        return new PDFAcroPushButton(dict, ref);
    };
    return PDFAcroPushButton;
}(PDFAcroButton_1.default));
exports.default = PDFAcroPushButton;
//# sourceMappingURL=PDFAcroPushButton.js.map