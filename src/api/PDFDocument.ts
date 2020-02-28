import Embeddable from 'src/api/Embeddable';
import {
  EncryptedPDFError,
  FontkitNotRegisteredError,
  ForeignPageError,
  RemovePageFromEmptyDocumentError,
} from 'src/api/errors';
import PDFEmbeddedPage from 'src/api/PDFEmbeddedPage';
import PDFFont from 'src/api/PDFFont';
import PDFImage from 'src/api/PDFImage';
import PDFPage from 'src/api/PDFPage';
import { PageSizes } from 'src/api/sizes';
import { StandardFonts } from 'src/api/StandardFonts';
import {
  CustomFontEmbedder,
  CustomFontSubsetEmbedder,
  JpegEmbedder,
  PageBoundingBox,
  PageEmbeddingMismatchedContextError,
  PDFCatalog,
  PDFContext,
  PDFDict,
  PDFHexString,
  PDFName,
  PDFObjectCopier,
  PDFPageEmbedder,
  PDFPageLeaf,
  PDFPageTree,
  PDFParser,
  PDFStreamWriter,
  PDFString,
  PDFWriter,
  PngEmbedder,
  StandardFontEmbedder,
} from 'src/core';
import { Fontkit } from 'src/types/fontkit';
import { TransformationMatrix } from 'src/types/matrix';
import {
  assertIs,
  assertRange,
  Cache,
  canBeConvertedToUint8Array,
  encodeToBase64,
  isStandardFont,
  pluckIndices,
  range,
  toUint8Array,
} from 'src/utils';

export enum ParseSpeeds {
  Fastest = Infinity,
  Fast = 1500,
  Medium = 500,
  Slow = 100,
}

export interface SaveOptions {
  useObjectStreams?: boolean;
  addDefaultPage?: boolean;
  objectsPerTick?: number;
}

export interface Base64SaveOptions extends SaveOptions {
  dataUri?: boolean;
}

export interface LoadOptions {
  ignoreEncryption?: boolean;
  parseSpeed?: ParseSpeeds | number;
  throwOnInvalidObject?: boolean;
}

export interface EmbedFontOptions {
  subset?: boolean;
}

/**
 * Represents a PDF document.
 */
export default class PDFDocument {
  /**
   * Load an existing [[PDFDocument]]. The input data can be provided in
   * multiple formats:
   *
   * | Type          | Contents                                               |
   * | ------------- | ------------------------------------------------------ |
   * | `string`      | A base64 encoded string (or data URI) containing a PDF |
   * | `Uint8Array`  | The raw bytes of a PDF                                 |
   * | `ArrayBuffer` | The raw bytes of a PDF                                 |
   *
   * For example:
   * ```js
   * import { PDFDocument } from 'pdf-lib'
   *
   * // pdf=string
   * const base64 =
   *  'JVBERi0xLjcKJYGBgYEKCjUgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL0xlbm' +
   *  'd0aCAxMDQKPj4Kc3RyZWFtCniccwrhMlAAwaJ0Ln2P1Jyy1JLM5ERdc0MjCwUjE4WQNC4Q' +
   *  '6cNlCFZkqGCqYGSqEJLLZWNuYGZiZmbkYuZsZmlmZGRgZmluDCQNzc3NTM2NzdzMXMxMjQ' +
   *  'ztFEKyuEK0uFxDuAAOERdVCmVuZHN0cmVhbQplbmRvYmoKCjYgMCBvYmoKPDwKL0ZpbHRl' +
   *  'ciAvRmxhdGVEZWNvZGUKL1R5cGUgL09ialN0bQovTiA0Ci9GaXJzdCAyMAovTGVuZ3RoID' +
   *  'IxNQo+PgpzdHJlYW0KeJxVj9GqwjAMhu/zFHkBzTo3nCCCiiKIHPEICuJF3cKoSCu2E8/b' +
   *  '20wPIr1p8v9/8kVhgilmGfawX2CGaVrgcAi0/bsy0lrX7IGWpvJ4iJYEN3gEmrrGBlQwGs' +
   *  'HHO9VBX1wNrxAqMX87RBD5xpJuddqwd82tjAHxzV1U5LPgy52DKXWnr1Lheg+j/c/pzGVr' +
   *  'iqV0VlwZPXGPCJjElw/ybkwUmeoWgxesDXGhHJC/D/iikp1Av80ptKU0FdBEe25pPihAM1' +
   *  'u6ytgaaWfs2Hrz35CJT1+EWmAKZW5kc3RyZWFtCmVuZG9iagoKNyAwIG9iago8PAovU2l6' +
   *  'ZSA4Ci9Sb290IDIgMCBSCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlCi9UeXBlIC9YUmVmCi9MZW' +
   *  '5ndGggMzgKL1cgWyAxIDIgMiBdCi9JbmRleCBbIDAgOCBdCj4+CnN0cmVhbQp4nBXEwREA' +
   *  'EBAEsCwz3vrvRmOOyyOoGhZdutHN2MT55fIAVocD+AplbmRzdHJlYW0KZW5kb2JqCgpzdG' +
   *  'FydHhyZWYKNTEwCiUlRU9G'
   *
   * const dataUri = 'data:application/pdf;base64,' + base64
   *
   * const pdfDoc1 = await PDFDocument.load(base64)
   * const pdfDoc2 = await PDFDocument.load(dataUri)
   *
   * // pdf=Uint8Array
   * import fs from 'fs'
   * const uint8Array = fs.readFileSync('with_update_sections.pdf')
   * const pdfDoc3 = await PDFDocument.load(uint8Array)
   *
   * // pdf=ArrayBuffer
   * const url = 'https://pdf-lib.js.org/assets/with_update_sections.pdf'
   * const arrayBuffer = await fetch(url).then(res => res.arrayBuffer())
   * const pdfDoc4 = await PDFDocument.load(arrayBuffer)
   *
   * ```
   *
   * @param pdf The input data containing a PDF document.
   * @param options The options to be used when loading the document.
   * @returns Resolves with a document loaded from the input.
   */
  static async load(
    pdf: string | Uint8Array | ArrayBuffer,
    options: LoadOptions = {},
  ) {
    const {
      ignoreEncryption = false,
      parseSpeed = ParseSpeeds.Slow,
      throwOnInvalidObject = false,
    } = options;

    assertIs(pdf, 'pdf', ['string', Uint8Array, ArrayBuffer]);
    assertIs(ignoreEncryption, 'ignoreEncryption', ['boolean']);
    assertIs(parseSpeed, 'parseSpeed', ['number']);
    assertIs(throwOnInvalidObject, 'throwOnInvalidObject', ['boolean']);

    const bytes = toUint8Array(pdf);
    const context = await PDFParser.forBytesWithOptions(
      bytes,
      parseSpeed,
      throwOnInvalidObject,
    ).parseDocument();
    return new PDFDocument(context, ignoreEncryption);
  }

