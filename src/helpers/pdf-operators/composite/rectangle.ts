import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import PDFOperator from 'core/pdf-operators/PDFOperator';

import {
  closePath,
  fill,
  fillAndStroke,
  fillingRgbColor,
  lineTo,
  lineWidth,
  moveTo,
  popGraphicsState,
  pushGraphicsState,
  rotateDegrees,
  rotateRadians,
  skewDegrees,
  skewRadians,
  stroke,
  strokingRgbColor,
  translate,
} from 'helpers/pdf-operators/simple';

// TODO: Make a "drawPolygon" function

// TODO: Implement cornerStyle option
/**
 * Options object with named parameters for the [[drawRectangle]] operator helper.
 */
export interface IDrawRectangleOptions {
  /**
   * Default value is `0`.
   *
   * `x` coordinate to position the lower left corner of the rectangle.
   */
  x?: number;
  /**
   * Default value is `0`.
   *
   * `y` coordinate to position the lower left corner of the rectangle.
   */
  y?: number;
  /**
   * Default value is `150`.
   *
   * `width` of the rectangle.
   */
  width?: number;
  /**
   * Default value is `100`.
   *
   * `height` of the rectangle.
   */
  height?: number;
  /**
   * Default value is `15`.
   *
   * `borderWidth` of the rectangle.
   */
  borderWidth?: number;
  /**
   * Default value is `[0, 0, 0]` (black).
   *
   * Array of 3 values between `0.0` and `1.0` representing a point in the
   * RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the rectangle in a
   * shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.
   *
   * RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0`
   * as used here. You can simply divide by 255 to do the conversion. E.g. we
   * could achieve the same shade of pink with
   * `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.
   */
  colorRgb?: number[];
  /**
   * Default value is `[0, 0, 0]` (black).
   *
   * Array of 3 values between `0.0` and `1.0` representing a point in the
   * RGB color space. E.g. `borderColorRgb: [1, 0.2, 1]` will draw the border in a
   * shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.
   *
   * RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0`
   * as used here. You can simply divide by 255 to do the conversion. E.g. we
   * could achieve the same shade of pink with
   * `borderColorRgb: [255 / 255, 50 / 255, 255 / 255]`.
   */
  borderColorRgb?: number[];
  /**
   * Default value is `0`.
   *
   * Degrees to rotate the rectangle clockwise. If defined as a negative number,
   * the rectangle will be rotated counter-clockwise.
   */
  rotateDegrees?: number;
  /**
   * Default value is `0`.
   *
   * Radians to rotate the rectangle clockwise. If defined as a negative number,
   * the rectangle will be rotated counter-clockwise.
   */
  rotateRadians?: number;
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Degrees to skew the x and y axes of the rectangle. Positive values will
   * skew the axes into Quadrant 1. Negative values will skew the axes away
   * from Quadrant 1.
   */
  skewDegrees?: { xAxis: number; yAxis: number };
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Radians to skew the x and y axes of the rectangle. Positive values will
   * skew the axes into Quadrant 1. Negative values will skew the axes away
   * from Quadrant 1.
   */
  skewRadians?: { xAxis: number; yAxis: number };
}

/**
 * Draws a rectangle in a content stream.
 *
 * ```javascript
 * const contentStream = pdfDoc.register(
 *   pdfDoc.createContentStream(
 *     drawRectangle({
 *       x: 25,
 *       y: 50,
 *       width: 1000,
 *       height: 500,
 *       rotateDegrees: 45,
 *       skewDegrees: { xAxis: 30, yAxis: 30 },
 *       borderWidth: 25,
 *       colorRgb: [0.25, 1.0, 0.79],
 *       borderColorRgb: [0.79, 0.25, 1.0],
 *     }),
 *   ),
 * );
 * const page = pdfDoc
 *   .createPage([250, 500])
 *   .addContentStreams(contentStream);
 * ```
 *
 * @param options An options object with named parameters.
 */
