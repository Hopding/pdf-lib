import PDFFont from 'src/api/PDFFont';
import PDFPage from 'src/api/PDFPage';
import {
  CustomFontSubsetEmbedder,
  PDFCatalog,
  PDFContext,
  PDFObjectCopier,
  PDFPageLeaf,
  PDFPageTree,
  PDFParser,
  StandardFontEmbedder,
  StandardFonts,
  JpegEmbedder,
  PngEmbedder,
  PDFWriter,
  PDFStreamWriter,
} from 'src/core';
import { Cache } from 'src/utils';
import PDFImage from 'src/api/PDFImage';

class PDFDocument {
  static load = (bytes: Uint8Array) => {
    const context = PDFParser.forBytes(bytes).parseDocument();
    return new PDFDocument(context);
  };

  static create = () => {
    const context = PDFContext.create();
    const pageTree = PDFPageTree.withContext(context);
    const pageTreeRef = context.register(pageTree);
    const catalog = PDFCatalog.withContextAndPages(context, pageTreeRef);
    context.trailerInfo.Root = context.register(catalog);
    return new PDFDocument(context);
  };

  readonly context: PDFContext;
  readonly catalog: PDFCatalog;

  private readonly pageCache: Cache<PDFPage[]>;
  private readonly pageMap: Map<PDFPageLeaf, PDFPage>;
  private readonly fonts: PDFFont[];
  private readonly images: PDFImage[];

  private constructor(context: PDFContext) {
    this.context = context;
    this.catalog = context.lookup(context.trailerInfo.Root) as PDFCatalog;

    this.pageCache = Cache.populatedBy(this.computePages);
    this.pageMap = new Map();
    this.fonts = [];
    this.images = [];
  }

  getPages(): PDFPage[] {
    return this.pageCache.access();
  }

  removePage(index: number): void {
    this.catalog.removeLeafNode(index);
  }

  addPage(page?: PDFPage): PDFPage {
    const pages = this.getPages();
    return this.insertPage(pages.length, page);
  }

  insertPage(index: number, page?: PDFPage): PDFPage {
    if (!page) {
      page = PDFPage.create(this);
    } else if (page.doc !== this) {
      const copier = PDFObjectCopier.for(page.doc.context, this.context);
      const copiedPage = copier.copy(page.node);
      const ref = this.context.register(copiedPage);
      page = PDFPage.of(copiedPage, ref, this);
    }

    const parentRef = this.catalog.insertLeafNode(page.ref, index);
    page.node.setParent(parentRef);

    this.pageMap.set(page.node, page);
    this.pageCache.invalidate();

    return page;
  }

  embedFont(font: StandardFonts | Uint8Array): PDFFont {
    const embedder =
      font instanceof Uint8Array
        ? CustomFontSubsetEmbedder.for(font)
        : StandardFontEmbedder.for(font);

    const ref = this.context.nextRef();
    const pdfFont = PDFFont.of(ref, this, embedder);
    this.fonts.push(pdfFont);

    return pdfFont;
  }

  embedJpg(jpg: Uint8Array): PDFImage {
    const embedder = JpegEmbedder.for(jpg);
    const ref = this.context.nextRef();
    const pdfImage = PDFImage.of(ref, this, embedder);
    this.images.push(pdfImage);
    return pdfImage;
  }

  embedPng(png: Uint8Array): PDFImage {
    const embedder = PngEmbedder.for(png);
    const ref = this.context.nextRef();
    const pdfImage = PDFImage.of(ref, this, embedder);
    this.images.push(pdfImage);
    return pdfImage;
  }

  async save(
    options: { useObjectStreams?: boolean } = {},
  ): Promise<Uint8Array> {
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

    const Writer = options.useObjectStreams ? PDFStreamWriter : PDFWriter;
    return Writer.forContext(this.context).serializeToBuffer();
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
