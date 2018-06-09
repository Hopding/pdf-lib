import _ from 'lodash';

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
import PDFFontFactory, {
  IFontFlagOptions,
} from 'core/pdf-structures/factories/PDFFontFactory';
import PNGXObjectFactory from 'core/pdf-structures/factories/PNGXObjectFactory';
import { error } from 'utils';
import { isInstance, oneOf, validate } from 'utils/validate';

class PDFDocument {
  static fromIndex = (index: PDFObjectIndex) => new PDFDocument(index);

  header: PDFHeader = PDFHeader.forVersion(1, 7);
  catalog: PDFCatalog;
  index: PDFObjectIndex;
  maxObjNum: number = 0;

  constructor(index: PDFObjectIndex) {
    validate(
      index,
      isInstance(PDFObjectIndex),
      '"index" must be a PDFObjectIndex object',
    );
    index.index.forEach((obj, ref) => {
      if (obj instanceof PDFCatalog) this.catalog = obj;
      if (ref.objectNumber > this.maxObjNum) this.maxObjNum = ref.objectNumber;
    });
    this.index = index;
    if (!this.catalog) error('"index" does not contain a PDFCatalog object');
  }

  register = <T extends PDFObject>(object: T): PDFIndirectReference<T> => {
    validate(object, isInstance(PDFObject), 'object must be a PDFObject');
    this.maxObjNum += 1;
    const ref = PDFIndirectReference.forNumbers(this.maxObjNum, 0);
    this.index.set(ref, object);
    return ref;
  };

  getPages = (): PDFPage[] => {
    const pages = [] as PDFPage[];
    this.catalog.Pages.traverse((kid) => {
      if (kid instanceof PDFPage) pages.push(kid);
    });
    return pages;
  };

  createPage = (size: [number, number], resources?: PDFDictionary): PDFPage =>
    PDFPage.create(this.index, size, resources);

  createContentStream = (...operators: PDFOperator[]) =>
    PDFContentStream.of(PDFDictionary.from({}, this.index), ...operators);

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
  removePage = (idx: number) => {
    validate(idx, _.isNumber, 'idx must be a number');
    const pageTreeRef = this.catalog.get('Pages');

    // TODO: Use a "stop" callback to avoid unneccesarily traversing whole page tree...
    let treeRef = pageTreeRef;
    let pageCount = 0;
    let kidNum = 0;
    this.catalog.Pages.traverse((kid, ref) => {
      if (pageCount !== idx) {
        if (kid instanceof PDFPageTree) kidNum = 0;
        if (kid instanceof PDFPage) {
          pageCount += 1;
          kidNum += 1;
          if (pageCount === idx) treeRef = kid.get('Parent');
        }
      }
    });

    const tree = this.index.lookup(treeRef) as PDFPageTree;
    tree.removePage(kidNum);
    return this;
  };

  // TODO: Make sure "idx" is within required range
  insertPage = (idx: number, page: PDFPage) => {
    validate(idx, _.isNumber, 'idx must be a number');
    validate(page, isInstance(PDFPage), 'page must be a PDFPage');
    const pageTreeRef = this.catalog.get('Pages');

    // TODO: Use a "stop" callback to avoid unneccesarily traversing whole page tree...
    let treeRef = pageTreeRef;
    let pageCount = 0;
    let kidNum = 0;
    this.catalog.Pages.traverse((kid, ref) => {
      if (pageCount !== idx) {
        if (kid instanceof PDFPageTree) kidNum = 0;
        if (kid instanceof PDFPage) {
          pageCount += 1;
          kidNum += 1;
          if (pageCount === idx) treeRef = kid.get('Parent');
        }
      }
    });

    page.set('Parent', treeRef);
    const tree = this.index.lookup(treeRef) as PDFPageTree;
    tree.insertPage(kidNum, this.register(page));
    return this;
  };

  embedStandardFont = (
    fontName: IStandard14FontsUnion,
  ): [PDFIndirectReference<PDFDictionary>] => {
    validate(
      fontName,
      oneOf(...Standard14Fonts),
      'PDFDocument.embedStandardFont: "fontName" must be one of the Standard 14 Fonts: ' +
        _.values(Standard14Fonts).join(', '),
    );

    /*
      TODO:
      A Type 1 font dictionary may contain the entries listed in Table 111.
      Some entries are optional for the standard 14 fonts listed under 9.6.2.2,
        "Standard Type 1 Fonts (Standard 14 Fonts)", but are required otherwise.

      NOTE: For compliance sake, these standard 14 font dictionaries need to be
            updated to include the following entries:
              • FirstChar
              • LastChar
              • Widths
              • FontDescriptor
            See "Table 111 – Entries in a Type 1 font dictionary (continued)"
            for details on this...
    */
    return [
      this.register(
        PDFDictionary.from(
          {
            Type: PDFName.from('Font'),
            Subtype: PDFName.from('Type1'),
            BaseFont: PDFName.from(fontName),
          },
          this.index,
        ),
      ),
    ];
  };

  embedFont = (
    fontData: Uint8Array,
    fontFlags: IFontFlagOptions = { Nonsymbolic: true },
  ): [PDFIndirectReference<PDFDictionary>, PDFFontFactory] => {
    const fontFactory = PDFFontFactory.for(fontData, fontFlags);
    return [fontFactory.embedFontIn(this), fontFactory];
  };

  embedPNG = (
    imageData: Uint8Array,
  ): [PDFIndirectReference<PDFRawStream>, PNGXObjectFactory] => {
    const pngFactory = PNGXObjectFactory.for(imageData);
    return [pngFactory.embedImageIn(this), pngFactory];
  };

  embedJPG = (
    imageData: Uint8Array,
  ): [PDFIndirectReference<PDFRawStream>, JPEGXObjectFactory] => {
    const jpgFactory = JPEGXObjectFactory.for(imageData);
    return [jpgFactory.embedImageIn(this), jpgFactory];
  };
}

export default PDFDocument;
