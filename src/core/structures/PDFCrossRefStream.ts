import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFRef from 'src/core/objects/PDFRef';
import PDFStream from 'src/core/objects/PDFStream';
import PDFContext from 'src/core/PDFContext';
import { bytesFor, Cache, reverseArray, sizeInBytes, sum } from 'src/utils';

export type Entry = [number, number, number];

class PDFCrossRefStream extends PDFStream {
  static of = (dict: PDFDict, entries?: Entry[]) =>
    new PDFCrossRefStream(dict, entries);

  private readonly entries: Entry[];
  private readonly maxByteWidthsCache: Cache<[number, number, number]>;

  private constructor(dict: PDFDict, entries?: Entry[]) {
    super(dict);

    this.entries = entries || [];
    this.maxByteWidthsCache = Cache.populatedBy(this.computeMaxEntryByteWidths);

    dict.set(PDFName.of('Type'), PDFName.of('XRef'));
  }

  addDeletedEntry(ref: PDFRef, nextFreeObjectNumber: number): void {
    this.entries.push([0, nextFreeObjectNumber, ref.generationNumber]);
    this.maxByteWidthsCache.invalidate();
  }

  addUncompressedEntry(ref: PDFRef, offset: number): void {
    this.entries.push([1, offset, ref.generationNumber]);
    this.maxByteWidthsCache.invalidate();
  }

  addCompressedEntry(objectStreamRef: PDFRef, index: number): void {
    this.entries.push([2, objectStreamRef.objectNumber, index]);
    this.maxByteWidthsCache.invalidate();
  }

  clone(context?: PDFContext): PDFCrossRefStream {
    return PDFCrossRefStream.of(this.dict.clone(context), this.entries.slice());
  }

  getContentsString(): string {
    const byteWidths = this.maxByteWidthsCache.access();
    let value = '';

    for (
      let entryIdx = 0, entriesLen = this.entries.length;
      entryIdx < entriesLen;
      entryIdx++
    ) {
      const [first, second, third] = this.entries[entryIdx];

      const firstBytes = reverseArray(bytesFor(first));
      const secondBytes = reverseArray(bytesFor(second));
      const thirdBytes = reverseArray(bytesFor(third));

      for (let idx = byteWidths[0] - 1; idx >= 0; idx--) {
        value += (firstBytes[idx] || 0).toString(2);
      }
      for (let idx = byteWidths[1] - 1; idx >= 0; idx--) {
        value += (secondBytes[idx] || 0).toString(2);
      }
      for (let idx = byteWidths[2] - 1; idx >= 0; idx--) {
        value += (thirdBytes[idx] || 0).toString(2);
      }
    }

    return value;
  }

  // TODO: Is this platform-endianess-independent?
  getContents(): Uint8Array {
    const byteWidths = this.maxByteWidthsCache.access();
    const buffer = new Uint8Array(this.getContentsSize());

    let offset = 0;
    for (
      let entryIdx = 0, entriesLen = this.entries.length;
      entryIdx < entriesLen;
      entryIdx++
    ) {
      const [first, second, third] = this.entries[entryIdx];

      const firstBytes = reverseArray(bytesFor(first));
      const secondBytes = reverseArray(bytesFor(second));
      const thirdBytes = reverseArray(bytesFor(third));

      for (let idx = byteWidths[0] - 1; idx >= 0; idx--) {
        buffer[offset++] = firstBytes[idx] || 0;
      }
      for (let idx = byteWidths[1] - 1; idx >= 0; idx--) {
        buffer[offset++] = secondBytes[idx] || 0;
      }
      for (let idx = byteWidths[2] - 1; idx >= 0; idx--) {
        buffer[offset++] = thirdBytes[idx] || 0;
      }
    }

    return buffer;
  }

  getContentsSize(): number {
    const byteWidths = this.maxByteWidthsCache.access();
    const entryWidth = sum(byteWidths);
    return entryWidth * byteWidths.length;
  }

  private computeMaxEntryByteWidths = (): [number, number, number] => {
    const widths: [number, number, number] = [0, 0, 0];

    for (let idx = 0, len = this.entries.length; idx < len; idx++) {
      const [first, second, third] = this.entries[idx];

      const firstSize = sizeInBytes(first);
      const secondSize = sizeInBytes(second);
      const thirdSize = sizeInBytes(third);

      if (firstSize > widths[0]) widths[0] = firstSize;
      if (secondSize > widths[1]) widths[1] = secondSize;
      if (thirdSize > widths[2]) widths[2] = thirdSize;
    }

    return widths;
  };

  // TODO: Cleanup shared Trailer logic...
  // private updateDict(): void {
  // // const byteWidths = this.computeMaxEntryByteWidths();
  //   const byteWidths = this.maxByteWidthsCache.access();
  //   this.dict.set(PDFName.of('W'), this.dict.context.obj(byteWidths));
  // }
}

export default PDFCrossRefStream;
