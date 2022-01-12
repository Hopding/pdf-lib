"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endMarkedContent = exports.beginMarkedContent = exports.setStrokingCmykColor = exports.setFillingCmykColor = exports.setStrokingRgbColor = exports.setFillingRgbColor = exports.setStrokingGrayscaleColor = exports.setFillingGrayscaleColor = exports.drawObject = exports.rotateAndSkewTextDegreesAndTranslate = exports.rotateAndSkewTextRadiansAndTranslate = exports.setTextMatrix = exports.setTextRenderingMode = exports.TextRenderingMode = exports.setTextRise = exports.setLineHeight = exports.setCharacterSqueeze = exports.setWordSpacing = exports.setCharacterSpacing = exports.setFontAndSize = exports.endText = exports.beginText = exports.showText = exports.moveText = exports.nextLine = exports.endPath = exports.fillAndStroke = exports.fill = exports.stroke = exports.square = exports.rectangle = exports.lineTo = exports.moveTo = exports.closePath = exports.appendQuadraticCurve = exports.appendBezierCurve = exports.setLineWidth = exports.popGraphicsState = exports.pushGraphicsState = exports.setGraphicsState = exports.setLineJoin = exports.LineJoinStyle = exports.setLineCap = exports.LineCapStyle = exports.restoreDashPattern = exports.setDashPattern = exports.skewDegrees = exports.skewRadians = exports.rotateDegrees = exports.rotateRadians = exports.scale = exports.translate = exports.concatTransformationMatrix = exports.clipEvenOdd = exports.clip = void 0;
var objects_1 = require("./objects");
var rotations_1 = require("./rotations");
var core_1 = require("../core");
/* ==================== Clipping Path Operators ==================== */
exports.clip = function () { return core_1.PDFOperator.of(core_1.PDFOperatorNames.ClipNonZero); };
exports.clipEvenOdd = function () { return core_1.PDFOperator.of(core_1.PDFOperatorNames.ClipEvenOdd); };
/* ==================== Graphics State Operators ==================== */
var cos = Math.cos, sin = Math.sin, tan = Math.tan;
exports.concatTransformationMatrix = function (a, b, c, d, e, f) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.ConcatTransformationMatrix, [
        objects_1.asPDFNumber(a),
        objects_1.asPDFNumber(b),
        objects_1.asPDFNumber(c),
        objects_1.asPDFNumber(d),
        objects_1.asPDFNumber(e),
        objects_1.asPDFNumber(f),
    ]);
};
exports.translate = function (xPos, yPos) {
    return exports.concatTransformationMatrix(1, 0, 0, 1, xPos, yPos);
};
exports.scale = function (xPos, yPos) {
    return exports.concatTransformationMatrix(xPos, 0, 0, yPos, 0, 0);
};
exports.rotateRadians = function (angle) {
    return exports.concatTransformationMatrix(cos(objects_1.asNumber(angle)), sin(objects_1.asNumber(angle)), -sin(objects_1.asNumber(angle)), cos(objects_1.asNumber(angle)), 0, 0);
};
exports.rotateDegrees = function (angle) {
    return exports.rotateRadians(rotations_1.degreesToRadians(objects_1.asNumber(angle)));
};
exports.skewRadians = function (xSkewAngle, ySkewAngle) {
    return exports.concatTransformationMatrix(1, tan(objects_1.asNumber(xSkewAngle)), tan(objects_1.asNumber(ySkewAngle)), 1, 0, 0);
};
exports.skewDegrees = function (xSkewAngle, ySkewAngle) {
    return exports.skewRadians(rotations_1.degreesToRadians(objects_1.asNumber(xSkewAngle)), rotations_1.degreesToRadians(objects_1.asNumber(ySkewAngle)));
};
exports.setDashPattern = function (dashArray, dashPhase) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.SetLineDashPattern, [
        "[" + dashArray.map(objects_1.asPDFNumber).join(' ') + "]",
        objects_1.asPDFNumber(dashPhase),
    ]);
};
exports.restoreDashPattern = function () { return exports.setDashPattern([], 0); };
var LineCapStyle;
(function (LineCapStyle) {
    LineCapStyle[LineCapStyle["Butt"] = 0] = "Butt";
    LineCapStyle[LineCapStyle["Round"] = 1] = "Round";
    LineCapStyle[LineCapStyle["Projecting"] = 2] = "Projecting";
})(LineCapStyle = exports.LineCapStyle || (exports.LineCapStyle = {}));
exports.setLineCap = function (style) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.SetLineCapStyle, [objects_1.asPDFNumber(style)]);
};
var LineJoinStyle;
(function (LineJoinStyle) {
    LineJoinStyle[LineJoinStyle["Miter"] = 0] = "Miter";
    LineJoinStyle[LineJoinStyle["Round"] = 1] = "Round";
    LineJoinStyle[LineJoinStyle["Bevel"] = 2] = "Bevel";
})(LineJoinStyle = exports.LineJoinStyle || (exports.LineJoinStyle = {}));
exports.setLineJoin = function (style) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.SetLineJoinStyle, [objects_1.asPDFNumber(style)]);
};
exports.setGraphicsState = function (state) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.SetGraphicsStateParams, [objects_1.asPDFName(state)]);
};
exports.pushGraphicsState = function () { return core_1.PDFOperator.of(core_1.PDFOperatorNames.PushGraphicsState); };
exports.popGraphicsState = function () { return core_1.PDFOperator.of(core_1.PDFOperatorNames.PopGraphicsState); };
exports.setLineWidth = function (width) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.SetLineWidth, [objects_1.asPDFNumber(width)]);
};
/* ==================== Path Construction Operators ==================== */
exports.appendBezierCurve = function (x1, y1, x2, y2, x3, y3) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.AppendBezierCurve, [
        objects_1.asPDFNumber(x1),
        objects_1.asPDFNumber(y1),
        objects_1.asPDFNumber(x2),
        objects_1.asPDFNumber(y2),
        objects_1.asPDFNumber(x3),
        objects_1.asPDFNumber(y3),
    ]);
};
exports.appendQuadraticCurve = function (x1, y1, x2, y2) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.CurveToReplicateInitialPoint, [
        objects_1.asPDFNumber(x1),
        objects_1.asPDFNumber(y1),
        objects_1.asPDFNumber(x2),
        objects_1.asPDFNumber(y2),
    ]);
};
exports.closePath = function () { return core_1.PDFOperator.of(core_1.PDFOperatorNames.ClosePath); };
exports.moveTo = function (xPos, yPos) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.MoveTo, [objects_1.asPDFNumber(xPos), objects_1.asPDFNumber(yPos)]);
};
exports.lineTo = function (xPos, yPos) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.LineTo, [objects_1.asPDFNumber(xPos), objects_1.asPDFNumber(yPos)]);
};
/**
 * @param xPos x coordinate for the lower left corner of the rectangle
 * @param yPos y coordinate for the lower left corner of the rectangle
 * @param width width of the rectangle
 * @param height height of the rectangle
 */
