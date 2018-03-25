import _ from 'lodash';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFDictionary,
  PDFIndirectReference,
  PDFObject,
  PDFRawStream,
} from 'core/pdf-objects';
import {
  PDFCatalog,
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
import { isInstance, validate } from 'utils/validate';

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

  embedFont = (
    name: string,
    fontData: Uint8Array,
    flagOptions: IFontFlagOptions,
  ): PDFIndirectReference<PDFDictionary> => {
    const fontFactory = PDFFontFactory.for(name, fontData, flagOptions);
    return fontFactory.embedFontIn(this);
  };

  addPNG = (imageData: Uint8Array): PDFIndirectReference<PDFRawStream> => {
    const pngFactory = PNGXObjectFactory.for(imageData);
    return pngFactory.embedImageIn(this);
  };

  addJPG = (imageData: Uint8Array): PDFIndirectReference<PDFRawStream> => {
    const jpgFactory = JPEGXObjectFactory.for(imageData);
    return jpgFactory.embedImageIn(this);
  };
}

export default PDFDocument;
