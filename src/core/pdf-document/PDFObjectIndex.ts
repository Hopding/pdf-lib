import { PDFIndirectReference, PDFObject } from 'core/pdf-objects';
import { error } from 'utils';
import { isInstance, validate } from 'utils/validate';

class PDFObjectIndex {
  public static create = () => new PDFObjectIndex();

  public index: Map<PDFIndirectReference, PDFObject> = new Map();

  public set = (key: PDFIndirectReference, val: PDFObject) => {
    validate(
      key,
      isInstance(PDFIndirectReference),
      '"key" must be a PDFIndirectReference',
    );
    validate(val, isInstance(PDFObject), '"val" must be a PDFObject');
    this.index.set(key, val);
    return this;
  }

  public lookupMaybe = (
    ref: PDFIndirectReference | PDFObject | void,
  ): PDFObject | void => {
    if (ref instanceof PDFIndirectReference) return this.index.get(ref);
    return ref;
  }

  public lookup = (ref: PDFIndirectReference | PDFObject): PDFObject => {
    return this.lookupMaybe(ref) || error(`Failed to lookup ref: ${ref}}`);
  }
}

export default PDFObjectIndex;