  /**
   * Create a new [[PDFDocument]].
   * @returns Resolves with the newly created document.
   */
  static async create() {
    const context = PDFContext.create();
    const pageTree = PDFPageTree.withContext(context);
    const pageTreeRef = context.register(pageTree);
    const catalog = PDFCatalog.withContextAndPages(context, pageTreeRef);
    context.trailerInfo.Root = context.register(catalog);
    return new PDFDocument(context, false);
  }

  /** The low-level context of this document. */
  readonly context: PDFContext;

  /** The catalog of this document. */
  readonly catalog: PDFCatalog;

  /** Whether or not this document is encrypted. */
  readonly isEncrypted: boolean;

  /** The default word breaks used in PDFPage.drawText */
  defaultWordBreaks: string[] = [' '];

  private fontkit?: Fontkit;
  private pageCount: number | undefined;
  private readonly pageCache: Cache<PDFPage[]>;
  private readonly pageMap: Map<PDFPageLeaf, PDFPage>;
  private readonly fonts: PDFFont[];
  private readonly images: PDFImage[];
  private readonly embeddedPages: PDFEmbeddedPage[];

  private constructor(context: PDFContext, ignoreEncryption: boolean) {
    assertIs(context, 'context', [[PDFContext, 'PDFContext']]);
    assertIs(ignoreEncryption, 'ignoreEncryption', ['boolean']);

    this.context = context;
    this.catalog = context.lookup(context.trailerInfo.Root) as PDFCatalog;
    this.isEncrypted = !!context.lookup(context.trailerInfo.Encrypt);

    this.pageCache = Cache.populatedBy(this.computePages);
    this.pageMap = new Map();
    this.fonts = [];
    this.images = [];
    this.embeddedPages = [];

    if (!ignoreEncryption && this.isEncrypted) throw new EncryptedPDFError();

    this.updateInfoDict();
  }

  /**
   * Register a fontkit instance. This must be done before custom fonts can
   * be embedded. See [here](https://github.com/Hopding/pdf-lib/tree/Rewrite#fontkit-installation)
   * for instructions on how to install and register a fontkit instance.
   *
   * > You do **not** need to call this method to embed standard fonts.
   *
   * @param fontkit The fontkit instance to be registered.
   */
  registerFontkit(fontkit: Fontkit): void {
    this.fontkit = fontkit;
  }

