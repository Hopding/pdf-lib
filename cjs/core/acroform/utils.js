"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPDFAcroField = exports.createPDFAcroFields = void 0;
var tslib_1 = require("tslib");
var PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
var PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
var PDFRef_1 = tslib_1.__importDefault(require("../objects/PDFRef"));
var PDFAcroTerminal_1 = tslib_1.__importDefault(require("./PDFAcroTerminal"));
var PDFAcroNonTerminal_1 = tslib_1.__importDefault(require("./PDFAcroNonTerminal"));
var PDFAcroSignature_1 = tslib_1.__importDefault(require("./PDFAcroSignature"));
var PDFAcroText_1 = tslib_1.__importDefault(require("./PDFAcroText"));
var PDFAcroPushButton_1 = tslib_1.__importDefault(require("./PDFAcroPushButton"));
var PDFAcroRadioButton_1 = tslib_1.__importDefault(require("./PDFAcroRadioButton"));
var PDFAcroCheckBox_1 = tslib_1.__importDefault(require("./PDFAcroCheckBox"));
var PDFAcroComboBox_1 = tslib_1.__importDefault(require("./PDFAcroComboBox"));
var PDFAcroListBox_1 = tslib_1.__importDefault(require("./PDFAcroListBox"));
var flags_1 = require("./flags");
exports.createPDFAcroFields = function (kidDicts) {
    if (!kidDicts)
        return [];
    var kids = [];
    for (var idx = 0, len = kidDicts.size(); idx < len; idx++) {
        var ref = kidDicts.get(idx);
        var dict = kidDicts.lookup(idx);
        // if (dict instanceof PDFDict) kids.push(PDFAcroField.fromDict(dict));
        if (ref instanceof PDFRef_1.default && dict instanceof PDFDict_1.default) {
            kids.push([exports.createPDFAcroField(dict, ref), ref]);
        }
    }
    return kids;
};
exports.createPDFAcroField = function (dict, ref) {
    var isNonTerminal = isNonTerminalAcroField(dict);
    if (isNonTerminal)
        return PDFAcroNonTerminal_1.default.fromDict(dict, ref);
    return createPDFAcroTerminal(dict, ref);
};
// TODO: Maybe just check if the dict is *not* a widget? That might be better.
// According to the PDF spec:
//
//   > A field's children in the hierarchy may also include widget annotations
//   > that define its appearance on the page. A field that has children that
//   > are fields is called a non-terminal field. A field that does not have
//   > children that are fields is called a terminal field.
//
// The spec is not entirely clear about how to determine whether a given
// dictionary represents an acrofield or a widget annotation. So we will assume
// that a dictionary is an acrofield if it is a member of the `/Kids` array
// and it contains a `/T` entry (widgets do not have `/T` entries). This isn't
// a bullet proof solution, because the `/T` entry is technically defined as
// optional for acrofields by the PDF spec. But in practice all acrofields seem
// to have a `/T` entry defined.
var isNonTerminalAcroField = function (dict) {
    var kids = dict.lookup(PDFName_1.default.of('Kids'));
    if (kids instanceof PDFArray_1.default) {
        for (var idx = 0, len = kids.size(); idx < len; idx++) {
            var kid = kids.lookup(idx);
            var kidIsField = kid instanceof PDFDict_1.default && kid.has(PDFName_1.default.of('T'));
            if (kidIsField)
                return true;
        }
    }
    return false;
};
var createPDFAcroTerminal = function (dict, ref) {
    var ftNameOrRef = getInheritableAttribute(dict, PDFName_1.default.of('FT'));
    var type = dict.context.lookup(ftNameOrRef, PDFName_1.default);
    if (type === PDFName_1.default.of('Btn'))
        return createPDFAcroButton(dict, ref);
    if (type === PDFName_1.default.of('Ch'))
        return createPDFAcroChoice(dict, ref);
    if (type === PDFName_1.default.of('Tx'))
        return PDFAcroText_1.default.fromDict(dict, ref);
    if (type === PDFName_1.default.of('Sig'))
        return PDFAcroSignature_1.default.fromDict(dict, ref);
    // We should never reach this line. But there are a lot of weird PDFs out
    // there. So, just to be safe, we'll try to handle things gracefully instead
    // of throwing an error.
    return PDFAcroTerminal_1.default.fromDict(dict, ref);
};
var createPDFAcroButton = function (dict, ref) {
    var _a;
    var ffNumberOrRef = getInheritableAttribute(dict, PDFName_1.default.of('Ff'));
    var ffNumber = dict.context.lookupMaybe(ffNumberOrRef, PDFNumber_1.default);
    var flags = (_a = ffNumber === null || ffNumber === void 0 ? void 0 : ffNumber.asNumber()) !== null && _a !== void 0 ? _a : 0;
    if (flagIsSet(flags, flags_1.AcroButtonFlags.PushButton)) {
        return PDFAcroPushButton_1.default.fromDict(dict, ref);
    }
    else if (flagIsSet(flags, flags_1.AcroButtonFlags.Radio)) {
        return PDFAcroRadioButton_1.default.fromDict(dict, ref);
    }
    else {
        return PDFAcroCheckBox_1.default.fromDict(dict, ref);
    }
};
var createPDFAcroChoice = function (dict, ref) {
    var _a;
    var ffNumberOrRef = getInheritableAttribute(dict, PDFName_1.default.of('Ff'));
    var ffNumber = dict.context.lookupMaybe(ffNumberOrRef, PDFNumber_1.default);
    var flags = (_a = ffNumber === null || ffNumber === void 0 ? void 0 : ffNumber.asNumber()) !== null && _a !== void 0 ? _a : 0;
    if (flagIsSet(flags, flags_1.AcroChoiceFlags.Combo)) {
        return PDFAcroComboBox_1.default.fromDict(dict, ref);
    }
    else {
        return PDFAcroListBox_1.default.fromDict(dict, ref);
    }
};
var flagIsSet = function (flags, flag) {
    return (flags & flag) !== 0;
};
var getInheritableAttribute = function (startNode, name) {
    var attribute;
    ascend(startNode, function (node) {
        if (!attribute)
            attribute = node.get(name);
    });
    return attribute;
};
var ascend = function (startNode, visitor) {
    visitor(startNode);
    var Parent = startNode.lookupMaybe(PDFName_1.default.of('Parent'), PDFDict_1.default);
    if (Parent)
        ascend(Parent, visitor);
};
//# sourceMappingURL=utils.js.map