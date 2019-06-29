import { asNumber, asPDFName, asPDFNumber } from 'src/api/objects';
import { degreesToRadians } from 'src/api/rotations';
import {
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFOperator,
  PDFOperatorNames as Ops,
} from 'src/core';

export type NameT = string | PDFName;
export type NumberT = number | PDFNumber;

/* ==================== Clipping Path Operators ==================== */

export const clip = () => PDFOperator.of(Ops.ClipNonZero);
export const clipEvenOdd = () => PDFOperator.of(Ops.ClipEvenOdd);

/* ==================== Graphics State Operators ==================== */

const { cos, sin, tan } = Math;

export const concatTransformationMatrix = (
  a: NumberT,
  b: NumberT,
  c: NumberT,
  d: NumberT,
  e: NumberT,
  f: NumberT,
) =>
  PDFOperator.of(Ops.ConcatTransformationMatrix, [
    asPDFNumber(a),
    asPDFNumber(b),
    asPDFNumber(c),
    asPDFNumber(d),
    asPDFNumber(e),
    asPDFNumber(f),
  ]);

export const translate = (xPos: NumberT, yPos: NumberT) =>
  concatTransformationMatrix(1, 0, 0, 1, xPos, yPos);

export const scale = (xPos: NumberT, yPos: NumberT) =>
  concatTransformationMatrix(xPos, 0, 0, yPos, 0, 0);

export const rotateRadians = (angle: NumberT) =>
  concatTransformationMatrix(
    cos(asNumber(angle)),
    sin(asNumber(angle)),
    -sin(asNumber(angle)),
    cos(asNumber(angle)),
    0,
    0,
  );

export const rotateDegrees = (angle: NumberT) =>
  rotateRadians(degreesToRadians(asNumber(angle)));

export const skewRadians = (xSkewAngle: NumberT, ySkewAngle: NumberT) =>
  concatTransformationMatrix(
    1,
    tan(asNumber(xSkewAngle)),
    tan(asNumber(ySkewAngle)),
    1,
    0,
    0,
  );

export const skewDegrees = (xSkewAngle: NumberT, ySkewAngle: NumberT) =>
  skewRadians(
    degreesToRadians(asNumber(xSkewAngle)),
    degreesToRadians(asNumber(ySkewAngle)),
  );

export const setDashPattern = (dashArray: NumberT[], dashPhase: NumberT) =>
  PDFOperator.of(Ops.SetLineDashPattern, [
    `[${dashArray.map(asPDFNumber).join(' ')}]`,
    asPDFNumber(dashPhase),
  ]);

export const restoreDashPattern = () => setDashPattern([], 0);

export enum LineCapStyle {
  Butt = 0,
  Round = 1,
  Projecting = 2,
}

export const setLineCap = (style: LineCapStyle) =>
  PDFOperator.of(Ops.SetLineCapStyle, [asPDFNumber(style)]);

export enum LineJoinStyle {
  Miter = 0,
  Round = 1,
  Bevel = 2,
}

export const setLineJoin = (style: LineJoinStyle) =>
  PDFOperator.of(Ops.SetLineJoinStyle, [asPDFNumber(style)]);

export const pushGraphicsState = () => PDFOperator.of(Ops.PushGraphicsState);

export const popGraphicsState = () => PDFOperator.of(Ops.PopGraphicsState);

export const setLineWidth = (width: NumberT) =>
  PDFOperator.of(Ops.SetLineWidth, [asPDFNumber(width)]);

/* ==================== Path Construction Operators ==================== */

export const appendBezierCurve = (
  x1: NumberT,
  y1: NumberT,
  x2: NumberT,
  y2: NumberT,
  x3: NumberT,
  y3: NumberT,
) =>
  PDFOperator.of(Ops.AppendBezierCurve, [
    asPDFNumber(x1),
    asPDFNumber(y1),
    asPDFNumber(x2),
    asPDFNumber(y2),
    asPDFNumber(x3),
    asPDFNumber(y3),
  ]);

export const closePath = () => PDFOperator.of(Ops.ClosePath);

export const moveTo = (xPos: NumberT, yPos: NumberT) =>
  PDFOperator.of(Ops.MoveTo, [asPDFNumber(xPos), asPDFNumber(yPos)]);

export const lineTo = (xPos: NumberT, yPos: NumberT) =>
  PDFOperator.of(Ops.LineTo, [asPDFNumber(xPos), asPDFNumber(yPos)]);

/**
 * @param xPos x coordinate for the lower left corner of the rectangle
 * @param yPos y coordinate for the lower left corner of the rectangle
 * @param width width of the rectangle
 * @param height height of the rectangle
 */
export const rectangle = (
  xPos: NumberT,
  yPos: NumberT,
  width: NumberT,
  height: NumberT,
) =>
  PDFOperator.of(Ops.AppendRectangle, [
    asPDFNumber(xPos),
    asPDFNumber(yPos),
    asPDFNumber(width),
    asPDFNumber(height),
  ]);

/**
 * @param xPos x coordinate for the lower left corner of the square
 * @param yPos y coordinate for the lower left corner of the square
 * @param size width and height of the square
 */
export const square = (xPos: number, yPos: number, size: number) =>
  rectangle(xPos, yPos, size, size);

/* ==================== Path Painting Operators ==================== */

export const stroke = () => PDFOperator.of(Ops.StrokePath);

export const fill = () => PDFOperator.of(Ops.FillNonZero);

export const fillAndStroke = () => PDFOperator.of(Ops.FillNonZeroAndStroke);

