import { PDFName } from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';

import {
  image,
  popGraphicsState,
  pushGraphicsState,
  rotateDegrees,
  rotateRadians,
  scale,
  skewDegrees,
  skewRadians,
  translate,
} from 'helpers/pdf-operators/simple';

// TODO: Implement the border* options
/**
 * Options object with named parameters for the [[drawImage]] operator helper.
 */
export interface IDrawImageOptions {
  /**
   * Default value is `0`.
   *
   * `x` coordinate of the lower left corner of the image to be drawn.
   */
  x?: number;
  /**
   * Default value is `0`.
   *
   * `y` coordinate of the lower left corner of the image to be drawn.
   */
  y?: number;
  /**
   * Default value is `100`.
   *
   * Width of the image to be drawn.
   */
  width?: number;
  /**
   * Default value is `100`.
   *
   * Height of the image to be drawn.
   */
  height?: number;
  /**
   * Default value is `0`.
   *
   * Degrees to rotate the image clockwise. If defined as a negative number,
   * the image will be rotated counter-clockwise.
   */
  rotateDegrees?: number;
  /**
   * Default value is `0`.
   *
   * Radians to rotate the image clockwise. If defined as a negative number,
   * the image will be rotated counter-clockwise.
   */
  rotateRadians?: number;
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Degrees to skew the x and y axes of the image. Positive values will skew
   * the axes into Quadrant 1. Negative values will skew the axes away from
   * Quadrant 1.
   */
  skewDegrees?: { xAxis: number; yAxis: number };
  /**
   * Default value is `{ xAxis: 0, yAxis: 0 }`.
   *
   * Radians to skew the x and y axes of the image. Positive values will skew
   * the axes into Quadrant 1. Negative values will skew the axes away from
   * Quadrant 1.
   */
  skewRadians?: { xAxis: number; yAxis: number };
}

/**
 * Draws an image object in a content stream. PNG and JPG image objects are
 * supported.
 *
 * ```javascript
 * // Should be a Uint8Array containing a PNG image
 * const pngBytes = ...
 *
 * const [pngImage, pngDims] = pdfDoc.embedPNG(pngBytes);
 * const contentStream = pdfDoc.register(
 *   pdfDoc.createContentStream(
 *     drawImage('MyPngImage', {
 *       x: 25,
 *       y: 50,
 *       width:  pngDims.width  * 0.5, // Make the image 50% smaller
 *       height: pngDims.height * 0.5, // Make the image 50% smaller
 *       rotateDegrees: 180            // Draw the image upside down
 *       skewDegrees: { xAxis: 30, yAxis: 30 } // Skew both axes by 30 degrees
 *     }),
 *   ),
 * );
 * const page = pdfDoc
 *   .createPage([250, 500])
 *   .addImageObject('MyPngImage', pngImage)
 *   .addContentStreams(contentStream);
 * ```
 *
 * @param name    Name of the image XObject to be drawn. Should be present in
 *                the XObject Dictionary of the page to which the content stream
 *                is applied.
 * @param options An options object with named parameters.
 */
export const drawImage = (
  name: string | PDFName,
  options: IDrawImageOptions,
): PDFOperator[] =>
  [
    pushGraphicsState(),
    translate(options.x || 0, options.y || 0),
    options.rotateDegrees && rotateDegrees(options.rotateDegrees),
    options.rotateRadians && rotateRadians(options.rotateRadians),
    scale(options.width || 100, options.height || 100),
    options.skewDegrees &&
      skewDegrees(options.skewDegrees.xAxis, options.skewDegrees.yAxis),
    options.skewRadians &&
      skewRadians(options.skewRadians.xAxis, options.skewRadians.yAxis),
    image(name),
    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];
