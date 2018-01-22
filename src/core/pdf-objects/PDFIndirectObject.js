/* @flow */
import _ from 'lodash';

import { addStringToBuffer, arrayToString } from 'utils';
import { validate, isInstance } from 'utils/validate';

import PDFObject from './PDFObject';
import PDFIndirectReference from './PDFIndirectReference';

// 55 errors
class PDFIndirectObject<T: $Subtype<PDFObject> = PDFObject> extends PDFObject {
  reference: PDFIndirectReference<T>;
  pdfObject: T;

  constructor(pdfObject: $Subtype<PDFObject>) {
    super();
    validate(
      pdfObject,
      isInstance(PDFObject),
      'PDFIndirectObject.pdfObject must be of type PDFObject',
    );
    this.pdfObject = pdfObject;
  }

  static of = <A: $Subtype<PDFObject>>(pdfObject: A): PDFIndirectObject<A> =>
    new PDFIndirectObject(pdfObject);

  setReferenceNumbers = (objectNumber: number, generationNumber: number) => {
    validate(objectNumber, _.isNumber, 'objectNumber must be a Number');
    validate(generationNumber, _.isNumber, 'generationNumber must be a Number');

    this.reference = PDFIndirectReference.forNumbers(
      objectNumber,
      generationNumber,
    );
    return this;
  };

  setReference = (reference: PDFIndirectReference<T>) => {
    this.reference = reference;
    return this;
  };

  getReference = () => this.reference;
  toReference = () => this.reference.toString();

  toString = (): string => {
    const buffer = new Uint8Array(this.bytesSize());
    this.copyBytesInto(buffer);
    return arrayToString(buffer);
  };

  bytesSize = () =>
    `${this.reference.objectNumber} ${this.reference.generationNumber} obj\n`
      .length +
    this.pdfObject.bytesSize() +
    9; // "\nendobj\n\n"

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer(
      `${this.reference.objectNumber} ${this.reference.generationNumber} obj\n`,
      buffer,
    );
    remaining = this.pdfObject.copyBytesInto(remaining);
    remaining = addStringToBuffer('\nendobj\n\n', remaining);
    return remaining;
  };
}

export default PDFIndirectObject;
