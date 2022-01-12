"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFAcroChoice_1 = tslib_1.__importDefault(require("./PDFAcroChoice"));
var PDFAcroListBox = /** @class */ (function (_super) {
    tslib_1.__extends(PDFAcroListBox, _super);
    function PDFAcroListBox() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PDFAcroListBox.fromDict = function (dict, ref) {
        return new PDFAcroListBox(dict, ref);
    };
    PDFAcroListBox.create = function (context) {
        var dict = context.obj({
            FT: 'Ch',
            Kids: [],
        });
        var ref = context.register(dict);
        return new PDFAcroListBox(dict, ref);
    };
    return PDFAcroListBox;
}(PDFAcroChoice_1.default));
exports.default = PDFAcroListBox;
//# sourceMappingURL=PDFAcroListBox.js.map