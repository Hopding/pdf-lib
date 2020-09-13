import { asNumber, asPDFName, asPDFNumber } from 'src/api/objects';
import { degreesToRadians } from 'src/api/rotations';
import {
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFOperator,
  PDFOperatorNames as Ops,
} from 'src/core';

/* ==================== Clipping Path Operators ==================== */

export const clip = () => PDFOperator.of(Ops.ClipNonZero);
export const clipEvenOdd = () => PDFOperator.of(Ops.ClipEvenOdd);

/* ==================== Graphics State Operators ==================== */

const { cos, sin, tan } = Math;

export const concatTransformationMatrix = (
  a: number | PDFNumber,
  b: number | PDFNumber,
  c: number | PDFNumber,
  d: number | PDFNumber,
  e: number | PDFNumber,
  f: number | PDFNumber,
) =>
  PDFOperator.of(Ops.ConcatTransformationMatrix, [
    asPDFNumber(a),
    asPDFNumber(b),
    asPDFNumber(c),
    asPDFNumber(d),
    asPDFNumber(e),
    asPDFNumber(f),
  ]);

export const translate = (xPos: number | PDFNumber, yPos: number | PDFNumber) =>
  concatTransformationMatrix(1, 0, 0, 1, xPos, yPos);

export const scale = (xPos: number | PDFNumber, yPos: number | PDFNumber) =>
  concatTransformationMatrix(xPos, 0, 0, yPos, 0, 0);

export const rotateRadians = (angle: number | PDFNumber) =>
  concatTransformationMatrix(
    cos(asNumber(angle)),
    sin(asNumber(angle)),
    -sin(asNumber(angle)),
    cos(asNumber(angle)),
    0,
    0,
  );

export const rotateDegrees = (angle: number | PDFNumber) =>
  rotateRadians(degreesToRadians(asNumber(angle)));

export const skewRadians = (
  xSkewAngle: number | PDFNumber,
  ySkewAngle: number | PDFNumber,
) =>
  concatTransformationMatrix(
    1,
    tan(asNumber(xSkewAngle)),
    tan(asNumber(ySkewAngle)),
    1,
    0,
    0,
  );

export const skewDegrees = (
  xSkewAngle: number | PDFNumber,
  ySkewAngle: number | PDFNumber,
) =>
  skewRadians(
    degreesToRadians(asNumber(xSkewAngle)),
    degreesToRadians(asNumber(ySkewAngle)),
  );

export const setDashPattern = (
  dashArray: (number | PDFNumber)[],
  dashPhase: number | PDFNumber,
) =>
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

export const setGraphicsState = (state: string | PDFName) =>
  PDFOperator.of(Ops.SetGraphicsStateParams, [asPDFName(state)]);

export const pushGraphicsState = () => PDFOperator.of(Ops.PushGraphicsState);

export const popGraphicsState = () => PDFOperator.of(Ops.PopGraphicsState);

export const setLineWidth = (width: number | PDFNumber) =>
  PDFOperator.of(Ops.SetLineWidth, [asPDFNumber(width)]);

/* ==================== Path Construction Operators ==================== */

export const appendBezierCurve = (
  x1: number | PDFNumber,
  y1: number | PDFNumber,
  x2: number | PDFNumber,
  y2: number | PDFNumber,
  x3: number | PDFNumber,
  y3: number | PDFNumber,
) =>
  PDFOperator.of(Ops.AppendBezierCurve, [
    asPDFNumber(x1),
    asPDFNumber(y1),
    asPDFNumber(x2),
    asPDFNumber(y2),
    asPDFNumber(x3),
    asPDFNumber(y3),
  ]);

export const appendQuadraticCurve = (
  x1: number | PDFNumber,
  y1: number | PDFNumber,
  x2: number | PDFNumber,
  y2: number | PDFNumber,
) =>
  PDFOperator.of(Ops.CurveToReplicateInitialPoint, [
    asPDFNumber(x1),
    asPDFNumber(y1),
    asPDFNumber(x2),
    asPDFNumber(y2),
  ]);

export const closePath = () => PDFOperator.of(Ops.ClosePath);

export const moveTo = (xPos: number | PDFNumber, yPos: number | PDFNumber) =>
  PDFOperator.of(Ops.MoveTo, [asPDFNumber(xPos), asPDFNumber(yPos)]);

export const lineTo = (xPos: number | PDFNumber, yPos: number | PDFNumber) =>
  PDFOperator.of(Ops.LineTo, [asPDFNumber(xPos), asPDFNumber(yPos)]);

/**
 * @param xPos x coordinate for the lower left corner of the rectangle
 * @param yPos y coordinate for the lower left corner of the rectangle
 * @param width width of the rectangle
 * @param height height of the rectangle
 */
