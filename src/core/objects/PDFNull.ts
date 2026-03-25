import PDFObject from './PDFObject';
import CharCodes from '../syntax/CharCodes';
import { PDFClasses } from '../../api/objects';

class PDFNull extends PDFObject {
  static className = () => PDFClasses.PDFNull;
  myClass(): PDFClasses {
    return PDFClasses.PDFNull;
  }
  asNull(): null {
    return null;
  }

  clone(): PDFNull {
    return this;
  }

  toString(): string {
    return 'null';
  }

  sizeInBytes(): number {
    return 4;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    buffer[offset++] = CharCodes.n;
    buffer[offset++] = CharCodes.u;
    buffer[offset++] = CharCodes.l;
    buffer[offset++] = CharCodes.l;
    return 4;
  }
}

export default new PDFNull();
