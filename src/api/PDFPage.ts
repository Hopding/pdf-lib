import { Color, rgb } from 'src/api/colors';
import {
  drawEllipse,
  drawImage,
  drawLinesOfText,
  drawRectangle,
} from 'src/api/operations';
import {
  popGraphicsState,
  pushGraphicsState,
  translate,
} from 'src/api/operators';
import PDFDocument from 'src/api/PDFDocument';
import PDFFont from 'src/api/PDFFont';
import PDFImage from 'src/api/PDFImage';
import {
  PDFPageDrawCircleOptions,
  PDFPageDrawEllipseOptions,
  PDFPageDrawImageOptions,
  PDFPageDrawRectangleOptions,
  PDFPageDrawSquareOptions,
  PDFPageDrawTextOptions,
} from 'src/api/PDFPageOptions';
import { degrees, Rotation, toDegrees } from 'src/api/rotations';
import { StandardFonts } from 'src/api/StandardFonts';
import {
  PDFContentStream,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFOperator,
  PDFPageLeaf,
  PDFRef,
} from 'src/core';
import {
  addRandomSuffix,
  assertEachIs,
  assertIs,
  assertMultiple,
  assertOrUndefined,
} from 'src/utils';

/**
 * Represents a single page of a [[PDFDocument]].
 */
export default class PDFPage {
  static of = (leafNode: PDFPageLeaf, ref: PDFRef, doc: PDFDocument) =>
    new PDFPage(leafNode, ref, doc);

