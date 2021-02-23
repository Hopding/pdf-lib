import PDFDocument from 'src/api/PDFDocument';
import PDFFont from 'src/api/PDFFont';
import { PageSizes } from 'src/api/sizes';
import PDFPage from 'src/api/PDFPage';
import { assertIs, assertOrUndefined } from 'src/utils';
import { StandardFonts } from './StandardFonts';

export interface PdfBuilderOptions {
  defaultSize?: number /** The default text size*/;
  topMargin?: number /** The top margin*/;
  leftMargin?: number /** The left margin */;
  rightMargin?: number /** The right margin */;
  bottomMargin?: number /** The bottom margin */;
  interLine?: number /** Space between lines */;
  onAddPage?: (builder: PdfBuilder, pageNumber: number) => void /** Callback on new page event */;
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
    let newDoc = new PdfBuilder(doc, options);
    await newDoc.addPage();
    return newDoc;
  };

  /** The document to which this builder belongs. */
  readonly doc: PDFDocument;

  // private fontKey?: string;
  private font?: PDFFont;
  private page?: PDFPage;
  // private PDFSize?: string;
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
    this.rightMargin = options.rightMargin ? options.rightMargin : this.rightMargin;
    this.bottomMargin = options.bottomMargin ? options.bottomMargin : this.bottomMargin;
    this.interLine = options.interLine ? options.interLine : this.interLine;
    this.defaultSize = options.defaultSize ? options.defaultSize : this.defaultSize;
    this.onAddPage = options.onAddPage ? options.onAddPage : this.onAddPage;
    this.doc = doc;
  }

 /**
   * load font
   */
  async loadFont() {
    if (!this.font) {
      this.font = await this.doc.embedStandardFont(StandardFonts.TimesRoman);
    }
    this.page!.setFont(this.font);
  }

  /**
   * Add a new page to the document
   */
  async addPage() {
    this.currentPageNumber++;
    this.page = this.doc.addPage(PageSizes.A4);
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
    options: { textSize: number; leftPos: number; font: PDFFont },
  ) {
    assertIs(text, 'text', ['string']);
    assertOrUndefined(options.textSize, 'options.size', ['number']);
    assertOrUndefined(options.leftPos, 'options.size', ['number']);
    assertOrUndefined(options.font, 'options.font', [[PDFFont, 'PDFFont']]);

    if (options.font) this.font = options.font;
    await this.loadFont();
    const textSize = options.textSize || this.defaultSize;
    const textHeight = this.font!.heightAtSize(textSize);
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

}
