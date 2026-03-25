import PDFArray from '../objects/PDFArray';
import PDFHexString from '../objects/PDFHexString';
import PDFName from '../objects/PDFName';
import PDFNumber from '../objects/PDFNumber';
import PDFObject from '../objects/PDFObject';
import PDFString from '../objects/PDFString';
import PDFOperatorNames from './PDFOperatorNames';
import PDFContext from '../PDFContext';
import CharCodes from '../syntax/CharCodes';
import { copyStringIntoBuffer } from '../../utils';
import { isPDFInstance, PDFClasses } from '../../api/objects';

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
      args[idx] = isPDFInstance(arg, PDFClasses.PDFObject)
        ? (arg as PDFObject).clone(context)
        : arg;
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
      size +=
        (isPDFInstance(arg, PDFClasses.PDFObject)
          ? (arg as PDFObject).sizeInBytes()
          : (arg as string).length) + 1;
    }
    size += this.name.length;
    return size;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    const initialOffset = offset;

    for (let idx = 0, len = this.args.length; idx < len; idx++) {
      const arg = this.args[idx];
      if (isPDFInstance(arg, PDFClasses.PDFObject)) {
        offset += (arg as PDFObject).copyBytesInto(buffer, offset);
      } else {
        offset += copyStringIntoBuffer(arg as string, buffer, offset);
      }
      buffer[offset++] = CharCodes.Space;
    }

    offset += copyStringIntoBuffer(this.name, buffer, offset);

    return offset - initialOffset;
  }
}

export default PDFOperator;
