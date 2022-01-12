import { PDFHexString, PDFName, PDFNumber, PDFOperator } from "../core";
export declare const clip: () => PDFOperator;
export declare const clipEvenOdd: () => PDFOperator;
export declare const concatTransformationMatrix: (a: number | PDFNumber, b: number | PDFNumber, c: number | PDFNumber, d: number | PDFNumber, e: number | PDFNumber, f: number | PDFNumber) => PDFOperator;
export declare const translate: (xPos: number | PDFNumber, yPos: number | PDFNumber) => PDFOperator;
export declare const scale: (xPos: number | PDFNumber, yPos: number | PDFNumber) => PDFOperator;
export declare const rotateRadians: (angle: number | PDFNumber) => PDFOperator;
export declare const rotateDegrees: (angle: number | PDFNumber) => PDFOperator;
export declare const skewRadians: (xSkewAngle: number | PDFNumber, ySkewAngle: number | PDFNumber) => PDFOperator;
export declare const skewDegrees: (xSkewAngle: number | PDFNumber, ySkewAngle: number | PDFNumber) => PDFOperator;
export declare const setDashPattern: (dashArray: (number | PDFNumber)[], dashPhase: number | PDFNumber) => PDFOperator;
export declare const restoreDashPattern: () => PDFOperator;
export declare enum LineCapStyle {
    Butt = 0,
    Round = 1,
    Projecting = 2
}
export declare const setLineCap: (style: LineCapStyle) => PDFOperator;
export declare enum LineJoinStyle {
    Miter = 0,
    Round = 1,
    Bevel = 2
}
export declare const setLineJoin: (style: LineJoinStyle) => PDFOperator;
export declare const setGraphicsState: (state: string | PDFName) => PDFOperator;
export declare const pushGraphicsState: () => PDFOperator;
export declare const popGraphicsState: () => PDFOperator;
export declare const setLineWidth: (width: number | PDFNumber) => PDFOperator;
export declare const appendBezierCurve: (x1: number | PDFNumber, y1: number | PDFNumber, x2: number | PDFNumber, y2: number | PDFNumber, x3: number | PDFNumber, y3: number | PDFNumber) => PDFOperator;
export declare const appendQuadraticCurve: (x1: number | PDFNumber, y1: number | PDFNumber, x2: number | PDFNumber, y2: number | PDFNumber) => PDFOperator;
export declare const closePath: () => PDFOperator;
export declare const moveTo: (xPos: number | PDFNumber, yPos: number | PDFNumber) => PDFOperator;
export declare const lineTo: (xPos: number | PDFNumber, yPos: number | PDFNumber) => PDFOperator;
/**
 * @param xPos x coordinate for the lower left corner of the rectangle
 * @param yPos y coordinate for the lower left corner of the rectangle
 * @param width width of the rectangle
 * @param height height of the rectangle
 */
export declare const rectangle: (xPos: number | PDFNumber, yPos: number | PDFNumber, width: number | PDFNumber, height: number | PDFNumber) => PDFOperator;
/**
 * @param xPos x coordinate for the lower left corner of the square
 * @param yPos y coordinate for the lower left corner of the square
 * @param size width and height of the square
 */
export declare const square: (xPos: number, yPos: number, size: number) => PDFOperator;
export declare const stroke: () => PDFOperator;
export declare const fill: () => PDFOperator;
export declare const fillAndStroke: () => PDFOperator;
export declare const endPath: () => PDFOperator;
export declare const nextLine: () => PDFOperator;
export declare const moveText: (x: number | PDFNumber, y: number | PDFNumber) => PDFOperator;
export declare const showText: (text: PDFHexString) => PDFOperator;
export declare const beginText: () => PDFOperator;
export declare const endText: () => PDFOperator;
export declare const setFontAndSize: (name: string | PDFName, size: number | PDFNumber) => PDFOperator;
export declare const setCharacterSpacing: (spacing: number | PDFNumber) => PDFOperator;
export declare const setWordSpacing: (spacing: number | PDFNumber) => PDFOperator;
/** @param squeeze horizontal character spacing */
export declare const setCharacterSqueeze: (squeeze: number | PDFNumber) => PDFOperator;
export declare const setLineHeight: (lineHeight: number | PDFNumber) => PDFOperator;
export declare const setTextRise: (rise: number | PDFNumber) => PDFOperator;
export declare enum TextRenderingMode {
    Fill = 0,
    Outline = 1,
    FillAndOutline = 2,
    Invisible = 3,
    FillAndClip = 4,
    OutlineAndClip = 5,
    FillAndOutlineAndClip = 6,
    Clip = 7
}
export declare const setTextRenderingMode: (mode: TextRenderingMode) => PDFOperator;
export declare const setTextMatrix: (a: number | PDFNumber, b: number | PDFNumber, c: number | PDFNumber, d: number | PDFNumber, e: number | PDFNumber, f: number | PDFNumber) => PDFOperator;
export declare const rotateAndSkewTextRadiansAndTranslate: (rotationAngle: number | PDFNumber, xSkewAngle: number | PDFNumber, ySkewAngle: number | PDFNumber, x: number | PDFNumber, y: number | PDFNumber) => PDFOperator;
export declare const rotateAndSkewTextDegreesAndTranslate: (rotationAngle: number | PDFNumber, xSkewAngle: number | PDFNumber, ySkewAngle: number | PDFNumber, x: number | PDFNumber, y: number | PDFNumber) => PDFOperator;
export declare const drawObject: (name: string | PDFName) => PDFOperator;
export declare const setFillingGrayscaleColor: (gray: number | PDFNumber) => PDFOperator;
export declare const setStrokingGrayscaleColor: (gray: number | PDFNumber) => PDFOperator;
export declare const setFillingRgbColor: (red: number | PDFNumber, green: number | PDFNumber, blue: number | PDFNumber) => PDFOperator;
export declare const setStrokingRgbColor: (red: number | PDFNumber, green: number | PDFNumber, blue: number | PDFNumber) => PDFOperator;
export declare const setFillingCmykColor: (cyan: number | PDFNumber, magenta: number | PDFNumber, yellow: number | PDFNumber, key: number | PDFNumber) => PDFOperator;
export declare const setStrokingCmykColor: (cyan: number | PDFNumber, magenta: number | PDFNumber, yellow: number | PDFNumber, key: number | PDFNumber) => PDFOperator;
export declare const beginMarkedContent: (tag: string | PDFName) => PDFOperator;
export declare const endMarkedContent: () => PDFOperator;
//# sourceMappingURL=operators.d.ts.map