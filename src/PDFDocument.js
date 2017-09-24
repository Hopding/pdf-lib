import {
  PDFCrossRef,
  PDFTrailer,
} from './PDFObjects';
import _ from 'lodash';
import dedent from 'dedent';

/*
Represents a PDF Document.

From PDF 1.7 Specification, "7.5 File Structure"
(http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/PDF32000_2008.pdf):

  This sub-clause describes how objects are organized in a PDF file for efficient random access and incremental update. A basic conforming PDF file shall be constructed of following four elements (see Figure 2):
    • A one-line header identifying the version of the PDF specification to which the file conforms
    • A body containing the objects that make up the document contained in the file
    • A cross-reference table containing information about the indirect objects in the file
    • A trailer giving the location of the cross-reference table and of certain special objects within the body of the file
  This initial structure may be modified by later updates, which append additional elements to the end of the file; see 7.5.6, "Incremental Updates," for details.
*/
class PDFDocument {
  fileHeader = '%PDF-1.7\n';
  indirectObjects = [];

  // pagesObj = PDFIndirectObject(2, 0);
  //
  // root =  PDFIndirectObject(1, 0, {
  //   'Type': PDFNameObject('Catalog'),
  //   'Pages': pagesObj,
  // });
  root = null;

  // crossRefTable = [[ this.root.objectNum, [[0, 65535, false]] ]];
  crossRefTable = null;

  constructor() {
    this.crossRefTable = new PDFCrossRef.Table();

    // Initialize the cross reference table with a subsection, and
    // add the first entry.
    const initialEntry = new PDFCrossRef.Entry()
      .setGenerationNum(0)
      .setOffset(65535)
      .setIsInUse(false);
    this.crossRefTable.addSubsection(
      new PDFCrossRef.Subsection()
        .setFirstObjNum(0)
        .addEntry(initialEntry)
    );
  }

  setRootObject = (rootObj) => {
    this.root = rootObj;
    this.addIndirectObject(rootObj);
    return this;
  }

  addIndirectObject = (obj) => {
    // Update the cross reference table
    let offset;
    if (this.indirectObjects.length === 0) {
      offset = this.fileHeader.length;
    } else {
      offset = this.crossRefTable
        .getLastSubsection()
        .getLastEntry().offset;
      offset += _.last(this.indirectObjects).toString().length;
    }

    const newEntry = new PDFCrossRef.Entry()
      .setGenerationNum(0)
      .setOffset(offset)
      .setIsInUse(true);
    this.crossRefTable.getLastSubsection().addEntry(newEntry);

    // Add the indirect object
    this.indirectObjects.push(obj);

    return this;
  };

  toString = () => {
    const headerAndObjects = dedent(`
      ${this.fileHeader}
      ${this.indirectObjects.map(String).join('')}
    `) + '\n\n';

    return dedent(`
      ${headerAndObjects}${this.crossRefTable}
      ${PDFTrailer({
          'Size': this.indirectObjects.length, // Fine until start doing modification
          'Root': this.root,
        }, headerAndObjects.length)}
    `);
  }
}

export default (...args) => new PDFDocument(...args);
