/* @flow */
import { PDFObject, PDFIndirectReference } from 'core/pdf-objects';
import { error } from 'utils';
import { validate, isInstance } from 'utils/validate';

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

  lookup = (ref: PDFIndirectReference<*> | PDFObject): PDFObject => {
    if (ref instanceof PDFIndirectReference) {
      return (
        this.index.get(ref) || error(`Failed to lookup ref: ${String(ref)}`)
      );
    }
    return ref;
  };
}

export default PDFObjectIndex;
