import XRef from './PDFObjects/PDFCrossRefTable';
import PDFTrailer from './PDFObjects/PDFTrailer';
import PDFIndirectObject from './PDFObjects/PDFIndirectObject';
import PDFNameObject from './PDFObjects/PDFNameObject';
import dedent from 'dedent';
import _ from 'lodash';

class UpdatedPDFDocument {
  existingContent = null;
  existingTrailer = null;
  usedObjNums = new Set();
  existingPages = [];
  indirectObjects = [];
  existingObjs = {};
  currentObjectNumber = 1;
  fonts = {};

  setExistingContent = (content) => {
    this.existingContent = content + '\n';
    return this;
  }

  setExistingTrailer = (trailer) => {
    this.existingTrailer = trailer;
    return this;
  }

  setUsedObjNums = (usedObjNums) => {
    this.usedObjNums = usedObjNums;
    return this;
  }

  setExistingObjs = (indirectObjects) => {
    this.existingObjs = indirectObjects;
    return this;
  }

  gottenObjs = []; // TODO: Take this out - it is hacky
  getIndirectObject = (indirectObjRef) => {
    const o = this.existingObjs[indirectObjRef.toString()];
    if (!this.gottenObjs.includes(o.toIndirectRef())) {
      o.objectNum = null;
      this.addIndirectObject(o);
    }
    return o;
  }

  nextObjNum = () => {
    while (this.usedObjNums.has(this.currentObjectNumber)) {
      this.currentObjectNumber++;
    }
    return this.currentObjectNumber;
  }

  addIndirectObject = (obj) => {
    if (obj.objectNum === null) obj.objectNum = this.nextObjNum();
    this.usedObjNums.add(obj.objectNum);
    this.indirectObjects.push(obj);
    return this;
  };

  addExistingPage = (page) => {
    this.existingPages.push(page);
    return this;
  }

  getPage = (idx) => {
    const page = this.existingPages[idx];
    if (!this.indirectObjects.includes(page)) {
      this.indirectObjects.push(page);
      if (!this.fonts.F1) {
        this.fonts.F1 = PDFIndirectObject(null, 0, {
          'Type': PDFNameObject('Font'),
          'Subtype': PDFNameObject('Type1'),
          'Name': PDFNameObject('F1'),
          'BaseFont': PDFNameObject('Helvetica'),
          'Encoding': PDFNameObject('MacRomanEncoding'),
        });
        this.addIndirectObject(this.fonts.F1);
      }
      page.addFont('F1', this.fonts.F1);
    }
    return page;
  }

  generateCrossRefTable = () => {
    const xRefTable = new XRef.Table();

    // Initialize the cross reference table with a subsection, and
    // add the first entry.
    const initialEntry = new XRef.Entry()
      .setGenerationNum(0)
      .setOffset(65535)
      .setIsInUse(false);
    xRefTable.addSubsection(
      new XRef.Subsection()
        .setFirstObjNum(0)
        .addEntry(initialEntry)
    );

    // Add entries for indirect objects
    const objNums = [];
    const objNumToObj = {};
    this.indirectObjects.forEach(indirectObj => {
      const { objectNum } = indirectObj;
      objNums.push(objectNum);
      objNumToObj[objectNum] = indirectObj;
    })
    objNums.sort();

    let offset = this.existingContent.length;
    let subsection = new XRef.Subsection().setFirstObjNum(objNums[0]);
    xRefTable.addSubsection(subsection);
    objNums.forEach((num, idx) => {
      if (idx > 0 && num > objNums[idx - 1] + 1) {
        subsection = new XRef.Subsection().setFirstObjNum(num);
        xRefTable.addSubsection(subsection);
      }

      const entry = new XRef.Entry()
        .setGenerationNum(0)
        .setOffset(offset)
        .setIsInUse(true);
      subsection.addEntry(entry);
      offset += objNumToObj[num].toString().length;
    });

    return xRefTable;
  }

  generateTrailer = (offset) => {
    const trailerDict = this.existingTrailer.dictionary;
    trailerDict.Size = _.max([...this.usedObjNums]) + 1;
    trailerDict.Prev = this.existingTrailer.offset;
    return PDFTrailer(trailerDict, offset);
  }

  toString = () => {
    console.log('Indirect Objs')
    console.log(_.last(this.indirectObjects))
    const newBody = dedent(`
      ${this.existingContent}
      ${this.indirectObjects.map(String).join('')}
    `) + '\n';
    return dedent(`
      ${newBody}
      ${this.generateCrossRefTable()}
      ${this.generateTrailer(newBody.length)}
    `);
  }
}

export default UpdatedPDFDocument;
