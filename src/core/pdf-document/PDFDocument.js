/* @flow */
import _ from 'lodash';
import {
  PDFDictionary,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFObject,
  PDFNumber,
} from '../pdf-objects';
import {
  PDFCatalog,
  PDFHeader,
  PDFPage,
  PDFXRef,
  PDFTrailer,
  PDFPageTree,
} from '../pdf-structures';
import { error, validate, isInstance, isIdentity } from '../../utils/validate';

class PDFDocument {
  header: PDFHeader = PDFHeader.forVersion(1, 7);
  catalog: PDFCatalog;
  index: Map<PDFIndirectReference, PDFObject>;
  maxObjNum: number = 0;

  constructor(index: Map<PDFIndirectReference, PDFObject>) {
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

  lookup = (ref: PDFIndirectReference<*>) => this.index.get(ref);

  register = <T: PDFObject>(object: T): PDFIndirectReference<T> => {
    validate(object, isInstance(PDFObject), 'object must be a PDFObject');
    this.maxObjNum += 1;
    const ref = PDFIndirectReference.forNumbers(this.maxObjNum, 0);
    this.index.set(ref, object);
    return ref;
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
}

export default PDFDocument;