  /**
   * Set this document's title metadata. The title will appear in the
   * "Document Properties" section of most PDF readers. For example:
   * ```js
   * pdfDoc.setTitle('🥚 The Life of an Egg 🍳')
   * ```
   * @param title The title of this document.
   */
  setTitle(title: string): void {
    assertIs(title, 'title', ['string']);
    const key = PDFName.of('Title');
    this.getInfoDict().set(key, PDFHexString.fromText(title));
  }

  /**
   * Set this document's author metadata. The author will appear in the
   * "Document Properties" section of most PDF readers. For example:
   * ```js
   * pdfDoc.setAuthor('Humpty Dumpty')
   * ```
   * @param author The author of this document.
   */
  setAuthor(author: string): void {
    assertIs(author, 'author', ['string']);
    const key = PDFName.of('Author');
    this.getInfoDict().set(key, PDFHexString.fromText(author));
  }

  /**
   * Set this document's subject metadata. The subject will appear in the
   * "Document Properties" section of most PDF readers. For example:
   * ```js
   * pdfDoc.setSubject('📘 An Epic Tale of Woe 📖')
   * ```
   * @param subject The subject of this document.
   */
  setSubject(subject: string): void {
    assertIs(subject, 'author', ['string']);
    const key = PDFName.of('Subject');
    this.getInfoDict().set(key, PDFHexString.fromText(subject));
  }

  /**
   * Set this document's keyword metadata. These keywords will appear in the
   * "Document Properties" section of most PDF readers. For example:
   * ```js
   * pdfDoc.setKeywords(['eggs', 'wall', 'fall', 'king', 'horses', 'men'])
   * ```
   * @param keywords An array of keywords associated with this document.
   */
  setKeywords(keywords: string[]): void {
    assertIs(keywords, 'keywords', [Array]);
    const key = PDFName.of('Keywords');
    this.getInfoDict().set(key, PDFHexString.fromText(keywords.join(' ')));
  }

  /**
   * Set this document's creator metadata. The creator will appear in the
   * "Document Properties" section of most PDF readers. For example:
   * ```js
   * pdfDoc.setCreator('PDF App 9000 🤖')
   * ```
   * @param creator The creator of this document.
   */
  setCreator(creator: string): void {
    assertIs(creator, 'creator', ['string']);
    const key = PDFName.of('Creator');
    this.getInfoDict().set(key, PDFHexString.fromText(creator));
  }

  /**
   * Set this document's producer metadata. The producer will appear in the
   * "Document Properties" section of most PDF readers. For example:
   * ```js
   * pdfDoc.setProducer('PDF App 9000 🤖')
   * ```
   * @param producer The producer of this document.
   */
  setProducer(producer: string): void {
    assertIs(producer, 'creator', ['string']);
    const key = PDFName.of('Producer');
    this.getInfoDict().set(key, PDFHexString.fromText(producer));
  }

  /**
   * Set this document's language metadata. The language will appear in the
   * "Document Properties" section of some PDF readers. For example:
   * ```js
   * pdfDoc.setLanguage('en-us')
   * ```
   *
   * @param language An RFC 3066 _Language-Tag_ denoting the language of this
   *                 document, or an empty string if the language is unknown.
   */
  setLanguage(language: string): void {
    assertIs(language, 'language', ['string']);
    const key = PDFName.of('Lang');
    this.catalog.set(key, PDFString.of(language));
  }

  /**
   * Set this document's creation date metadata. The creation date will appear
   * in the "Document Properties" section of most PDF readers. For example:
   * ```js
   * pdfDoc.setCreationDate(new Date())
   * ```
   * @param creationDate The date this document was created.
   */
  setCreationDate(creationDate: Date): void {
    assertIs(creationDate, 'creationDate', [[Date, 'Date']]);
    const key = PDFName.of('CreationDate');
    this.getInfoDict().set(key, PDFString.fromDate(creationDate));
  }

  /**
   * Set this document's modification date metadata. The modification date will
   * appear in the "Document Properties" section of most PDF readers. For
   * example:
   * ```js
   * pdfDoc.setModificationDate(new Date())
   * ```
   * @param modificationDate The date this document was last modified.
   */
  setModificationDate(modificationDate: Date): void {
    assertIs(modificationDate, 'modificationDate', [[Date, 'Date']]);
    const key = PDFName.of('ModDate');
    this.getInfoDict().set(key, PDFString.fromDate(modificationDate));
  }

  /**
   * Get the number of pages contained in this document. For example:
   * ```js
   * const totalPages = pdfDoc.getPageCount()
   * ```
   * @returns The number of pages in this document.
   */
  getPageCount(): number {
    if (this.pageCount === undefined) this.pageCount = this.getPages().length;
    return this.pageCount;
  }

