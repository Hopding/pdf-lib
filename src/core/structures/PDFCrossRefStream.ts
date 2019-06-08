import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import PDFFlateStream from 'src/core/structures/PDFFlateStream';
import { bytesFor, Cache, reverseArray, sizeInBytes, sum } from 'src/utils';

export enum EntryType {
  Deleted = 0,
  Uncompressed = 1,
  Compressed = 2,
}

export interface DeletedEntry {
  type: EntryType.Deleted;
  ref: PDFRef;
  nextFreeObjectNumber: number;
}

export interface UncompressedEntry {
  type: EntryType.Uncompressed;
  ref: PDFRef;
  offset: number;
}

export interface CompressedEntry {
  type: EntryType.Compressed;
  ref: PDFRef;
  objectStreamRef: PDFRef;
  index: number;
}

export type Entry = DeletedEntry | UncompressedEntry | CompressedEntry;

export type EntryTuple = [number, number, number];

/**
 * Entries should be added using the [[addDeletedEntry]],
 * [[addUncompressedEntry]], and [[addCompressedEntry]] methods
 * **in order of ascending object number**.
 */
class PDFCrossRefStream extends PDFFlateStream {
  static create = (dict: PDFDict, encode = true) => {
    const stream = new PDFCrossRefStream(dict, [], encode);
    stream.addDeletedEntry(PDFRef.of(0, 65535), 0);
    return stream;
  };

  static of = (dict: PDFDict, entries: Entry[], encode = true) =>
    new PDFCrossRefStream(dict, entries, encode);

  private readonly entries: Entry[];
  private readonly entryTuplesCache: Cache<EntryTuple[]>;
  private readonly maxByteWidthsCache: Cache<[number, number, number]>;
  private readonly indexCache: Cache<number[]>;

  private constructor(dict: PDFDict, entries?: Entry[], encode = true) {
    super(dict, encode);

    this.entries = entries || [];
    this.entryTuplesCache = Cache.populatedBy(this.computeEntryTuples);
    this.maxByteWidthsCache = Cache.populatedBy(this.computeMaxEntryByteWidths);
    this.indexCache = Cache.populatedBy(this.computeIndex);

    dict.set(PDFName.of('Type'), PDFName.of('XRef'));
  }

  addDeletedEntry(ref: PDFRef, nextFreeObjectNumber: number) {
    const type = EntryType.Deleted;
    this.entries.push({ type, ref, nextFreeObjectNumber });
    this.entryTuplesCache.invalidate();
    this.maxByteWidthsCache.invalidate();
    this.indexCache.invalidate();
    this.contentsCache.invalidate();
  }

  addUncompressedEntry(ref: PDFRef, offset: number) {
    const type = EntryType.Uncompressed;
    this.entries.push({ type, ref, offset });
    this.entryTuplesCache.invalidate();
    this.maxByteWidthsCache.invalidate();
    this.indexCache.invalidate();
    this.contentsCache.invalidate();
  }

  addCompressedEntry(ref: PDFRef, objectStreamRef: PDFRef, index: number) {
    const type = EntryType.Compressed;
    this.entries.push({ type, ref, objectStreamRef, index });
    this.entryTuplesCache.invalidate();
    this.maxByteWidthsCache.invalidate();
    this.indexCache.invalidate();
    this.contentsCache.invalidate();
  }

  clone(context?: PDFContext): PDFCrossRefStream {
    const { dict, entries, encode } = this;
    return PDFCrossRefStream.of(dict.clone(context), entries.slice(), encode);
  }

  getContentsString(): string {
    const entryTuples = this.entryTuplesCache.access();
    const byteWidths = this.maxByteWidthsCache.access();
    let value = '';

    for (
      let entryIdx = 0, entriesLen = entryTuples.length;
      entryIdx < entriesLen;
      entryIdx++
    ) {
      const [first, second, third] = entryTuples[entryIdx];

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

  getUnencodedContents(): Uint8Array {
    const entryTuples = this.entryTuplesCache.access();
    const byteWidths = this.maxByteWidthsCache.access();
    const buffer = new Uint8Array(this.getUnencodedContentsSize());

    let offset = 0;
    for (
      let entryIdx = 0, entriesLen = entryTuples.length;
      entryIdx < entriesLen;
      entryIdx++
    ) {
      const [first, second, third] = entryTuples[entryIdx];

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

  getUnencodedContentsSize(): number {
    const byteWidths = this.maxByteWidthsCache.access();
    const entryWidth = sum(byteWidths);
    return entryWidth * this.entries.length;
  }

  updateDict(): void {
    super.updateDict();

    const byteWidths = this.maxByteWidthsCache.access();
    const index = this.indexCache.access();

    const { context } = this.dict;
    this.dict.set(PDFName.of('W'), context.obj(byteWidths));
    this.dict.set(PDFName.of('Index'), context.obj(index));
  }

  // Returns an array of integer pairs for each subsection of the cross ref
  // section, where each integer pair represents:
  //   firstObjectNumber(OfSection), length(OfSection)
  private computeIndex = (): number[] => {
    const subsections: number[] = [];

    let subsectionLength = 0;
    for (let idx = 0, len = this.entries.length; idx < len; idx++) {
      const currEntry = this.entries[idx];
      const prevEntry = this.entries[idx - 1];

      if (idx === 0) {
        subsections.push(currEntry.ref.objectNumber);
      } else if (currEntry.ref.objectNumber - prevEntry.ref.objectNumber > 1) {
        subsections.push(subsectionLength);
        subsections.push(currEntry.ref.objectNumber);
        subsectionLength = 0;
      }

      subsectionLength += 1;
    }
    subsections.push(subsectionLength);

    return subsections;
  };

  private computeEntryTuples = (): EntryTuple[] => {
    const entryTuples: EntryTuple[] = new Array(this.entries.length);

    for (let idx = 0, len = this.entries.length; idx < len; idx++) {
      const entry = this.entries[idx];
      if (entry.type === EntryType.Deleted) {
        const { type, nextFreeObjectNumber, ref } = entry;
        entryTuples[idx] = [type, nextFreeObjectNumber, ref.generationNumber];
      }
      if (entry.type === EntryType.Uncompressed) {
        const { type, offset, ref } = entry;
        entryTuples[idx] = [type, offset, ref.generationNumber];
      }
      if (entry.type === EntryType.Compressed) {
        const { type, objectStreamRef, index } = entry;
        entryTuples[idx] = [type, objectStreamRef.objectNumber, index];
      }
    }

    return entryTuples;
  };

  private computeMaxEntryByteWidths = (): [number, number, number] => {
    const entryTuples = this.entryTuplesCache.access();
    const widths: [number, number, number] = [0, 0, 0];

    for (let idx = 0, len = entryTuples.length; idx < len; idx++) {
      const [first, second, third] = entryTuples[idx];

      const firstSize = sizeInBytes(first);
      const secondSize = sizeInBytes(second);
      const thirdSize = sizeInBytes(third);

      if (firstSize > widths[0]) widths[0] = firstSize;
      if (secondSize > widths[1]) widths[1] = secondSize;
      if (thirdSize > widths[2]) widths[2] = thirdSize;
    }

    return widths;
  };
}

export default PDFCrossRefStream;
