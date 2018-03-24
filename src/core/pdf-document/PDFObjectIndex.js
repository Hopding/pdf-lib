/* @flow */
import { PDFObject, PDFIndirectReference } from 'core/pdf-objects';
import { error } from 'utils';
import { validate, isInstance } from 'utils/validate';

// export type PDFObjectLookup = (
// PDFIndirectReference<*> | PDFObject,
// ) => PDFObject;

export type PDFObjectLookup = (
  PDFIndirectReference<*> | PDFObject | void,
) => PDFObject | null | undefined;

// export type PDFObjectLookup = <T>(
// PDFIndirectReference<*> | PDFObject | void,
// type: Class<T>,
// ) => T;

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

  // lookup = (ref: PDFIndirectReference<*> | PDFObject): PDFObject =>
  //   ref instanceof PDFIndirectReference
  //     ? this.index.get(ref) || error(`Failed to lookup ref: ${ref.toString()}`)
  //     : ref;

  lookup = (ref: PDFIndirectReference<*> | PDFObject | void) => {
    if (!ref) return null;
    return ref instanceof PDFIndirectReference
      ? this.index.get(ref) || error(`Failed to lookup ref: ${ref.toString()}`)
      : ref;
  };
}

export default PDFObjectIndex;
