import _ from 'lodash';
import { addStringToBuffer } from 'utils';
import { isIdentity, validate } from 'utils/validate';
import PDFObject from './PDFObject';

const pdfIndirectRefEnforcer = Symbol('PDF_INDIRECT_REF_ENFORCER');
const pdfIndirectRefPool: Map<string, PDFIndirectReference> = new Map();

// TODO: Need to error out if obj or gen numbers are manually set!
// eslint-disable-next-line no-unused-vars
class PDFIndirectReference<T extends PDFObject = PDFObject> extends PDFObject {
  public static forNumbers = (
    objectNumber: number,
    generationNumber: number,
  ) => {
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

  public objectNumber: number;
  public generationNumber: number;

  constructor(
    enforcer: symbol,
    objectNumber: number,
    generationNumber: number,
  ) {
    super();
    validate(
      enforcer,
      isIdentity(pdfIndirectRefEnforcer),
      'Cannot create PDFIndirectReference via constructor',
    );
    validate(objectNumber, _.isNumber, 'objectNumber must be a Number');
    validate(generationNumber, _.isNumber, 'generationNumber must be a Number');

    this.objectNumber = objectNumber;
    this.generationNumber = generationNumber;
  }

  public toString = (): string =>
    `${this.objectNumber} ${this.generationNumber} R`;

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFIndirectReference;
