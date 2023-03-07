import PDFName from '../objects/PDFName';
import PDFNumber from '../objects/PDFNumber';
import PDFObject from '../objects/PDFObject';
import PDFRef from '../objects/PDFRef';
import PDFContext from '../PDFContext';
import PDFFlateStream from './PDFFlateStream';
import CharCodes from '../syntax/CharCodes';
import { copyStringIntoBuffer, last } from '../../utils';

export type IndirectObject = [PDFRef, PDFObject];

class PDFObjectStream extends PDFFlateStream {
  static withContextAndObjects = (
    context: PDFContext,
    objects: IndirectObject[],
    encode = true,
  ) => new PDFObjectStream(context, objects, encode);

  private readonly objects: IndirectObject[];
  private readonly offsets: [number, number][];
  private readonly offsetsString: string;

  private constructor(
    context: PDFContext,
    objects: IndirectObject[],
    encode = true,
  ) {
    super(context.obj({}), encode);

    this.objects = objects;
    this.offsets = this.computeObjectOffsets();
    this.offsetsString = this.computeOffsetsString();

    this.dict.set(PDFName.of('Type'), PDFName.of('ObjStm'));
    this.dict.set(PDFName.of('N'), PDFNumber.of(this.objects.length));
    this.dict.set(PDFName.of('First'), PDFNumber.of(this.offsetsString.length));
  }

  getObjectsCount(): number {
    return this.objects.length;
  }

  clone(context?: PDFContext): PDFObjectStream {
    return PDFObjectStream.withContextAndObjects(
      context || this.dict.context,
      this.objects.slice(),
      this.encode,
    );
  }

  getContentsString(): string {
    let value = this.offsetsString;
    for (let idx = 0, len = this.objects.length; idx < len; idx++) {
      const [, object] = this.objects[idx];
      value += `${object}\n`;
    }
    return value;
  }

  getUnencodedContents(): Uint8Array {
    const buffer = new Uint8Array(this.getUnencodedContentsSize());
    let offset = copyStringIntoBuffer(this.offsetsString, buffer, 0);
    for (let idx = 0, len = this.objects.length; idx < len; idx++) {
      const [, object] = this.objects[idx];
      offset += object.copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
    }
    return buffer;
  }

  getUnencodedContentsSize(): number {
    return (
      this.offsetsString.length +
      last(this.offsets)[1] +
      last(this.objects)[1].sizeInBytes() +
      1
    );
  }

  private computeOffsetsString(): string {
    let offsetsString = '';
    for (let idx = 0, len = this.offsets.length; idx < len; idx++) {
      const [objectNumber, offset] = this.offsets[idx];
      offsetsString += `${objectNumber} ${offset} `;
    }
    return offsetsString;
  }

  private computeObjectOffsets(): [number, number][] {
    let offset = 0;
    const offsets = new Array(this.objects.length);
    for (let idx = 0, len = this.objects.length; idx < len; idx++) {
      const [ref, object] = this.objects[idx];
      offsets[idx] = [ref.objectNumber, offset];
      offset += object.sizeInBytes() + 1; // '\n'
    }
    return offsets;
  }
}

export default PDFObjectStream;
