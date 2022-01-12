"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
var PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFAcroNonTerminal_1 = tslib_1.__importDefault(require("./PDFAcroNonTerminal"));
var utils_1 = require("./utils");
var PDFAcroForm = /** @class */ (function () {
    function PDFAcroForm(dict) {
        this.dict = dict;
    }
    PDFAcroForm.prototype.Fields = function () {
        var fields = this.dict.lookup(PDFName_1.default.of('Fields'));
        if (fields instanceof PDFArray_1.default)
            return fields;
        return undefined;
    };
    PDFAcroForm.prototype.getFields = function () {
        var Fields = this.normalizedEntries().Fields;
        var fields = new Array(Fields.size());
        for (var idx = 0, len = Fields.size(); idx < len; idx++) {
            var ref = Fields.get(idx);
            var dict = Fields.lookup(idx, PDFDict_1.default);
            fields[idx] = [utils_1.createPDFAcroField(dict, ref), ref];
        }
        return fields;
    };
    PDFAcroForm.prototype.getAllFields = function () {
        var allFields = [];
        var pushFields = function (fields) {
            if (!fields)
                return;
            for (var idx = 0, len = fields.length; idx < len; idx++) {
                var field = fields[idx];
                allFields.push(field);
                var fieldModel = field[0];
                if (fieldModel instanceof PDFAcroNonTerminal_1.default) {
                    pushFields(utils_1.createPDFAcroFields(fieldModel.Kids()));
                }
            }
        };
        pushFields(this.getFields());
        return allFields;
    };
    PDFAcroForm.prototype.addField = function (field) {
        var Fields = this.normalizedEntries().Fields;
        Fields === null || Fields === void 0 ? void 0 : Fields.push(field);
    };
    PDFAcroForm.prototype.removeField = function (field) {
        var parent = field.getParent();
        var fields = parent === undefined ? this.normalizedEntries().Fields : parent.Kids();
        var index = fields === null || fields === void 0 ? void 0 : fields.indexOf(field.ref);
        if (fields === undefined || index === undefined) {
            throw new Error("Tried to remove inexistent field " + field.getFullyQualifiedName());
        }
        fields.remove(index);
        if (parent !== undefined && fields.size() === 0) {
            this.removeField(parent);
        }
    };
    PDFAcroForm.prototype.normalizedEntries = function () {
        var Fields = this.Fields();
        if (!Fields) {
            Fields = this.dict.context.obj([]);
            this.dict.set(PDFName_1.default.of('Fields'), Fields);
        }
        return { Fields: Fields };
    };
    PDFAcroForm.fromDict = function (dict) { return new PDFAcroForm(dict); };
    PDFAcroForm.create = function (context) {
        var dict = context.obj({ Fields: [] });
        return new PDFAcroForm(dict);
    };
    return PDFAcroForm;
}());
exports.default = PDFAcroForm;
//# sourceMappingURL=PDFAcroForm.js.map