export const rectangle = (
  xPos: number | PDFNumber,
  yPos: number | PDFNumber,
  width: number | PDFNumber,
  height: number | PDFNumber,
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

export const moveText = (x: number | PDFNumber, y: number | PDFNumber) =>
  PDFOperator.of(Ops.MoveText, [asPDFNumber(x), asPDFNumber(y)]);

/* ==================== Text Showing Operators ==================== */

export const showText = (text: PDFHexString) =>
  PDFOperator.of(Ops.ShowText, [text]);

/* ==================== Text State Operators ==================== */

export const beginText = () => PDFOperator.of(Ops.BeginText);
export const endText = () => PDFOperator.of(Ops.EndText);

export const setFontAndSize = (
  name: string | PDFName,
  size: number | PDFNumber,
) => PDFOperator.of(Ops.SetFontAndSize, [asPDFName(name), asPDFNumber(size)]);

export const setCharacterSpacing = (spacing: number | PDFNumber) =>
  PDFOperator.of(Ops.SetCharacterSpacing, [asPDFNumber(spacing)]);

export const setWordSpacing = (spacing: number | PDFNumber) =>
  PDFOperator.of(Ops.SetWordSpacing, [asPDFNumber(spacing)]);

/** @param squeeze horizontal character spacing */
export const setCharacterSqueeze = (squeeze: number | PDFNumber) =>
  PDFOperator.of(Ops.SetTextHorizontalScaling, [asPDFNumber(squeeze)]);

export const setLineHeight = (lineHeight: number | PDFNumber) =>
  PDFOperator.of(Ops.SetTextLineHeight, [asPDFNumber(lineHeight)]);

export const setTextRise = (rise: number | PDFNumber) =>
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
  a: number | PDFNumber,
  b: number | PDFNumber,
  c: number | PDFNumber,
  d: number | PDFNumber,
  e: number | PDFNumber,
  f: number | PDFNumber,
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
  rotationAngle: number | PDFNumber,
  xSkewAngle: number | PDFNumber,
  ySkewAngle: number | PDFNumber,
  x: number | PDFNumber,
  y: number | PDFNumber,
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
  rotationAngle: number | PDFNumber,
  xSkewAngle: number | PDFNumber,
  ySkewAngle: number | PDFNumber,
  x: number | PDFNumber,
  y: number | PDFNumber,
) =>
  rotateAndSkewTextRadiansAndTranslate(
    degreesToRadians(asNumber(rotationAngle)),
    degreesToRadians(asNumber(xSkewAngle)),
    degreesToRadians(asNumber(ySkewAngle)),
    x,
    y,
  );

/* ==================== XObject Operator ==================== */

export const drawObject = (name: string | PDFName) =>
  PDFOperator.of(Ops.DrawObject, [asPDFName(name)]);

/* ==================== Color Operators ==================== */

export const setFillingGrayscaleColor = (gray: number | PDFNumber) =>
  PDFOperator.of(Ops.NonStrokingColorGray, [asPDFNumber(gray)]);

export const setStrokingGrayscaleColor = (gray: number | PDFNumber) =>
  PDFOperator.of(Ops.StrokingColorGray, [asPDFNumber(gray)]);

export const setFillingRgbColor = (
  red: number | PDFNumber,
  green: number | PDFNumber,
  blue: number | PDFNumber,
) =>
  PDFOperator.of(Ops.NonStrokingColorRgb, [
    asPDFNumber(red),
    asPDFNumber(green),
    asPDFNumber(blue),
  ]);

export const setStrokingRgbColor = (
  red: number | PDFNumber,
  green: number | PDFNumber,
  blue: number | PDFNumber,
) =>
  PDFOperator.of(Ops.StrokingColorRgb, [
    asPDFNumber(red),
    asPDFNumber(green),
    asPDFNumber(blue),
  ]);

export const setFillingCmykColor = (
  cyan: number | PDFNumber,
  magenta: number | PDFNumber,
  yellow: number | PDFNumber,
  key: number | PDFNumber,
) =>
  PDFOperator.of(Ops.NonStrokingColorCmyk, [
    asPDFNumber(cyan),
    asPDFNumber(magenta),
    asPDFNumber(yellow),
    asPDFNumber(key),
  ]);

export const setStrokingCmykColor = (
  cyan: number | PDFNumber,
  magenta: number | PDFNumber,
  yellow: number | PDFNumber,
  key: number | PDFNumber,
) =>
  PDFOperator.of(Ops.StrokingColorCmyk, [
    asPDFNumber(cyan),
    asPDFNumber(magenta),
    asPDFNumber(yellow),
    asPDFNumber(key),
  ]);

/* ==================== Marked Content Operators ==================== */

export const beginMarkedContent = (tag: string | PDFName) =>
  PDFOperator.of(Ops.BeginMarkedContent, [asPDFName(tag)]);

export const endMarkedContent = () => PDFOperator.of(Ops.EndMarkedContent);
