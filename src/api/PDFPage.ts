import { Color, rgb } from 'src/api/colors';
import {
  drawEllipse,
  drawImage,
  drawLine,
  drawLinesOfText,
  drawPage,
  drawRectangle,
  drawSvgPath,
} from 'src/api/operations';
import {
  popGraphicsState,
  pushGraphicsState,
  translate,
} from 'src/api/operators';
import PDFDocument from 'src/api/PDFDocument';
import PDFEmbeddedPage from 'src/api/PDFEmbeddedPage';
import PDFFont from 'src/api/PDFFont';
import PDFImage from 'src/api/PDFImage';
import {
  PDFPageDrawCircleOptions,
  PDFPageDrawEllipseOptions,
  PDFPageDrawImageOptions,
  PDFPageDrawLineOptions,
  PDFPageDrawPageOptions,
  PDFPageDrawRectangleOptions,
  PDFPageDrawSquareOptions,
  PDFPageDrawSVGOptions,
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
  breakTextIntoLines,
  cleanText,
} from 'src/utils';

/**
 * Represents a single page of a [[PDFDocument]].
 */
export default class PDFPage {
  /**
   * > **NOTE:** You probably don't want to call this method directly. Instead,
   * > consider using the [[PDFDocument.addPage]] and [[PDFDocument.insertPage]]
   * > methods, which can create instances of [[PDFPage]] for you.
   *
   * Create an instance of [[PDFPage]] from an existing leaf node.
   *
   * @param leafNode The leaf node to be wrapped.
   * @param ref The unique reference for the page.
   * @param doc The document to which the page will belong.
   */
  static of = (leafNode: PDFPageLeaf, ref: PDFRef, doc: PDFDocument) =>
    new PDFPage(leafNode, ref, doc);

  /**
   * > **NOTE:** You probably don't want to call this method directly. Instead,
   * > consider using the [[PDFDocument.addPage]] and [[PDFDocument.insertPage]]
   * > methods, which can create instances of [[PDFPage]] for you.
   *
   * Create an instance of [[PDFPage]].
   *
   * @param doc The document to which the page will belong.
   */
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
   * See also: [[resetPosition]]
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
   * const page = pdfDoc.addPage()
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

  /**
   * Choose a default font size for this page. The default font size will be
   * used whenever text is drawn on this page and no font size is specified.
   * For example:
   * ```js
   * page.setFontSize(12)
   * page.drawText('I will be drawn in size 12')
   *
   * page.setFontSize(36)
   * page.drawText('I will be drawn in size 24', { fontSize: 24 })
   * ```
   * @param fontSize The default font size to be used when drawing text on this
   *                 page.
   */
  setFontSize(fontSize: number): void {
    assertIs(fontSize, 'fontSize', ['number']);
    this.fontSize = fontSize;
  }

  /**
   * Choose a default font color for this page. The default font color will be
   * used whenever text is drawn on this page and no font color is specified.
   * For example:
   * ```js
   * import { rgb, cmyk, grayscale } from 'pdf-lib'
   *
   * page.setFontColor(rgb(0.97, 0.02, 0.97))
   * page.drawText('I will be drawn in pink')
   *
   * page.setFontColor(cmyk(0.4, 0.7, 0.39, 0.15))
   * page.drawText('I will be drawn in gray', { color: grayscale(0.5) })
   * ```
   * @param fontColor The default font color to be used when drawing text on
   *                  this page.
   */
  setFontColor(fontColor: Color): void {
    assertIs(fontColor, 'fontColor', [[Object, 'Color']]);
    this.fontColor = fontColor;
  }

  /**
   * Choose a default line height for this page. The default line height will be
   * used whenever text is drawn on this page and no line height is specified.
   * For example:
   * ```js
   * page.setLineHeight(12);
   * page.drawText('These lines will be vertically \n separated by 12 units')
   *
   * page.setLineHeight(36);
   * page.drawText('These lines will be vertically \n separated by 24 units', {
   *   lineHeight: 24
   * })
   * ```
   * @param lineHeight The default line height to be used when drawing text on
   *                   this page.
   */
  setLineHeight(lineHeight: number): void {
    assertIs(lineHeight, 'lineHeight', ['number']);
    this.lineHeight = lineHeight;
  }

  /**
   * Get the default position of this page. For example:
   * ```js
   * const { x, y } = page.getPosition()
   * ```
   * @returns The default position of the page.
   */
  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Get the default x coordinate of this page. For example:
   * ```js
   * const x = page.getX()
   * ```
   * @returns The default x coordinate of the page.
   */
  getX(): number {
    return this.x;
  }

