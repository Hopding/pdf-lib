"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawOptionList = exports.drawTextField = exports.drawTextLines = exports.drawButton = exports.drawRadioButton = exports.drawCheckBox = exports.rotateInPlace = exports.drawCheckMark = exports.drawSvgPath = exports.drawEllipse = exports.drawEllipsePath = exports.drawRectangle = exports.drawLine = exports.drawPage = exports.drawImage = exports.drawLinesOfText = exports.drawText = void 0;
var tslib_1 = require("tslib");
var colors_1 = require("./colors");
var operators_1 = require("./operators");
var rotations_1 = require("./rotations");
var svgPath_1 = require("./svgPath");
var objects_1 = require("./objects");
exports.drawText = function (line, options) {
    return [
        operators_1.pushGraphicsState(),
        options.graphicsState && operators_1.setGraphicsState(options.graphicsState),
        operators_1.beginText(),
        colors_1.setFillingColor(options.color),
        operators_1.setFontAndSize(options.font, options.size),
        operators_1.rotateAndSkewTextRadiansAndTranslate(rotations_1.toRadians(options.rotate), rotations_1.toRadians(options.xSkew), rotations_1.toRadians(options.ySkew), options.x, options.y),
        operators_1.showText(line),
        operators_1.endText(),
        operators_1.popGraphicsState(),
    ].filter(Boolean);
};
exports.drawLinesOfText = function (lines, options) {
    var operators = [
        operators_1.pushGraphicsState(),
        options.graphicsState && operators_1.setGraphicsState(options.graphicsState),
        operators_1.beginText(),
        colors_1.setFillingColor(options.color),
        operators_1.setFontAndSize(options.font, options.size),
        operators_1.setLineHeight(options.lineHeight),
        operators_1.rotateAndSkewTextRadiansAndTranslate(rotations_1.toRadians(options.rotate), rotations_1.toRadians(options.xSkew), rotations_1.toRadians(options.ySkew), options.x, options.y),
    ].filter(Boolean);
    for (var idx = 0, len = lines.length; idx < len; idx++) {
        operators.push(operators_1.showText(lines[idx]), operators_1.nextLine());
    }
    operators.push(operators_1.endText(), operators_1.popGraphicsState());
    return operators;
};
exports.drawImage = function (name, options) {
    return [
        operators_1.pushGraphicsState(),
        options.graphicsState && operators_1.setGraphicsState(options.graphicsState),
        operators_1.translate(options.x, options.y),
        operators_1.rotateRadians(rotations_1.toRadians(options.rotate)),
        operators_1.scale(options.width, options.height),
        operators_1.skewRadians(rotations_1.toRadians(options.xSkew), rotations_1.toRadians(options.ySkew)),
        operators_1.drawObject(name),
        operators_1.popGraphicsState(),
    ].filter(Boolean);
};
exports.drawPage = function (name, options) {
    return [
        operators_1.pushGraphicsState(),
        options.graphicsState && operators_1.setGraphicsState(options.graphicsState),
        operators_1.translate(options.x, options.y),
        operators_1.rotateRadians(rotations_1.toRadians(options.rotate)),
        operators_1.scale(options.xScale, options.yScale),
        operators_1.skewRadians(rotations_1.toRadians(options.xSkew), rotations_1.toRadians(options.ySkew)),
        operators_1.drawObject(name),
        operators_1.popGraphicsState(),
    ].filter(Boolean);
};
exports.drawLine = function (options) {
    var _a, _b;
    return [
        operators_1.pushGraphicsState(),
        options.graphicsState && operators_1.setGraphicsState(options.graphicsState),
        options.color && colors_1.setStrokingColor(options.color),
        operators_1.setLineWidth(options.thickness),
        operators_1.setDashPattern((_a = options.dashArray) !== null && _a !== void 0 ? _a : [], (_b = options.dashPhase) !== null && _b !== void 0 ? _b : 0),
        operators_1.moveTo(options.start.x, options.start.y),
        options.lineCap && operators_1.setLineCap(options.lineCap),
        operators_1.moveTo(options.start.x, options.start.y),
        operators_1.lineTo(options.end.x, options.end.y),
        operators_1.stroke(),
        operators_1.popGraphicsState(),
    ].filter(Boolean);
};
exports.drawRectangle = function (options) {
    var _a, _b;
    return [
        operators_1.pushGraphicsState(),
        options.graphicsState && operators_1.setGraphicsState(options.graphicsState),
        options.color && colors_1.setFillingColor(options.color),
        options.borderColor && colors_1.setStrokingColor(options.borderColor),
        operators_1.setLineWidth(options.borderWidth),
        options.borderLineCap && operators_1.setLineCap(options.borderLineCap),
        operators_1.setDashPattern((_a = options.borderDashArray) !== null && _a !== void 0 ? _a : [], (_b = options.borderDashPhase) !== null && _b !== void 0 ? _b : 0),
        operators_1.translate(options.x, options.y),
        operators_1.rotateRadians(rotations_1.toRadians(options.rotate)),
        operators_1.skewRadians(rotations_1.toRadians(options.xSkew), rotations_1.toRadians(options.ySkew)),
        operators_1.moveTo(0, 0),
        operators_1.lineTo(0, options.height),
        operators_1.lineTo(options.width, options.height),
        operators_1.lineTo(options.width, 0),
        operators_1.closePath(),
        // prettier-ignore
        options.color && options.borderWidth ? operators_1.fillAndStroke()
            : options.color ? operators_1.fill()
                : options.borderColor ? operators_1.stroke()
                    : operators_1.closePath(),
        operators_1.popGraphicsState(),
    ].filter(Boolean);
};
var KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);
/** @deprecated */
exports.drawEllipsePath = function (config) {
    var x = objects_1.asNumber(config.x);
    var y = objects_1.asNumber(config.y);
    var xScale = objects_1.asNumber(config.xScale);
    var yScale = objects_1.asNumber(config.yScale);
    x -= xScale;
    y -= yScale;
    var ox = xScale * KAPPA;
    var oy = yScale * KAPPA;
    var xe = x + xScale * 2;
    var ye = y + yScale * 2;
    var xm = x + xScale;
    var ym = y + yScale;
    return [
        operators_1.pushGraphicsState(),
        operators_1.moveTo(x, ym),
        operators_1.appendBezierCurve(x, ym - oy, xm - ox, y, xm, y),
        operators_1.appendBezierCurve(xm + ox, y, xe, ym - oy, xe, ym),
        operators_1.appendBezierCurve(xe, ym + oy, xm + ox, ye, xm, ye),
        operators_1.appendBezierCurve(xm - ox, ye, x, ym + oy, x, ym),
        operators_1.popGraphicsState(),
    ];
};
var drawEllipseCurves = function (config) {
    var centerX = objects_1.asNumber(config.x);
    var centerY = objects_1.asNumber(config.y);
    var xScale = objects_1.asNumber(config.xScale);
    var yScale = objects_1.asNumber(config.yScale);
    var x = -xScale;
    var y = -yScale;
    var ox = xScale * KAPPA;
    var oy = yScale * KAPPA;
    var xe = x + xScale * 2;
    var ye = y + yScale * 2;
    var xm = x + xScale;
    var ym = y + yScale;
    return [
        operators_1.translate(centerX, centerY),
        operators_1.rotateRadians(rotations_1.toRadians(config.rotate)),
        operators_1.moveTo(x, ym),
        operators_1.appendBezierCurve(x, ym - oy, xm - ox, y, xm, y),
        operators_1.appendBezierCurve(xm + ox, y, xe, ym - oy, xe, ym),
        operators_1.appendBezierCurve(xe, ym + oy, xm + ox, ye, xm, ye),
        operators_1.appendBezierCurve(xm - ox, ye, x, ym + oy, x, ym),
    ];
};
exports.drawEllipse = function (options) {
    var _a, _b, _c;
    return tslib_1.__spreadArrays([
        operators_1.pushGraphicsState(),
        options.graphicsState && operators_1.setGraphicsState(options.graphicsState),
        options.color && colors_1.setFillingColor(options.color),
        options.borderColor && colors_1.setStrokingColor(options.borderColor),
        operators_1.setLineWidth(options.borderWidth),
        options.borderLineCap && operators_1.setLineCap(options.borderLineCap),
        operators_1.setDashPattern((_a = options.borderDashArray) !== null && _a !== void 0 ? _a : [], (_b = options.borderDashPhase) !== null && _b !== void 0 ? _b : 0)
    ], (options.rotate === undefined
        ? exports.drawEllipsePath({
            x: options.x,
            y: options.y,
            xScale: options.xScale,
            yScale: options.yScale,
        })
        : drawEllipseCurves({
            x: options.x,
            y: options.y,
            xScale: options.xScale,
            yScale: options.yScale,
            rotate: (_c = options.rotate) !== null && _c !== void 0 ? _c : rotations_1.degrees(0),
        })), [
        // prettier-ignore
        options.color && options.borderWidth ? operators_1.fillAndStroke()
            : options.color ? operators_1.fill()
                : options.borderColor ? operators_1.stroke()
                    : operators_1.closePath(),
        operators_1.popGraphicsState(),
    ]).filter(Boolean);
};
exports.drawSvgPath = function (path, options) {
    var _a, _b, _c;
    return tslib_1.__spreadArrays([
        operators_1.pushGraphicsState(),
        options.graphicsState && operators_1.setGraphicsState(options.graphicsState),
        operators_1.translate(options.x, options.y),
        operators_1.rotateRadians(rotations_1.toRadians((_a = options.rotate) !== null && _a !== void 0 ? _a : rotations_1.degrees(0))),
        // SVG path Y axis is opposite pdf-lib's
        options.scale ? operators_1.scale(options.scale, -options.scale) : operators_1.scale(1, -1),
        options.color && colors_1.setFillingColor(options.color),
        options.borderColor && colors_1.setStrokingColor(options.borderColor),
        options.borderWidth && operators_1.setLineWidth(options.borderWidth),
        options.borderLineCap && operators_1.setLineCap(options.borderLineCap),
        operators_1.setDashPattern((_b = options.borderDashArray) !== null && _b !== void 0 ? _b : [], (_c = options.borderDashPhase) !== null && _c !== void 0 ? _c : 0)
    ], svgPath_1.svgPathToOperators(path), [
        // prettier-ignore
        options.color && options.borderWidth ? operators_1.fillAndStroke()
            : options.color ? operators_1.fill()
                : options.borderColor ? operators_1.stroke()
                    : operators_1.closePath(),
        operators_1.popGraphicsState(),
    ]).filter(Boolean);
};
exports.drawCheckMark = function (options) {
    var size = objects_1.asNumber(options.size);
    /*********************** Define Check Mark Points ***************************/
    // A check mark is defined by three points in some coordinate space. Here, we
    // define these points in a unit coordinate system, where the range of the x
    // and y axis are both [-1, 1].
    //
    // Note that we do not hard code `p1y` in case we wish to change the
    // size/shape of the check mark in the future. We want the check mark to
    // always form a right angle. This means that the dot product between (p1-p2)
    // and (p3-p2) should be zero:
    //
    //   (p1x-p2x) * (p3x-p2x) + (p1y-p2y) * (p3y-p2y) = 0
    //
    // We can now rejigger this equation to solve for `p1y`:
    //
    //   (p1y-p2y) * (p3y-p2y) = -((p1x-p2x) * (p3x-p2x))
    //   (p1y-p2y) = -((p1x-p2x) * (p3x-p2x)) / (p3y-p2y)
    //   p1y = -((p1x-p2x) * (p3x-p2x)) / (p3y-p2y) + p2y
    //
    // Thanks to my friend Joel Walker (https://github.com/JWalker1995) for
    // devising the above equation and unit coordinate system approach!
    // (x, y) coords of the check mark's bottommost point
    var p2x = -1 + 0.75;
    var p2y = -1 + 0.51;
    // (x, y) coords of the check mark's topmost point
    var p3y = 1 - 0.525;
    var p3x = 1 - 0.31;
    // (x, y) coords of the check mark's center (vertically) point
    var p1x = -1 + 0.325;
    var p1y = -((p1x - p2x) * (p3x - p2x)) / (p3y - p2y) + p2y;
    /****************************************************************************/
    return [
        operators_1.pushGraphicsState(),
        options.color && colors_1.setStrokingColor(options.color),
        operators_1.setLineWidth(options.thickness),
        operators_1.translate(options.x, options.y),
        operators_1.moveTo(p1x * size, p1y * size),
        operators_1.lineTo(p2x * size, p2y * size),
        operators_1.lineTo(p3x * size, p3y * size),
        operators_1.stroke(),
        operators_1.popGraphicsState(),
    ].filter(Boolean);
};
// prettier-ignore
exports.rotateInPlace = function (options) {
    return options.rotation === 0 ? [
        operators_1.translate(0, 0),
        operators_1.rotateDegrees(0)
    ]
        : options.rotation === 90 ? [
            operators_1.translate(options.width, 0),
            operators_1.rotateDegrees(90)
        ]
            : options.rotation === 180 ? [
                operators_1.translate(options.width, options.height),
                operators_1.rotateDegrees(180)
            ]
                : options.rotation === 270 ? [
                    operators_1.translate(0, options.height),
                    operators_1.rotateDegrees(270)
                ]
                    : [];
}; // Invalid rotation - noop
exports.drawCheckBox = function (options) {
    var outline = exports.drawRectangle({
        x: options.x,
        y: options.y,
        width: options.width,
        height: options.height,
        borderWidth: options.borderWidth,
        color: options.color,
        borderColor: options.borderColor,
        rotate: rotations_1.degrees(0),
        xSkew: rotations_1.degrees(0),
        ySkew: rotations_1.degrees(0),
    });
    if (!options.filled)
        return outline;
    var width = objects_1.asNumber(options.width);
    var height = objects_1.asNumber(options.height);
    var checkMarkSize = Math.min(width, height) / 2;
    var checkMark = exports.drawCheckMark({
        x: width / 2,
        y: height / 2,
        size: checkMarkSize,
        thickness: options.thickness,
        color: options.markColor,
    });
    return tslib_1.__spreadArrays([operators_1.pushGraphicsState()], outline, checkMark, [operators_1.popGraphicsState()]);
};
exports.drawRadioButton = function (options) {
    var width = objects_1.asNumber(options.width);
    var height = objects_1.asNumber(options.height);
    var outlineScale = Math.min(width, height) / 2;
    var outline = exports.drawEllipse({
        x: options.x,
        y: options.y,
        xScale: outlineScale,
        yScale: outlineScale,
        color: options.color,
        borderColor: options.borderColor,
        borderWidth: options.borderWidth,
    });
    if (!options.filled)
        return outline;
    var dot = exports.drawEllipse({
        x: options.x,
        y: options.y,
        xScale: outlineScale * 0.45,
        yScale: outlineScale * 0.45,
        color: options.dotColor,
        borderColor: undefined,
        borderWidth: 0,
    });
    return tslib_1.__spreadArrays([operators_1.pushGraphicsState()], outline, dot, [operators_1.popGraphicsState()]);
};
exports.drawButton = function (options) {
    var x = objects_1.asNumber(options.x);
    var y = objects_1.asNumber(options.y);
    var width = objects_1.asNumber(options.width);
    var height = objects_1.asNumber(options.height);
    var background = exports.drawRectangle({
        x: x,
        y: y,
        width: width,
        height: height,
        borderWidth: options.borderWidth,
        color: options.color,
        borderColor: options.borderColor,
        rotate: rotations_1.degrees(0),
        xSkew: rotations_1.degrees(0),
        ySkew: rotations_1.degrees(0),
    });
    var lines = exports.drawTextLines(options.textLines, {
        color: options.textColor,
        font: options.font,
        size: options.fontSize,
        rotate: rotations_1.degrees(0),
        xSkew: rotations_1.degrees(0),
        ySkew: rotations_1.degrees(0),
    });
    return tslib_1.__spreadArrays([operators_1.pushGraphicsState()], background, lines, [operators_1.popGraphicsState()]);
};
exports.drawTextLines = function (lines, options) {
    var operators = [
        operators_1.beginText(),
        colors_1.setFillingColor(options.color),
        operators_1.setFontAndSize(options.font, options.size),
    ];
    for (var idx = 0, len = lines.length; idx < len; idx++) {
        var _a = lines[idx], encoded = _a.encoded, x = _a.x, y = _a.y;
        operators.push(operators_1.rotateAndSkewTextRadiansAndTranslate(rotations_1.toRadians(options.rotate), rotations_1.toRadians(options.xSkew), rotations_1.toRadians(options.ySkew), x, y), operators_1.showText(encoded));
    }
    operators.push(operators_1.endText());
    return operators;
};
exports.drawTextField = function (options) {
    var x = objects_1.asNumber(options.x);
    var y = objects_1.asNumber(options.y);
    var width = objects_1.asNumber(options.width);
    var height = objects_1.asNumber(options.height);
    var borderWidth = objects_1.asNumber(options.borderWidth);
    var padding = objects_1.asNumber(options.padding);
    var clipX = x + borderWidth / 2 + padding;
    var clipY = y + borderWidth / 2 + padding;
    var clipWidth = width - (borderWidth / 2 + padding) * 2;
    var clipHeight = height - (borderWidth / 2 + padding) * 2;
    var clippingArea = [
        operators_1.moveTo(clipX, clipY),
        operators_1.lineTo(clipX, clipY + clipHeight),
        operators_1.lineTo(clipX + clipWidth, clipY + clipHeight),
        operators_1.lineTo(clipX + clipWidth, clipY),
        operators_1.closePath(),
        operators_1.clip(),
        operators_1.endPath(),
    ];
    var background = exports.drawRectangle({
        x: x,
        y: y,
        width: width,
        height: height,
        borderWidth: options.borderWidth,
        color: options.color,
        borderColor: options.borderColor,
        rotate: rotations_1.degrees(0),
        xSkew: rotations_1.degrees(0),
        ySkew: rotations_1.degrees(0),
    });
    var lines = exports.drawTextLines(options.textLines, {
        color: options.textColor,
        font: options.font,
        size: options.fontSize,
        rotate: rotations_1.degrees(0),
        xSkew: rotations_1.degrees(0),
        ySkew: rotations_1.degrees(0),
    });
    var markedContent = tslib_1.__spreadArrays([
        operators_1.beginMarkedContent('Tx'),
        operators_1.pushGraphicsState()
    ], lines, [
        operators_1.popGraphicsState(),
        operators_1.endMarkedContent(),
    ]);
    return tslib_1.__spreadArrays([
        operators_1.pushGraphicsState()
    ], background, clippingArea, markedContent, [
        operators_1.popGraphicsState(),
    ]);
};
exports.drawOptionList = function (options) {
    var x = objects_1.asNumber(options.x);
    var y = objects_1.asNumber(options.y);
    var width = objects_1.asNumber(options.width);
    var height = objects_1.asNumber(options.height);
    var lineHeight = objects_1.asNumber(options.lineHeight);
    var borderWidth = objects_1.asNumber(options.borderWidth);
    var padding = objects_1.asNumber(options.padding);
    var clipX = x + borderWidth / 2 + padding;
    var clipY = y + borderWidth / 2 + padding;
    var clipWidth = width - (borderWidth / 2 + padding) * 2;
    var clipHeight = height - (borderWidth / 2 + padding) * 2;
    var clippingArea = [
        operators_1.moveTo(clipX, clipY),
        operators_1.lineTo(clipX, clipY + clipHeight),
        operators_1.lineTo(clipX + clipWidth, clipY + clipHeight),
        operators_1.lineTo(clipX + clipWidth, clipY),
        operators_1.closePath(),
        operators_1.clip(),
        operators_1.endPath(),
    ];
    var background = exports.drawRectangle({
        x: x,
        y: y,
        width: width,
        height: height,
        borderWidth: options.borderWidth,
        color: options.color,
        borderColor: options.borderColor,
        rotate: rotations_1.degrees(0),
        xSkew: rotations_1.degrees(0),
        ySkew: rotations_1.degrees(0),
    });
    var highlights = [];
    for (var idx = 0, len = options.selectedLines.length; idx < len; idx++) {
        var line = options.textLines[options.selectedLines[idx]];
        highlights.push.apply(highlights, exports.drawRectangle({
            x: line.x - padding,
            y: line.y - (lineHeight - line.height) / 2,
            width: width - borderWidth,
            height: line.height + (lineHeight - line.height) / 2,
            borderWidth: 0,
            color: options.selectedColor,
            borderColor: undefined,
            rotate: rotations_1.degrees(0),
            xSkew: rotations_1.degrees(0),
            ySkew: rotations_1.degrees(0),
        }));
    }
    var lines = exports.drawTextLines(options.textLines, {
        color: options.textColor,
        font: options.font,
        size: options.fontSize,
        rotate: rotations_1.degrees(0),
        xSkew: rotations_1.degrees(0),
        ySkew: rotations_1.degrees(0),
    });
    var markedContent = tslib_1.__spreadArrays([
        operators_1.beginMarkedContent('Tx'),
        operators_1.pushGraphicsState()
    ], lines, [
        operators_1.popGraphicsState(),
        operators_1.endMarkedContent(),
    ]);
    return tslib_1.__spreadArrays([
        operators_1.pushGraphicsState()
    ], background, highlights, clippingArea, markedContent, [
        operators_1.popGraphicsState(),
    ]);
};
//# sourceMappingURL=operations.js.map