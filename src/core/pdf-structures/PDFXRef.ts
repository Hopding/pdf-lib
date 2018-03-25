/* tslint:disable:max-classes-per-file */
import _ from 'lodash';

import { addStringToBuffer } from 'utils';
import { isInstance, validate, validateArr } from 'utils/validate';

export class Entry {
  static create = () => new Entry();

  offset: number = null;
  generationNum: number = null;
  isInUse: boolean = null;

  setOffset = (offset: number) => {
    validate(offset, _.isNumber, 'offset must be a number');
    this.offset = offset;
    return this;
  };

  setGenerationNum = (generationNum: number) => {
    validate(generationNum, _.isNumber, 'generationNum must be a number');
    this.generationNum = generationNum;
    return this;
  };

  setIsInUse = (isInUse: boolean) => {
    validate(isInUse, _.isBoolean, 'isInUse must be a boolean');
    this.isInUse = isInUse;
    return this;
  };

  toString = (): string =>
    `${_.padStart(String(this.offset), 10, '0')} ` +
    `${_.padStart(String(this.generationNum), 5, '0')} ` +
    `${this.isInUse ? 'n' : 'f'} \n`;

  bytesSize = () => this.toString().length;
}

export class Subsection {
  static from = (entries: Entry[]) => {
    validateArr(
      entries,
      isInstance(Entry),
      'PDFXRef.Subsection.entries must be an array of PDFXRef.Entry',
    );

    const subsection = new Subsection();
    subsection.entries = entries;
    return subsection;
  };

  entries: Entry[] = [];
  firstObjNum: number;

  addEntry = (entry: Entry) => {
    this.entries.push(entry);
    return this;
  };

  setFirstObjNum = (firstObjNum: number) => {
    validate(firstObjNum, _.isNumber, 'firstObjNum must be a number');
    this.firstObjNum = firstObjNum;
    return this;
  };

  toString = (): string =>
    `${this.firstObjNum} ${this.entries.length}\n` +
    `${this.entries.map(String).join('')}\n`;

  bytesSize = () =>
    `${this.firstObjNum} ${this.entries.length}\n`.length +
    _(this.entries)
      .map((e) => e.bytesSize())
      .sum();
}

export class Table {
  static from = (subsections: Subsection[]) => {
    validateArr(
      subsections,
      isInstance(Subsection),
      'subsections must be an array of PDFXRef.Subsection',
    );

    const table = new Table();
    table.subsections = subsections;
    return table;
  };

  subsections: Subsection[] = [];

  addSubsection = (subsection: Subsection) => {
    this.subsections.push(subsection);
    return this;
  };

  toString = (): string =>
    `xref\n${this.subsections.map(String).join('\n')}\n`;

  bytesSize = () =>
    5 + // "xref\n"
    _(this.subsections)
      .map((ss) => ss.bytesSize() + 1)
      .sum();

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer('xref\n', buffer);
    this.subsections.map(String).forEach((subsectionStr) => {
      remaining = addStringToBuffer(`${subsectionStr}\n`, remaining);
    });
    return remaining;
  };
}

const PDFXRef = {
  Table,
  Subsection,
  Entry,
};

export default PDFXRef;
