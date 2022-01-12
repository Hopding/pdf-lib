"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFAcroField_1 = tslib_1.__importDefault(require("./PDFAcroField"));
var PDFWidgetAnnotation_1 = tslib_1.__importDefault(require("../annotation/PDFWidgetAnnotation"));
var errors_1 = require("../errors");
var PDFAcroTerminal = /** @class */ (function (_super) {
    tslib_1.__extends(PDFAcroTerminal, _super);
    function PDFAcroTerminal() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PDFAcroTerminal.prototype.FT = function () {
        var nameOrRef = this.getInheritableAttribute(PDFName_1.default.of('FT'));
        return this.dict.context.lookup(nameOrRef, PDFName_1.default);
    };
    PDFAcroTerminal.prototype.getWidgets = function () {
        var kidDicts = this.Kids();
        // This field is itself a widget
        if (!kidDicts)
            return [PDFWidgetAnnotation_1.default.fromDict(this.dict)];
        // This field's kids are its widgets
        var widgets = new Array(kidDicts.size());
        for (var idx = 0, len = kidDicts.size(); idx < len; idx++) {
            var dict = kidDicts.lookup(idx, PDFDict_1.default);
            widgets[idx] = PDFWidgetAnnotation_1.default.fromDict(dict);
        }
        return widgets;
    };
    PDFAcroTerminal.prototype.addWidget = function (ref) {
        var Kids = this.normalizedEntries().Kids;
        Kids.push(ref);
    };
    PDFAcroTerminal.prototype.removeWidget = function (idx) {
        var kidDicts = this.Kids();
        if (!kidDicts) {
            // This field is itself a widget
            if (idx !== 0)
                throw new errors_1.IndexOutOfBoundsError(idx, 0, 0);
            this.setKids([]);
        }
        else {
            // This field's kids are its widgets
            if (idx < 0 || idx > kidDicts.size()) {
                throw new errors_1.IndexOutOfBoundsError(idx, 0, kidDicts.size());
            }
            kidDicts.remove(idx);
        }
    };
    PDFAcroTerminal.prototype.normalizedEntries = function () {
        var Kids = this.Kids();
        // If this field is itself a widget (because it was only rendered once in
        // the document, so the field and widget properties were merged) then we
        // add itself to the `Kids` array. The alternative would be to try
        // splitting apart the widget properties and creating a separate object
        // for them.
        if (!Kids) {
            Kids = this.dict.context.obj([this.ref]);
            this.dict.set(PDFName_1.default.of('Kids'), Kids);
        }
        return { Kids: Kids };
    };
    PDFAcroTerminal.fromDict = function (dict, ref) {
        return new PDFAcroTerminal(dict, ref);
    };
    return PDFAcroTerminal;
}(PDFAcroField_1.default));
exports.default = PDFAcroTerminal;
//# sourceMappingURL=PDFAcroTerminal.js.map