import flatMap from 'lodash/flatMap';
import get from 'lodash/get';

import { PDFName } from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';

import {
  degreesToRadians,
  fillingRgbColor,
  fontAndSize,
  lineHeight,
  nextLine,
  rotateAndSkewTextRadiansAndTranslate,
  text,
} from 'helpers/pdf-operators/simple';

/**
 * Options object with named parameters for the [[drawText]] operator helper.
 */
export interface IDrawTextOptions {
  /**
   * Default value is `0`.
   *
   * `x` coordinate to position the starting point of the line of text.
   */
  x?: number;
  /**
   * Default value is `0`.
   *
   * `y` coordinate to position the bottom of the line of text.
   */
  y?: number;
  /**
   * Name of the font to use when drawing the line of text. Should be present
   * in the Font Dictionary of the page to which the content stream containing
   * the `drawText` operator is applied.
   */
  font: string | PDFName;
  /**
   * Default value is `12`.
   *
   * Size to draw the text. Can be any number.
   */
  size?: number;
  /**
   * Default value is `[0, 0, 0]` (black).
   *
   * Array of 3 values between `0.0` and `1.0` representing a point in the
   * RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the text in a
   * shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.
   *
   * RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0`
   * as used here. You can simply divide by 255 to do the conversion. E.g. we
   * could achieve the same shade of pink with
   * `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.
   */
  colorRgb?: number[];
  // borderWidth?: number;
  // borderRgbColor?: number[];
  /**
   * Default value is `0`.
   *
   * Degrees to rotate the text clockwise. If defined as a negative number,
   * the text will be rotated counter-clockwise.
   */
  rotateDegrees?: number;
  /**
   * Default value is `0`.
   *
   * Radians to rotate the text clockwise. If defined as a negative number,
   * the text will be rotated counter-clockwise.
   */
  rotateRadians?: number;
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Degrees to skew the x and y axes of the text. Positive values will skew
   * the axes into Quadrant 1. Negative values will skew the axes away from
   * Quadrant 1.
   */
  skewDegrees?: { xAxis: number; yAxis: number };
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Radians to skew the x and y axes of the text. Positive values will skew
   * the axes into Quadrant 1. Negative values will skew the axes away from
   * Quadrant 1.
   */
  skewRadians?: { xAxis: number; yAxis: number };
}

// TODO: Implement the border* options
/**
 * Draws a line of text in a content stream.
 *
 * ```javascript
 * const [timesRomanFont] = pdfDoc.embedStandardFont('Times-Roman');
 * const contentStream = pdfDoc.register(
 *   pdfDoc.createContentStream(
 *     drawText('This is a line of text!', {
 *       x: 25,
 *       y: 50,
 *       rotateDegrees: 180,
 *       skewDegrees: { xAxis: 15, yAxis: 15 },
 *       font: 'Times-Roman',
 *       size: 24,
 *       colorRgb: [0.25, 1.0, 0.79],
 *     }),
 *   ),
 * );
 * const page = pdfDoc
 *   .createPage([250, 500])
 *   .addFontDictionary('Times-Roman', timesRomanFont)
 *   .addContentStreams(contentStream);
 * ```
 *
 * @param line    A string of text to draw.
 * @param options An options object with named parameters.
 */
export const drawText = (
  line: string,
  options: IDrawTextOptions,
): PDFOperator[] => [
  PDFTextObject.of(
    fillingRgbColor(
      get(options, 'colorRgb[0]', 0),
      get(options, 'colorRgb[1]', 0),
      get(options, 'colorRgb[2]', 0),
    ),
    fontAndSize(options.font, options.size || 12),
    rotateAndSkewTextRadiansAndTranslate(
      options.rotateDegrees
        ? degreesToRadians(options.rotateDegrees)
        : options.rotateRadians || 0,
      // prettier-ignore
      options.skewDegrees   ? degreesToRadians(options.skewDegrees.xAxis)
      : options.skewRadians ? options.skewRadians.xAxis
      : 0,
      // prettier-ignore
      options.skewDegrees   ? degreesToRadians(options.skewDegrees.yAxis)
      : options.skewRadians ? options.skewRadians.yAxis
      : 0,
      options.x || 0,
      options.y || 0,
    ),
    text(line),
  ),
];

