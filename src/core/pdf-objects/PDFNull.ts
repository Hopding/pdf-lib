import { addStringToBuffer } from 'utils';
import { isIdentity, validate } from 'utils/validate';

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

  public static instance = new PDFNull(PDF_NULL_ENFORCER);

  public toString = (): string => 'null';

  public bytesSize = () => 4;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer('null', buffer)
}

export default PDFNull;
