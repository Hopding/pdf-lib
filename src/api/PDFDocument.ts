import {
  EncryptedPDFError,
  FontkitNotRegisteredError,
  ForeignPageError,
  RemovePageFromEmptyDocumentError,
} from 'src/api/errors';
import PDFFont from 'src/api/PDFFont';
import PDFImage from 'src/api/PDFImage';
import PDFPage from 'src/api/PDFPage';
import { PageSizes } from 'src/api/sizes';
import { StandardFonts } from 'src/api/StandardFonts';
import {
  CustomFontEmbedder,
  CustomFontSubsetEmbedder,
  JpegEmbedder,
  PDFCatalog,
  PDFContext,
  PDFObjectCopier,
  PDFPageLeaf,
  PDFPageTree,
  PDFParser,
  PDFStreamWriter,
  PDFWriter,
  PngEmbedder,
  StandardFontEmbedder,
} from 'src/core';
import { Fontkit } from 'src/types/fontkit';
import {
  assertIs,
  assertRange,
  Cache,
  canBeConvertedToUint8Array,
  encodeToBase64,
  isStandardFont,
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
   * import fs from 'fs'
   *
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
   * const url = 'https://pdf-lib.js.org/assets/with_update_sections.pdf'
   * const arrayBuffer = await fetch(url).then(res => res.arrayBuffer())
   *
   * const uint8Array = fs.readFileSync('with_update_sections.pdf')
   *
   * const pdfDoc1 = await PDFDocument.load(base64)
   * const pdfDoc2 = await PDFDocument.load(dataUri)
   * const pdfDoc3 = await PDFDocument.load(arrayBuffer)
   * const pdfDoc4 = await PDFDocument.load(uint8Array)
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
    const { ignoreEncryption = false, parseSpeed = ParseSpeeds.Slow } = options;

    assertIs(pdf, 'pdf', ['string', Uint8Array, ArrayBuffer]);
    assertIs(ignoreEncryption, 'ignoreEncryption', ['boolean']);
    assertIs(parseSpeed, 'parseSpeed', ['number']);

    const bytes = toUint8Array(pdf);
    const context = await PDFParser.forBytesWithOptions(
      bytes,
      parseSpeed,
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

  private fontkit?: Fontkit;
  private pageCount: number;
  private readonly pageCache: Cache<PDFPage[]>;
  private readonly pageMap: Map<PDFPageLeaf, PDFPage>;
  private readonly fonts: PDFFont[];
  private readonly images: PDFImage[];

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

    this.pageCount = this.getPageCount();

    if (!ignoreEncryption && this.isEncrypted) throw new EncryptedPDFError();
  }

  /**
   * Register a fontkit instance. This must be done before custom fonts can
   * be embedded. See [here](https://github.com/Hopding/pdf-lib/tree/Rewrite#fontkit-installation)
   * for instructions on how to install and register a fontkit instance.
   * @param fontkit The fontkit instance to be registered.
   */
  registerFontkit(fontkit: Fontkit): void {
    this.fontkit = fontkit;
  }

  /**
   * Get the number of pages contained in this document. For example:
   * ```js
   * const totalPages = pdfDoc.getPageCount();
   * ```
   * @returns The number of pages in this document.
   */
  getPageCount(): number {
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
    const pageCount = this.getPages().length;
    if (pageCount === 0) throw new RemovePageFromEmptyDocumentError();
    assertRange(index, 'index', 0, pageCount - 1);
    this.catalog.removeLeafNode(index);
    this.pageCount -= 1;
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
    const pages = this.getPages();
    this.pageCount += 1;
    return this.insertPage(pages.length, page);
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
    assertRange(index, 'index', 0, this.pageCount - 1);
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

    this.pageCount += 1;

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
   *
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

  async embedJpg(jpg: string | Uint8Array | ArrayBuffer): Promise<PDFImage> {
    assertIs(jpg, 'jpg', ['string', Uint8Array, ArrayBuffer]);
    const bytes = toUint8Array(jpg);
    const embedder = await JpegEmbedder.for(bytes);
    const ref = this.context.nextRef();
    const pdfImage = PDFImage.of(ref, this, embedder);
    this.images.push(pdfImage);
    return pdfImage;
  }

  async embedPng(png: string | Uint8Array | ArrayBuffer): Promise<PDFImage> {
    assertIs(png, 'png', ['string', Uint8Array, ArrayBuffer]);
    const bytes = toUint8Array(png);
    const embedder = await PngEmbedder.for(bytes);
    const ref = this.context.nextRef();
    const pdfImage = PDFImage.of(ref, this, embedder);
    this.images.push(pdfImage);
    return pdfImage;
  }

  async flush(): Promise<void> {
    // Embed fonts
    for (let idx = 0, len = this.fonts.length; idx < len; idx++) {
      const font = this.fonts[idx];
      await font.embed();
    }

    // Embed images
    for (let idx = 0, len = this.images.length; idx < len; idx++) {
      const image = this.images[idx];
      await image.embed();
    }
  }

  async save(options: SaveOptions = {}): Promise<Uint8Array> {
    const {
      useObjectStreams = true,
      addDefaultPage = true,
      objectsPerTick = 50,
    } = options;

    assertIs(useObjectStreams, 'useObjectStreams', ['boolean']);
    assertIs(addDefaultPage, 'addDefaultPage', ['boolean']);
    assertIs(objectsPerTick, 'objectsPerTick', ['number']);

    if (addDefaultPage && this.getPages().length === 0) this.addPage();
    await this.flush();

    const Writer = useObjectStreams ? PDFStreamWriter : PDFWriter;
    return Writer.forContext(this.context, objectsPerTick).serializeToBuffer();
  }

  async saveAsBase64(options: Base64SaveOptions = {}): Promise<string> {
    const { dataUri = false, ...otherOptions } = options;
    assertIs(dataUri, 'dataUri', ['boolean']);
    const bytes = await this.save(otherOptions);
    const base64 = encodeToBase64(bytes);
    return dataUri ? `data:application/pdf;base64,${base64}` : base64;
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
