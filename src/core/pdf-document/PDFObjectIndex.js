/* @flow */
import { PDFObject, PDFIndirectReference } from 'core/pdf-objects';
import { validate, isInstance } from 'utils/validate';

export type PDFObjectLookup = (
  PDFIndirectReference<*> | PDFObject,
) => ?PDFObject;

class PDFObjectIndex {
  index: Map<PDFIndirectReference<*>, PDFObject> = new Map();

  static create = () => new PDFObjectIndex();

  set = (key: PDFIndirectReference<*>, val: PDFObject) => {
    validate(
      key,
      isInstance(PDFIndirectReference),
      '"key" must be a PDFIndirectReference',
    );
    validate(val, isInstance(PDFObject), '"val" must be a PDFObject');
    this.index.set(key, val);
    return this;
  };

  lookup = (ref: PDFIndirectReference<*> | PDFObject): ?PDFObject =>
    ref instanceof PDFIndirectReference ? this.index.get(ref) : ref;
}

export default PDFObjectIndex;
