/* @flow */
import _ from 'lodash';
import { PDFIndirectReference, PDFObject } from '../pdf-objects';
import { XRef, PDFTrailer } from '../pdf-structures';
import PDFCrossReferenceParser from '../pdf-parser/PDFCrossReferenceParser';

import parseIndirectObj from '../pdf-parser/parseIndirectObj';
import { error } from '../../utils';
import { validate, isInstance } from '../../utils/validate';

class PDFObjectIndex {
  cache: Map<PDFIndirectReference, PDFObject> = new Map();
  index: Map<PDFIndirectReference, number> = new Map();
  pdfBytes: Uint8Array;
  trailer: PDFTrailer;

  constructor(pdfBytes: Uint8Array) {
    validate(pdfBytes, isInstance(Uint8Array), 'pdfBytes must be a Uint8Array');
    this.pdfBytes = pdfBytes;

    const parser = new PDFCrossReferenceParser();
    const parsedObjects: [XRef.Table, PDFTrailer][] = parser.parse(pdfBytes);
    this.trailer = _.last(_.last(parsedObjects));

    _(parsedObjects)
      .map(_.first)
      .flatMap(t => t.activeObjectOffsets)
      .forEach(([ref, offset]) => {
        this.index.set(ref, offset);
      });
  }

  static for = (pdfBytes: Uint8Array) => new PDFObjectIndex(pdfBytes);

  resolve = (offset: number): PDFObject => {
    validate(offset, _.isNumber, 'offset must be a number');

    const [indirectObj] =
      parseIndirectObj(this.pdfBytes.subarray(offset)) ||
      error(`Failed to parse indirect object at offset ${offset}`);

    this.cache.set(indirectObj.getReference(), indirectObj.pdfObject);
    return indirectObj.pdfObject;
  };

  lookup = (ref: PDFIndirectReference): PDFObject => {
    validate(
      ref,
      isInstance(PDFIndirectReference),
      'ref must be a PDFIndirectReference',
    );
    return this.cache.get(ref) || this.resolve(this.index.get(ref));
  };
}

export default PDFObjectIndex;
