import isNumber from 'lodash/isNumber';

import { addStringToBuffer, arrayToString } from 'utils';
import { isInstance, validate } from 'utils/validate';

import PDFIndirectReference from './PDFIndirectReference';
import PDFObject from './PDFObject';

class PDFIndirectObject<T extends PDFObject = PDFObject> extends PDFObject {
  static of = <A extends PDFObject>(pdfObject: A): PDFIndirectObject<A> =>
    new PDFIndirectObject(pdfObject);

  reference: PDFIndirectReference<T>;
  pdfObject: T;

  constructor(pdfObject: T) {
    super();
    validate(
      pdfObject,
      isInstance(PDFObject),
      'PDFIndirectObject.pdfObject must be of type PDFObject',
    );
    this.pdfObject = pdfObject;
  }

  getReference = () => this.reference;

  setReferenceNumbers = (objectNumber: number, generationNumber: number) => {
    validate(objectNumber, isNumber, 'objectNumber must be a Number');
    validate(generationNumber, isNumber, 'generationNumber must be a Number');

    this.reference = PDFIndirectReference.forNumbers(
      objectNumber,
      generationNumber,
    );
    return this;
  };

  setReference = (reference: PDFIndirectReference<T>) => {
    validate(
      reference,
      isInstance(PDFIndirectReference),
      '"reference" must be a PDFIndirectReference object',
    );
    this.reference = reference;
    return this;
  };

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