export const endPath = () => PDFOperator.of(Ops.EndPath);

/* ==================== Text Positioning Operators ==================== */

export const nextLine = () => PDFOperator.of(Ops.NextLine);

export const moveText = (x: NumberT, y: NumberT) =>
  PDFOperator.of(Ops.MoveText, [asPDFNumber(x), asPDFNumber(y)]);

/* ==================== Text Showing Operators ==================== */

export const showText = (text: PDFHexString) =>
  PDFOperator.of(Ops.ShowText, [text]);

/* ==================== Text State Operators ==================== */

export const beginText = () => PDFOperator.of(Ops.BeginText);
export const endText = () => PDFOperator.of(Ops.EndText);

export const setFontAndSize = (name: NameT, size: NumberT) =>
  PDFOperator.of(Ops.SetFontAndSize, [asPDFName(name), asPDFNumber(size)]);

export const setCharacterSpacing = (spacing: NumberT) =>
  PDFOperator.of(Ops.SetCharacterSpacing, [asPDFNumber(spacing)]);

export const setWordSpacing = (spacing: NumberT) =>
  PDFOperator.of(Ops.SetWordSpacing, [asPDFNumber(spacing)]);

/** @param squeeze horizontal character spacing */
export const setCharacterSqueeze = (squeeze: NumberT) =>
  PDFOperator.of(Ops.SetTextHorizontalScaling, [asPDFNumber(squeeze)]);

export const setLineHeight = (lineHeight: NumberT) =>
  PDFOperator.of(Ops.SetTextLineHeight, [asPDFNumber(lineHeight)]);

export const setTextRise = (rise: NumberT) =>
  PDFOperator.of(Ops.SetTextRise, [asPDFNumber(rise)]);

export enum TextRenderingMode {
  Fill = 0,
  Outline = 1,
  FillAndOutline = 2,
  Invisible = 3,
  FillAndClip = 4,
  OutlineAndClip = 5,
  FillAndOutlineAndClip = 6,
  Clip = 7,
}

export const setTextRenderingMode = (mode: TextRenderingMode) =>
  PDFOperator.of(Ops.SetTextRenderingMode, [asPDFNumber(mode)]);

export const setTextMatrix = (
  a: NumberT,
  b: NumberT,
  c: NumberT,
  d: NumberT,
  e: NumberT,
  f: NumberT,
) =>
  PDFOperator.of(Ops.SetTextMatrix, [
    asPDFNumber(a),
    asPDFNumber(b),
    asPDFNumber(c),
    asPDFNumber(d),
    asPDFNumber(e),
    asPDFNumber(f),
  ]);

export const rotateAndSkewTextRadiansAndTranslate = (
  rotationAngle: NumberT,
  xSkewAngle: NumberT,
  ySkewAngle: NumberT,
  x: NumberT,
  y: NumberT,
) =>
  setTextMatrix(
    cos(asNumber(rotationAngle)),
    sin(asNumber(rotationAngle)) + tan(asNumber(xSkewAngle)),
    -sin(asNumber(rotationAngle)) + tan(asNumber(ySkewAngle)),
    cos(asNumber(rotationAngle)),
    x,
    y,
  );

export const rotateAndSkewTextDegreesAndTranslate = (
  rotationAngle: NumberT,
  xSkewAngle: NumberT,
  ySkewAngle: NumberT,
  x: NumberT,
  y: NumberT,
) =>
  rotateAndSkewTextRadiansAndTranslate(
    degreesToRadians(asNumber(rotationAngle)),
    degreesToRadians(asNumber(xSkewAngle)),
    degreesToRadians(asNumber(ySkewAngle)),
    x,
    y,
  );

/* ==================== XObject Operator ==================== */

export const drawObject = (name: NameT) =>
  PDFOperator.of(Ops.DrawObject, [asPDFName(name)]);

/* ==================== Color Operators ==================== */

export const setFillingGrayscaleColor = (gray: NumberT) =>
  PDFOperator.of(Ops.NonStrokingColorGray, [asPDFNumber(gray)]);

export const setStrokingGrayscaleColor = (gray: NumberT) =>
  PDFOperator.of(Ops.StrokingColorGray, [asPDFNumber(gray)]);

export const setFillingRgbColor = (
  red: NumberT,
  green: NumberT,
  blue: NumberT,
) =>
  PDFOperator.of(Ops.NonStrokingColorRgb, [
    asPDFNumber(red),
    asPDFNumber(green),
    asPDFNumber(blue),
  ]);

export const setStrokingRgbColor = (
  red: NumberT,
  green: NumberT,
  blue: NumberT,
) =>
  PDFOperator.of(Ops.StrokingColorRgb, [
    asPDFNumber(red),
    asPDFNumber(green),
    asPDFNumber(blue),
  ]);

export const setFillingCmykColor = (
  cyan: NumberT,
  magenta: NumberT,
  yellow: NumberT,
  key: NumberT,
) =>
  PDFOperator.of(Ops.NonStrokingColorCmyk, [
    asPDFNumber(cyan),
    asPDFNumber(magenta),
    asPDFNumber(yellow),
    asPDFNumber(key),
  ]);

export const setStrokingCmykColor = (
  cyan: NumberT,
  magenta: NumberT,
  yellow: NumberT,
  key: NumberT,
) =>
  PDFOperator.of(Ops.StrokingColorCmyk, [
    asPDFNumber(cyan),
    asPDFNumber(magenta),
    asPDFNumber(yellow),
    asPDFNumber(key),
  ]);
