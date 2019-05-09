import { PrivateConstructorError } from 'src/core/errors';
import { CharCodes } from 'src/core/enums';

import PDFObject from './PDFObject';

const ENFORCER = {};

class PDFBool extends PDFObject {
  static readonly True = new PDFBool(ENFORCER, true);
  static readonly False = new PDFBool(ENFORCER, false);

  private readonly value: boolean;

  private constructor(enforcer: any, value: boolean) {
    if (enforcer !== ENFORCER) throw new PrivateConstructorError('PDFBool');
    super();
    this.value = value;
  }

  clone(): PDFBool {
    return this;
  }

  toString(): string {
    return String(this.value);
  }

  sizeInBytes(): number {
    return this.value ? 4 : 5;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): void {
    if (this.value) {
      buffer[offset++] = CharCodes.t;
      buffer[offset++] = CharCodes.r;
      buffer[offset++] = CharCodes.u;
      buffer[offset++] = CharCodes.e;
    } else {
      buffer[offset++] = CharCodes.f;
      buffer[offset++] = CharCodes.a;
      buffer[offset++] = CharCodes.l;
      buffer[offset++] = CharCodes.s;
      buffer[offset++] = CharCodes.e;
    }
  }
}

export default PDFBool;
