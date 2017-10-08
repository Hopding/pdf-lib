import _ from 'lodash';

import { charCode, isString } from '../utils';
import PDFNameObject from './PDFNameObject';
import PDFString from './PDFString';
import dedent from 'dedent';

export class Entry {
  offset = null;
  generationNum = null;
  isInUse = null;

  setOffset = offset => {
    this.offset = offset;
    return this;
  };

  setGenerationNum = generationNum => {
    this.generationNum = generationNum;
    return this;
  };

  setIsInUse = isInUse => {
    this.isInUse = isInUse;
    return this;
  };

  toString = () =>
    `${_.padStart(String(this.offset), 10, '0')} ` +
    `${_.padStart(String(this.generationNum), 5, '0')} ` +
    `${this.isInUse ? 'n' : 'f'} \n`;
}

export class Subsection {
  entries = [];
  firstObjNum = null;

  addEntry = entry => {
    this.entries.push(entry);
    return this;
  };

  setFirstObjNum = firstObjNum => {
    this.firstObjNum = firstObjNum;
    return this;
  };

  getLastEntry = () => _(this.entries).last();
  getEntry = idx => this.entries[idx];

  toString = () =>
    dedent(`
    ${this.firstObjNum} ${this.entries.length}
    ${this.entries.map(String).join('')}
  `);
}

/*
Represents a PDF Cross-Reference Table.

From PDF 1.7 Specification, "7.5.4 Cross-Reference Table"
(http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/PDF32000_2008.pdf):

  The cross-reference table contains information that permits random access to indirect objects within the file so that the entire file need not be read to locate any particular object. The table shall contain a one-line entry for each indirect object, specifying the byte offset of that object within the body of the file. (Beginning with PDF 1.5, some or all of the cross-reference information may alternatively be contained in cross-reference streams; see 7.5.8, "Cross-Reference Streams.")

  The table comprises one or more cross-reference sections. Initially, the entire table consists of a single section (or two sections if the file is linearized; see Annex F). One additional section shall be added each time the file is incrementally updated (see 7.5.6, "Incremental Updates").
*/
class Table {
  subsections = [];

  addSubsection = subsection => {
    this.subsections.push(subsection);
    return this;
  };

  getLastSubsection = () => _.last(this.subsections);

  getUsedObjNums = () => {
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
}

const PDFCrossRef = {
  Table,
  Subsection,
  Entry,
};

export default PDFCrossRef;
