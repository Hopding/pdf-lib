import { PDFIndirectReference, PDFObject } from 'core/pdf-objects';
import { error } from 'utils';
import { isInstance, validate } from 'utils/validate';

class PDFObjectIndex {
  static create = () => new PDFObjectIndex();

  index: Map<PDFIndirectReference, PDFObject> = new Map();

  set = (key: PDFIndirectReference, val: PDFObject) => {
    validate(
      key,
      isInstance(PDFIndirectReference),
      '"key" must be a PDFIndirectReference',
    );
    validate(val, isInstance(PDFObject), '"val" must be a PDFObject');
    this.index.set(key, val);
    return this;
  };

  lookupMaybe = (
    ref: PDFIndirectReference | PDFObject | void,
  ): PDFObject | void => {
    if (ref instanceof PDFIndirectReference) return this.index.get(ref);
    return ref;
  };

  lookup = (ref: PDFIndirectReference | PDFObject): PDFObject => {
    return this.lookupMaybe(ref) || error(`Failed to lookup ref: ${ref}}`);
  };
}

export default PDFObjectIndex;