  static create = (doc: PDFDocument) => {
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);
    const dummyRef = PDFRef.of(-1);
    const pageLeaf = PDFPageLeaf.withContextAndParent(doc.context, dummyRef);
    const pageRef = doc.context.register(pageLeaf);
    return new PDFPage(pageLeaf, pageRef, doc);
  };

  /** The low-level PDFDictionary wrapped by this page. */
  readonly node: PDFPageLeaf;

  /** The unique reference assigned to this page within the document. */
  readonly ref: PDFRef;

  /** The document to which this page belongs. */
  readonly doc: PDFDocument;

  private fontKey?: string;
  private font?: PDFFont;
  private fontSize = 24;
  private fontColor = rgb(0, 0, 0) as Color;
  private lineHeight = 24;
  private x = 0;
  private y = 0;
  private contentStream?: PDFContentStream;
  private contentStreamRef?: PDFRef;

  private constructor(leafNode: PDFPageLeaf, ref: PDFRef, doc: PDFDocument) {
    assertIs(leafNode, 'leafNode', [[PDFPageLeaf, 'PDFPageLeaf']]);
    assertIs(ref, 'ref', [[PDFRef, 'PDFRef']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.node = leafNode;
    this.ref = ref;
    this.doc = doc;
  }

  /**
   * Rotate this page by a multiple of 90 degrees. For example:
   * ```js
   * import { degrees } from 'pdf-lib'
   *
   * page.setRotation(degrees(-90))
   * page.setRotation(degrees(0))
   * page.setRotation(degrees(90))
   * page.setRotation(degrees(180))
   * page.setRotation(degrees(270))
   * ```
   * @param angle The angle to rotate this page.
   */
  setRotation(angle: Rotation): void {
    const degreesAngle = toDegrees(angle);
    assertMultiple(degreesAngle, 'degreesAngle', 90);
    this.node.set(PDFName.of('Rotate'), this.doc.context.obj(degreesAngle));
  }

  /**
   * Get this page's rotation angle in degrees. For example:
   * ```js
   * const rotationAngle = page.getRotation().angle;
   * ```
   * @returns The rotation angle of the page in degrees (always a multiple of
   *          90 degrees).
   */
  getRotation(): Rotation {
    const Rotate = this.node.Rotate();
    return degrees(Rotate ? Rotate.value() : 0);
  }

  /**
   * Resize this page by increasing or decreasing its width and height. For
   * example:
   * ```js
   * page.setSize(250, 500)
   * page.setSize(page.getWidth() + 50, page.getHeight() + 100)
   * page.setSize(page.getWidth() - 50, page.getHeight() - 100)
   * ```
   * @param width The new width of the page.
   * @param height The new height of the page.
   */
  setSize(width: number, height: number): void {
    assertIs(width, 'width', ['number']);
    assertIs(height, 'height', ['number']);
    const mediaBox = this.node.MediaBox().clone();
    mediaBox.set(2, this.doc.context.obj(width));
    mediaBox.set(3, this.doc.context.obj(height));
    this.node.set(PDFName.of('MediaBox'), mediaBox);
  }

  /**
   * Resize this page by increasing or decreasing its width. For example:
   * ```js
   * page.setWidth(250)
   * page.setWidth(page.getWidth() + 50)
   * page.setWidth(page.getWidth() - 50)
   * ```
   * @param width The new width of the page.
   */
  setWidth(width: number): void {
    assertIs(width, 'width', ['number']);
    this.setSize(width, this.getSize().height);
  }

  /**
   * Resize this page by increasing or decreasing its height. For example:
   * ```js
   * page.setHeight(500)
   * page.setHeight(page.getWidth() + 100)
   * page.setHeight(page.getWidth() - 100)
   * ```
   * @param height The new height of the page.
   */
  setHeight(height: number): void {
    assertIs(height, 'height', ['number']);
    this.setSize(this.getSize().width, height);
  }

  /**
   * Get this page's width and height. For example:
   * ```js
   * const { width, height } = page.getSize()
   * ```
   * @returns The width and height of the page.
   */
  getSize(): { width: number; height: number } {
    const mediaBox = this.node.MediaBox();
    const width =
      mediaBox.lookup(2, PDFNumber).value() -
      mediaBox.lookup(0, PDFNumber).value();
    const height =
      mediaBox.lookup(3, PDFNumber).value() -
      mediaBox.lookup(1, PDFNumber).value();
    return { width, height };
  }

  /**
   * Get this page's width. For example:
   * ```js
   * const width = page.getWidth()
   * ```
   * @returns The width of the page.
   */
  getWidth(): number {
    return this.getSize().width;
  }

  /**
   * Get this page's height. For example:
   * ```js
   * const height = page.getHeight()
   * ```
   * @returns The height of the page.
   */
  getHeight(): number {
    return this.getSize().height;
  }

  /**
   * Translate this page's content to a new location on the page. This operation
   * is often useful after resizing the page with [[setSize]]. For example:
   * ```js
   * // Add 50 units of whitespace to the top and right of the page
   * page.setSize(page.getWidth() + 50, page.getHeight() + 50)
   *
   * // Move the page's content from the lower-left corner of the page
   * // to the top-right corner.
   * page.translateContent(50, 50)
   *
   * // Now there are 50 units of whitespace to the left and bottom of the page
   * ```
   * @param x The new position on the x-axis for this page's content.
   * @param y The new position on the y-axis for this page's content.
   */
  translateContent(x: number, y: number): void {
    assertIs(x, 'x', ['number']);
    assertIs(y, 'y', ['number']);

    this.node.normalize();
    this.getContentStream();

    const start = this.createContentStream(
      pushGraphicsState(),
      translate(x, y),
    );
    const startRef = this.doc.context.register(start);

    const end = this.createContentStream(popGraphicsState());
    const endRef = this.doc.context.register(end);

    this.node.wrapContentStreams(startRef, endRef);
  }

  /**
   * Reset the x and y coordinates of this page to `(0, 0)`. This operation is
   * often useful after calling [[translateContent]]. For example:
   * ```js
   * // Shift the page's contents up and to the right by 50 units
   * page.translateContent(50, 50)
   *
   * // This text will shifted - it will be drawn at (50, 50)
   * page.drawText('I am shifted')
   *
   * // Move back to (0, 0)
   * page.resetPosition()
   *
   * // This text will not be shifted - it will be drawn at (0, 0)
   * page.drawText('I am not shifted')
   * ```
   */
  resetPosition(): void {
    this.getContentStream(false);
    this.x = 0;
    this.y = 0;
  }

  /**
   * Choose a default font for this page. The default font will be used whenever
   * text is drawn on this page and no font is specified. For example:
   * ```js
   * import { StandardFonts } from 'pdf-lib'
   *
   * const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
   * const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const courierFont = await pdfDoc.embedFont(StandardFonts.Courier)
   *
   * page.setFont(helveticaFont)
   * page.drawText('I will be drawn in Helvetica')
   *
   * page.setFont(timesRomanFont)
   * page.drawText('I will be drawn in Courier', { font: courierFont })
   * ```
   * @param font The default font to be used when drawing text on this page.
   */
  setFont(font: PDFFont): void {
    // TODO: Reuse image Font name if we've already added this image to Resources.Fonts
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    this.font = font;
    this.fontKey = addRandomSuffix(this.font.name);
    this.node.setFontDictionary(PDFName.of(this.fontKey), this.font.ref);
  }

  setFontSize(fontSize: number): void {
    assertIs(fontSize, 'fontSize', ['number']);
    this.fontSize = fontSize;
  }

  setFontColor(fontColor: Color): void {
    assertIs(fontColor, 'fontColor', [[Object, 'Color']]);
    this.fontColor = fontColor;
  }

  setLineHeight(lineHeight: number): void {
    assertIs(lineHeight, 'lineHeight', ['number']);
    this.lineHeight = lineHeight;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  moveTo(x: number, y: number): void {
    assertIs(x, 'x', ['number']);
    assertIs(y, 'y', ['number']);
    this.x = x;
    this.y = y;
  }

  moveDown(yDecrease: number): void {
    assertIs(yDecrease, 'yDecrease', ['number']);
    this.y -= yDecrease;
  }

  moveUp(yIncrease: number): void {
    assertIs(yIncrease, 'yIncrease', ['number']);
    this.y += yIncrease;
  }

  moveLeft(xDecrease: number): void {
    assertIs(xDecrease, 'xDecrease', ['number']);
    this.x -= xDecrease;
  }

  moveRight(xIncrease: number): void {
    assertIs(xIncrease, 'xIncrease', ['number']);
    this.x += xIncrease;
  }

  pushOperators(...operator: PDFOperator[]): void {
    assertEachIs(operator, 'operator', [[PDFOperator, 'PDFOperator']]);
    const contentStream = this.getContentStream();
    contentStream.push(...operator);
  }

  drawText(text: string, options: PDFPageDrawTextOptions = {}): void {
    assertIs(text, 'text', ['string']);
    assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
    assertOrUndefined(options.font, 'options.font', [[PDFFont, 'PDFFont']]);
    assertOrUndefined(options.size, 'options.size', ['number']);
    assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
    assertOrUndefined(options.xSkew, 'options.xSkew', [[Object, 'Rotation']]);
    assertOrUndefined(options.ySkew, 'options.ySkew', [[Object, 'Rotation']]);
    assertOrUndefined(options.x, 'options.x', ['number']);
    assertOrUndefined(options.y, 'options.y', ['number']);
    assertOrUndefined(options.lineHeight, 'options.lineHeight', ['number']);

    const [originalFont] = this.getFont();
    if (options.font) this.setFont(options.font);
    const [font, fontKey] = this.getFont();

    const preprocessedLines = this.preprocessText(text);
    const encodedLines = new Array(preprocessedLines.length) as PDFHexString[];
    for (let idx = 0, len = preprocessedLines.length; idx < len; idx++) {
      encodedLines[idx] = font.encodeText(preprocessedLines[idx]);
    }

    const contentStream = this.getContentStream();
    contentStream.push(
      ...drawLinesOfText(encodedLines, {
        color: options.color || this.fontColor,
        font: fontKey,
        size: options.size || this.fontSize,
        rotate: options.rotate || degrees(0),
        xSkew: options.xSkew || degrees(0),
        ySkew: options.ySkew || degrees(0),
        x: options.x || this.x,
        y: options.y || this.y,
        lineHeight: options.lineHeight || this.lineHeight,
      }),
    );

    if (options.font) this.setFont(originalFont);
  }

  // TODO: Reuse image XObject name if we've already added this image to Resources.XObjects
  drawImage(image: PDFImage, options: PDFPageDrawImageOptions = {}): void {
    assertIs(image, 'image', [[PDFImage, 'PDFImage']]);
    assertOrUndefined(options.x, 'options.x', ['number']);
    assertOrUndefined(options.y, 'options.y', ['number']);
    assertOrUndefined(options.width, 'options.width', ['number']);
    assertOrUndefined(options.height, 'options.height', ['number']);
    assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
    assertOrUndefined(options.xSkew, 'options.xSkew', [[Object, 'Rotation']]);
    assertOrUndefined(options.ySkew, 'options.ySkew', [[Object, 'Rotation']]);

    const xObjectKey = addRandomSuffix('Image', 4);
    this.node.setXObject(PDFName.of(xObjectKey), image.ref);

    const contentStream = this.getContentStream();
    contentStream.push(
      ...drawImage(xObjectKey, {
        x: options.x || this.x,
        y: options.y || this.y,
        width: options.width || image.size().width,
        height: options.height || image.size().height,
        rotate: options.rotate || degrees(0),
        xSkew: options.xSkew || degrees(0),
        ySkew: options.ySkew || degrees(0),
      }),
    );
  }

  drawRectangle(options: PDFPageDrawRectangleOptions = {}): void {
    assertOrUndefined(options.x, 'options.x', ['number']);
    assertOrUndefined(options.y, 'options.y', ['number']);
    assertOrUndefined(options.width, 'options.width', ['number']);
    assertOrUndefined(options.height, 'options.height', ['number']);
    assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
    assertOrUndefined(options.xSkew, 'options.xSkew', [[Object, 'Rotation']]);
    assertOrUndefined(options.ySkew, 'options.ySkew', [[Object, 'Rotation']]);
    assertOrUndefined(options.borderWidth, 'options.borderWidth', ['number']);
    assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
    assertOrUndefined(options.borderColor, 'options.borderColor', [
      [Object, 'Color'],
    ]);

    const contentStream = this.getContentStream();
    if (!('color' in options) && !('borderColor' in options)) {
      options.color = rgb(0, 0, 0);
    }
    contentStream.push(
      ...drawRectangle({
        x: options.x || this.x,
        y: options.y || this.y,
        width: options.width || 150,
        height: options.height || 100,
        rotate: options.rotate || degrees(0),
        xSkew: options.xSkew || degrees(0),
        ySkew: options.ySkew || degrees(0),
        borderWidth: options.borderWidth || 0,
        color: options.color || undefined,
        borderColor: options.borderColor || undefined,
      }),
    );
  }

  drawSquare(options: PDFPageDrawSquareOptions = {}): void {
    const { size } = options;
    assertOrUndefined(size, 'size', ['number']);
    this.drawRectangle({ ...options, width: size, height: size });
  }

  drawEllipse(options: PDFPageDrawEllipseOptions = {}): void {
    assertOrUndefined(options.x, 'options.x', ['number']);
    assertOrUndefined(options.y, 'options.y', ['number']);
    assertOrUndefined(options.xScale, 'options.xScale', ['number']);
    assertOrUndefined(options.yScale, 'options.yScale', ['number']);
    assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
    assertOrUndefined(options.borderColor, 'options.borderColor', [
      [Object, 'Color'],
    ]);
    assertOrUndefined(options.borderWidth, 'options.borderWidth', ['number']);

    const contentStream = this.getContentStream();
    if (!('color' in options) && !('borderColor' in options)) {
      options.color = rgb(0, 0, 0);
    }
    contentStream.push(
      ...drawEllipse({
        x: options.x || this.x,
        y: options.y || this.y,
        xScale: options.xScale || 100,
        yScale: options.yScale || 100,
        color: options.color || undefined,
        borderColor: options.borderColor || undefined,
        borderWidth: options.borderWidth || 0,
      }),
    );
  }

  drawCircle(options: PDFPageDrawCircleOptions = {}): void {
    const { size } = options;
    assertOrUndefined(size, 'size', ['number']);
    this.drawEllipse({ ...options, xScale: size, yScale: size });
  }

  private preprocessText(text: string): string[] {
    return text
      .replace(/\t/g, '    ')
      .replace(/[\b\v]/g, '')
      .split(/[\r\n\f]/);
  }

  private getFont(): [PDFFont, string] {
    if (!this.font || !this.fontKey) {
      const font = this.doc.embedStandardFont(StandardFonts.Helvetica);
      this.setFont(font);
    }
    return [this.font!, this.fontKey!];
  }

  private getContentStream(useExisting = true): PDFContentStream {
    if (useExisting && this.contentStream) return this.contentStream;
    this.contentStream = this.createContentStream();
    this.contentStreamRef = this.doc.context.register(this.contentStream);
    this.node.addContentStream(this.contentStreamRef);
    return this.contentStream;
  }

  private createContentStream(...operators: PDFOperator[]): PDFContentStream {
    const dict = this.doc.context.obj({});
    const contentStream = PDFContentStream.of(dict, operators);
    return contentStream;
  }
}