  /**
   * Get an array of all the pages contained in this document. The pages are
   * stored in the array in the same order that they are rendered in the
   * document. For example:
   * ```js
   * const pages = pdfDoc.getPages()
   * pages[0]   // The first page of the document
   * pages[2]   // The third page of the document
   * pages[197] // The 198th page of the document
   * ```
   * @returns An array of all the pages contained in this document.
   */
  getPages(): PDFPage[] {
    return this.pageCache.access();
  }

  /**
   * Get an array of indices for all the pages contained in this document. The
   * array will contain a range of integers from
   * `0..pdfDoc.getPageCount() - 1`. For example:
   * ```js
   * const pdfDoc = await PDFDocument.create()
   * pdfDoc.addPage()
   * pdfDoc.addPage()
   * pdfDoc.addPage()
   *
   * const indices = pdfDoc.getPageIndices()
   * indices // => [0, 1, 2]
   * ```
   * @returns An array of indices for all pages contained in this document.
   */
  getPageIndices(): number[] {
    return range(0, this.getPageCount());
  }

  /**
   * Remove the page at a given index from this document. For example:
   * ```js
   * pdfDoc.removePage(0)   // Remove the first page of the document
   * pdfDoc.removePage(2)   // Remove the third page of the document
   * pdfDoc.removePage(197) // Remove the 198th page of the document
   * ```
   * Once a page has been removed, it will no longer be rendered at that index
   * in the document.
   * @param index The index of the page to be removed.
   */
  removePage(index: number): void {
    const pageCount = this.getPageCount();
    if (this.pageCount === 0) throw new RemovePageFromEmptyDocumentError();
    assertRange(index, 'index', 0, pageCount - 1);
    this.catalog.removeLeafNode(index);
    this.pageCount = pageCount - 1;
  }

  /**
   * Add a page to the end of this document. This method accepts three
   * different value types for the `page` parameter:
   *
   * | Type               | Behavior                                                                            |
   * | ------------------ | ----------------------------------------------------------------------------------- |
   * | `undefined`        | Create a new page and add it to the end of this document                            |
   * | `[number, number]` | Create a new page with the given dimensions and add it to the end of this document  |
   * | `PDFPage`          | Add the existing page to the end of this document                                   |
   *
   * For example:
   * ```js
   * // page=undefined
   * const newPage = pdfDoc.addPage()
   *
   * // page=[number, number]
   * import { PageSizes } from 'pdf-lib'
   * const newPage1 = pdfDoc.addPage(PageSizes.A7)
   * const newPage2 = pdfDoc.addPage(PageSizes.Letter)
   * const newPage3 = pdfDoc.addPage([500, 750])
   *
   * // page=PDFPage
   * const pdfDoc1 = await PDFDocument.create()
   * const pdfDoc2 = await PDFDocument.load(...)
   * const [existingPage] = await pdfDoc1.copyPages(pdfDoc2, [0])
   * pdfDoc1.addPage(existingPage)
   * ```
   *
   * @param page Optionally, the desired dimensions or existing page.
   * @returns The newly created (or existing) page.
   */
  addPage(page?: PDFPage | [number, number]): PDFPage {
    assertIs(page, 'page', ['undefined', [PDFPage, 'PDFPage'], Array]);
    return this.insertPage(this.getPageCount(), page);
  }

  /**
   * Insert a page at a given index within this document. This method accepts
   * three different value types for the `page` parameter:
   *
   * | Type               | Behavior                                                                       |
   * | ------------------ | ------------------------------------------------------------------------------ |
   * | `undefined`        | Create a new page and insert it into this document                             |
   * | `[number, number]` | Create a new page with the given dimensions and insert it into this document   |
   * | `PDFPage`          | Insert the existing page into this document                                    |
   *
   * For example:
   * ```js
   * // page=undefined
   * const newPage = pdfDoc.insertPage(2)
   *
   * // page=[number, number]
   * import { PageSizes } from 'pdf-lib'
   * const newPage1 = pdfDoc.insertPage(2, PageSizes.A7)
   * const newPage2 = pdfDoc.insertPage(0, PageSizes.Letter)
   * const newPage3 = pdfDoc.insertPage(198, [500, 750])
   *
   * // page=PDFPage
   * const pdfDoc1 = await PDFDocument.create()
   * const pdfDoc2 = await PDFDocument.load(...)
   * const [existingPage] = await pdfDoc1.copyPages(pdfDoc2, [0])
   * pdfDoc1.insertPage(0, existingPage)
   * ```
   *
   * @param index The index at which the page should be inserted (zero-based).
   * @param page Optionally, the desired dimensions or existing page.
   * @returns The newly created (or existing) page.
   */
  insertPage(index: number, page?: PDFPage | [number, number]): PDFPage {
    const pageCount = this.getPageCount();
    assertRange(index, 'index', 0, pageCount);
    assertIs(page, 'page', ['undefined', [PDFPage, 'PDFPage'], Array]);
    if (!page || Array.isArray(page)) {
      const dims = Array.isArray(page) ? page : PageSizes.A4;
      page = PDFPage.create(this);
      page.setSize(...dims);
    } else if (page.doc !== this) {
      throw new ForeignPageError();
    }

    const parentRef = this.catalog.insertLeafNode(page.ref, index);
    page.node.setParent(parentRef);

    this.pageMap.set(page.node, page);
    this.pageCache.invalidate();

    this.pageCount = pageCount + 1;

    return page;
  }

