import CharCodes from 'src/core/syntax/CharCodes';
import { copyStringIntoBuffer } from 'src/utils';

class PDFTrailer {
  static forLastCrossRefSectionOffset = (offset: number) =>
    new PDFTrailer(offset);

  private readonly lastXRefOffset: string;

  private constructor(lastXRefOffset: number) {
    this.lastXRefOffset = String(lastXRefOffset);
  }

  toString(): string {
    return `startxref\n${this.lastXRefOffset}\n%%EOF`;
  }

  sizeInBytes(): number {
    return 16 + this.lastXRefOffset.length;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    const initialOffset = offset;

    buffer[offset++] = CharCodes.s;
    buffer[offset++] = CharCodes.t;
    buffer[offset++] = CharCodes.a;
    buffer[offset++] = CharCodes.r;
    buffer[offset++] = CharCodes.t;
    buffer[offset++] = CharCodes.x;
    buffer[offset++] = CharCodes.r;
    buffer[offset++] = CharCodes.e;
    buffer[offset++] = CharCodes.f;
    buffer[offset++] = CharCodes.Newline;

    offset += copyStringIntoBuffer(this.lastXRefOffset, buffer, offset);

    buffer[offset++] = CharCodes.Newline;
    buffer[offset++] = CharCodes.Percent;
    buffer[offset++] = CharCodes.Percent;
    buffer[offset++] = CharCodes.E;
    buffer[offset++] = CharCodes.O;
    buffer[offset++] = CharCodes.F;

    return offset - initialOffset;
  }
}

export default PDFTrailer;
