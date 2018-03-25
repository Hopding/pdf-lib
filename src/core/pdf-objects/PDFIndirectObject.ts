import _ from 'lodash';

import { addStringToBuffer, arrayToString } from 'utils';
import { isInstance, validate } from 'utils/validate';

import PDFIndirectReference from './PDFIndirectReference';
import PDFObject from './PDFObject';

class PDFIndirectObject<T extends PDFObject = PDFObject> extends PDFObject {
  public static of = <A extends PDFObject>(
    pdfObject: A,
  ): PDFIndirectObject<A> => new PDFIndirectObject(pdfObject)

  public reference: PDFIndirectReference<T>;
  public pdfObject: T;

  constructor(pdfObject: T) {
    super();
    validate(
      pdfObject,
      isInstance(PDFObject),
      'PDFIndirectObject.pdfObject must be of type PDFObject',
    );
    this.pdfObject = pdfObject;
  }

  public setReferenceNumbers = (
    objectNumber: number,
    generationNumber: number,
  ) => {
    validate(objectNumber, _.isNumber, 'objectNumber must be a Number');
    validate(generationNumber, _.isNumber, 'generationNumber must be a Number');

    this.reference = PDFIndirectReference.forNumbers(
      objectNumber,
      generationNumber,
    );
    return this;
  }

  public setReference = (reference: PDFIndirectReference<T>) => {
    this.reference = reference;
    return this;
  }

  public getReference = () => this.reference;
  public toReference = () => this.reference.toString();

  public toString = (): string => {
    const buffer = new Uint8Array(this.bytesSize());
    this.copyBytesInto(buffer);
    return arrayToString(buffer);
  }

  public bytesSize = () =>
    `${this.reference.objectNumber} ${this.reference.generationNumber} obj\n`
      .length +
    this.pdfObject.bytesSize() +
    9 // "\nendobj\n\n"

  public copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer(
      `${this.reference.objectNumber} ${this.reference.generationNumber} obj\n`,
      buffer,
    );
    remaining = this.pdfObject.copyBytesInto(remaining);
    remaining = addStringToBuffer('\nendobj\n\n', remaining);
    return remaining;
  }
}

export default PDFIndirectObject;