// TODO: Implement the border* options
/**
 * Options object with named parameters for the [[drawLinesOfText]] operator
 * helper.
 */
export interface IDrawLinesOfTextOptions {
  /**
   * Default value is `0`.
   *
   * `x` coordinate to position the starting point of the first line of text.
   */
  x?: number;
  /**
   * Default value is `0`.
   *
   * `y` coordinate to position the bottom of the first line of text.
   */
  y?: number;
  /**
   * Name of the font to use when drawing the lines of text. Should be present
   * in the Font Dictionary of the page to which the content stream containing
   * the `drawLinesOfText` operator is applied.
   */
  font: string | PDFName;
  /**
   * Default value is `12`.
   *
   * Size to draw the text. Can be any number.
   */
  size?: number;
  /**
   * Default value is equal to the value for `size`.
   *
   * Distance between the lines of text.
   */
  lineHeight?: number;
  /**
   * Default value is `[0, 0, 0]` (black).
   *
   * Array of 3 values between `0.0` and `1.0` representing a point in the
   * RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the text in a
   * shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.
   *
   * RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0`
   * as used here. You can simply divide by 255 to do the conversion. E.g. we
   * could achieve the same shade of pink with
   * `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.
   */
  colorRgb?: number[];
  // borderWidth?: number;
  // borderRgbColor?: number[];
  /**
   * Default value is `0`.
   *
   * Degrees to rotate the lines of text clockwise. If defined as a negative
   * number, the line of text will be rotated counter-clockwise.
   */
  rotateDegrees?: number;
  /**
   * Default value is `0`.
   *
   * Radians to rotate the lines of text clockwise. If defined as a negative
   * number, the lines of text will be rotated counter-clockwise.
   */
  rotateRadians?: number;
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Degrees to skew the x and y axes of the lines of text. Positive values will
   * skew the axes into Quadrant 1. Negative values will skew the axes away from
   * Quadrant 1.
   */
  skewDegrees?: { xAxis: number; yAxis: number };
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Radians to skew the x and y axes of the lines of text. Positive values will
   * skew the axes into Quadrant 1. Negative values will skew the axes away from
   * Quadrant 1.
   */
  skewRadians?: { xAxis: number; yAxis: number };
}

/**
 * Draws multiple lines of text in a content stream.
 *
 * ```javascript
 * const [timesRomanFont] = pdfDoc.embedStandardFont('Times-Roman');
 * const contentStream = pdfDoc.register(
 *   pdfDoc.createContentStream(
 *     drawLinesOfText(
 *       ['First line of text.', 'Second line of text.'], {
 *       x: 25,
 *       y: 50,
 *       rotateDegrees: 180,
 *       skewDegrees: { xAxis: 15, yAxis: 15 },
 *       font: 'Times-Roman',
 *       size: 24,
 *       lineHeight: 48,
 *       colorRgb: [0.25, 1.0, 0.79],
 *     }),
 *   ),
 * );
 * const page = pdfDoc
 *   .createPage([250, 500])
 *   .addFontDictionary('Times-Roman', timesRomanFont)
 *   .addContentStreams(contentStream);
 * ```
 *
 * @param lines   An array of strings to be drawn.
 * @param options An options object with named parameters.
 */
export const drawLinesOfText = (
  lines: string[],
  options: IDrawLinesOfTextOptions,
): PDFOperator[] => [
  PDFTextObject.of(
    fillingRgbColor(
      get(options, 'colorRgb[0]', 0),
      get(options, 'colorRgb[1]', 0),
      get(options, 'colorRgb[2]', 0),
    ),
    fontAndSize(options.font, options.size || 12),
    lineHeight(options.lineHeight || options.size || 12),
    rotateAndSkewTextRadiansAndTranslate(
      options.rotateDegrees
        ? degreesToRadians(options.rotateDegrees)
        : options.rotateRadians || 0,
      // prettier-ignore
      options.skewDegrees   ? degreesToRadians(options.skewDegrees.xAxis)
      : options.skewRadians ? options.skewRadians.xAxis
      : 0,
      // prettier-ignore
      options.skewDegrees   ? degreesToRadians(options.skewDegrees.yAxis)
      : options.skewRadians ? options.skewRadians.yAxis
      : 0,
      options.x || 0,
      options.y || 0,
    ),
    ...flatMap(lines, (line) => [text(line), nextLine()]),
  ),
];
