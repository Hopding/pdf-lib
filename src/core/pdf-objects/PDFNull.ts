import { addStringToBuffer } from 'utils';
import { isIdentity, validate } from 'utils/validate';

import PDFObject from './PDFObject';

// const PDF_NULL_ENFORCER = Symbol('PDF_NULL_ENFORCER');

// Using a Symbol is ideal here, but React Native doesn't current support them,
// so we'll use a string instead.
const PDF_NULL_ENFORCER = '@@__PDF_NULL_ENFORCER';

class PDFNull extends PDFObject {
  static instance = new PDFNull(PDF_NULL_ENFORCER);

  constructor(enforcer: string) {
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