  /**
   * Get the default y coordinate of this page. For example:
   * ```js
   * const y = page.getY()
   * ```
   * @returns The default y coordinate of the page.
   */
  getY(): number {
    return this.y;
  }

  /**
   * Change the default position of this page. For example:
   * ```js
   * page.moveTo(0, 0)
   * page.drawText('I will be drawn at the origin')
   *
   * page.moveTo(0, 25)
   * page.drawText('I will be drawn 25 units up')
   *
   * page.moveTo(25, 25)
   * page.drawText('I will be drawn 25 units up and 25 units to the right')
   * ```
   * @param x The new default position on the x-axis for this page.
   * @param y The new default position on the y-axis for this page.
   */
  moveTo(x: number, y: number): void {
    assertIs(x, 'x', ['number']);
    assertIs(y, 'y', ['number']);
    this.x = x;
    this.y = y;
  }

  /**
   * Change the default position of this page to be further down the y-axis.
   * For example:
   * ```js
   * page.moveTo(50, 50)
   * page.drawText('I will be drawn at (50, 50)')
   *
   * page.moveDown(10)
   * page.drawText('I will be drawn at (50, 40)')
   * ```
   * @param yDecrease The amount by which the page's default position along the
   *                  y-axis should be decreased.
   */
  moveDown(yDecrease: number): void {
    assertIs(yDecrease, 'yDecrease', ['number']);
    this.y -= yDecrease;
  }

  /**
   * Change the default position of this page to be further up the y-axis.
   * For example:
   * ```js
   * page.moveTo(50, 50)
   * page.drawText('I will be drawn at (50, 50)')
   *
   * page.moveUp(10)
   * page.drawText('I will be drawn at (50, 60)')
   * ```
   * @param yIncrease The amount by which the page's default position along the
   *                  y-axis should be increased.
   */
  moveUp(yIncrease: number): void {
    assertIs(yIncrease, 'yIncrease', ['number']);
    this.y += yIncrease;
  }

  /**
   * Change the default position of this page to be further left on the x-axis.
   * For example:
   * ```js
   * page.moveTo(50, 50)
   * page.drawText('I will be drawn at (50, 50)')
   *
   * page.moveLeft(10)
   * page.drawText('I will be drawn at (40, 50)')
   * ```
   * @param xDecrease The amount by which the page's default position along the
   *                  x-axis should be decreased.
   */
  moveLeft(xDecrease: number): void {
    assertIs(xDecrease, 'xDecrease', ['number']);
    this.x -= xDecrease;
  }

  /**
   * Change the default position of this page to be further right on the y-axis.
   * For example:
   * ```js
   * page.moveTo(50, 50)
   * page.drawText('I will be drawn at (50, 50)')
   *
   * page.moveRight(10)
   * page.drawText('I will be drawn at (60, 50)')
   * ```
   * @param xIncrease The amount by which the page's default position along the
   *                  x-axis should be increased.
   */
  moveRight(xIncrease: number): void {
    assertIs(xIncrease, 'xIncrease', ['number']);
    this.x += xIncrease;
  }

  /**
   * Push one or more operators to the end of this page's current content
   * stream. For example:
   * ```js
   * import {
   *   pushGraphicsState,
   *   moveTo,
   *   lineTo,
   *   closePath,
   *   setFillingColor,
   *   rgb,
   *   fill,
   *   popGraphicsState,
   * } from 'pdf-lib'
   *
   * // Draw a green triangle in the lower-left corner of the page
   * page.pushOperators(
   *   pushGraphicsState(),
   *   moveTo(0, 0),
   *   lineTo(100, 0),
   *   lineTo(50, 100),
   *   closePath(),
   *   setFillingColor(rgb(0.0, 1.0, 0.0)),
   *   fill(),
   *   popGraphicsState(),
   * )
   * ```
   * @param operator The operators to be pushed.
   */
  pushOperators(...operator: PDFOperator[]): void {
    assertEachIs(operator, 'operator', [[PDFOperator, 'PDFOperator']]);
    const contentStream = this.getContentStream();
    contentStream.push(...operator);
  }

