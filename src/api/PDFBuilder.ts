import PDFDocument from 'src/api/PDFDocument';
import PDFFont from 'src/api/PDFFont';
import { PageSizes } from 'src/api/sizes';
import PDFPage from 'src/api/PDFPage';
import { assertIs, assertOrUndefined, breakTextIntoLines } from 'src/utils';
import { PDFPageDrawImageOptions } from 'src/api/PDFPageOptions';
import { StandardFonts } from './StandardFonts';
import PDFImage from './PDFImage';

export interface PdfBuilderOptions {
  defaultSize?: number /** The default text size*/;
  topMargin?: number /** The top margin*/;
  leftMargin?: number /** The left margin */;
  rightMargin?: number /** The right margin */;
  bottomMargin?: number /** The bottom margin */;
  interLine?: number /** Space between lines */;
  font?: PDFFont /**font */;
  PDFSize?: [number, number];
  onAddPage?: (
    builder: PdfBuilder,
    pageNumber: number,
  ) => void /** Callback on new page event */;
}

/**
 * Helper class to create a new PDF with a [[PDFDocument]].
 */
export default class PdfBuilder {
  /**
   * Create an instance of [[PdfBuilder]].
   *
   * @param doc The document to which the builder will belong.
   * @param options Options of the builder.
   */
  static async create(doc: PDFDocument, options: PdfBuilderOptions = {}) {
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);
    const newDoc = new PdfBuilder(doc, options);
    await newDoc.addPage();
    return newDoc;
  }

  /** The document to which this builder belongs. */
  readonly doc: PDFDocument;

  // private fontKey?: string;
  private font?: PDFFont;
  private page?: PDFPage;
  private PDFSize?: [number, number] = PageSizes.A4;
  private defaultSize = 10;
  private topMargin = 60;
  private leftMargin = 25;
  private rightMargin = 25;
  private bottomMargin = 25;
  private interLine = 2;
  private currentPageNumber = 0;
  private onAddPage?: (builder: PdfBuilder, pageNumber: number) => void;

  private constructor(doc: PDFDocument, options: PdfBuilderOptions) {
    this.topMargin = options.topMargin ? options.topMargin : this.topMargin;
    this.leftMargin = options.leftMargin ? options.leftMargin : this.leftMargin;
    this.rightMargin = options.rightMargin
      ? options.rightMargin
      : this.rightMargin;
    this.bottomMargin = options.bottomMargin
      ? options.bottomMargin
      : this.bottomMargin;
    this.interLine = options.interLine ? options.interLine : this.interLine;
    this.defaultSize = options.defaultSize
      ? options.defaultSize
      : this.defaultSize;
    this.font = options.font ? options.font : this.font;
    this.PDFSize = options.PDFSize ? options.PDFSize : this.PDFSize;
    this.onAddPage = options.onAddPage ? options.onAddPage : this.onAddPage;
    this.doc = doc;
  }

  /**
   * get the font
   */
  getFont(): PDFFont {
    if (!this.font) {
      this.font = this.doc.embedStandardFont(StandardFonts.TimesRoman);
    }
    return this.font;
  }

  /**
   * get the page
   */
  getPage(): PDFPage {
    if (!this.page) {
      this.page = this.doc.addPage(this.PDFSize);
    }
    return this.page;
  }

  /**
   * get the defaultSize
   */
  getDefaultSize(): number {
    return this.defaultSize;
  }

  /**
   * get the interline
   */
  getInterLine(): number {
    return this.interLine;
  }

  /**
   * get the bottomMargin
   */
  getBottomMargin(): number {
    return this.bottomMargin;
  }

  /**
   * Add a new page to the document
   */
  async addPage() {
    this.currentPageNumber++;
    this.page = this.doc.addPage(this.PDFSize);
    const font = await this.getFont();
    this.page!.setFont(font);
    assertIs(this.page, 'page', ['undefined', [PDFPage, 'PDFPage'], Array]);
    this.page.moveTo(this.leftMargin, this.page.getHeight() - this.topMargin);
    if (this.onAddPage) {
      await this.onAddPage(this, this.currentPageNumber);
    }
  }

  /**
   * Write a line and jump to the next one
   * @param text //input String to add
   * @param options // text options
   */
  async drawTextLine(
    text: string,
    options: { textSize?: number; leftPos?: number },
  ) {
    assertIs(text, 'text', ['string']);
    assertOrUndefined(options.textSize, 'options.size', ['number']);
    assertOrUndefined(options.leftPos, 'options.size', ['number']);

    const font = await this.getFont();
    const textSize = options.textSize || this.defaultSize;
    const textHeight = font!.heightAtSize(textSize);
    const move = textHeight + this.interLine;
    if (this.page!.getY() - move < this.bottomMargin) {
      await this.addPage();
    }
    this.page!.moveDown(textHeight);
    if (text) {
      this.page!.drawText(text, {
        x: options.leftPos,
        size: textSize,
        lineHeight: textSize,
      });
    }
    this.page!.moveDown(this.interLine);
  }
  /**
   * @returns text Width
   */
  getWidth(): number {
    return this.page!.getWidth() - (this.page!.getX() + this.rightMargin);
  }
  /**
   * Break text into lines
   */
  breakTextIntoLines(
    text: string | null,
    textSize: number,
    options: { width?: number; breakWords?: string[] } = {},
  ) {
    if (!text) {
      return [];
    }
    const breakWords = options.breakWords || this.doc.defaultWordBreaks;
    const width = options.width || this.getWidth();
    const computeTextWidth = (t: string) =>
      this.font!.widthOfTextAtSize(t, textSize);
    return breakTextIntoLines(text, breakWords, width, computeTextWidth);
  }
  /**
   * Add paragraph
   */
  async addParagraph(text: string, textSize: number | null = null) {
    textSize = textSize || this.defaultSize;
    const lines = this.breakTextIntoLines(text, textSize!);
    for (const l of lines) {
      await this.drawTextLine(l, { textSize });
    }
  }
  /**
   * Add image
   */
  addImage(image: PDFImage, options: PDFPageDrawImageOptions) {
    this.page!.drawImage(image, options);
  }
  /**
   * Add centred text to the page
   */
  async addCenteredText(text: string, textSize: number | null = null) {
    textSize = textSize || this.defaultSize;
    const textWidth = this.font!.widthOfTextAtSize(text, textSize);
    const leftPos =
      (this.page!.getWidth() +
        this.page!.getX() -
        this.rightMargin -
        textWidth) /
      2;
    await this.drawTextLine(text, { textSize, leftPos });
  }

  /**
   * Add a list
   */
  async list(list: string[], options: any) {
    options = Object.assign(
      {
        type: 'bullet',
        bulletRadius: 1.5,
        indent: 20
      },
      options,
    );
    this.page!.moveRight(options.indent);
    for (const l of list) {
      await this.addParagraph(l, this.defaultSize);
      const textHeight = this.font!.heightAtSize(this.defaultSize);
      if (options.type == 'bullet') {
        this.page!.drawEllipse({
          x: this.page!.getX() - options.bulletRadius * 3,
          y: this.page!.getY() + textHeight / 2 - options.bulletRadius,
          xScale: options.bulletRadius / 2,
          yScale: options.bulletRadius / 2,
          borderWidth: options.bulletRadius,
        });
      }
    }
    this.page!.moveLeft(options.indent);
  }
}
