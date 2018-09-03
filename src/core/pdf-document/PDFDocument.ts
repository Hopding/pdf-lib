import isNumber from 'lodash/isNumber';
import values from 'lodash/values';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import Standard14Fonts, {
  IStandard14FontsUnion,
} from 'core/pdf-document/Standard14Fonts';
import {
  PDFDictionary,
  PDFIndirectReference,
  PDFName,
  PDFObject,
  PDFRawStream,
} from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import {
  PDFCatalog,
  PDFContentStream,
  PDFHeader,
  PDFPage,
  PDFPageTree,
} from 'core/pdf-structures';
import JPEGXObjectFactory from 'core/pdf-structures/factories/JPEGXObjectFactory';
import PDFFontEncoder from 'core/pdf-structures/factories/PDFFontEncoder';
import PDFFontFactory, {
  IFontFlagOptions,
} from 'core/pdf-structures/factories/PDFFontFactory';
import PDFStandardFontFactory from 'core/pdf-structures/factories/PDFStandardFontFactory';
import PNGXObjectFactory from 'core/pdf-structures/factories/PNGXObjectFactory';
import { isInstance, oneOf, validate } from 'utils/validate';

class PDFDocument {
  static from = (
    catalog: PDFCatalog,
    maxObjectNumber: number,
    index: PDFObjectIndex,
  ) => new PDFDocument(catalog, maxObjectNumber, index);

  /** @hidden */
  header: PDFHeader = PDFHeader.forVersion(1, 7);
  /** @hidden */
  catalog: PDFCatalog;
  /** @hidden */
  index: PDFObjectIndex;

  maxObjNum: number = 0;

  constructor(
    catalog: PDFCatalog,
    maxObjectNumber: number,
    index: PDFObjectIndex,
  ) {
    validate(
      catalog,
      isInstance(PDFCatalog),
      '"catalog" must be a PDFCatalog object',
    );
    validate(maxObjectNumber, isNumber, '"maxObjectNumber" must be a number');
    validate(
      index,
      isInstance(PDFObjectIndex),
      '"index" must be a PDFObjectIndex object',
    );

    this.catalog = catalog;
    this.maxObjNum = maxObjectNumber;
    this.index = index;
  }

  /**
   * Registers a [[PDFObject]] to the [[PDFDocument]]'s `index`. Returns a
   * [[PDFIndirectReference]] that can be used to reference the given `object`
   * in other `pdf-lib` methods.
   *
   * @param   object The [[PDFObject]] to be registered.
   *
   * @returns The [[PDFIndirectReference]] under which the `object` has been
   *          registered.
   */
  register = <T extends PDFObject>(object: T): PDFIndirectReference<T> => {
    validate(object, isInstance(PDFObject), 'object must be a PDFObject');
    this.maxObjNum += 1;
    const ref = PDFIndirectReference.forNumbers(this.maxObjNum, 0);
    this.index.set(ref, object);
    return ref;
  };

  /**
   * @returns An array of [[PDFPage]] objects representing the pages of the
   *          [[PDFDocument]]. The order of the [[PDFPage]] documents in the
   *          array mirrors the order in which they will be rendered in the
   *          [[PDFDocument]].
   */
  getPages = (): PDFPage[] => {
    const pages = [] as PDFPage[];
    this.catalog.Pages.traverse((kid) => {
      if (kid instanceof PDFPage) pages.push(kid);
    });
    return pages;
  };

  /**
   * Creates a new [[PDFPage]] of the given `size`. And optionally, with the
   * given `resources` dictionary.
   *
   * Note that the [[PDFPage]] returned by this method is **not** automatically
   * added to the [[PDFDocument]]. You must call the [[addPage]] or [[insertPage]]
   * methods for it to be rendered in the document.
   *
   * @param size      A tuple containing the width and height of the page,
   *                  respectively.
   * @param resources A resources dictionary for the page.
   *
   * @returns The newly created [[PDFPage]].
   */
  createPage = (size: [number, number], resources?: PDFDictionary): PDFPage =>
    PDFPage.create(this.index, size, resources);

  /**
   * Creates a new [[PDFContentStream]] with the given operators.
   *
   * Note that the [[PDFContentStream]] returned by this method is **not**
   * automatically registered to the document or added to any of its pages.
   * You must first call the [[register]] method for it to be registered to the
   * [[PDFDocument]]. Then, you must call [[PDFPage.addContentStreams]] to add
   * the registered [[PDFContentStream]] to the desired page(s).
   *
   * @param operators One or more [[PDFOperator]]s to be added to the
   *                  [[PDFContentStream]].
   *
   * @returns The newly created [[PDFContentStream]].
   */
  createContentStream = (
    ...operators: Array<PDFOperator | PDFOperator[]>
  ): PDFContentStream =>
    PDFContentStream.of(PDFDictionary.from({}, this.index), ...operators);

  /**
   * Adds a page to the end of the [[PDFDocument]].
   *
   * @param page The page to be added.
   */
  addPage = (page: PDFPage) => {
    validate(page, isInstance(PDFPage), 'page must be a PDFPage');
    const { Pages } = this.catalog;

    let lastPageTree = Pages;
    let lastPageTreeRef = this.catalog.get('Pages');
    Pages.traverseRight((kid, ref) => {
      if (kid instanceof PDFPageTree) {
        lastPageTree = kid;
        lastPageTreeRef = ref;
      }
    });

    page.set('Parent', lastPageTreeRef);
    lastPageTree.addPage(this.register(page));
    return this;
  };

