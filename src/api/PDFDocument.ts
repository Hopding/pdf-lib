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
  StandardFonts,
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

class PDFDocument {
  static async load(
    pdf: string | Uint8Array | ArrayBuffer,
    options: {
      ignoreEncryption?: boolean;
      parseSpeed?: ParseSpeeds | number;
    } = {},
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

  static async create() {
    const context = PDFContext.create();
    const pageTree = PDFPageTree.withContext(context);
    const pageTreeRef = context.register(pageTree);
    const catalog = PDFCatalog.withContextAndPages(context, pageTreeRef);
    context.trailerInfo.Root = context.register(catalog);
    return new PDFDocument(context, false);
  }

  readonly context: PDFContext;
  readonly catalog: PDFCatalog;
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

  registerFontkit(fontkit: Fontkit): void {
    this.fontkit = fontkit;
  }

  getPageCount(): number {
    return this.pageCount;
  }

  getPages(): PDFPage[] {
    return this.pageCache.access();
  }

  getPageIndices(): number[] {
    return range(0, this.getPages().length);
  }

  removePage(index: number): void {
    const pageCount = this.getPages().length;
    if (pageCount === 0) throw new RemovePageFromEmptyDocumentError();
    assertRange(index, 'index', 0, pageCount - 1);
    this.catalog.removeLeafNode(index);
    this.pageCount -= 1;
  }

  addPage(page?: PDFPage | [number, number]): PDFPage {
    assertIs(page, 'page', ['undefined', [PDFPage, 'PDFPage'], Array]);
    const pages = this.getPages();
    this.pageCount += 1;
    return this.insertPage(pages.length, page);
  }

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

  async embedFont(
    font: StandardFonts | string | Uint8Array | ArrayBuffer,
    options: { subset?: boolean } = {},
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

export default PDFDocument;