  /**
   * Copy pages from a source document into this document. Allows pages to be
   * copied between different [[PDFDocument]] instances. For example:
   * ```js
   * const pdfDoc = await PDFDocument.create()
   * const srcDoc = await PDFDocument.load(...)
   *
   * const copiedPages = await pdfDoc.copyPages(srcDoc, [0, 3, 89])
   * const [firstPage, fourthPage, ninetiethPage] = copiedPages;
   *
   * pdfDoc.addPage(fourthPage)
   * pdfDoc.insertPage(0, ninetiethPage)
   * pdfDoc.addPage(firstPage)
   * ```
   * @param srcDoc The document from which pages should be copied.
   * @param indices The indices of the pages that should be copied.
   * @returns Resolves with an array of pages copied into this document.
   */
  async copyPages(srcDoc: PDFDocument, indices: number[]): Promise<PDFPage[]> {
    assertIs(srcDoc, 'srcDoc', [[PDFDocument, 'PDFDocument']]);
    assertIs(indices, 'indices', [Array]);
    await srcDoc.flush();
    const copier = PDFObjectCopier.for(srcDoc.context, this.context);
    const srcPages = srcDoc.getPages();
    const copiedPages: PDFPage[] = new Array(indices.length);
    for (let idx = 0, len = indices.length; idx < len; idx++) {
      const srcPage = srcPages[indices[idx]];
      const copiedPage = copier.copy(srcPage.node);
      const ref = this.context.register(copiedPage);
      copiedPages[idx] = PDFPage.of(copiedPage, ref, this);
    }
    return copiedPages;
  }

  /**
   * Embed a font into this document. The input data can be provided in multiple
   * formats:
   *
   * | Type            | Contents                                                |
   * | --------------- | ------------------------------------------------------- |
   * | `StandardFonts` | One of the standard 14 fonts                            |
   * | `string`        | A base64 encoded string (or data URI) containing a font |
   * | `Uint8Array`    | The raw bytes of a font                                 |
   * | `ArrayBuffer`   | The raw bytes of a font                                 |
   *
   * For example:
   * ```js
   * // font=StandardFonts
   * import { StandardFonts } from 'pdf-lib'
   * const font1 = await pdfDoc.embedFont(StandardFonts.Helvetica)
   *
   * // font=string
   * const font2 = await pdfDoc.embedFont('AAEAAAAVAQAABABQRFNJRx/upe...')
   * const font3 = await pdfDoc.embedFont('data:font/opentype;base64,AAEAAA...')
   *
   * // font=Uint8Array
   * import fs from 'fs'
   * const font4 = await pdfDoc.embedFont(fs.readFileSync('Ubuntu-R.ttf'))
   *
   * // font=ArrayBuffer
   * const url = 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf'
   * const ubuntuBytes = await fetch(url).then(res => res.arrayBuffer())
   * const font5 = await pdfDoc.embedFont(ubuntuBytes)
   * ```
   * See also: [[registerFontkit]]
   * @param font The input data for a font.
   * @param options The options to be used when embedding the font.
   * @returns Resolves with the embedded font.
   */
  async embedFont(
    font: StandardFonts | string | Uint8Array | ArrayBuffer,
    options: EmbedFontOptions = {},
  ): Promise<PDFFont> {
    const { subset = false } = options;

    assertIs(font, 'font', ['string', Uint8Array, ArrayBuffer]);
    assertIs(subset, 'subset', ['boolean']);

    let embedder: CustomFontEmbedder | StandardFontEmbedder;
    if (isStandardFont(font)) {
      embedder = StandardFontEmbedder.for(font);
    } else if (canBeConvertedToUint8Array(font)) {
      const bytes = toUint8Array(font);
      const fontkit = this.assertFontkit();
      embedder = subset
        ? await CustomFontSubsetEmbedder.for(fontkit, bytes)
        : await CustomFontEmbedder.for(fontkit, bytes);
    } else {
      throw new TypeError(
        '`font` must be one of `StandardFonts | string | Uint8Array | ArrayBuffer`',
      );
    }

    const ref = this.context.nextRef();
    const pdfFont = PDFFont.of(ref, this, embedder);
    this.fonts.push(pdfFont);

    return pdfFont;
  }

