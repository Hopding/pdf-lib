import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import PDFOperator from 'core/pdf-operators/PDFOperator';

import {
  appendBezierCurve,
  closePath,
  degreesToRadians,
  fill,
  fillAndStroke,
  fillingRgbColor,
  lineWidth,
  moveTo,
  popGraphicsState,
  pushGraphicsState,
  rotateRadians,
  scale,
  skewRadians,
  stroke,
  strokingRgbColor,
  translate,
} from 'helpers/pdf-operators/simple';

// =============================================================================
// Based on: http://spencermortensen.com/articles/bezier-circle/
//   P_0 = (0,1),  P_1 = (c,1),   P_2 = (1,c),   P_3 = (1,0)
//   P_0 = (1,0),  P_1 = (1,-c),  P_2 = (c,-1),  P_3 = (0,-1)
//   P_0 = (0,-1), P_1 = (-c,-1), P_3 = (-1,-c), P_4 = (-1,0)
//   P_0 = (-1,0), P_1 = (-1,c),  P_2 = (-c,1),  P_3 = (0,1)
//     with c = 0.551915024494

/** @hidden */
const C_VAL = 0.551915024494;

/** @hidden */
const drawEllipsePath = ({
  x = 0,
  y = 0,
  xScale = 100,
  yScale = 100,
  rotationAngle = 0,
  skewAngles = { xAxis: 0, yAxis: 0 },
}: {
  x?: number;
  y?: number;
  xScale?: number;
  yScale?: number;
  rotationAngle?: number;
  skewAngles?: { xAxis: number; yAxis: number };
}): PDFOperator[] => [
  pushGraphicsState(),
  translate(x, y),
  rotateRadians(rotationAngle),
  scale(xScale, yScale),
  skewRadians(skewAngles.xAxis, skewAngles.yAxis),
  moveTo(0, 1),
  appendBezierCurve(C_VAL, 1, 1, C_VAL, 1, 0),
  appendBezierCurve(1, -C_VAL, C_VAL, -1, 0, -1),
  appendBezierCurve(-C_VAL, -1, -1, -C_VAL, -1, 0),
  appendBezierCurve(-1, C_VAL, -C_VAL, 1, 0, 1),
  popGraphicsState(),
];
// =============================================================================

// TODO: Implement borderStyle option.
/**
 * Options object with named parameters for the [[drawEllipse]] operator helper.
 */
export interface IDrawEllipseOptions {
  /**
   * Default value is `0`.
   *
   * `x` coordinate to position the center of the ellipse.
   */
  x?: number;
  /**
   * Default value is `0`.
   *
   * `y` coordinate to position the center of the ellipse.
   */
  y?: number;
  /**
   * Default value is `100`.
   *
   * Scale of the x dimension.
   */
  xScale?: number;
  /**
   * Default value is `100`.
   *
   * Scale of the y dimension.
   */
  yScale?: number;
  /**
   * Default value is `15`.
   *
   * `borderWidth` of the ellipse.
   */
  borderWidth?: number;
  /**
   * Default value is `[0, 0, 0]` (black).
   *
   * Array of 3 values between `0.0` and `1.0` representing a point in the
   * RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the ellipse in a
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
   * Degrees to rotate the ellipse clockwise. If defined as a negative number,
   * the ellipse will be rotated counter-clockwise.
   */
  rotateDegrees?: number;
  /**
   * Default value is `0`.
   *
   * Radians to rotate the ellipse clockwise. If defined as a negative number,
   * the ellipse will be rotated counter-clockwise.
   */
  rotateRadians?: number;
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Degrees to skew the x and y axes of the ellipse. Positive values will skew
   * the axes into Quadrant 1. Negative values will skew the axes away from
   * Quadrant 1.
   */
  skewDegrees?: { xAxis: number; yAxis: number };
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Radians to skew the x and y axes of the ellipse. Positive values will skew
   * the axes into Quadrant 1. Negative values will skew the axes away from
   * Quadrant 1.
   */
  skewRadians?: { xAxis: number; yAxis: number };
}

/**
 * Draws an ellipse in a content stream.
 *
 * ```javascript
 * const contentStream = pdfDoc.register(
 *   pdfDoc.createContentStream(
 *     drawEllipse({
 *       x: 25,
 *       y: 50,
 *       xScale: 50,
 *       yScale: 150,
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
export const drawEllipse = (options: IDrawEllipseOptions): PDFOperator[] => [
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
  ...drawEllipsePath({
    x: options.x || 0,
    y: options.y || 0,
    xScale: options.xScale || 100,
    yScale: options.yScale || 100,
    rotationAngle: options.rotateDegrees
      ? degreesToRadians(options.rotateDegrees)
      : options.rotateRadians,
    skewAngles: options.skewDegrees
      ? {
          xAxis: degreesToRadians(options.skewDegrees.xAxis),
          yAxis: degreesToRadians(options.skewDegrees.yAxis),
        }
      : options.skewRadians,
  }),
  // prettier-ignore
  !isEmpty(options.colorRgb) && !isEmpty(options.borderColorRgb) ? fillAndStroke()
  : !isEmpty(options.colorRgb)                                   ? fill()
  : !isEmpty(options.borderColorRgb)                             ? stroke()
  : closePath(),
  popGraphicsState(),
];

// TODO: Implement borderStyle option.
/**
 * Options object with named parameters for the [[drawCircle]] operator helper.
 */
export interface IDrawCircleOptions {
  /**
   * Default value is `0`.
   *
   * `x` coordinate to position the center of the circle.
   */
  x?: number;
  /**
   * Default value is `0`.
   *
   * `y` coordinate to position the center of the circle.
   */
  y?: number;
  /**
   * Default value is `100`.
   *
   * Scale of the circle.
   */
  size?: number;
  /**
   * Default value is `15`.
   *
   * `borderWidth` of the circle.
   */
  borderWidth?: number;
  /**
   * Default value is `[0, 0, 0]` (black).
   *
   * Array of 3 values between `0.0` and `1.0` representing a point in the
   * RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the circle in a
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
   * Degrees to rotate the circle clockwise. If defined as a negative number,
   * the circle will be rotated counter-clockwise.
   */
  rotateDegrees?: number;
  /**
   * Default value is `0`.
   *
   * Radians to rotate the circle clockwise. If defined as a negative number,
   * the circle will be rotated counter-clockwise.
   */
  rotateRadians?: number;
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Degrees to skew the x and y axes of the circle. Positive values will skew
   * the axes into Quadrant 1. Negative values will skew the axes away from
   * Quadrant 1.
   */
  skewDegrees?: { xAxis: number; yAxis: number };
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Radians to skew the x and y axes of the circle. Positive values will skew
   * the axes into Quadrant 1. Negative values will skew the axes away from
   * Quadrant 1.
   */
  skewRadians?: { xAxis: number; yAxis: number };
}

/**
 * Draws a circle in a content stream.
 *
 * ```javascript
 * const contentStream = pdfDoc.register(
 *   pdfDoc.createContentStream(
 *     drawCircle({
 *       x: 25,
 *       y: 50,
 *       size: 50,
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
export const drawCircle = (options: IDrawCircleOptions): PDFOperator[] =>
  drawEllipse({
    x: options.x || 0,
    y: options.y || 0,
    xScale: options.size || 100,
    yScale: options.size || 100,
    borderWidth: options.borderWidth || 15,
    colorRgb: options.colorRgb || [],
    borderColorRgb: options.borderColorRgb || [],
    rotateDegrees: options.rotateDegrees,
    rotateRadians: options.rotateRadians,
    skewDegrees: options.skewDegrees,
    skewRadians: options.skewRadians,
  });
