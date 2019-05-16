import CharCodes from 'src/core/CharCodes';
import PDFRef from 'src/core/objects/PDFRef';
import { padStart } from 'src/utils';

export interface Entry {
  ref: PDFRef;
  offset: number;
  deleted: boolean;
}

class PDFCrossRefSection {
  static create = () =>
    new PDFCrossRefSection({
      ref: PDFRef.of(0, 65535),
      offset: 0,
      deleted: true,
    });

  static createEmpty = () => new PDFCrossRefSection();

  private subsections: Entry[][];
  private chunkIdx: number;
  private chunkLength: number;

  private constructor(firstEntry: Entry | void) {
    this.subsections = firstEntry ? [[firstEntry]] : [];
    this.chunkIdx = 0;
    this.chunkLength = firstEntry ? 1 : 0;
  }

  addEntry(ref: PDFRef, offset: number): void {
    this.append({ ref, offset, deleted: false });
  }

  addDeletedEntry(ref: PDFRef, nextFreeObjectNumber: number): void {
    this.append({ ref, offset: nextFreeObjectNumber, deleted: true });
  }

  toString(): string {
    let section = `xref\n`;

    for (
      let rangeIdx = 0, rangeLen = this.subsections.length;
      rangeIdx < rangeLen;
      rangeIdx++
    ) {
      const range = this.subsections[rangeIdx];
      section += `${range[0].ref.objectNumber} ${range.length}\n`;
      for (
        let entryIdx = 0, entryLen = range.length;
        entryIdx < entryLen;
        entryIdx++
      ) {
        const entry = range[entryIdx];
        section += padStart(String(entry.offset), 10, '0');
        section += ' ';
        section += padStart(String(entry.ref.generationNumber), 5, '0');
        section += ' ';
        section += entry.deleted ? 'f' : 'n';
        section += ' \n';
      }
    }

    return section;
  }

  sizeInBytes(): number {
    let size = 5;
    for (let idx = 0, len = this.subsections.length; idx < len; idx++) {
      const subsection = this.subsections[idx];
      const subsectionLength = subsection.length;
      const [firstEntry] = subsection;
      size += 2;
      size += String(firstEntry.ref.objectNumber).length;
      size += String(subsectionLength).length;
      size += 20 * subsectionLength;
    }
    return size;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    const initialOffset = offset;

    buffer[offset++] = CharCodes.x;
    buffer[offset++] = CharCodes.r;
    buffer[offset++] = CharCodes.e;
    buffer[offset++] = CharCodes.f;
    buffer[offset++] = CharCodes.Newline;

    for (
      let rangeIdx = 0, rangeLen = this.subsections.length;
      rangeIdx < rangeLen;
      rangeIdx++
    ) {
      const range = this.subsections[rangeIdx];

      const firstObjectNumber = String(range[0].ref.objectNumber);
      for (let idx = 0, len = firstObjectNumber.length; idx < len; idx++) {
        buffer[offset++] = firstObjectNumber.charCodeAt(idx);
      }
      buffer[offset++] = CharCodes.Space;

      const rangeLength = String(range.length);
      for (let idx = 0, len = rangeLength.length; idx < len; idx++) {
        buffer[offset++] = rangeLength.charCodeAt(idx);
      }
      buffer[offset++] = CharCodes.Newline;

      for (
        let entryIdx = 0, entryLen = range.length;
        entryIdx < entryLen;
        entryIdx++
      ) {
        const entry = range[entryIdx];

        const entryOffset = padStart(String(entry.offset), 10, '0');
        for (let idx = 0, len = entryOffset.length; idx < len; idx++) {
          buffer[offset++] = entryOffset.charCodeAt(idx);
        }
        buffer[offset++] = CharCodes.Space;

        const entryGen = padStart(String(entry.ref.generationNumber), 5, '0');
        for (let idx = 0, len = entryGen.length; idx < len; idx++) {
          buffer[offset++] = entryGen.charCodeAt(idx);
        }
        buffer[offset++] = CharCodes.Space;

        if (entry.deleted) {
          buffer[offset++] = CharCodes.f;
        } else {
          buffer[offset++] = CharCodes.n;
        }

        buffer[offset++] = CharCodes.Space;
        buffer[offset++] = CharCodes.Newline;
      }
    }

    return offset - initialOffset;
  }

  private append(currEntry: Entry): void {
    if (this.chunkLength === 0) {
      this.subsections.push([currEntry]);
      this.chunkIdx = 0;
      this.chunkLength = 1;
      return;
    }

    const chunk = this.subsections[this.chunkIdx];
    const prevEntry = chunk[this.chunkLength - 1];

    if (currEntry.ref.objectNumber - prevEntry.ref.objectNumber > 1) {
      this.subsections.push([currEntry]);
      this.chunkIdx += 1;
      this.chunkLength = 1;
    } else {
      chunk.push(currEntry);
      this.chunkLength += 1;
    }
  }
}

export default PDFCrossRefSection;