  /**
   * Draw one or more lines of text on this page. For example:
   * ```js
   * import { StandardFonts, rgb } from 'pdf-lib'
   *
   * const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
   *
   * const page = pdfDoc.addPage()
   *
   * page.setFont(helveticaFont)
   *
   * page.moveTo(5, 200)
   * page.drawText('The Life of an Egg', { size: 36 })
   *
   * page.moveDown(36)
   * page.drawText('An Epic Tale of Woe', { size: 30 })
   *
   * page.drawText(
   *   `Humpty Dumpty sat on a wall \n` +
   *   `Humpty Dumpty had a great fall; \n` +
   *   `All the king's horses and all the king's men \n` +
   *   `Couldn't put Humpty together again. \n`,
   *   {
   *     x: 25,
   *     y: 100,
   *     font: timesRomanFont,
   *     size: 24,
   *     color: rgb(1, 0, 0),
   *     lineHeight: 24,
   *   },
   * )
   * ```
   * @param text The text to be drawn.
   * @param options The options to be used when drawing the text.
   */
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
    assertOrUndefined(options.maxWidth, 'options.maxWidth', ['number']);
    assertOrUndefined(options.wordBreaks, 'options.wordBreaks', [Array]);

    const [originalFont] = this.getFont();
    if (options.font) this.setFont(options.font);
    const [font, fontKey] = this.getFont();

    const fontSize = options.size || this.fontSize;

    const wordBreaks = options.wordBreaks || this.doc.defaultWordBreaks;
    const textWidth = (t: string) => font.widthOfTextAtSize(t, fontSize);
    const lines =
      options.maxWidth === undefined
        ? cleanText(text).split(/[\r\n\f]/)
        : breakTextIntoLines(text, wordBreaks, options.maxWidth, textWidth);

    const encodedLines = new Array(lines.length) as PDFHexString[];
    for (let idx = 0, len = lines.length; idx < len; idx++) {
      encodedLines[idx] = font.encodeText(lines[idx]);
    }

    const contentStream = this.getContentStream();
    contentStream.push(
      ...drawLinesOfText(encodedLines, {
        color: options.color ?? this.fontColor,
        font: fontKey,
        size: fontSize,
        rotate: options.rotate ?? degrees(0),
        xSkew: options.xSkew ?? degrees(0),
        ySkew: options.ySkew ?? degrees(0),
        x: options.x ?? this.x,
        y: options.y ?? this.y,
        lineHeight: options.lineHeight ?? this.lineHeight,
      }),
    );

