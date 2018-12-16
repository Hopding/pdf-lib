import { PDFIndirectReference, PDFObject } from 'core/pdf-objects';
import { PDFContentStream } from 'core/pdf-structures';
import { error } from 'utils';
import { isInstance, validate } from 'utils/validate';

class PDFObjectIndex {
  static create = () => new PDFObjectIndex();

  index: Map<PDFIndirectReference, PDFObject> = new Map();

  /*
   * Reference to PDFContentStream that contains a single PDFOperator: `q`.
   * Used by [[PDFPage]] instances to ensure that when content streams are
   * added to a modified PDF, they start in the default, unchanged graphics
   * state.
   */
  /** @hidden */
  pushGraphicsStateContentStream?: PDFIndirectReference<PDFContentStream>;

  /*
   * Reference to PDFContentStream that contains a single PDFOperator: `Q`.
   * Used by [[PDFPage]] instances to ensure that when content streams are
   * added to a modified PDF, they start in the default, unchanged graphics
   * state.
   */
  /** @hidden */
  popGraphicsStateContentStream?: PDFIndirectReference<PDFContentStream>;

  highestObjectNumber: number = -1;

  assign = (key: PDFIndirectReference, val: PDFObject) => {
    validate(
      key,
      isInstance(PDFIndirectReference),
      '"key" must be a PDFIndirectReference',
    );
    validate(val, isInstance(PDFObject), '"val" must be a PDFObject');
    if (key.objectNumber > this.highestObjectNumber) {
      this.highestObjectNumber = key.objectNumber;
    }
    this.index.set(key, val);
    return this;
  };

  nextObjectNumber = () => {
    this.highestObjectNumber += 1;
    const ref = PDFIndirectReference.forNumbers(this.highestObjectNumber, 0);
    return ref;
  };

  assignNextObjectNumberTo = (val: PDFObject) => {
    const ref = this.nextObjectNumber();
    this.assign(ref, val);
    return ref;
  };

  lookupMaybe = <T extends PDFObject = PDFObject>(
    ref: PDFIndirectReference | PDFObject | void,
  ): T | void => {
    if (ref instanceof PDFIndirectReference) return this.index.get(ref) as T;
    return ref as T;
  };

  lookup = <T extends PDFObject = PDFObject>(
    ref: PDFIndirectReference | PDFObject,
  ): T => {
    return this.lookupMaybe<T>(ref) || error(`Failed to lookup ref: ${ref}`);
  };
}

export default PDFObjectIndex;
