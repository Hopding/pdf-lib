import { PDFClasses } from '../../api/objects';
import { MethodNotImplementedError } from '../errors';
import PDFContext from '../PDFContext';

class PDFObject {
  static className = () => PDFClasses.PDFObject;
  myClass(): PDFClasses {
    return PDFClasses.PDFObject;
  }

  registerChange() {
    throw new MethodNotImplementedError(
      this.constructor.name,
      'registerChange',
    );
  }
  clone(_context?: PDFContext): PDFObject {
    throw new MethodNotImplementedError(this.constructor.name, 'clone');
  }

  toString(): string {
    throw new MethodNotImplementedError(this.constructor.name, 'toString');
  }

  sizeInBytes(): number {
    throw new MethodNotImplementedError(this.constructor.name, 'sizeInBytes');
  }

  copyBytesInto(_buffer: Uint8Array, _offset: number): number {
    throw new MethodNotImplementedError(this.constructor.name, 'copyBytesInto');
  }
}

export default PDFObject;
