"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFAcroTerminal_1 = tslib_1.__importDefault(require("./PDFAcroTerminal"));
var PDFAcroSignature = /** @class */ (function (_super) {
    tslib_1.__extends(PDFAcroSignature, _super);
    function PDFAcroSignature() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PDFAcroSignature.fromDict = function (dict, ref) {
        return new PDFAcroSignature(dict, ref);
    };
    return PDFAcroSignature;
}(PDFAcroTerminal_1.default));
exports.default = PDFAcroSignature;
//# sourceMappingURL=PDFAcroSignature.js.map