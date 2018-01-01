/* @flow */
import _ from 'lodash';
import dedent from 'dedent';
import { addStringToBuffer } from '../utils';
import { validate, validateArr, isInstance } from '../utils/validate';

export class Entry {
  offset = null;
  generationNum = null;
  isInUse = null;

  static create = () => new Entry();

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

  toString = () =>
    `${_.padStart(String(this.offset), 10, '0')} ` +
    `${_.padStart(String(this.generationNum), 5, '0')} ` +
    `${this.isInUse ? 'n' : 'f'} \n`;

  bytesSize = () => this.toString().length;
}

export class Subsection {
  entries: Entry[] = [];
  firstObjNum: number;

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

  addEntry = (entry: Entry) => {
    this.entries.push(entry);
    return this;
  };

  setFirstObjNum = (firstObjNum: number) => {
    validate(firstObjNum, _.isNumber, 'firstObjNum must be a number');
    this.firstObjNum = firstObjNum;
    return this;
  };

  toString = () =>
    dedent(`
    ${this.firstObjNum} ${this.entries.length}
    ${this.entries.map(String).join('')}
  `);

  bytesSize = () =>
    `${this.firstObjNum} ${this.entries.length}\n`.length +
    _(this.entries)
      .map(e => e.bytesSize())
      .sum();
}

class Table {
  subsections: Subsection[] = [];

  static from = (subsections: Subsection[]) => {
    validateArr(
      subsections,
      isInstance(Subsection),
      'PDFXRef.Table.subsections must be an array of PDFXRef.Subsection',
    );

    const table = new Table();
    table.subsections = subsections;
    return table;
  };

  addSubsection = (subsection: Subsection) => {
    this.subsections.push(subsection);
    return this;
  };

  toString = () =>
    `${dedent(`
    xref
    ${this.subsections.map(String).join('\n')}
  `)}\n`;

  bytesSize = () =>
    5 + // "xref\n"
    _(this.subsections)
      .map(ss => ss.bytesSize() + 1)
      .sum();

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer('xref\n', buffer);
    this.subsections.map(String).forEach(subsectionStr => {
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
