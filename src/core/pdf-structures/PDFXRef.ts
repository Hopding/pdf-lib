/* tslint:disable:max-classes-per-file */
import add from 'lodash/add';
import isBoolean from 'lodash/isBoolean';
import isNumber from 'lodash/isNumber';
import padStart from 'lodash/padStart';

import { addStringToBuffer } from 'utils';
import { isInstance, validate, validateArr } from 'utils/validate';

export class Entry {
  static create = () => new Entry();

  offset: number;
  generationNum: number;
  isInUse: boolean = false;

  setOffset = (offset: number) => {
    validate(offset, isNumber, 'offset must be a number');
    this.offset = offset;
    return this;
  };

  setGenerationNum = (generationNum: number) => {
    validate(generationNum, isNumber, 'generationNum must be a number');
    this.generationNum = generationNum;
    return this;
  };

  setIsInUse = (isInUse: boolean) => {
    validate(isInUse, isBoolean, 'isInUse must be a boolean');
    this.isInUse = isInUse;
    return this;
  };

  toString = (): string =>
    `${padStart(String(this.offset), 10, '0')} ` +
    `${padStart(String(this.generationNum), 5, '0')} ` +
    `${this.isInUse ? 'n' : 'f'} \n`;

  bytesSize = () => this.toString().length;
}

export class Subsection {
  static from = (entries: Entry[] = []) => new Subsection(entries);

  entries: Entry[] = [];
  firstObjNum: number;

  constructor(entries: Entry[] = []) {
    validateArr(
      entries,
      isInstance(Entry),
      'PDFXRef.Subsection.entries must be an array of PDFXRef.Entry',
    );
    this.entries = entries;
  }

  addEntry = (entry: Entry) => {
    validate(
      entry,
      isInstance(Entry),
      '"entry" must be instance of PDFXRef.Entry',
    );

    this.entries.push(entry);
    return this;
  };

  setFirstObjNum = (firstObjNum: number) => {
    validate(firstObjNum, isNumber, 'firstObjNum must be a number');
    this.firstObjNum = firstObjNum;
    return this;
  };

  toString = (): string =>
    `${this.firstObjNum} ${this.entries.length}\n` +
    `${this.entries.map(String).join('')}`;

  bytesSize = (): number =>
    `${this.firstObjNum} ${this.entries.length}\n`.length +
    this.entries.map((e) => e.bytesSize()).reduce(add, 0);
}

export class Table {
  static from = (subsections: Subsection[] = []) => new Table(subsections);

  subsections: Subsection[] = [];

  constructor(subsections: Subsection[] = []) {
    validateArr(
      subsections,
      isInstance(Subsection),
      'subsections must be an array of PDFXRef.Subsection',
    );

    this.subsections = subsections;
  }

  addSubsection = (subsection: Subsection) => {
    validate(
      subsection,
      isInstance(Subsection),
      '"subsection" must be instance of PDFXRef.Subsection',
    );

    this.subsections.push(subsection);
    return this;
  };

  toString = (): string => `xref\n${this.subsections.map(String).join('\n')}\n`;

  bytesSize = (): number =>
    5 + this.subsections.map((ss) => ss.bytesSize() + 1).reduce(add, 0); // "xref\n"

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer('xref\n', buffer);
    this.subsections.map(String).forEach((subsectionStr) => {
      remaining = addStringToBuffer(`${subsectionStr}\n`, remaining);
    });
    return remaining;
  };
}
