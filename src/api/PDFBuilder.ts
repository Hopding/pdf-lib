import PDFDocument from 'src/api/PDFDocument';
import PDFFont from 'src/api/PDFFont';
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

export interface PdfBuilderOptions {
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

  private fontKey?: string;
  private font?: PDFFont;
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
    this.onAddPage = options.onAddPage ? options.onAddPage : this.onAddPage;
    this.doc = doc;
  }

  /**
   * Add a new page to the document
   */
  async addPage() {
    this.currentPageNumber++;
    this.page = this.doc.addPage(pdfLib.PageSizes.A4);
    this.page.setFont(this.font);
    this.page.moveTo(this.leftMargin, this.page.getHeight() - this.topMargin);
    if (this.onAddPage) {
      await this.onAddPage(this, this.currentPageNumber);
    };
  }

}
