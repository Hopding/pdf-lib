import {
  PDFCrossRefTable,
  PDFTrailer,
} from './PDFObjects';
import _ from 'lodash';

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
  this.indirectObjects = [];
  this.pagesObj = PDFIndirectObject(2, 0);
  this.root =  PDFIndirectObject(1, 0, {
    'Type': PDFNameObject('Catalog'),
    'Pages': pagesObj,
  });
  this.crossRefTable = [[ this.root.objectNum, [[0, 65535, false]] ]];

  addIndirectObject = (obj) => {
    this.indirectObjects.push(obj);
    const offset = _.last(this.crossRefTable[0][1])[0] + obj.toString().length;
    this.crossRefTable[0][1].push([offset, 0, true]);
    return this;
  };

  crossRefTableOffset = () => {};

  toString = () =>
    `%PDF-1.7\n` +
    `${this.indirectObjects}\n` +
    `${PDFCrossRefTable(this.crossRefTable)}\n` +
    `${PDFTrailer({
        'Size': this.indirectObjects.length, // Fine until start doing modification
        'Root': this.root,
      }, this.crossRefTableOffset())}`;
}

export default (...args) => new PDFDocument(...args);