  /**
   * Embed a standard font into this document.
   * For example:
   * ```js
   * import { StandardFonts } from 'pdf-lib'
   * const helveticaFont = pdfDoc.embedFont(StandardFonts.Helvetica)
   * ```
   * @param font The standard font to be embedded.
   * @returns The embedded font.
   */
  embedStandardFont(font: StandardFonts): PDFFont {
    assertIs(font, 'font', ['string']);
    if (!isStandardFont(font)) {
      throw new TypeError('`font` must be one of type `StandardFontsr`');
    }

    const embedder = StandardFontEmbedder.for(font);

    const ref = this.context.nextRef();
    const pdfFont = PDFFont.of(ref, this, embedder);
    this.fonts.push(pdfFont);

    return pdfFont;
  }

  /**
   * Embed a JPEG image into this document. The input data can be provided in
   * multiple formats:
   *
   * | Type          | Contents                                                      |
   * | ------------- | ------------------------------------------------------------- |
   * | `string`      | A base64 encoded string (or data URI) containing a JPEG image |
   * | `Uint8Array`  | The raw bytes of a JPEG image                                 |
   * | `ArrayBuffer` | The raw bytes of a JPEG image                                 |
   *
   * For example:
   * ```js
   * // jpg=string
   * const image1 = await pdfDoc.embedJpg('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD...')
   * const image2 = await pdfDoc.embedJpg('data:image/jpeg;base64,/9j/4AAQ...')
   *
   * // jpg=Uint8Array
   * import fs from 'fs'
   * const uint8Array = fs.readFileSync('cat_riding_unicorn.jpg')
   * const image3 = await pdfDoc.embedJpg(uint8Array)
   *
   * // jpg=ArrayBuffer
   * const url = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg'
   * const arrayBuffer = await fetch(url).then(res => res.arrayBuffer())
   * const image4 = await pdfDoc.embedJpg(arrayBuffer)
   * ```
   *
   * @param jpg The input data for a JPEG image.
   * @returns Resolves with the embedded image.
   */
  async embedJpg(jpg: string | Uint8Array | ArrayBuffer): Promise<PDFImage> {
    assertIs(jpg, 'jpg', ['string', Uint8Array, ArrayBuffer]);
    const bytes = toUint8Array(jpg);
    const embedder = await JpegEmbedder.for(bytes);
    const ref = this.context.nextRef();
    const pdfImage = PDFImage.of(ref, this, embedder);
    this.images.push(pdfImage);
    return pdfImage;
  }

  /**
   * Embed a PNG image into this document. The input data can be provided in
   * multiple formats:
   *
   * | Type          | Contents                                                     |
   * | ------------- | ------------------------------------------------------------ |
   * | `string`      | A base64 encoded string (or data URI) containing a PNG image |
   * | `Uint8Array`  | The raw bytes of a PNG image                                 |
   * | `ArrayBuffer` | The raw bytes of a PNG image                                 |
   *
   * For example:
   * ```js
   * // png=string
   * const image1 = await pdfDoc.embedPng('iVBORw0KGgoAAAANSUhEUgAAAlgAAAF3...')
   * const image2 = await pdfDoc.embedPng('data:image/png;base64,iVBORw0KGg...')
   *
   * // png=Uint8Array
   * import fs from 'fs'
   * const uint8Array = fs.readFileSync('small_mario.png')
   * const image3 = await pdfDoc.embedPng(uint8Array)
   *
   * // png=ArrayBuffer
   * const url = 'https://pdf-lib.js.org/assets/small_mario.png'
   * const arrayBuffer = await fetch(url).then(res => res.arrayBuffer())
   * const image4 = await pdfDoc.embedPng(arrayBuffer)
   * ```
   *
   * @param png The input data for a PNG image.
   * @returns Resolves with the embedded image.
   */
  async embedPng(png: string | Uint8Array | ArrayBuffer): Promise<PDFImage> {
    assertIs(png, 'png', ['string', Uint8Array, ArrayBuffer]);
    const bytes = toUint8Array(png);
    const embedder = await PngEmbedder.for(bytes);
    const ref = this.context.nextRef();
    const pdfImage = PDFImage.of(ref, this, embedder);
    this.images.push(pdfImage);
    return pdfImage;
  }

