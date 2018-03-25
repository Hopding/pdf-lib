import _ from 'lodash';

import { addStringToBuffer } from 'utils';
import { isInstance, validate, validateArr } from 'utils/validate';

export class Entry {
  public offset: number = null;
  public generationNum: number = null;
  public isInUse: boolean = null;

  public static create = () => new Entry();

  public setOffset = (offset: number) => {
    validate(offset, _.isNumber, 'offset must be a number');
    this.offset = offset;
    return this;
  }

  public setGenerationNum = (generationNum: number) => {
    validate(generationNum, _.isNumber, 'generationNum must be a number');
    this.generationNum = generationNum;
    return this;
  }

  public setIsInUse = (isInUse: boolean) => {
    validate(isInUse, _.isBoolean, 'isInUse must be a boolean');
    this.isInUse = isInUse;
    return this;
  }

  public toString = (): string =>
    `${_.padStart(String(this.offset), 10, '0')} ` +
    `${_.padStart(String(this.generationNum), 5, '0')} ` +
    `${this.isInUse ? 'n' : 'f'} \n`

  public bytesSize = () => this.toString().length;
}

export class Subsection {
  public entries: Entry[] = [];
  public firstObjNum: number;

  public static from = (entries: Entry[]) => {
    validateArr(
      entries,
      isInstance(Entry),
      'PDFXRef.Subsection.entries must be an array of PDFXRef.Entry',
    );

    const subsection = new Subsection();
    subsection.entries = entries;
    return subsection;
  }

  public addEntry = (entry: Entry) => {
    this.entries.push(entry);
    return this;
  }

  public setFirstObjNum = (firstObjNum: number) => {
    validate(firstObjNum, _.isNumber, 'firstObjNum must be a number');
    this.firstObjNum = firstObjNum;
    return this;
  }

  public toString = (): string =>
    `${this.firstObjNum} ${this.entries.length}\n` +
    `${this.entries.map(String).join('')}\n`

  public bytesSize = () =>
    `${this.firstObjNum} ${this.entries.length}\n`.length +
    _(this.entries)
      .map((e) => e.bytesSize())
      .sum()
}

export class Table {
  public subsections: Subsection[] = [];

  public static from = (subsections: Subsection[]) => {
    validateArr(
      subsections,
      isInstance(Subsection),
      'subsections must be an array of PDFXRef.Subsection',
    );

    const table = new Table();
    table.subsections = subsections;
    return table;
  }

  public addSubsection = (subsection: Subsection) => {
    this.subsections.push(subsection);
    return this;
  }

  public toString = (): string =>
    `xref\n${this.subsections.map(String).join('\n')}\n`

  public bytesSize = () =>
    5 + // "xref\n"
    _(this.subsections)
      .map((ss) => ss.bytesSize() + 1)
      .sum()

  public copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer('xref\n', buffer);
    this.subsections.map(String).forEach((subsectionStr) => {
      remaining = addStringToBuffer(`${subsectionStr}\n`, remaining);
    });
    return remaining;
  }
}

const PDFXRef = {
  Table,
  Subsection,
  Entry,
};

export default PDFXRef;
