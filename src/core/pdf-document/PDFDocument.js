/* @flow */
import _ from 'lodash';

import {
  PDFIndirectReference,
  PDFObject,
  PDFDictionary,
  PDFRawStream,
} from 'core/pdf-objects';
import {
  PDFCatalog,
  PDFHeader,
  PDFPage,
  PDFPageTree,
} from 'core/pdf-structures';
import PNGXObjectFactory from 'core/pdf-structures/factories/PNGXObjectFactory';
import JPEGXObjectFactory from 'core/pdf-structures/factories/JPEGXObjectFactory';
import PDFFontFactory from 'core/pdf-structures/factories/PDFFontFactory';
import { validate, isInstance } from 'utils/validate';

import type { FontFlagOptions } from 'core/pdf-structures/factories/PDFFontFactory';

class PDFDocument {
  header: PDFHeader = PDFHeader.forVersion(1, 7);
  catalog: PDFCatalog;
  index: Map<PDFIndirectReference<*>, PDFObject>;
  maxObjNum: number = 0;

  constructor(index: Map<PDFIndirectReference<*>, PDFObject>) {
    validate(
      index,
      isInstance(Map),
      'index must be a Map<PDFIndirectReference, PDFObject>',
    );
    index.forEach((obj, ref) => {
      if (obj.is(PDFCatalog)) this.catalog = obj;
      if (ref.objectNumber > this.maxObjNum) this.maxObjNum = ref.objectNumber;
    });
    this.index = index;
  }

  static fromIndex = (index: Map<PDFIndirectReference<*>, PDFObject>) =>
    new PDFDocument(index);

  lookup = (ref: PDFIndirectReference<*> | PDFObject) =>
    ref.is(PDFIndirectReference) ? this.index.get(ref) : ref;

  register = <T: PDFObject>(object: T): PDFIndirectReference<T> => {
    validate(object, isInstance(PDFObject), 'object must be a PDFObject');
    this.maxObjNum += 1;
    const ref = PDFIndirectReference.forNumbers(this.maxObjNum, 0);
    this.index.set(ref, object);
    return ref;
  };

  getPages = (): PDFPage[] => {
    const pageTree = this.catalog.getPageTree(this.lookup);
    const pages = [];
    pageTree.traverse(this.lookup, kid => {
      if (kid.is(PDFPage)) pages.push(kid);
    });
    return Object.freeze(pages);
  };

  addPage = (page: PDFPage) => {
    validate(page, isInstance(PDFPage), 'page must be a PDFPage');
    const pageTree = this.catalog.getPageTree(this.lookup);

    let lastPageTree = pageTree;
    let lastPageTreeRef = this.catalog.get('Pages');
    pageTree.traverseRight(this.lookup, (kid, ref) => {
      if (kid.is(PDFPageTree)) {
        lastPageTree = kid;
        lastPageTreeRef = ref;
      }
    });

    page.set('Parent', lastPageTreeRef);
    lastPageTree.addPage(this.lookup, this.register(page));
    return this;
  };

  // TODO: Clean up unused objects when possible after removing page from tree
  // TODO: Make sure "idx" is within required range
  removePage = (idx: number) => {
    validate(idx, _.isNumber, 'idx must be a number');
    const pageTreeRef = this.catalog.get('Pages');
    const pageTree = this.catalog.getPageTree(this.lookup);

    // TODO: Use a "stop" callback to avoid unneccesarily traversing whole page tree...
    let treeRef = pageTreeRef;
    let pageCount = 0;
    let kidNum = 0;
    pageTree.traverse(this.lookup, (kid, ref) => {
      if (pageCount !== idx) {
        if (kid.is(PDFPageTree)) kidNum = 0;
        if (kid.is(PDFPage)) {
          pageCount += 1;
          kidNum += 1;
          if (pageCount === idx) treeRef = kid.get('Parent');
        }
      }
    });

    const tree: PDFPageTree = this.lookup(treeRef);
    tree.removePage(this.lookup, kidNum);
    return this;
  };

  // TODO: Make sure "idx" is within required range
  insertPage = (idx: number, page: PDFPage) => {
    validate(idx, _.isNumber, 'idx must be a number');
    validate(page, isInstance(PDFPage), 'page must be a PDFPage');
    const pageTreeRef = this.catalog.get('Pages');
    const pageTree = this.catalog.getPageTree(this.lookup);

    // TODO: Use a "stop" callback to avoid unneccesarily traversing whole page tree...
    let treeRef = pageTreeRef;
    let pageCount = 0;
    let kidNum = 0;
    pageTree.traverse(this.lookup, (kid, ref) => {
      if (pageCount !== idx) {
        if (kid.is(PDFPageTree)) kidNum = 0;
        if (kid.is(PDFPage)) {
          pageCount += 1;
          kidNum += 1;
          if (pageCount === idx) treeRef = kid.get('Parent');
        }
      }
    });

    page.set('Parent', treeRef);
    const tree: PDFPageTree = this.lookup(treeRef);
    tree.insertPage(this.lookup, kidNum, this.register(page));
    return this;
  };

  embedFont = (
    name: string,
    fontData: Uint8Array,
    flagOptions: FontFlagOptions,
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
