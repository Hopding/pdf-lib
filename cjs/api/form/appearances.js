"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOptionListAppearanceProvider = exports.defaultDropdownAppearanceProvider = exports.defaultTextFieldAppearanceProvider = exports.defaultButtonAppearanceProvider = exports.defaultRadioGroupAppearanceProvider = exports.defaultCheckBoxAppearanceProvider = exports.normalizeAppearance = void 0;
var tslib_1 = require("tslib");
var operations_1 = require("../operations");
var colors_1 = require("../colors");
var rotations_1 = require("../rotations");
var layout_1 = require("../text/layout");
var alignment_1 = require("../text/alignment");
var operators_1 = require("../operators");
var utils_1 = require("../../utils");
/********************* Appearance Provider Functions **************************/
exports.normalizeAppearance = function (appearance) {
    if ('normal' in appearance)
        return appearance;
    return { normal: appearance };
};
// Examples:
//   `/Helv 12 Tf` -> ['/Helv 12 Tf', 'Helv', '12']
//   `/HeBo 8.00 Tf` -> ['/HeBo 8 Tf', 'HeBo', '8.00']
var tfRegex = /\/([^\0\t\n\f\r\ ]+)[\0\t\n\f\r\ ]+(\d*\.\d+|\d+)[\0\t\n\f\r\ ]+Tf/;
var getDefaultFontSize = function (field) {
    var _a, _b;
    var da = (_a = field.getDefaultAppearance()) !== null && _a !== void 0 ? _a : '';
    var daMatch = (_b = utils_1.findLastMatch(da, tfRegex).match) !== null && _b !== void 0 ? _b : [];
    var defaultFontSize = Number(daMatch[2]);
    return isFinite(defaultFontSize) ? defaultFontSize : undefined;
};
// Examples:
//   `0.3 g` -> ['0.3', 'g']
//   `0.3 1 .3 rg` -> ['0.3', '1', '.3', 'rg']
//   `0.3 1 .3 0 k` -> ['0.3', '1', '.3', '0', 'k']
var colorRegex = /(\d*\.\d+|\d+)[\0\t\n\f\r\ ]*(\d*\.\d+|\d+)?[\0\t\n\f\r\ ]*(\d*\.\d+|\d+)?[\0\t\n\f\r\ ]*(\d*\.\d+|\d+)?[\0\t\n\f\r\ ]+(g|rg|k)/;
var getDefaultColor = function (field) {
    var _a;
    var da = (_a = field.getDefaultAppearance()) !== null && _a !== void 0 ? _a : '';
    var daMatch = utils_1.findLastMatch(da, colorRegex).match;
    var _b = daMatch !== null && daMatch !== void 0 ? daMatch : [], c1 = _b[1], c2 = _b[2], c3 = _b[3], c4 = _b[4], colorSpace = _b[5];
    if (colorSpace === 'g' && c1) {
        return colors_1.grayscale(Number(c1));
    }
    if (colorSpace === 'rg' && c1 && c2 && c3) {
        return colors_1.rgb(Number(c1), Number(c2), Number(c3));
    }
    if (colorSpace === 'k' && c1 && c2 && c3 && c4) {
        return colors_1.cmyk(Number(c1), Number(c2), Number(c3), Number(c4));
    }
    return undefined;
};
var updateDefaultAppearance = function (field, color, font, fontSize) {
    var _a;
    if (fontSize === void 0) { fontSize = 0; }
    var da = [
        colors_1.setFillingColor(color).toString(),
        operators_1.setFontAndSize((_a = font === null || font === void 0 ? void 0 : font.name) !== null && _a !== void 0 ? _a : 'dummy__noop', fontSize).toString(),
    ].join('\n');
    field.setDefaultAppearance(da);
};
exports.defaultCheckBoxAppearanceProvider = function (checkBox, widget) {
    var _a, _b, _c;
    // The `/DA` entry can be at the widget or field level - so we handle both
    var widgetColor = getDefaultColor(widget);
    var fieldColor = getDefaultColor(checkBox.acroField);
    var rectangle = widget.getRectangle();
    var ap = widget.getAppearanceCharacteristics();
    var bs = widget.getBorderStyle();
    var borderWidth = (_a = bs === null || bs === void 0 ? void 0 : bs.getWidth()) !== null && _a !== void 0 ? _a : 0;
    var rotation = rotations_1.reduceRotation(ap === null || ap === void 0 ? void 0 : ap.getRotation());
    var _d = rotations_1.adjustDimsForRotation(rectangle, rotation), width = _d.width, height = _d.height;
    var rotate = operations_1.rotateInPlace(tslib_1.__assign(tslib_1.__assign({}, rectangle), { rotation: rotation }));
    var black = colors_1.rgb(0, 0, 0);
    var borderColor = (_b = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBorderColor())) !== null && _b !== void 0 ? _b : black;
    var normalBackgroundColor = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor());
    var downBackgroundColor = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor(), 0.8);
    // Update color
    var textColor = (_c = widgetColor !== null && widgetColor !== void 0 ? widgetColor : fieldColor) !== null && _c !== void 0 ? _c : black;
    if (widgetColor) {
        updateDefaultAppearance(widget, textColor);
    }
    else {
        updateDefaultAppearance(checkBox.acroField, textColor);
    }
    var options = {
        x: 0 + borderWidth / 2,
        y: 0 + borderWidth / 2,
        width: width - borderWidth,
        height: height - borderWidth,
        thickness: 1.5,
        borderWidth: borderWidth,
        borderColor: borderColor,
        markColor: textColor,
    };
    return {
        normal: {
            on: tslib_1.__spreadArrays(rotate, operations_1.drawCheckBox(tslib_1.__assign(tslib_1.__assign({}, options), { color: normalBackgroundColor, filled: true }))),
            off: tslib_1.__spreadArrays(rotate, operations_1.drawCheckBox(tslib_1.__assign(tslib_1.__assign({}, options), { color: normalBackgroundColor, filled: false }))),
        },
        down: {
            on: tslib_1.__spreadArrays(rotate, operations_1.drawCheckBox(tslib_1.__assign(tslib_1.__assign({}, options), { color: downBackgroundColor, filled: true }))),
            off: tslib_1.__spreadArrays(rotate, operations_1.drawCheckBox(tslib_1.__assign(tslib_1.__assign({}, options), { color: downBackgroundColor, filled: false }))),
        },
    };
};
exports.defaultRadioGroupAppearanceProvider = function (radioGroup, widget) {
    var _a, _b, _c;
    // The `/DA` entry can be at the widget or field level - so we handle both
    var widgetColor = getDefaultColor(widget);
    var fieldColor = getDefaultColor(radioGroup.acroField);
    var rectangle = widget.getRectangle();
    var ap = widget.getAppearanceCharacteristics();
    var bs = widget.getBorderStyle();
    var borderWidth = (_a = bs === null || bs === void 0 ? void 0 : bs.getWidth()) !== null && _a !== void 0 ? _a : 0;
    var rotation = rotations_1.reduceRotation(ap === null || ap === void 0 ? void 0 : ap.getRotation());
    var _d = rotations_1.adjustDimsForRotation(rectangle, rotation), width = _d.width, height = _d.height;
    var rotate = operations_1.rotateInPlace(tslib_1.__assign(tslib_1.__assign({}, rectangle), { rotation: rotation }));
    var black = colors_1.rgb(0, 0, 0);
    var borderColor = (_b = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBorderColor())) !== null && _b !== void 0 ? _b : black;
    var normalBackgroundColor = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor());
    var downBackgroundColor = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor(), 0.8);
    // Update color
    var textColor = (_c = widgetColor !== null && widgetColor !== void 0 ? widgetColor : fieldColor) !== null && _c !== void 0 ? _c : black;
    if (widgetColor) {
        updateDefaultAppearance(widget, textColor);
    }
    else {
        updateDefaultAppearance(radioGroup.acroField, textColor);
    }
    var options = {
        x: width / 2,
        y: height / 2,
        width: width - borderWidth,
        height: height - borderWidth,
        borderWidth: borderWidth,
        borderColor: borderColor,
        dotColor: textColor,
    };
    return {
        normal: {
            on: tslib_1.__spreadArrays(rotate, operations_1.drawRadioButton(tslib_1.__assign(tslib_1.__assign({}, options), { color: normalBackgroundColor, filled: true }))),
            off: tslib_1.__spreadArrays(rotate, operations_1.drawRadioButton(tslib_1.__assign(tslib_1.__assign({}, options), { color: normalBackgroundColor, filled: false }))),
        },
        down: {
            on: tslib_1.__spreadArrays(rotate, operations_1.drawRadioButton(tslib_1.__assign(tslib_1.__assign({}, options), { color: downBackgroundColor, filled: true }))),
            off: tslib_1.__spreadArrays(rotate, operations_1.drawRadioButton(tslib_1.__assign(tslib_1.__assign({}, options), { color: downBackgroundColor, filled: false }))),
        },
    };
};
exports.defaultButtonAppearanceProvider = function (button, widget, font) {
    var _a, _b, _c, _d, _e;
    // The `/DA` entry can be at the widget or field level - so we handle both
    var widgetColor = getDefaultColor(widget);
    var fieldColor = getDefaultColor(button.acroField);
    var widgetFontSize = getDefaultFontSize(widget);
    var fieldFontSize = getDefaultFontSize(button.acroField);
    var rectangle = widget.getRectangle();
    var ap = widget.getAppearanceCharacteristics();
    var bs = widget.getBorderStyle();
    var captions = ap === null || ap === void 0 ? void 0 : ap.getCaptions();
    var normalText = (_a = captions === null || captions === void 0 ? void 0 : captions.normal) !== null && _a !== void 0 ? _a : '';
    var downText = (_c = (_b = captions === null || captions === void 0 ? void 0 : captions.down) !== null && _b !== void 0 ? _b : normalText) !== null && _c !== void 0 ? _c : '';
    var borderWidth = (_d = bs === null || bs === void 0 ? void 0 : bs.getWidth()) !== null && _d !== void 0 ? _d : 0;
    var rotation = rotations_1.reduceRotation(ap === null || ap === void 0 ? void 0 : ap.getRotation());
    var _f = rotations_1.adjustDimsForRotation(rectangle, rotation), width = _f.width, height = _f.height;
    var rotate = operations_1.rotateInPlace(tslib_1.__assign(tslib_1.__assign({}, rectangle), { rotation: rotation }));
    var black = colors_1.rgb(0, 0, 0);
    var borderColor = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBorderColor());
    var normalBackgroundColor = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor());
    var downBackgroundColor = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor(), 0.8);
    var bounds = {
        x: borderWidth,
        y: borderWidth,
        width: width - borderWidth * 2,
        height: height - borderWidth * 2,
    };
    var normalLayout = layout_1.layoutSinglelineText(normalText, {
        alignment: alignment_1.TextAlignment.Center,
        fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
        font: font,
        bounds: bounds,
    });
    var downLayout = layout_1.layoutSinglelineText(downText, {
        alignment: alignment_1.TextAlignment.Center,
        fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
        font: font,
        bounds: bounds,
    });
    // Update font size and color
    var fontSize = Math.min(normalLayout.fontSize, downLayout.fontSize);
    var textColor = (_e = widgetColor !== null && widgetColor !== void 0 ? widgetColor : fieldColor) !== null && _e !== void 0 ? _e : black;
    if (widgetColor || widgetFontSize !== undefined) {
        updateDefaultAppearance(widget, textColor, font, fontSize);
    }
    else {
        updateDefaultAppearance(button.acroField, textColor, font, fontSize);
    }
    var options = {
        x: 0 + borderWidth / 2,
        y: 0 + borderWidth / 2,
        width: width - borderWidth,
        height: height - borderWidth,
        borderWidth: borderWidth,
        borderColor: borderColor,
        textColor: textColor,
        font: font.name,
        fontSize: fontSize,
    };
    return {
        normal: tslib_1.__spreadArrays(rotate, operations_1.drawButton(tslib_1.__assign(tslib_1.__assign({}, options), { color: normalBackgroundColor, textLines: [normalLayout.line] }))),
        down: tslib_1.__spreadArrays(rotate, operations_1.drawButton(tslib_1.__assign(tslib_1.__assign({}, options), { color: downBackgroundColor, textLines: [downLayout.line] }))),
    };
};
exports.defaultTextFieldAppearanceProvider = function (textField, widget, font) {
    var _a, _b, _c, _d;
    // The `/DA` entry can be at the widget or field level - so we handle both
    var widgetColor = getDefaultColor(widget);
    var fieldColor = getDefaultColor(textField.acroField);
    var widgetFontSize = getDefaultFontSize(widget);
    var fieldFontSize = getDefaultFontSize(textField.acroField);
    var rectangle = widget.getRectangle();
    var ap = widget.getAppearanceCharacteristics();
    var bs = widget.getBorderStyle();
    var text = (_a = textField.getText()) !== null && _a !== void 0 ? _a : '';
    var borderWidth = (_b = bs === null || bs === void 0 ? void 0 : bs.getWidth()) !== null && _b !== void 0 ? _b : 0;
    var rotation = rotations_1.reduceRotation(ap === null || ap === void 0 ? void 0 : ap.getRotation());
    var _e = rotations_1.adjustDimsForRotation(rectangle, rotation), width = _e.width, height = _e.height;
    var rotate = operations_1.rotateInPlace(tslib_1.__assign(tslib_1.__assign({}, rectangle), { rotation: rotation }));
    var black = colors_1.rgb(0, 0, 0);
    var borderColor = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBorderColor());
    var normalBackgroundColor = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor());
    var textLines;
    var fontSize;
    var padding = textField.isCombed() ? 0 : 1;
    var bounds = {
        x: borderWidth + padding,
        y: borderWidth + padding,
        width: width - (borderWidth + padding) * 2,
        height: height - (borderWidth + padding) * 2,
    };
    if (textField.isMultiline()) {
        var layout = layout_1.layoutMultilineText(text, {
            alignment: textField.getAlignment(),
            fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
            font: font,
            bounds: bounds,
        });
        textLines = layout.lines;
        fontSize = layout.fontSize;
    }
    else if (textField.isCombed()) {
        var layout = layout_1.layoutCombedText(text, {
            fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
            font: font,
            bounds: bounds,
            cellCount: (_c = textField.getMaxLength()) !== null && _c !== void 0 ? _c : 0,
        });
        textLines = layout.cells;
        fontSize = layout.fontSize;
    }
    else {
        var layout = layout_1.layoutSinglelineText(text, {
            alignment: textField.getAlignment(),
            fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
            font: font,
            bounds: bounds,
        });
        textLines = [layout.line];
        fontSize = layout.fontSize;
    }
    // Update font size and color
    var textColor = (_d = widgetColor !== null && widgetColor !== void 0 ? widgetColor : fieldColor) !== null && _d !== void 0 ? _d : black;
    if (widgetColor || widgetFontSize !== undefined) {
        updateDefaultAppearance(widget, textColor, font, fontSize);
    }
    else {
        updateDefaultAppearance(textField.acroField, textColor, font, fontSize);
    }
    var options = {
        x: 0 + borderWidth / 2,
        y: 0 + borderWidth / 2,
        width: width - borderWidth,
        height: height - borderWidth,
        borderWidth: borderWidth !== null && borderWidth !== void 0 ? borderWidth : 0,
        borderColor: borderColor,
        textColor: textColor,
        font: font.name,
        fontSize: fontSize,
        color: normalBackgroundColor,
        textLines: textLines,
        padding: padding,
    };
    return tslib_1.__spreadArrays(rotate, operations_1.drawTextField(options));
};
exports.defaultDropdownAppearanceProvider = function (dropdown, widget, font) {
    var _a, _b, _c;
    // The `/DA` entry can be at the widget or field level - so we handle both
    var widgetColor = getDefaultColor(widget);
    var fieldColor = getDefaultColor(dropdown.acroField);
    var widgetFontSize = getDefaultFontSize(widget);
    var fieldFontSize = getDefaultFontSize(dropdown.acroField);
    var rectangle = widget.getRectangle();
    var ap = widget.getAppearanceCharacteristics();
    var bs = widget.getBorderStyle();
    var text = (_a = dropdown.getSelected()[0]) !== null && _a !== void 0 ? _a : '';
    var borderWidth = (_b = bs === null || bs === void 0 ? void 0 : bs.getWidth()) !== null && _b !== void 0 ? _b : 0;
    var rotation = rotations_1.reduceRotation(ap === null || ap === void 0 ? void 0 : ap.getRotation());
    var _d = rotations_1.adjustDimsForRotation(rectangle, rotation), width = _d.width, height = _d.height;
    var rotate = operations_1.rotateInPlace(tslib_1.__assign(tslib_1.__assign({}, rectangle), { rotation: rotation }));
    var black = colors_1.rgb(0, 0, 0);
    var borderColor = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBorderColor());
    var normalBackgroundColor = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor());
    var padding = 1;
    var bounds = {
        x: borderWidth + padding,
        y: borderWidth + padding,
        width: width - (borderWidth + padding) * 2,
        height: height - (borderWidth + padding) * 2,
    };
    var _e = layout_1.layoutSinglelineText(text, {
        alignment: alignment_1.TextAlignment.Left,
        fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
        font: font,
        bounds: bounds,
    }), line = _e.line, fontSize = _e.fontSize;
    // Update font size and color
    var textColor = (_c = widgetColor !== null && widgetColor !== void 0 ? widgetColor : fieldColor) !== null && _c !== void 0 ? _c : black;
    if (widgetColor || widgetFontSize !== undefined) {
        updateDefaultAppearance(widget, textColor, font, fontSize);
    }
    else {
        updateDefaultAppearance(dropdown.acroField, textColor, font, fontSize);
    }
    var options = {
        x: 0 + borderWidth / 2,
        y: 0 + borderWidth / 2,
        width: width - borderWidth,
        height: height - borderWidth,
        borderWidth: borderWidth !== null && borderWidth !== void 0 ? borderWidth : 0,
        borderColor: borderColor,
        textColor: textColor,
        font: font.name,
        fontSize: fontSize,
        color: normalBackgroundColor,
        textLines: [line],
        padding: padding,
    };
    return tslib_1.__spreadArrays(rotate, operations_1.drawTextField(options));
};
exports.defaultOptionListAppearanceProvider = function (optionList, widget, font) {
    var _a, _b;
    // The `/DA` entry can be at the widget or field level - so we handle both
    var widgetColor = getDefaultColor(widget);
    var fieldColor = getDefaultColor(optionList.acroField);
    var widgetFontSize = getDefaultFontSize(widget);
    var fieldFontSize = getDefaultFontSize(optionList.acroField);
    var rectangle = widget.getRectangle();
    var ap = widget.getAppearanceCharacteristics();
    var bs = widget.getBorderStyle();
    var borderWidth = (_a = bs === null || bs === void 0 ? void 0 : bs.getWidth()) !== null && _a !== void 0 ? _a : 0;
    var rotation = rotations_1.reduceRotation(ap === null || ap === void 0 ? void 0 : ap.getRotation());
    var _c = rotations_1.adjustDimsForRotation(rectangle, rotation), width = _c.width, height = _c.height;
    var rotate = operations_1.rotateInPlace(tslib_1.__assign(tslib_1.__assign({}, rectangle), { rotation: rotation }));
    var black = colors_1.rgb(0, 0, 0);
    var borderColor = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBorderColor());
    var normalBackgroundColor = colors_1.componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor());
    var options = optionList.getOptions();
    var selected = optionList.getSelected();
    if (optionList.isSorted())
        options.sort();
    var text = '';
    for (var idx = 0, len = options.length; idx < len; idx++) {
        text += options[idx];
        if (idx < len - 1)
            text += '\n';
    }
    var padding = 1;
    var bounds = {
        x: borderWidth + padding,
        y: borderWidth + padding,
        width: width - (borderWidth + padding) * 2,
        height: height - (borderWidth + padding) * 2,
    };
    var _d = layout_1.layoutMultilineText(text, {
        alignment: alignment_1.TextAlignment.Left,
        fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
        font: font,
        bounds: bounds,
    }), lines = _d.lines, fontSize = _d.fontSize, lineHeight = _d.lineHeight;
    var selectedLines = [];
    for (var idx = 0, len = lines.length; idx < len; idx++) {
        var line = lines[idx];
        if (selected.includes(line.text))
            selectedLines.push(idx);
    }
    var blue = colors_1.rgb(153 / 255, 193 / 255, 218 / 255);
    // Update font size and color
    var textColor = (_b = widgetColor !== null && widgetColor !== void 0 ? widgetColor : fieldColor) !== null && _b !== void 0 ? _b : black;
    if (widgetColor || widgetFontSize !== undefined) {
        updateDefaultAppearance(widget, textColor, font, fontSize);
    }
    else {
        updateDefaultAppearance(optionList.acroField, textColor, font, fontSize);
    }
    return tslib_1.__spreadArrays(rotate, operations_1.drawOptionList({
        x: 0 + borderWidth / 2,
        y: 0 + borderWidth / 2,
        width: width - borderWidth,
        height: height - borderWidth,
        borderWidth: borderWidth !== null && borderWidth !== void 0 ? borderWidth : 0,
        borderColor: borderColor,
        textColor: textColor,
        font: font.name,
        fontSize: fontSize,
        color: normalBackgroundColor,
        textLines: lines,
        lineHeight: lineHeight,
        selectedColor: blue,
        selectedLines: selectedLines,
        padding: padding,
    }));
};
//# sourceMappingURL=appearances.js.map