    if (options.font) this.setFont(originalFont);
  }

  /**
   * Draw an image on this page. For example:
   * ```js
   * import { degrees } from 'pdf-lib'
   *
   * const jpgUrl = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg'
   * const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer())
   *
   * const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)
   * const jpgDims = jpgImage.scale(0.5)
   *
   * const page = pdfDoc.addPage()
   *
   * page.drawImage(jpgImage, {
   *   x: 25,
   *   y: 25,
   *   width: jpgDims.width,
   *   height: jpgDims.height,
   *   rotate: degrees(30)
   * })
   * ```
   * @param image The image to be drawn.
   * @param options The options to be used when drawing the image.
   */
  drawImage(image: PDFImage, options: PDFPageDrawImageOptions = {}): void {
    // TODO: Reuse image XObject name if we've already added this image to Resources.XObjects
    assertIs(image, 'image', [[PDFImage, 'PDFImage']]);
    assertOrUndefined(options.x, 'options.x', ['number']);
    assertOrUndefined(options.y, 'options.y', ['number']);
    assertOrUndefined(options.width, 'options.width', ['number']);
    assertOrUndefined(options.height, 'options.height', ['number']);
    assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
    assertOrUndefined(options.xSkew, 'options.xSkew', [[Object, 'Rotation']]);
    assertOrUndefined(options.ySkew, 'options.ySkew', [[Object, 'Rotation']]);

    const xObjectKey = addRandomSuffix('Image', 10);
    this.node.setXObject(PDFName.of(xObjectKey), image.ref);

    const contentStream = this.getContentStream();
    contentStream.push(
      ...drawImage(xObjectKey, {
        x: options.x ?? this.x,
        y: options.y ?? this.y,
        width: options.width ?? image.size().width,
        height: options.height ?? image.size().height,
        rotate: options.rotate ?? degrees(0),
        xSkew: options.xSkew ?? degrees(0),
        ySkew: options.ySkew ?? degrees(0),
      }),
    );
  }

  /**
   * Draw an embedded PDF page on this page. For example:
   * ```js
   * import { degrees } from 'pdf-lib'
   *
   * const pdfDoc = await PDFDocument.create()
   * const page = pdfDoc.addPage()
   *
   * const sourcePdfUrl = 'https://pdf-lib.js.org/assets/with_large_page_count.pdf'
   * const sourcePdf = await fetch(sourcePdfUrl).then((res) => res.arrayBuffer())
   *
   * // Embed page 74 from the PDF
   * const [embeddedPage] = await pdfDoc.embedPdf(sourcePdf, 73)
   *
   * page.drawPage(embeddedPage, {
   *   x: 250,
   *   y: 200,
   *   xScale: 0.5,
   *   yScale: 0.5,
   *   rotate: degrees(30),
   * })
   * ```
   *
   * The `options` argument accepts both `width`/`height` and `xScale`/`yScale`
   * as options. Since each of these options defines the size of the drawn page,
   * if both options are given, `width` and `height` take precedence and the
   * corresponding scale variants are ignored.
   *
   * @param embeddedPage The embedded page to be drawn.
   * @param options The options to be used when drawing the embedded page.
   */
  drawPage(
    embeddedPage: PDFEmbeddedPage,
    options: PDFPageDrawPageOptions = {},
  ): void {
    // TODO: Reuse embeddedPage XObject name if we've already added this embeddedPage to Resources.XObjects
    assertIs(embeddedPage, 'embeddedPage', [
      [PDFEmbeddedPage, 'PDFEmbeddedPage'],
    ]);
    assertOrUndefined(options.x, 'options.x', ['number']);
    assertOrUndefined(options.y, 'options.y', ['number']);
    assertOrUndefined(options.xScale, 'options.xScale', ['number']);
    assertOrUndefined(options.yScale, 'options.yScale', ['number']);
    assertOrUndefined(options.width, 'options.width', ['number']);
    assertOrUndefined(options.height, 'options.height', ['number']);
    assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
    assertOrUndefined(options.xSkew, 'options.xSkew', [[Object, 'Rotation']]);
    assertOrUndefined(options.ySkew, 'options.ySkew', [[Object, 'Rotation']]);

    const xObjectKey = addRandomSuffix('EmbeddedPdfPage', 10);
    this.node.setXObject(PDFName.of(xObjectKey), embeddedPage.ref);

    // prettier-ignore
    const xScale = (
        options.width  !== undefined ? options.width / embeddedPage.width
      : options.xScale !== undefined ? options.xScale
      : 1
    );

    // prettier-ignore
    const yScale = (
        options.height !== undefined ? options.height / embeddedPage.height
      : options.yScale !== undefined ? options.yScale
      : 1
    );

    const contentStream = this.getContentStream();
    contentStream.push(
      ...drawPage(xObjectKey, {
        x: options.x ?? this.x,
        y: options.y ?? this.y,
        xScale,
        yScale,
        rotate: options.rotate ?? degrees(0),
        xSkew: options.xSkew ?? degrees(0),
        ySkew: options.ySkew ?? degrees(0),
      }),
    );
  }

  /**
   * Draw an SVG path on this page. For example:
   * ```js
   * import { rgb } from 'pdf-lib'
   *
   * const svgPath = 'M 0,20 L 100,160 Q 130,200 150,120 C 190,-40 200,200 300,150 L 400,90'
   *
   * // Draw path as black line
   * page.drawSvgPath(svgPath, { x: 25, y: 75 })
   *
   * // Change border style
   * page.drawSvgPath(svgPath, {
   *   x: 25,
   *   y: 275,
   *   borderColor: rgb(0.5, 0.5, 0.5),
   *   borderWidth: 2,
   * })
   *
   * // Set fill color
   * page.drawSvgPath(svgPath, {
   * 	 x: 25,
   * 	 y: 475,
   * 	 color: rgb(1.0, 0, 0),
   * })
   *
   * // Draw 50% of original size
   * page.drawSvgPath(svgPath, {
   * 	 x: 25,
   * 	 y: 675,
   * 	 scale: 0.5,
   * })
   * ```
   * @param path The SVG path to be drawn.
   * @param options The options to be used when drawing the SVG path.
   */
  drawSvgPath(path: string, options: PDFPageDrawSVGOptions = {}): void {
    assertIs(path, 'path', ['string']);
    assertOrUndefined(options.x, 'options.x', ['number']);
    assertOrUndefined(options.y, 'options.y', ['number']);
    assertOrUndefined(options.scale, 'options.scale', ['number']);
    assertOrUndefined(options.borderWidth, 'options.borderWidth', ['number']);
    assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
    assertOrUndefined(options.borderColor, 'options.borderColor', [
      [Object, 'Color'],
    ]);

    const contentStream = this.getContentStream();
    if (!('color' in options) && !('borderColor' in options)) {
      options.borderColor = rgb(0, 0, 0);
    }
    contentStream.push(
      ...drawSvgPath(path, {
        x: options.x ?? this.x,
        y: options.y ?? this.y,
        scale: options.scale,
        color: options.color ?? undefined,
        borderColor: options.borderColor ?? undefined,
        borderWidth: options.borderWidth ?? 0,
      }),
    );
  }

  /**
   * Draw a line on this page. For example:
   * ```js
   * import { rgb } from 'pdf-lib'
   *
   * page.drawLine({
   *   start: { x: 25, y: 75 },
   *   end: { x: 125, y: 175 },
   *   thickness: 2,
   *   color: rgb(0.75, 0.2, 0.2)
   * })
   * ```
   * @param options The options to be used when drawing the line.
   */
  drawLine(options: PDFPageDrawLineOptions): void {
    assertIs(options.start, 'options.start', [
      [Object, '{ x: number, y: number }'],
    ]);
    assertIs(options.end, 'options.end', [
      [Object, '{ x: number, y: number }'],
    ]);
    assertIs(options.start.x, 'options.start.x', ['number']);
    assertIs(options.start.y, 'options.start.y', ['number']);
    assertIs(options.end.x, 'options.end.x', ['number']);
    assertIs(options.end.y, 'options.end.y', ['number']);
    assertOrUndefined(options.thickness, 'options.thickness', ['number']);
    assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);

    const contentStream = this.getContentStream();
    if (!('color' in options)) {
      options.color = rgb(0, 0, 0);
    }
    contentStream.push(
      ...drawLine({
        start: options.start,
        end: options.end,
        thickness: options.thickness ?? 1,
        color: options.color ?? undefined,
      }),
    );
  }

  /**
   * Draw a rectangle on this page. For example:
   * ```js
   * import { degrees, grayscale, rgb } from 'pdf-lib'
   *
   * page.drawRectangle({
   *   x: 25,
   *   y: 75,
   *   width: 250,
   *   height: 75,
   *   rotate: degrees(-15),
   *   borderWidth: 5,
   *   borderColor: grayscale(0.5),
   *   color: rgb(0.75, 0.2, 0.2)
   * })
   * ```
   * @param options The options to be used when drawing the rectangle.
   */
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
        x: options.x ?? this.x,
        y: options.y ?? this.y,
        width: options.width ?? 150,
        height: options.height ?? 100,
        rotate: options.rotate ?? degrees(0),
        xSkew: options.xSkew ?? degrees(0),
        ySkew: options.ySkew ?? degrees(0),
        borderWidth: options.borderWidth ?? 0,
        color: options.color ?? undefined,
        borderColor: options.borderColor ?? undefined,
      }),
    );
  }

  /**
   * Draw a square on this page. For example:
   * ```js
   * import { degrees, grayscale, rgb } from 'pdf-lib'
   *
   * page.drawSquare({
   *   x: 25,
   *   y: 75,
   *   size: 100,
   *   rotate: degrees(-15),
   *   borderWidth: 5,
   *   borderColor: grayscale(0.5),
   *   color: rgb(0.75, 0.2, 0.2)
   * })
   * ```
   * @param options The options to be used when drawing the square.
   */
  drawSquare(options: PDFPageDrawSquareOptions = {}): void {
    const { size } = options;
    assertOrUndefined(size, 'size', ['number']);
    this.drawRectangle({ ...options, width: size, height: size });
  }

  /**
   * Draw an ellipse on this page. For example:
   * ```js
   * import { grayscale, rgb } from 'pdf-lib'
   *
   * page.drawEllipse({
   *   x: 200,
   *   y: 75,
   *   xScale: 100,
   *   yScale: 50,
   *   borderWidth: 5,
   *   borderColor: grayscale(0.5),
   *   color: rgb(0.75, 0.2, 0.2)
   * })
   * ```
   * @param options The options to be used when drawing the ellipse.
   */
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
        x: options.x ?? this.x,
        y: options.y ?? this.y,
        xScale: options.xScale ?? 100,
        yScale: options.yScale ?? 100,
        color: options.color ?? undefined,
        borderColor: options.borderColor ?? undefined,
        borderWidth: options.borderWidth ?? 0,
      }),
    );
  }

  /**
   * Draw a circle on this page. For example:
   * ```js
   * import { grayscale, rgb } from 'pdf-lib'
   *
   * page.drawCircle({
   *   x: 200,
   *   y: 150,
   *   size: 100,
   *   borderWidth: 5,
   *   borderColor: grayscale(0.5),
   *   color: rgb(0.75, 0.2, 0.2)
   * })
   * ```
   * @param options The options to be used when drawing the ellipse.
   */
  drawCircle(options: PDFPageDrawCircleOptions = {}): void {
    const { size } = options;
    assertOrUndefined(size, 'size', ['number']);
    this.drawEllipse({ ...options, xScale: size, yScale: size });
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