exports.rectangle = function (xPos, yPos, width, height) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.AppendRectangle, [
        objects_1.asPDFNumber(xPos),
        objects_1.asPDFNumber(yPos),
        objects_1.asPDFNumber(width),
        objects_1.asPDFNumber(height),
    ]);
};
/**
 * @param xPos x coordinate for the lower left corner of the square
 * @param yPos y coordinate for the lower left corner of the square
 * @param size width and height of the square
 */
exports.square = function (xPos, yPos, size) {
    return exports.rectangle(xPos, yPos, size, size);
};
/* ==================== Path Painting Operators ==================== */
exports.stroke = function () { return core_1.PDFOperator.of(core_1.PDFOperatorNames.StrokePath); };
exports.fill = function () { return core_1.PDFOperator.of(core_1.PDFOperatorNames.FillNonZero); };
exports.fillAndStroke = function () { return core_1.PDFOperator.of(core_1.PDFOperatorNames.FillNonZeroAndStroke); };
exports.endPath = function () { return core_1.PDFOperator.of(core_1.PDFOperatorNames.EndPath); };
/* ==================== Text Positioning Operators ==================== */
exports.nextLine = function () { return core_1.PDFOperator.of(core_1.PDFOperatorNames.NextLine); };
exports.moveText = function (x, y) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.MoveText, [objects_1.asPDFNumber(x), objects_1.asPDFNumber(y)]);
};
/* ==================== Text Showing Operators ==================== */
exports.showText = function (text) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.ShowText, [text]);
};
/* ==================== Text State Operators ==================== */
exports.beginText = function () { return core_1.PDFOperator.of(core_1.PDFOperatorNames.BeginText); };
exports.endText = function () { return core_1.PDFOperator.of(core_1.PDFOperatorNames.EndText); };
exports.setFontAndSize = function (name, size) { return core_1.PDFOperator.of(core_1.PDFOperatorNames.SetFontAndSize, [objects_1.asPDFName(name), objects_1.asPDFNumber(size)]); };
exports.setCharacterSpacing = function (spacing) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.SetCharacterSpacing, [objects_1.asPDFNumber(spacing)]);
};
exports.setWordSpacing = function (spacing) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.SetWordSpacing, [objects_1.asPDFNumber(spacing)]);
};
/** @param squeeze horizontal character spacing */
exports.setCharacterSqueeze = function (squeeze) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.SetTextHorizontalScaling, [objects_1.asPDFNumber(squeeze)]);
};
exports.setLineHeight = function (lineHeight) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.SetTextLineHeight, [objects_1.asPDFNumber(lineHeight)]);
};
exports.setTextRise = function (rise) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.SetTextRise, [objects_1.asPDFNumber(rise)]);
};
var TextRenderingMode;
(function (TextRenderingMode) {
    TextRenderingMode[TextRenderingMode["Fill"] = 0] = "Fill";
    TextRenderingMode[TextRenderingMode["Outline"] = 1] = "Outline";
    TextRenderingMode[TextRenderingMode["FillAndOutline"] = 2] = "FillAndOutline";
    TextRenderingMode[TextRenderingMode["Invisible"] = 3] = "Invisible";
    TextRenderingMode[TextRenderingMode["FillAndClip"] = 4] = "FillAndClip";
    TextRenderingMode[TextRenderingMode["OutlineAndClip"] = 5] = "OutlineAndClip";
    TextRenderingMode[TextRenderingMode["FillAndOutlineAndClip"] = 6] = "FillAndOutlineAndClip";
    TextRenderingMode[TextRenderingMode["Clip"] = 7] = "Clip";
})(TextRenderingMode = exports.TextRenderingMode || (exports.TextRenderingMode = {}));
exports.setTextRenderingMode = function (mode) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.SetTextRenderingMode, [objects_1.asPDFNumber(mode)]);
};
exports.setTextMatrix = function (a, b, c, d, e, f) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.SetTextMatrix, [
        objects_1.asPDFNumber(a),
        objects_1.asPDFNumber(b),
        objects_1.asPDFNumber(c),
        objects_1.asPDFNumber(d),
        objects_1.asPDFNumber(e),
        objects_1.asPDFNumber(f),
    ]);
};
exports.rotateAndSkewTextRadiansAndTranslate = function (rotationAngle, xSkewAngle, ySkewAngle, x, y) {
    return exports.setTextMatrix(cos(objects_1.asNumber(rotationAngle)), sin(objects_1.asNumber(rotationAngle)) + tan(objects_1.asNumber(xSkewAngle)), -sin(objects_1.asNumber(rotationAngle)) + tan(objects_1.asNumber(ySkewAngle)), cos(objects_1.asNumber(rotationAngle)), x, y);
};
exports.rotateAndSkewTextDegreesAndTranslate = function (rotationAngle, xSkewAngle, ySkewAngle, x, y) {
    return exports.rotateAndSkewTextRadiansAndTranslate(rotations_1.degreesToRadians(objects_1.asNumber(rotationAngle)), rotations_1.degreesToRadians(objects_1.asNumber(xSkewAngle)), rotations_1.degreesToRadians(objects_1.asNumber(ySkewAngle)), x, y);
};
/* ==================== XObject Operator ==================== */
exports.drawObject = function (name) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.DrawObject, [objects_1.asPDFName(name)]);
};
/* ==================== Color Operators ==================== */
exports.setFillingGrayscaleColor = function (gray) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.NonStrokingColorGray, [objects_1.asPDFNumber(gray)]);
};
exports.setStrokingGrayscaleColor = function (gray) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.StrokingColorGray, [objects_1.asPDFNumber(gray)]);
};
exports.setFillingRgbColor = function (red, green, blue) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.NonStrokingColorRgb, [
        objects_1.asPDFNumber(red),
        objects_1.asPDFNumber(green),
        objects_1.asPDFNumber(blue),
    ]);
};
exports.setStrokingRgbColor = function (red, green, blue) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.StrokingColorRgb, [
        objects_1.asPDFNumber(red),
        objects_1.asPDFNumber(green),
        objects_1.asPDFNumber(blue),
    ]);
};
exports.setFillingCmykColor = function (cyan, magenta, yellow, key) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.NonStrokingColorCmyk, [
        objects_1.asPDFNumber(cyan),
        objects_1.asPDFNumber(magenta),
        objects_1.asPDFNumber(yellow),
        objects_1.asPDFNumber(key),
    ]);
};
exports.setStrokingCmykColor = function (cyan, magenta, yellow, key) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.StrokingColorCmyk, [
        objects_1.asPDFNumber(cyan),
        objects_1.asPDFNumber(magenta),
        objects_1.asPDFNumber(yellow),
        objects_1.asPDFNumber(key),
    ]);
};
/* ==================== Marked Content Operators ==================== */
exports.beginMarkedContent = function (tag) {
    return core_1.PDFOperator.of(core_1.PDFOperatorNames.BeginMarkedContent, [objects_1.asPDFName(tag)]);
};
exports.endMarkedContent = function () { return core_1.PDFOperator.of(core_1.PDFOperatorNames.EndMarkedContent); };
//# sourceMappingURL=operators.js.map