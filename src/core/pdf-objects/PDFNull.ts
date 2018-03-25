import { addStringToBuffer } from 'utils';
import { isIdentity, validate } from 'utils/validate';

import PDFObject from './PDFObject';

const PDF_NULL_ENFORCER = Symbol('PDF_NULL_ENFORCER');

class PDFNull extends PDFObject {
  static instance = new PDFNull(PDF_NULL_ENFORCER);

  constructor(enforcer: symbol) {
    super();
    validate(
      enforcer,
      isIdentity(PDF_NULL_ENFORCER),
      'Cannot create new PDFNull objects - use PDFNull.instance',
    );
  }

  toString = (): string => 'null';

  bytesSize = () => 4;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer('null', buffer);
}

export default PDFNull;
