import isNumber from 'lodash/isNumber';

import { addStringToBuffer } from 'utils';
import { isIdentity, validate } from 'utils/validate';
import PDFObject from './PDFObject';

// const pdfIndirectRefEnforcer = Symbol('PDF_INDIRECT_REF_ENFORCER');

// Using a Symbol is ideal here, but React Native doesn't current support them,
// so we'll use a string instead.
const pdfIndirectRefEnforcer = '@@__PDF_INDIRECT_REF_ENFORCER';
const pdfIndirectRefPool: Map<string, PDFIndirectReference> = new Map();

// TODO: Need to error out if obj or gen numbers are manually set!
// tslint:disable-next-line:no-unused-variable
class PDFIndirectReference<T extends PDFObject = PDFObject> extends PDFObject {
  static forNumbers = (objectNumber: number, generationNumber: number) => {
    const key = `${objectNumber} ${generationNumber}`;
    let indirectRef = pdfIndirectRefPool.get(key);
    if (!indirectRef) {
      indirectRef = new PDFIndirectReference(
        pdfIndirectRefEnforcer,
        objectNumber,
        generationNumber,
      );
      pdfIndirectRefPool.set(key, indirectRef);
    }
    return indirectRef;
  };

  objectNumber: number;
  generationNumber: number;

  constructor(
    enforcer: string,
    objectNumber: number,
    generationNumber: number,
  ) {
    super();
    validate(
      enforcer,
      isIdentity(pdfIndirectRefEnforcer),
      'Cannot create PDFIndirectReference via constructor. Use PDFIndirectReference.forNumbers instead.',
    );
    validate(objectNumber, isNumber, 'objectNumber must be a Number');
    validate(generationNumber, isNumber, 'generationNumber must be a Number');

    this.objectNumber = objectNumber;
    this.generationNumber = generationNumber;
  }

  toString = (): string => `${this.objectNumber} ${this.generationNumber} R`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFIndirectReference;