  /**
   * Embed one or more PDF pages into this document.
   *
   * For example:
   * ```js
   * const pdfDoc = await PDFDocument.create()
   *
   * const sourcePdfUrl = 'https://pdf-lib.js.org/assets/with_large_page_count.pdf'
   * const sourcePdf = await fetch(sourcePdfUrl).then((res) => res.arrayBuffer())
   *
   * // Embed page 74 of `sourcePdf` into `pdfDoc`
   * const [embeddedPage] = await pdfDoc.embedPdf(sourcePdf, [73])
   * ```
   *
   * See [[PDFDocument.load]] for examples of the allowed input data formats.
   *
   * @param pdf The input data containing a PDF document.
   * @param indices The indices of the pages that should be embedded.
   * @returns Resolves with an array of the embedded pages.
   */
  async embedPdf(
    pdf: string | Uint8Array | ArrayBuffer | PDFDocument,
    indices: number[] = [0],
  ): Promise<PDFEmbeddedPage[]> {
    assertIs(pdf, 'pdf', [
      'string',
      Uint8Array,
      ArrayBuffer,
      [PDFDocument, 'PDFDocument'],
    ]);
    assertIs(indices, 'indices', [Array]);

    const srcDoc =
      pdf instanceof PDFDocument ? pdf : await PDFDocument.load(pdf);

    const srcPages = pluckIndices(srcDoc.getPages(), indices);

    return this.embedPages(srcPages);
  }

  /**
   * Embed a single PDF page into this document.
   *
   * For example:
   * ```js
   * const pdfDoc = await PDFDocument.create()
   *
   * const sourcePdfUrl = 'https://pdf-lib.js.org/assets/with_large_page_count.pdf'
   * const sourceBuffer = await fetch(sourcePdfUrl).then((res) => res.arrayBuffer())
   * const sourcePdfDoc = await PDFDocument.load(sourceBuffer)
   * const sourcePdfPage = sourcePdfDoc.getPages()[73]
   *
   * const embeddedPage = await pdfDoc.embedPage(
   *   sourcePdfPage,
   *
   *   // Clip a section of the source page so that we only embed part of it
   *   { left: 100, right: 450, bottom: 330, top: 570 },
   *
   *   // Translate all drawings of the embedded page by (10, 200) units
   *   [1, 0, 0, 1, 10, 200],
   * )
   * ```
   *
   * @param page The page to be embedded.
   * @param boundingBox
   * Optionally, an area of the source page that should be embedded
   * (defaults to entire page).
   * @param transformationMatrix
   * Optionally, a transformation matrix that is always applied to the embedded
   * page anywhere it is drawn.
   * @returns Resolves with the embedded pdf page.
   */
  async embedPage(
    page: PDFPage,
    boundingBox?: PageBoundingBox,
    transformationMatrix?: TransformationMatrix,
  ): Promise<PDFEmbeddedPage> {
    assertIs(page, 'page', [[PDFPage, 'PDFPage']]);
    const [embeddedPage] = await this.embedPages(
      [page],
      [boundingBox],
      [transformationMatrix],
    );
    return embeddedPage;
  }

  /**
   * Embed one or more PDF pages into this document.
   *
   * For example:
   * ```js
   * const pdfDoc = await PDFDocument.create()
   *
   * const sourcePdfUrl = 'https://pdf-lib.js.org/assets/with_large_page_count.pdf'
   * const sourceBuffer = await fetch(sourcePdfUrl).then((res) => res.arrayBuffer())
   * const sourcePdfDoc = await PDFDocument.load(sourceBuffer)
   *
   * const page1 = sourcePdfDoc.getPages()[0]
   * const page2 = sourcePdfDoc.getPages()[52]
   * const page3 = sourcePdfDoc.getPages()[73]
   *
   * const embeddedPages = await pdfDoc.embedPages([page1, page2, page3])
   * ```
   *
   * @param page
   * The pages to be embedded (they must all share the same context).
   * @param boundingBoxes
   * Optionally, an array of clipping boundaries - one for each page
   * (defaults to entirety of each page).
   * @param transformationMatrices
   * Optionally, an array of transformation matrices - one for each page
   * (each page's transformation will apply anywhere it is drawn).
   * @returns Resolves with an array of the embedded pdf pages.
   */
  async embedPages(
    pages: PDFPage[],
    boundingBoxes: Array<PageBoundingBox | undefined> = [],
    transformationMatrices: Array<TransformationMatrix | undefined> = [],
  ) {
    if (pages.length === 0) return [];

    // Assert all pages have the same context
    for (let idx = 0, len = pages.length - 1; idx < len; idx++) {
      const currPage = pages[idx];
      const nextPage = pages[idx + 1];
      if (currPage.node.context !== nextPage.node.context) {
        throw new PageEmbeddingMismatchedContextError();
      }
    }

    const context = pages[0].node.context;
    const maybeCopyPage =
      context === this.context
        ? (p: PDFPageLeaf) => p
        : PDFObjectCopier.for(context, this.context).copy;

    const embeddedPages = new Array<PDFEmbeddedPage>(pages.length);
    for (let idx = 0, len = pages.length; idx < len; idx++) {
      const page = maybeCopyPage(pages[idx].node);
      const box = boundingBoxes[idx];
      const matrix = transformationMatrices[idx];

      const embedder = await PDFPageEmbedder.for(page, box, matrix);

      const ref = this.context.nextRef();
      embeddedPages[idx] = PDFEmbeddedPage.of(ref, this, embedder);
    }

    this.embeddedPages.push(...embeddedPages);

    return embeddedPages;
  }

