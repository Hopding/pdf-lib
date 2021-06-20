import { MethodNotImplementedError } from 'src/core/errors';
import PDFContext from 'src/core/PDFContext';
import { EncryptFn } from '../security/PDFSecurity';

class PDFObject {
  clone(_context?: PDFContext): PDFObject {
    throw new MethodNotImplementedError(this.constructor.name, 'clone');
  }

  toString(): string {
    throw new MethodNotImplementedError(this.constructor.name, 'toString');
  }

  sizeInBytes(): number {
    throw new MethodNotImplementedError(this.constructor.name, 'sizeInBytes');
  }

  copyBytesInto(
    _buffer: Uint8Array,
    _offset: number,
    _encryptFn?: EncryptFn,
  ): number {
    throw new MethodNotImplementedError(this.constructor.name, 'copyBytesInto');
  }
}

export default PDFObject;