  // TODO: Clean up unused objects when possible after removing page from tree
  // TODO: Make sure "idx" is within required range
  /**
   * Removes a page from the document.
   *
   * @param index The index of the page to be removed. The index is zero-based,
   *              e.g. the first page in the document is index `0`.
   */
  removePage = (index: number) => {
    validate(index, isNumber, 'idx must be a number');
    const pageTreeRef = this.catalog.get('Pages');

    // TODO: Use a "stop" callback to avoid unneccesarily traversing whole page tree...
    let treeRef = pageTreeRef;
    let pageCount = 0;
    let kidNum = 0;
    this.catalog.Pages.traverse((kid, ref) => {
      if (pageCount !== index) {
        if (kid instanceof PDFPageTree) kidNum = 0;
        if (kid instanceof PDFPage) {
          pageCount += 1;
          kidNum += 1;
          if (pageCount === index) treeRef = kid.get('Parent');
        }
      }
    });

    const tree = this.index.lookup(treeRef) as PDFPageTree;
    tree.removePage(kidNum);
    return this;
  };

  // TODO: Make sure "idx" is within required range
  /**
   * Inserts a page into the document at the specified index. The page that is
   * displaced by the insertion will be become the page immediately following
   * the inserted page.
   *
   * @param index The index of the page to be removed. The index is zero-based,
   *              e.g. the first page in the document is index `0`.
   * @param page  The page to be inserted.
   */
  insertPage = (index: number, page: PDFPage) => {
    validate(index, isNumber, 'idx must be a number');
    validate(page, isInstance(PDFPage), 'page must be a PDFPage');
    const pageTreeRef = this.catalog.get('Pages');

    // TODO: Use a "stop" callback to avoid unneccesarily traversing whole page tree...
    let treeRef = pageTreeRef;
    let pageCount = 0;
    let kidNum = 0;
    this.catalog.Pages.traverse((kid, ref) => {
      if (pageCount !== index) {
        if (kid instanceof PDFPageTree) kidNum = 0;
        if (kid instanceof PDFPage) {
          pageCount += 1;
          kidNum += 1;
          if (pageCount === index) treeRef = kid.get('Parent');
        }
      }
    });

    page.set('Parent', treeRef);
    const tree = this.index.lookup(treeRef) as PDFPageTree;
    tree.insertPage(kidNum, this.register(page));
    return this;
  };

  /**
   * Embeds one of the Standard 14 Fonts fonts in the document. This method
   * does **not** require a `Uint8Array` containing a font to be passed, because
   * the Standard 14 Fonts are automatically available to all PDF documents.
   *
   * @param fontName Name of the font to be embedded.
   *
   * @returns A tuple containing the [[PDFIndirectReference]] under which the
   *          specified font is registered.
   */
  embedStandardFont = (
    fontName: IStandard14FontsUnion,
  ): [PDFIndirectReference<PDFDictionary>, PDFFontEncoder] => {
    validate(
      fontName,
      oneOf(...Standard14Fonts),
      'PDFDocument.embedStandardFont: "fontName" must be one of the Standard 14 Fonts: ' +
        values(Standard14Fonts).join(', '),
    );

    const standardFontFactory = PDFStandardFontFactory.for(fontName);
    return [standardFontFactory.embedFontIn(this), standardFontFactory];
  };

  /**
   * Embeds the font contained in the specified `Uint8Array` in the document.
   *
   * @param fontData A `Uint8Array` containing an OpenType (`.otf`) or TrueType
   *                 (`.ttf`) font.
   *
   * @returns A tuple containing (1) the [[PDFIndirectReference]] under which the
   *          specified font is registered, and (2) a [[PDFFontFactory]] object
   *          containing font metadata properties and methods.
   */
  embedFont = (
    fontData: Uint8Array,
    fontFlags: IFontFlagOptions = { Nonsymbolic: true },
  ): [PDFIndirectReference<PDFDictionary>, PDFFontFactory] => {
    const fontFactory = PDFFontFactory.for(fontData, fontFlags);
    return [fontFactory.embedFontIn(this), fontFactory];
  };

  /**
   * Embeds the PNG image contained in the specified `Uint8Array` in the document.
   *
   * @param pngData A `Uint8Array` containing a PNG (`.png`) image.
   *
   * @returns A tuple containing (1) the [[PDFIndirectReference]] under which the
   *          specified image is registered, and (2) a [[PNGXObjectFactory]]
   *          object containing the image's width and height.
   */
  embedPNG = (
    pngData: Uint8Array,
  ): [PDFIndirectReference<PDFRawStream>, PNGXObjectFactory] => {
    const pngFactory = PNGXObjectFactory.for(pngData);
    return [pngFactory.embedImageIn(this), pngFactory];
  };

  /**
   * Embeds the JPG image contained in the specified `Uint8Array` in the document.
   *
   * @param jpgData A `Uint8Array` containing a JPG (`.jpg`) image.
   *
   * @returns A tuple containing (1) the [[PDFIndirectReference]] under which the
   *          specified image is registered, and (2) a [[JPEGXObjectFactory]]
   *          object containing the image's width and height.
   */
  embedJPG = (
    jpgData: Uint8Array,
  ): [PDFIndirectReference<PDFRawStream>, JPEGXObjectFactory] => {
    const jpgFactory = JPEGXObjectFactory.for(jpgData);
    return [jpgFactory.embedImageIn(this), jpgFactory];
  };
}

export default PDFDocument;