  /**
   * > **NOTE:** You shouldn't need to call this method directly. The [[save]]
   * > and [[saveAsBase64]] methods will automatically ensure that all embedded
   * > assets are flushed before serializing the document.
   *
   * Flush all embedded fonts, PDF pages, and images to this document's
   * [[context]].
   *
   * @returns Resolves when the flush is complete.
   */
  async flush(): Promise<void> {
    await this.embedAll(this.fonts);
    await this.embedAll(this.images);
    await this.embedAll(this.embeddedPages);
  }

  /**
   * Serialize this document to an array of bytes making up a PDF file.
   * For example:
   * ```js
   * const pdfBytes = await pdfDoc.save()
   * ```
   *
   * There are a number of things you can do with the serialized document,
   * depending on the JavaScript environment you're running in:
   * * Write it to a file in Node or React Native
   * * Download it as a Blob in the browser
   * * Render it in an `iframe`
   *
   * @param options The options to be used when saving the document.
   * @returns Resolves with the bytes of the serialized document.
   */
  async save(options: SaveOptions = {}): Promise<Uint8Array> {
    const {
      useObjectStreams = true,
      addDefaultPage = true,
      objectsPerTick = 50,
    } = options;

    assertIs(useObjectStreams, 'useObjectStreams', ['boolean']);
    assertIs(addDefaultPage, 'addDefaultPage', ['boolean']);
    assertIs(objectsPerTick, 'objectsPerTick', ['number']);

    if (addDefaultPage && this.getPageCount() === 0) this.addPage();
    await this.flush();

    const Writer = useObjectStreams ? PDFStreamWriter : PDFWriter;
    return Writer.forContext(this.context, objectsPerTick).serializeToBuffer();
  }

  /**
   * Serialize this document to a base64 encoded string or data URI making up a
   * PDF file. For example:
   * ```js
   * const base64String = await pdfDoc.saveAsBase64()
   * base64String // => 'JVBERi0xLjcKJYGBgYEKC...'
   *
   * const base64DataUri = await pdfDoc.saveAsBase64({ dataUri: true })
   * base64DataUri // => 'data:application/pdf;base64,JVBERi0xLjcKJYGBgYEKC...'
   * ```
   *
   * @param options The options to be used when saving the document.
   * @returns Resolves with a base64 encoded string or data URI of the
   *          serialized document.
   */
  async saveAsBase64(options: Base64SaveOptions = {}): Promise<string> {
    const { dataUri = false, ...otherOptions } = options;
    assertIs(dataUri, 'dataUri', ['boolean']);
    const bytes = await this.save(otherOptions);
    const base64 = encodeToBase64(bytes);
    return dataUri ? `data:application/pdf;base64,${base64}` : base64;
  }

  private async embedAll(embeddables: Embeddable[]): Promise<void> {
    for (let idx = 0, len = embeddables.length; idx < len; idx++) {
      await embeddables[idx].embed();
    }
  }

  private updateInfoDict(): void {
    const pdfLib = `pdf-lib (https://github.com/Hopding/pdf-lib)`;
    const now = new Date();

    const info = this.getInfoDict();

    this.setProducer(pdfLib);
    this.setModificationDate(now);

    if (!info.get(PDFName.of('Creator'))) this.setCreator(pdfLib);
    if (!info.get(PDFName.of('CreationDate'))) this.setCreationDate(now);
  }

  private getInfoDict(): PDFDict {
    const existingInfo = this.context.lookup(this.context.trailerInfo.Info);
    if (existingInfo instanceof PDFDict) return existingInfo;

    const newInfo = this.context.obj({});
    this.context.trailerInfo.Info = this.context.register(newInfo);

    return newInfo;
  }

  private assertFontkit(): Fontkit {
    if (!this.fontkit) throw new FontkitNotRegisteredError();
    return this.fontkit;
  }

  private computePages = (): PDFPage[] => {
    const pages: PDFPage[] = [];
    this.catalog.Pages().traverse((node, ref) => {
      if (node instanceof PDFPageLeaf) {
        let page = this.pageMap.get(node);
        if (!page) {
          page = PDFPage.of(node, ref, this);
          this.pageMap.set(node, page);
        }
        pages.push(page);
      }
    });
    return pages;
  };
}
