"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFAcroTerminal_1 = tslib_1.__importDefault(require("./PDFAcroTerminal"));
var PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
var PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
var PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var flags_1 = require("./flags");
var errors_1 = require("../errors");
var PDFAcroChoice = /** @class */ (function (_super) {
    tslib_1.__extends(PDFAcroChoice, _super);
    function PDFAcroChoice() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PDFAcroChoice.prototype.setValues = function (values) {
        if (this.hasFlag(flags_1.AcroChoiceFlags.Combo) &&
            !this.hasFlag(flags_1.AcroChoiceFlags.Edit) &&
            !this.valuesAreValid(values)) {
            throw new errors_1.InvalidAcroFieldValueError();
        }
        if (values.length === 0) {
            this.dict.delete(PDFName_1.default.of('V'));
        }
        if (values.length === 1) {
            this.dict.set(PDFName_1.default.of('V'), values[0]);
        }
        if (values.length > 1) {
            if (!this.hasFlag(flags_1.AcroChoiceFlags.MultiSelect)) {
                throw new errors_1.MultiSelectValueError();
            }
            this.dict.set(PDFName_1.default.of('V'), this.dict.context.obj(values));
        }
        this.updateSelectedIndices(values);
    };
    PDFAcroChoice.prototype.valuesAreValid = function (values) {
        var options = this.getOptions();
        var _loop_1 = function (idx, len) {
            var val = values[idx].decodeText();
            if (!options.find(function (o) { return val === (o.display || o.value).decodeText(); })) {
                return { value: false };
            }
        };
        for (var idx = 0, len = values.length; idx < len; idx++) {
            var state_1 = _loop_1(idx, len);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return true;
    };
    PDFAcroChoice.prototype.updateSelectedIndices = function (values) {
        if (values.length > 1) {
            var indices = new Array(values.length);
            var options = this.getOptions();
            var _loop_2 = function (idx, len) {
                var val = values[idx].decodeText();
                indices[idx] = options.findIndex(function (o) { return val === (o.display || o.value).decodeText(); });
            };
            for (var idx = 0, len = values.length; idx < len; idx++) {
                _loop_2(idx, len);
            }
            this.dict.set(PDFName_1.default.of('I'), this.dict.context.obj(indices.sort()));
        }
        else {
            this.dict.delete(PDFName_1.default.of('I'));
        }
    };
    PDFAcroChoice.prototype.getValues = function () {
        var v = this.V();
        if (v instanceof PDFString_1.default || v instanceof PDFHexString_1.default)
            return [v];
        if (v instanceof PDFArray_1.default) {
            var values = [];
            for (var idx = 0, len = v.size(); idx < len; idx++) {
                var value = v.lookup(idx);
                if (value instanceof PDFString_1.default || value instanceof PDFHexString_1.default) {
                    values.push(value);
                }
            }
            return values;
        }
        return [];
    };
    PDFAcroChoice.prototype.Opt = function () {
        return this.dict.lookupMaybe(PDFName_1.default.of('Opt'), PDFString_1.default, PDFHexString_1.default, PDFArray_1.default);
    };
    PDFAcroChoice.prototype.setOptions = function (options) {
        var newOpt = new Array(options.length);
        for (var idx = 0, len = options.length; idx < len; idx++) {
            var _a = options[idx], value = _a.value, display = _a.display;
            newOpt[idx] = this.dict.context.obj([value, display || value]);
        }
        this.dict.set(PDFName_1.default.of('Opt'), this.dict.context.obj(newOpt));
    };
    PDFAcroChoice.prototype.getOptions = function () {
        var Opt = this.Opt();
        // Not supposed to happen - Opt _should_ always be `PDFArray | undefined`
        if (Opt instanceof PDFString_1.default || Opt instanceof PDFHexString_1.default) {
            return [{ value: Opt, display: Opt }];
        }
        if (Opt instanceof PDFArray_1.default) {
            var res = [];
            for (var idx = 0, len = Opt.size(); idx < len; idx++) {
                var item = Opt.lookup(idx);
                // If `item` is a string, use that as both the export and text value
                if (item instanceof PDFString_1.default || item instanceof PDFHexString_1.default) {
                    res.push({ value: item, display: item });
                }
                // If `item` is an array of one, treat it the same as just a string,
                // if it's an array of two then `item[0]` is the export value and
                // `item[1]` is the text value
                if (item instanceof PDFArray_1.default) {
                    if (item.size() > 0) {
                        var first = item.lookup(0, PDFString_1.default, PDFHexString_1.default);
                        var second = item.lookupMaybe(1, PDFString_1.default, PDFHexString_1.default);
                        res.push({ value: first, display: second || first });
                    }
                }
            }
            return res;
        }
        return [];
    };
    return PDFAcroChoice;
}(PDFAcroTerminal_1.default));
exports.default = PDFAcroChoice;
//# sourceMappingURL=PDFAcroChoice.js.map