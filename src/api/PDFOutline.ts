import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import { PDFOutlines, outlineOptions, PDFRef, PDFName } from 'src/core';
import { assertIs, assertRange } from 'src/utils';

/**
 * Represents a single outline of a [[PDFDocument]].
 */
export default class PDFOutline {
  /**
   * > **NOTE:** You probably don't want to call this method directly. Instead,
   * > consider using the [[PDFDocument.addOutline]] and [[PDFDocument.insertOutline]]
   * > methods, which can create instances of [[PDFOutline]] for you.
   * > Then with a [[PDFOutline]], you can also use [[PDFOutline.addOutline]] and
   * > [[PDFOutline.insertOutline]] to create a nested outline.
   *
   * Create an instance of [[PDFOutline]] from an existing outline node.
   *
   * @param outlineNode The outline node to be wrapped.
   * @param ref The unique reference for the outline.
   * @param doc The document to which the outline will belong.
   */
  static of = (outlineNode: PDFOutlines, ref: PDFRef, doc: PDFDocument) =>
    new PDFOutline(outlineNode, ref, doc);

  /**
   * > **NOTE:** You probably don't want to call this method directly. Instead,
   * > consider using the [[PDFDocument.addOutline]] and [[PDFDocument.insertOutline]]
   * > methods, which can create instances of [[PDFOutline]] for you.
   * > Then with a [[PDFOutline]], you can also use [[PDFOutline.addOutline]] and
   * > [[PDFOutline.insertOutline]] to create a nested outline.
   *
   * Create an instance of [[PDFOutline]].
   *
   * @param doc The document to which the outline will belong.
   * @param title The title of the outline.
   * @param outlineOptions The outline options.
   */
  static create = (
    doc: PDFDocument,
    title: string,
    options?: outlineOptions,
  ) => {
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);
    const dummyRef = PDFRef.of(-1);
    const outlineItem = PDFOutlines.withContext(
      doc.context,
      options,
      title,
      dummyRef,
    );

    const outlineRef = doc.context.register(outlineItem);
    return new PDFOutline(outlineItem, outlineRef, doc);
  };

  /** The low-level PDFDictionary wrapped by this outline. */
  readonly node: PDFOutlines;

  /** The unique reference assigned to this outline within the document. */
  readonly ref: PDFRef;

  /** The document to which this outline belongs. */
  readonly doc: PDFDocument;

  private constructor(outlineNode: PDFOutlines, ref: PDFRef, doc: PDFDocument) {
    assertIs(outlineNode, 'outlineNode', [[PDFOutlines, 'PDFOutlines']]);
    assertIs(ref, 'ref', [[PDFRef, 'PDFRef']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.node = outlineNode;
    this.ref = ref;
    this.doc = doc;
  }

  setTitle(title: string): void {
    assertIs(title, 'title', ['string']);
    this.node.setTitle(title);
  }

  setPage(page: PDFPage): void {
    assertIs(page, 'page', [[PDFPage, 'PDFPage']]);
    this.node.setDest(page.ref);
  }

  setExpanded(expanded: boolean): void {
    assertIs(expanded, 'expanded', ['boolean']);
    this.node.setExpanded(expanded);
  }

  /**
   * Remove an outline with all its progenies.
   * First, traverse through and delete all children.
   * Second, delete itself from its Parent's children array.
   */
  remove(): void {
    this.node.removeChildren();
    const parent = this.node.get(PDFName.Parent);
    const parentOutline = this.doc.context.lookup(
      parent,
      PDFOutlines,
    ) as PDFOutlines;
    const idx = parentOutline.children.findIndex((ref) => ref === this.ref);
    parentOutline.removeChild(idx);
  }

  /**
   * Add a nested outline as the last child of this outline.
   * This method accepts two parameters:
   * 1) title, as a text string,
   * 2) an optional object with two possible options:
   *    i) expanded, a boolean to flag whether it should be expanded in the initial view,
   *   ii) page, a PDFRef of a PDFPage for the new outline to be linked to.
   *
   * For example:
   * ```js
   * const newPage = pdfDoc.addPage()
   * const newOutline = pdfDoc.addOutline('title')
   * const nestedOutline = newOutline.addOutline('title2', { expanded: true, page: newPage })
   * ```
   * This will add a nested outline labeled "title2",
   * with an expanded view and linked to newPage.
   *
   * @param title, the desired title of the nested outline.
   * @param outlineOptions object that may contain `expanded`, and/or `page`.
   * @returns The newly created nested outline.
   */
  addOutline(title: string, options?: outlineOptions): PDFOutline {
    assertIs(title, 'title', ['string']);
    if (options?.expanded) assertIs(options?.expanded, 'expanded', ['boolean']);
    if (options?.page) {
      assertIs(options?.page, 'page', [[PDFPage, 'PDFPage']]);
    }

    return this.insertOutline(this.node.children.length, title, options);
  }

  /**
   * Add a nested outline as a child of this outline at index.
   * This method accepts three prameters:
   * 1) index, number where to insert,
   * 2) title, as a text string,
   * 3) an optional object with two possible options:
   *    i) expanded, a boolean to flag whether it should be expanded in the initial view,
   *   ii) page, a PDFRef of a PDFPage for the new outline to be linked to.
   *
   * For example:
   * ```js
   * const newPage = pdfDoc.addPage()
   * const newOutline = pdfDoc.addOutline('title')
   * const childOutline = newOutline.insertOutline(2, 'title2', { expanded: true, page: newPage })
   * ```
   * This will add a nested outline into newOutline labeled "title2" at index 2,
   * with an expanded view and linked to newPage.
   *
   * @param index The index at which the page should be inserted (zero-based).
   * @param title The desired title of the outline.
   * @param outlineOptions object that may contain `expanded`, and/or `page`.
   * @returns The newly created nested outline.
   */
  insertOutline(
    index: number,
    title: string,
    options?: outlineOptions,
  ): PDFOutline {
    const outlineCount = this.node.children.length;
    assertRange(index, 'index', 0, outlineCount);
    assertIs(title, 'title', ['string']);
    if (options?.expanded) assertIs(options?.expanded, 'expanded', ['boolean']);
    if (options?.page) {
      assertIs(options?.page, 'page', [[PDFPage, 'PDFPage']]);
    }

    const outline = PDFOutline.create(this.doc, title, options);
    const parentRef = this.node.insertOutlineItem(this.ref, outline.ref, index);
    outline.node.setParent(parentRef);

    if (options?.page !== undefined && options?.page?.ref !== undefined) {
      outline.node.setDest(options?.page?.ref);
    }

    return outline;
  }
}
