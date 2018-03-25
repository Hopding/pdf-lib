
import { addStringToBuffer } from 'utils';
import { validate, isIdentity } from 'utils/validate';

import PDFObject from './PDFObject';

const PDF_NULL_ENFORCER = Symbol('PDF_NULL_ENFORCER');

class PDFNull extends PDFObject {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(PDF_NULL_ENFORCER),
      'Cannot create new PDFNull objects - use PDFNull.instance',
    );
  }

  static instance = new PDFNull(PDF_NULL_ENFORCER);

  toString = (): string => 'null';

  bytesSize = () => 4;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer('null', buffer);
}

export default PDFNull;
