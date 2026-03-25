import PDFRef from '../objects/PDFRef';
import CharCodes from '../syntax/CharCodes';
import { copyStringIntoBuffer, padStart } from '../../utils';

export interface Entry {
  ref: PDFRef;
  offset: number;
  deleted: boolean;
}

/**
 * Entries should be added using the [[addEntry]] and [[addDeletedEntry]]
 * methods.
 */
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
    // fix the first entry if required
    if (!this.subsections.length) {
      this.subsections = [
        [
          {
            ref: PDFRef.of(0, 65535),
            offset: ref.objectNumber,
            deleted: true,
          },
        ],
      ];
      this.chunkIdx = 0;
      this.chunkLength = 1;
    } else if (!this.subsections[0][0].offset) {
      this.subsections[0][0].offset = ref.objectNumber;
    }
    this.append({ ref, offset: nextFreeObjectNumber, deleted: true });
  }

  toString(): string {
    let section = 'xref\n';

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

    offset += this.copySubsectionsIntoBuffer(this.subsections, buffer, offset);

    return offset - initialOffset;
  }

  private copySubsectionsIntoBuffer(
    subsections: Entry[][],
    buffer: Uint8Array,
    offset: number,
  ): number {
    const initialOffset = offset;
    const length = subsections.length;

    for (let idx = 0; idx < length; idx++) {
      const subsection = this.subsections[idx];

      const firstObjectNumber = String(subsection[0].ref.objectNumber);
      offset += copyStringIntoBuffer(firstObjectNumber, buffer, offset);
      buffer[offset++] = CharCodes.Space;

      const rangeLength = String(subsection.length);
      offset += copyStringIntoBuffer(rangeLength, buffer, offset);
      buffer[offset++] = CharCodes.Newline;

      offset += this.copyEntriesIntoBuffer(subsection, buffer, offset);
    }

    return offset - initialOffset;
  }

  private copyEntriesIntoBuffer(
    entries: Entry[],
    buffer: Uint8Array,
    offset: number,
  ): number {
    const length = entries.length;

    for (let idx = 0; idx < length; idx++) {
      const entry = entries[idx];

      const entryOffset = padStart(String(entry.offset), 10, '0');
      offset += copyStringIntoBuffer(entryOffset, buffer, offset);
      buffer[offset++] = CharCodes.Space;

      const entryGen = padStart(String(entry.ref.generationNumber), 5, '0');
      offset += copyStringIntoBuffer(entryGen, buffer, offset);
      buffer[offset++] = CharCodes.Space;

      buffer[offset++] = entry.deleted ? CharCodes.f : CharCodes.n;

      buffer[offset++] = CharCodes.Space;
      buffer[offset++] = CharCodes.Newline;
    }

    return 20 * length;
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

    if (currEntry.ref.objectNumber - prevEntry.ref.objectNumber !== 1) {
      // the current chunk is not the right chunk, find the right one, or create a new one
      for (let c = 0; c < this.subsections.length; c++) {
        const first = this.subsections[c][0];
        const last = this.subsections[c][this.subsections[c].length - 1];
        if (first.ref.objectNumber > currEntry.ref.objectNumber) {
          // goes before this subsection, or at the start of it
          if (first.ref.objectNumber - currEntry.ref.objectNumber === 1) {
            // first element of subsection
            this.subsections[c].unshift(currEntry);
            if (c === this.chunkIdx) this.chunkLength += 1;
            return;
          } else {
            // create subsection
            this.subsections.splice(c, 0, [currEntry]);
            this.chunkIdx++;
            return;
          }
        } else if (last.ref.objectNumber > currEntry.ref.objectNumber) {
          // goes in this subsection, find its place..
          const cep = this.subsections[c].findIndex(
            (ee) => ee.ref.objectNumber > currEntry.ref.objectNumber,
          );
          this.subsections[c].splice(cep, 0, currEntry);
          if (c === this.chunkIdx) this.chunkLength += 1;
        }
        // bigger, keep looking
      }
      // if got to here, then a new subsection is required
      this.subsections.push([currEntry]);
      this.chunkIdx += 1;
      this.chunkLength = 1;
    } else {
      chunk.push(currEntry);
      this.chunkLength += 1;
    }
  }

  /**
   * Returns all the entries in the XREF section, except the first one (object == 0)
   * @returns {Entry[]} All the entries in the XREF section
   */
  listRefs(): Entry[] {
    const refList: Entry[] = [];
    for (
      let rangeIdx = 0, rangeLen = this.subsections.length;
      rangeIdx < rangeLen;
      rangeIdx++
    ) {
      const range = this.subsections[rangeIdx];
      for (
        let entryIdx = 0, entryLen = range.length;
        entryIdx < entryLen;
        entryIdx++
      ) {
        const entry = range[entryIdx];
        if (entry.ref.objectNumber) refList.push(entry);
      }
    }
    return refList;
  }
}

export default PDFCrossRefSection;
