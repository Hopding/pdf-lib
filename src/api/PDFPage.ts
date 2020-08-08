import { Color, rgb } from 'src/api/colors';
import {
  drawImage,
  drawLine,
  drawLinesOfText,
  drawPage,
  drawRectangle,
  drawSvgPath,
  drawEllipse,
} from 'src/api/operations';
import {
  popGraphicsState,
  pushGraphicsState,
  translate,
  LineCapStyle,
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
  BlendMode,
} from 'src/api/PDFPageOptions';
import { degrees, Rotation, toDegrees } from 'src/api/rotations';
import { StandardFonts } from 'src/api/StandardFonts';
import {
  PDFContentStream,
  PDFHexString,
  PDFName,
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
  rectanglesAreEqual,
  lineSplit,
  assertRangeOrUndefined,
  assertIsOneOfOrUndefined,
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
    return degrees(Rotate ? Rotate.asNumber() : 0);
  }

  /**
   * Resize this page by increasing or decreasing its width and height. For
   * example:
   * ```js
   * page.setSize(250, 500)
   * page.setSize(page.getWidth() + 50, page.getHeight() + 100)
   * page.setSize(page.getWidth() - 50, page.getHeight() - 100)
   * ```
   *
   * Note that the PDF specification does not allow for pages to have explicit
   * widths and heights. Instead it defines the "size" of a page in terms of
   * five rectangles: the MediaBox, CropBox, BleedBox, TrimBox, and ArtBox. As a
   * result, this method cannot directly change the width and height of a page.
   * Instead, it works by adjusting these five boxes.
   *
   * This method performs the following steps:
   *   1. Set width & height of MediaBox.
   *   2. Set width & height of CropBox, if it has same dimensions as MediaBox.
   *   3. Set width & height of BleedBox, if it has same dimensions as MediaBox.
   *   4. Set width & height of TrimBox, if it has same dimensions as MediaBox.
   *   5. Set width & height of ArtBox, if it has same dimensions as MediaBox.
   *
   * This approach works well for most PDF documents as all PDF pages must
   * have a MediaBox, but relatively few have a CropBox, BleedBox, TrimBox, or
   * ArtBox. And when they do have these additional boxes, they often have the
   * same dimensions as the MediaBox. However, if you find this method does not
   * work for your document, consider setting the boxes directly:
   *   * [[PDFPage.setMediaBox]]
   *   * [[PDFPage.setCropBox]]
   *   * [[PDFPage.setBleedBox]]
   *   * [[PDFPage.setTrimBox]]
   *   * [[PDFPage.setArtBox]]
   *
   * @param width The new width of the page.
   * @param height The new height of the page.
   */
  setSize(width: number, height: number): void {
    assertIs(width, 'width', ['number']);
    assertIs(height, 'height', ['number']);

    const mediaBox = this.getMediaBox();
    this.setMediaBox(mediaBox.x, mediaBox.y, width, height);

    const cropBox = this.getCropBox();
    const bleedBox = this.getBleedBox();
    const trimBox = this.getTrimBox();
    const artBox = this.getArtBox();

    const hasCropBox = this.node.CropBox()!!;
    const hasBleedBox = this.node.BleedBox()!!;
    const hasTrimBox = this.node.TrimBox()!!;
    const hasArtBox = this.node.ArtBox()!!;

    if (hasCropBox && rectanglesAreEqual(cropBox, mediaBox)) {
      this.setCropBox(mediaBox.x, mediaBox.y, width, height);
    }
    if (hasBleedBox && rectanglesAreEqual(bleedBox, mediaBox)) {
      this.setBleedBox(mediaBox.x, mediaBox.y, width, height);
    }
    if (hasTrimBox && rectanglesAreEqual(trimBox, mediaBox)) {
      this.setTrimBox(mediaBox.x, mediaBox.y, width, height);
    }
    if (hasArtBox && rectanglesAreEqual(artBox, mediaBox)) {
      this.setArtBox(mediaBox.x, mediaBox.y, width, height);
    }
  }

  /**
   * Resize this page by increasing or decreasing its width. For example:
   * ```js
   * page.setWidth(250)
   * page.setWidth(page.getWidth() + 50)
   * page.setWidth(page.getWidth() - 50)
   * ```
   *
   * This method uses [[PDFPage.setSize]] to set the page's width.
   *
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
   *
   * This method uses [[PDFPage.setSize]] to set the page's height.
   *
   * @param height The new height of the page.
   */
  setHeight(height: number): void {
    assertIs(height, 'height', ['number']);
    this.setSize(this.getSize().width, height);
  }

  /**
   * Set the MediaBox of this page. For example:
   * ```js
   * const mediaBox = page.getMediaBox()
   *
   * page.setMediaBox(0, 0, 250, 500)
   * page.setMediaBox(mediaBox.x, mediaBox.y, 50, 100)
   * page.setMediaBox(15, 5, mediaBox.width - 50, mediaBox.height - 100)
   * ```
   *
   * See [[PDFPage.getMediaBox]] for details about what the MediaBox represents.
   *
   * @param x The x coordinate of the lower left corner of the new MediaBox.
   * @param y The y coordinate of the lower left corner of the new MediaBox.
   * @param width The width of the new MediaBox.
   * @param height The height of the new MediaBox.
   */
  setMediaBox(x: number, y: number, width: number, height: number): void {
    assertIs(x, 'x', ['number']);
    assertIs(y, 'y', ['number']);
    assertIs(width, 'width', ['number']);
    assertIs(height, 'height', ['number']);
    const mediaBox = this.doc.context.obj([x, y, x + width, y + height]);
    this.node.set(PDFName.MediaBox, mediaBox);
  }

  /**
   * Set the CropBox of this page. For example:
   * ```js
   * const cropBox = page.getCropBox()
   *
   * page.setCropBox(0, 0, 250, 500)
   * page.setCropBox(cropBox.x, cropBox.y, 50, 100)
   * page.setCropBox(15, 5, cropBox.width - 50, cropBox.height - 100)
   * ```
   *
   * See [[PDFPage.getCropBox]] for details about what the CropBox represents.
   *
   * @param x The x coordinate of the lower left corner of the new CropBox.
   * @param y The y coordinate of the lower left corner of the new CropBox.
   * @param width The width of the new CropBox.
   * @param height The height of the new CropBox.
   */
  setCropBox(x: number, y: number, width: number, height: number): void {
    assertIs(x, 'x', ['number']);
    assertIs(y, 'y', ['number']);
    assertIs(width, 'width', ['number']);
    assertIs(height, 'height', ['number']);
    const cropBox = this.doc.context.obj([x, y, x + width, y + height]);
    this.node.set(PDFName.CropBox, cropBox);
  }

  /**
   * Set the BleedBox of this page. For example:
   * ```js
   * const bleedBox = page.getBleedBox()
   *
   * page.setBleedBox(0, 0, 250, 500)
   * page.setBleedBox(bleedBox.x, bleedBox.y, 50, 100)
   * page.setBleedBox(15, 5, bleedBox.width - 50, bleedBox.height - 100)
   * ```
   *
   * See [[PDFPage.getBleedBox]] for details about what the BleedBox represents.
   *
   * @param x The x coordinate of the lower left corner of the new BleedBox.
   * @param y The y coordinate of the lower left corner of the new BleedBox.
   * @param width The width of the new BleedBox.
   * @param height The height of the new BleedBox.
   */
  setBleedBox(x: number, y: number, width: number, height: number): void {
    assertIs(x, 'x', ['number']);
    assertIs(y, 'y', ['number']);
    assertIs(width, 'width', ['number']);
    assertIs(height, 'height', ['number']);
    const bleedBox = this.doc.context.obj([x, y, x + width, y + height]);
    this.node.set(PDFName.BleedBox, bleedBox);
  }

  /**
   * Set the TrimBox of this page. For example:
   * ```js
   * const trimBox = page.getTrimBox()
   *
   * page.setTrimBox(0, 0, 250, 500)
   * page.setTrimBox(trimBox.x, trimBox.y, 50, 100)
   * page.setTrimBox(15, 5, trimBox.width - 50, trimBox.height - 100)
   * ```
   *
   * See [[PDFPage.getTrimBox]] for details about what the TrimBox represents.
   *
   * @param x The x coordinate of the lower left corner of the new TrimBox.
   * @param y The y coordinate of the lower left corner of the new TrimBox.
   * @param width The width of the new TrimBox.
   * @param height The height of the new TrimBox.
   */
  setTrimBox(x: number, y: number, width: number, height: number): void {
    assertIs(x, 'x', ['number']);
    assertIs(y, 'y', ['number']);
    assertIs(width, 'width', ['number']);
    assertIs(height, 'height', ['number']);
    const trimBox = this.doc.context.obj([x, y, x + width, y + height]);
    this.node.set(PDFName.TrimBox, trimBox);
  }

  /**
   * Set the ArtBox of this page. For example:
   * ```js
   * const artBox = page.getArtBox()
   *
   * page.setArtBox(0, 0, 250, 500)
   * page.setArtBox(artBox.x, artBox.y, 50, 100)
   * page.setArtBox(15, 5, artBox.width - 50, artBox.height - 100)
   * ```
   *
   * See [[PDFPage.getArtBox]] for details about what the ArtBox represents.
   *
   * @param x The x coordinate of the lower left corner of the new ArtBox.
   * @param y The y coordinate of the lower left corner of the new ArtBox.
   * @param width The width of the new ArtBox.
   * @param height The height of the new ArtBox.
   */
  setArtBox(x: number, y: number, width: number, height: number): void {
    assertIs(x, 'x', ['number']);
    assertIs(y, 'y', ['number']);
    assertIs(width, 'width', ['number']);
    assertIs(height, 'height', ['number']);
    const artBox = this.doc.context.obj([x, y, x + width, y + height]);
    this.node.set(PDFName.ArtBox, artBox);
  }

  /**
   * Get this page's width and height. For example:
   * ```js
   * const { width, height } = page.getSize()
   * ```
   *
   * This method uses [[PDFPage.getMediaBox]] to obtain the page's
   * width and height.
   *
   * @returns The width and height of the page.
   */
  getSize(): { width: number; height: number } {
    const { width, height } = this.getMediaBox();
    return { width, height };
  }

  /**
   * Get this page's width. For example:
   * ```js
   * const width = page.getWidth()
   * ```
   *
   * This method uses [[PDFPage.getSize]] to obtain the page's size.
   *
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
   *
   * This method uses [[PDFPage.getSize]] to obtain the page's size.
   *
   * @returns The height of the page.
   */
  getHeight(): number {
    return this.getSize().height;
  }

  /**
   * Get the rectangle defining this page's MediaBox. For example:
   * ```js
   * const { x, y, width, height } = page.getMediaBox()
   * ```
   *
   * The MediaBox of a page defines the boundaries of the physical medium on
   * which the page is to be displayed/printed. It may include extended area
   * surrounding the page content for bleed marks, printing marks, etc...
   * It may also include areas close to the edges of the medium that cannot be
   * marked because of physical limitations of the output device. Content
   * falling outside this boundary may safely be discarded without affecting
   * the meaning of the PDF file.
   *
   * @returns An object defining the lower left corner of the MediaBox and its
   *          width & height.
   */
  getMediaBox(): { x: number; y: number; width: number; height: number } {
    const mediaBox = this.node.MediaBox();
    return mediaBox.asRectangle();
  }

  /**
   * Get the rectangle defining this page's CropBox. For example:
   * ```js
   * const { x, y, width, height } = page.getCropBox()
   * ```
   *
   * The CropBox of a page defines the region to which the contents of the page
   * shall be clipped when displayed or printed. Unlike the other boxes, the
   * CropBox does not necessarily represent the physical page geometry. It
   * merely imposes clipping on the page contents.
   *
   * The CropBox's default value is the page's MediaBox.
   *
   * @returns An object defining the lower left corner of the CropBox and its
   *          width & height.
   */
  getCropBox(): { x: number; y: number; width: number; height: number } {
    const cropBox = this.node.CropBox();
    return cropBox?.asRectangle() ?? this.getMediaBox();
  }

  /**
   * Get the rectangle defining this page's BleedBox. For example:
   * ```js
   * const { x, y, width, height } = page.getBleedBox()
   * ```
   *
   * The BleedBox of a page defines the region to which the contents of the
   * page shall be clipped when output in a production environment. This may
   * include any extra bleed area needed to accommodate the physical
   * limitations of cutting, folding, and trimming equipment. The actual
   * printed page may include printing marks that fall outside the BleedBox.
   *
   * The BleedBox's default value is the page's CropBox.
   *
   * @returns An object defining the lower left corner of the BleedBox and its
   *          width & height.
   */
  getBleedBox(): { x: number; y: number; width: number; height: number } {
    const bleedBox = this.node.BleedBox();
    return bleedBox?.asRectangle() ?? this.getCropBox();
  }

  /**
   * Get the rectangle defining this page's TrimBox. For example:
   * ```js
   * const { x, y, width, height } = page.getTrimBox()
   * ```
   *
   * The TrimBox of a page defines the intended dimensions of the finished
   * page after trimming. It may be smaller than the MediaBox to allow for
   * production-related content, such as printing instructions, cut marks, or
   * color bars.
   *
   * The TrimBox's default value is the page's CropBox.
   *
   * @returns An object defining the lower left corner of the TrimBox and its
   *          width & height.
   */
  getTrimBox(): { x: number; y: number; width: number; height: number } {
    const trimBox = this.node.TrimBox();
    return trimBox?.asRectangle() ?? this.getCropBox();
  }

  /**
   * Get the rectangle defining this page's ArtBox. For example:
   * ```js
   * const { x, y, width, height } = page.getArtBox()
   * ```
   *
   * The ArtBox of a page defines the extent of the page's meaningful content
   * (including potential white space).
   *
   * The ArtBox's default value is the page's CropBox.
   *
   * @returns An object defining the lower left corner of the ArtBox and its
   *          width & height.
   */
  getArtBox(): { x: number; y: number; width: number; height: number } {
    const artBox = this.node.ArtBox();
    return artBox?.asRectangle() ?? this.getCropBox();
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
   *     opacity: 0.75,
   *   },
   * )
   * ```
   * @param text The text to be drawn.
   * @param options The options to be used when drawing the text.
   */
  drawText(text: string, options: PDFPageDrawTextOptions = {}): void {
    assertIs(text, 'text', ['string']);
    assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
    assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
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
    assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', BlendMode);

    const [originalFont] = this.getFont();
    if (options.font) this.setFont(options.font);
    const [font, fontKey] = this.getFont();

    const fontSize = options.size || this.fontSize;

    const wordBreaks = options.wordBreaks || this.doc.defaultWordBreaks;
    const textWidth = (t: string) => font.widthOfTextAtSize(t, fontSize);
    const lines =
      options.maxWidth === undefined
        ? lineSplit(cleanText(text))
        : breakTextIntoLines(text, wordBreaks, options.maxWidth, textWidth);

    const encodedLines = new Array(lines.length) as PDFHexString[];
    for (let idx = 0, len = lines.length; idx < len; idx++) {
      encodedLines[idx] = font.encodeText(lines[idx]);
    }

    const graphicsStateKey = this.maybeEmbedGraphicsState({
      opacity: options.opacity,
      blendMode: options.blendMode,
    });

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
        graphicsState: graphicsStateKey,
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
   *   rotate: degrees(30),
   *   opacity: 0.75,
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
    assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
    assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', BlendMode);

    const xObjectKey = addRandomSuffix('Image', 10);
    this.node.setXObject(PDFName.of(xObjectKey), image.ref);

    const graphicsStateKey = this.maybeEmbedGraphicsState({
      opacity: options.opacity,
      blendMode: options.blendMode,
    });

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
        graphicsState: graphicsStateKey,
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
   *   opacity: 0.75,
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
    assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
    assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', BlendMode);

    const xObjectKey = addRandomSuffix('EmbeddedPdfPage', 10);
    this.node.setXObject(PDFName.of(xObjectKey), embeddedPage.ref);

    const graphicsStateKey = this.maybeEmbedGraphicsState({
      opacity: options.opacity,
      blendMode: options.blendMode,
    });

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
        graphicsState: graphicsStateKey,
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
   * // Change border style and opacity
   * page.drawSvgPath(svgPath, {
   *   x: 25,
   *   y: 275,
   *   borderColor: rgb(0.5, 0.5, 0.5),
   *   borderWidth: 2,
   *   borderOpacity: 0.75,
   * })
   *
   * // Set fill color and opacity
   * page.drawSvgPath(svgPath, {
   *   x: 25,
   *   y: 475,
   *   color: rgb(1.0, 0, 0),
   *   opacity: 0.75,
   * })
   *
   * // Draw 50% of original size
   * page.drawSvgPath(svgPath, {
   *   x: 25,
   *   y: 675,
   *   scale: 0.5,
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
    assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
    assertOrUndefined(options.borderWidth, 'options.borderWidth', ['number']);
    assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
    assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
    assertOrUndefined(options.borderColor, 'options.borderColor', [
      [Object, 'Color'],
    ]);
    assertOrUndefined(options.borderDashArray, 'options.borderDashArray', [
      Array,
    ]);
    assertOrUndefined(options.borderDashPhase, 'options.borderDashPhase', [
      'number',
    ]);
    assertIsOneOfOrUndefined(
      options.borderLineCap,
      'options.borderLineCap',
      LineCapStyle,
    );
    assertRangeOrUndefined(
      options.borderOpacity,
      'options.borderOpacity',
      0,
      1,
    );
    assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', BlendMode);

    const graphicsStateKey = this.maybeEmbedGraphicsState({
      opacity: options.opacity,
      borderOpacity: options.borderOpacity,
      blendMode: options.blendMode,
    });

    if (!('color' in options) && !('borderColor' in options)) {
      options.borderColor = rgb(0, 0, 0);
    }

    const contentStream = this.getContentStream();
    contentStream.push(
      ...drawSvgPath(path, {
        x: options.x ?? this.x,
        y: options.y ?? this.y,
        scale: options.scale,
        rotate: options.rotate ?? degrees(0),
        color: options.color ?? undefined,
        borderColor: options.borderColor ?? undefined,
        borderWidth: options.borderWidth ?? 0,
        borderDashArray: options.borderDashArray ?? undefined,
        borderDashPhase: options.borderDashPhase ?? undefined,
        borderLineCap: options.borderLineCap ?? undefined,
        graphicsState: graphicsStateKey,
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
   *   color: rgb(0.75, 0.2, 0.2),
   *   opacity: 0.75,
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
    assertOrUndefined(options.dashArray, 'options.dashArray', [Array]);
    assertOrUndefined(options.dashPhase, 'options.dashPhase', ['number']);
    assertIsOneOfOrUndefined(options.lineCap, 'options.lineCap', LineCapStyle);
    assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
    assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', BlendMode);

    const graphicsStateKey = this.maybeEmbedGraphicsState({
      borderOpacity: options.opacity,
      blendMode: options.blendMode,
    });

    if (!('color' in options)) {
      options.color = rgb(0, 0, 0);
    }

    const contentStream = this.getContentStream();
    contentStream.push(
      ...drawLine({
        start: options.start,
        end: options.end,
        thickness: options.thickness ?? 1,
        color: options.color ?? undefined,
        dashArray: options.dashArray ?? undefined,
        dashPhase: options.dashPhase ?? undefined,
        lineCap: options.lineCap ?? undefined,
        graphicsState: graphicsStateKey,
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
   *   color: rgb(0.75, 0.2, 0.2),
   *   opacity: 0.5,
   *   borderOpacity: 0.75,
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
    assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
    assertOrUndefined(options.borderColor, 'options.borderColor', [
      [Object, 'Color'],
    ]);
    assertOrUndefined(options.borderDashArray, 'options.borderDashArray', [
      Array,
    ]);
    assertOrUndefined(options.borderDashPhase, 'options.borderDashPhase', [
      'number',
    ]);
    assertIsOneOfOrUndefined(
      options.borderLineCap,
      'options.borderLineCap',
      LineCapStyle,
    );
    assertRangeOrUndefined(
      options.borderOpacity,
      'options.borderOpacity',
      0,
      1,
    );
    assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', BlendMode);

    const graphicsStateKey = this.maybeEmbedGraphicsState({
      opacity: options.opacity,
      borderOpacity: options.borderOpacity,
      blendMode: options.blendMode,
    });

    if (!('color' in options) && !('borderColor' in options)) {
      options.color = rgb(0, 0, 0);
    }

    const contentStream = this.getContentStream();
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
        borderDashArray: options.borderDashArray ?? undefined,
        borderDashPhase: options.borderDashPhase ?? undefined,
        graphicsState: graphicsStateKey,
        borderLineCap: options.borderLineCap ?? undefined,
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
   *   color: rgb(0.75, 0.2, 0.2),
   *   opacity: 0.5,
   *   borderOpacity: 0.75,
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
   *   color: rgb(0.75, 0.2, 0.2),
   *   opacity: 0.5,
   *   borderOpacity: 0.75,
   * })
   * ```
   * @param options The options to be used when drawing the ellipse.
   */
  drawEllipse(options: PDFPageDrawEllipseOptions = {}): void {
    assertOrUndefined(options.x, 'options.x', ['number']);
    assertOrUndefined(options.y, 'options.y', ['number']);
    assertOrUndefined(options.xScale, 'options.xScale', ['number']);
    assertOrUndefined(options.yScale, 'options.yScale', ['number']);
    assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
    assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
    assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
    assertOrUndefined(options.borderColor, 'options.borderColor', [
      [Object, 'Color'],
    ]);
    assertRangeOrUndefined(
      options.borderOpacity,
      'options.borderOpacity',
      0,
      1,
    );
    assertOrUndefined(options.borderWidth, 'options.borderWidth', ['number']);
    assertOrUndefined(options.borderDashArray, 'options.borderDashArray', [
      Array,
    ]);
    assertOrUndefined(options.borderDashPhase, 'options.borderDashPhase', [
      'number',
    ]);
    assertIsOneOfOrUndefined(
      options.borderLineCap,
      'options.borderLineCap',
      LineCapStyle,
    );
    assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', BlendMode);
    const graphicsStateKey = this.maybeEmbedGraphicsState({
      opacity: options.opacity,
      borderOpacity: options.borderOpacity,
      blendMode: options.blendMode,
    });

    if (!('color' in options) && !('borderColor' in options)) {
      options.color = rgb(0, 0, 0);
    }

    const contentStream = this.getContentStream();
    contentStream.push(
      ...drawEllipse({
        x: options.x ?? this.x,
        y: options.y ?? this.y,
        xScale: options.xScale ?? 100,
        yScale: options.yScale ?? 100,
        rotate: options.rotate ?? undefined,
        color: options.color ?? undefined,
        borderColor: options.borderColor ?? undefined,
        borderWidth: options.borderWidth ?? 0,
        borderDashArray: options.borderDashArray ?? undefined,
        borderDashPhase: options.borderDashPhase ?? undefined,
        borderLineCap: options.borderLineCap ?? undefined,
        graphicsState: graphicsStateKey,
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
   *   color: rgb(0.75, 0.2, 0.2),
   *   opacity: 0.5,
   *   borderOpacity: 0.75,
   * })
   * ```
   * @param options The options to be used when drawing the ellipse.
   */
  drawCircle(options: PDFPageDrawCircleOptions = {}): void {
    const { size = 100 } = options;
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

  private maybeEmbedGraphicsState(options: {
    opacity?: number;
    borderOpacity?: number;
    blendMode?: BlendMode;
  }): string | undefined {
    const { opacity, borderOpacity, blendMode } = options;

    if (
      opacity === undefined &&
      borderOpacity === undefined &&
      blendMode === undefined
    ) {
      return undefined;
    }

    const key = addRandomSuffix('GS', 10);

    const graphicsState = this.doc.context.obj({
      Type: 'ExtGState',
      ca: opacity,
      CA: borderOpacity,
      BM: blendMode,
    });

    this.node.setExtGState(PDFName.of(key), graphicsState);

    return key;
  }
}
