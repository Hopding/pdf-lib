import { PDFName } from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';
import { isInRange, validate } from 'utils/validate';

import {
  appendBezierCurve,
  clip,
  closePath,
  dashPattern,
  endPath,
  fill,
  fillAndStroke,
  fillingRgbColor,
  fontAndSize,
  image,
  lineHeight,
  lineWidth,
  moveTo,
  nextLine,
  popGraphicsState,
  pushGraphicsState,
  rectangle,
  scale,
  square,
  stroke,
  strokingRgbColor,
  text,
  textPosition,
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
 *       width: pngDims.width * 0.5,   // Make the image 50% smaller
 *       height: pngDims.height * 0.5, // Make the image 50% smaller
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
): PDFOperator[] => [
  pushGraphicsState(),
  translate(options.x || 0, options.y || 0),
  scale(options.width || 100, options.height || 100),
  image(name),
  popGraphicsState(),
];
