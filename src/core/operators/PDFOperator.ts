import PDFArray from 'src/core/objects/PDFArray';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFObject from 'src/core/objects/PDFObject';
import PDFString from 'src/core/objects/PDFString';
import PDFOperatorNames from 'src/core/operators/PDFOperatorNames';
import PDFContext from 'src/core/PDFContext';
import CharCodes from 'src/core/syntax/CharCodes';
import { copyStringIntoBuffer } from 'src/utils';

export type PDFOperatorArg =
  | string
  | PDFName
  | PDFArray
  | PDFNumber
  | PDFString
  | PDFHexString;

class PDFOperator {
  static of = (name: PDFOperatorNames, args?: PDFOperatorArg[]) =>
    new PDFOperator(name, args);

  private readonly name: PDFOperatorNames;
  private readonly args: PDFOperatorArg[];

  private constructor(name: PDFOperatorNames, args?: PDFOperatorArg[]) {
    this.name = name;
    this.args = args || [];
  }

  clone(context?: PDFContext): PDFOperator {
    const args = new Array(this.args.length);
    for (let idx = 0, len = args.length; idx < len; idx++) {
      const arg = this.args[idx];
      args[idx] = arg instanceof PDFObject ? arg.clone(context) : arg;
    }
    return PDFOperator.of(this.name, args);
  }

  toString(): string {
    let value = '';
    for (let idx = 0, len = this.args.length; idx < len; idx++) {
      value += String(this.args[idx]) + ' ';
    }
    value += this.name;
    return value;
  }

  sizeInBytes(): number {
    let size = 0;
    for (let idx = 0, len = this.args.length; idx < len; idx++) {
      const arg = this.args[idx];
      size += (arg instanceof PDFObject ? arg.sizeInBytes() : arg.length) + 1;
    }
    size += this.name.length;
    return size;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    const initialOffset = offset;

    for (let idx = 0, len = this.args.length; idx < len; idx++) {
      const arg = this.args[idx];
      if (arg instanceof PDFObject) {
        offset += arg.copyBytesInto(buffer, offset);
      } else {
        offset += copyStringIntoBuffer(arg, buffer, offset);
      }
      buffer[offset++] = CharCodes.Space;
    }

    offset += copyStringIntoBuffer(this.name, buffer, offset);

    return offset - initialOffset;
  }
}

export default PDFOperator;
