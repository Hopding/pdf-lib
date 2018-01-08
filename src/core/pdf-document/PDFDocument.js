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

  static fromIndex = (index: Map<PDFIndirectReference, PDFObject>) =>
    new PDFDocument(index);

  register = (object: PDFObject): PDFIndirectReference => {
    this.maxObjNum += 1;
    const ref = PDFIndirectReference.forNumbers(this.maxObjNum, 0);
    this.index.set(ref, object);
    return ref;
  };
}

export default PDFDocument;
