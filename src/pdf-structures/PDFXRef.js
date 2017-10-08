/* @flow */
import _ from 'lodash';
import dedent from 'dedent';
import { charCodes } from '../utils';

export class Entry {
  offset = null;
  generationNum = null;
  isInUse = null;

  setOffset = (offset: number) => {
    this.offset = offset;
    return this;
  };

  setGenerationNum = (generationNum: number) => {
    this.generationNum = generationNum;
    return this;
  };

  setIsInUse = (isInUse: boolean) => {
    this.isInUse = isInUse;
    return this;
  };

  toString = () =>
    `${_.padStart(String(this.offset), 10, '0')} ` +
    `${_.padStart(String(this.generationNum), 5, '0')} ` +
    `${this.isInUse ? 'n' : 'f'} \n`;
}

export class Subsection {
  entries: Array<Entry> = [];
  firstObjNum: number;

  addEntry = (entry: Entry) => {
    this.entries.push(entry);
    return this;
  };

  setFirstObjNum = (firstObjNum: number) => {
    this.firstObjNum = firstObjNum;
    return this;
  };

  getLastEntry = () => _(this.entries).last();
  getEntry = (idx: number) => this.entries[idx];

  toString = () =>
    dedent(`
    ${this.firstObjNum} ${this.entries.length}
    ${this.entries.map(String).join('')}
  `);
}

class Table {
  subsections: Array<Subsection> = [];

  addSubsection = (subsection: Subsection) => {
    this.subsections.push(subsection);
    return this;
  };

  getLastSubsection = () => _.last(this.subsections);

  getUsedObjectNumbers = () => {
    const usedObjNums = new Set();
    this.subsections.forEach(({ firstObjNum, entries }) => {
      _.range(firstObjNum, entries.length).forEach(n => {
        usedObjNums.add(n);
      });
    });
    return usedObjNums;
  };

  toString = () =>
    dedent(`
    xref
    ${this.subsections.map(String).join('\n')}
  `);

  toBytes = (): Uint8Array => new Uint8Array(charCodes(this.toString()));
}

const PDFXRef = {
  Table,
  Subsection,
  Entry,
};

export default PDFXRef;