export const drawRectangle = (options: IDrawRectangleOptions): PDFOperator[] =>
  [
    pushGraphicsState(),
    fillingRgbColor(
      get(options, 'colorRgb[0]', 0),
      get(options, 'colorRgb[1]', 0),
      get(options, 'colorRgb[2]', 0),
    ),
    strokingRgbColor(
      get(options, 'borderColorRgb[0]', 0),
      get(options, 'borderColorRgb[1]', 0),
      get(options, 'borderColorRgb[2]', 0),
    ),
    lineWidth(options.borderWidth || 15),

    translate(options.x || 0, options.y || 0),
    options.rotateDegrees && rotateDegrees(options.rotateDegrees),
    options.rotateRadians && rotateRadians(options.rotateRadians),
    options.skewDegrees &&
      skewDegrees(options.skewDegrees.xAxis, options.skewDegrees.yAxis),
    options.skewRadians &&
      skewRadians(options.skewRadians.xAxis, options.skewRadians.yAxis),
    moveTo(0, 0),
    lineTo(0, options.height || 100),
    lineTo(options.width || 150, options.height || 100),
    lineTo(options.width || 150, 0),
    closePath(),

    // prettier-ignore
    !isEmpty(options.colorRgb) && !isEmpty(options.borderColorRgb)   ? fillAndStroke()
    : !isEmpty(options.colorRgb)                                     ? fill()
    : !isEmpty(options.borderColorRgb)                               ? stroke()
    : closePath(),
    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];

// TODO: Implement cornerStyle option
/**
 * Options object with named parameters for the [[drawSquare]] operator helper.
 */
export interface IDrawSquareOptions {
  /**
   * Default value is `0`.
   *
   * `x` coordinate to position the lower left corner of the square.
   */
  x?: number;
  /**
   * Default value is `0`.
   *
   * `y` coordinate to position the lower left corner of the square.
   */
  y?: number;
  /**
   * Default value is `100`.
   *
   * `size` of the square.
   */
  size?: number;
  /**
   * Default value is `15`.
   *
   * `borderWidth` of the square.
   */
  borderWidth?: number;
  /**
   * Default value is `[0, 0, 0]` (black).
   *
   * Array of 3 values between `0.0` and `1.0` representing a point in the
   * RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the square in a
   * shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.
   *
   * RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0`
   * as used here. You can simply divide by 255 to do the conversion. E.g. we
   * could achieve the same shade of pink with
   * `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.
   */
  colorRgb?: number[];
  /**
   * Default value is `[0, 0, 0]` (black).
   *
   * Array of 3 values between `0.0` and `1.0` representing a point in the
   * RGB color space. E.g. `borderColorRgb: [1, 0.2, 1]` will draw the border in a
   * shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.
   *
   * RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0`
   * as used here. You can simply divide by 255 to do the conversion. E.g. we
   * could achieve the same shade of pink with
   * `borderColorRgb: [255 / 255, 50 / 255, 255 / 255]`.
   */
  borderColorRgb?: number[];
  /**
   * Default value is `0`.
   *
   * Degrees to rotate the square clockwise. If defined as a negative number,
   * the square will be rotated counter-clockwise.
   */
  rotateDegrees?: number;
  /**
   * Default value is `0`.
   *
   * Radians to rotate the square clockwise. If defined as a negative number,
   * the square will be rotated counter-clockwise.
   */
  rotateRadians?: number;
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Degrees to skew the x and y axes of the square. Positive values will
   * skew the axes into Quadrant 1. Negative values will skew the axes away
   * from Quadrant 1.
   */
  skewDegrees?: { xAxis: number; yAxis: number };
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Radians to skew the x and y axes of the square. Positive values will
   * skew the axes into Quadrant 1. Negative values will skew the axes away
   * from Quadrant 1.
   */
  skewRadians?: { xAxis: number; yAxis: number };
}

/**
 * Draws a square in a content stream.
 *
 * ```javascript
 * const contentStream = pdfDoc.register(
 *   pdfDoc.createContentStream(
 *     drawSquare({
 *       x: 25,
 *       y: 50,
 *       size: 500,
 *       rotateDegrees: 45,
 *       skewDegrees: { xAxis: 30, yAxis: 30 },
 *       borderWidth: 25,
 *       colorRgb: [0.25, 1.0, 0.79],
 *       borderColorRgb: [0.79, 0.25, 1.0],
 *     }),
 *   ),
 * );
 * const page = pdfDoc
 *   .createPage([250, 500])
 *   .addContentStreams(contentStream);
 * ```
 *
 * @param options An options object with named parameters.
 */
export const drawSquare = (options: IDrawSquareOptions): PDFOperator[] =>
  drawRectangle({
    x: options.x || 0,
    y: options.y || 0,
    width: options.size || 100,
    height: options.size || 100,
    rotateDegrees: options.rotateDegrees,
    rotateRadians: options.rotateRadians,
    skewDegrees: options.skewDegrees,
    skewRadians: options.skewRadians,
    borderWidth: options.borderWidth || 15,
    colorRgb: options.colorRgb || [],
    borderColorRgb: options.borderColorRgb || [],
  });
