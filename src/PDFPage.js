import {
  PDFCrossRef,
  PDFTrailer,
  PDFNameObject,
  PDFStreamObject,
  PDFArrayObject,
  PDFDictionaryObject,
  PDFTextObject,
} from './PDFObjects';
import { PDFIndirectObject } from './PDFObjects/PDFIndirectObject';
import _ from 'lodash';
import dedent from 'dedent';


/*
Represents a PDF Page Tree Object (Leaf Node).

From PDF 1.7 Specification, "7.7.3.3 Page Objects"
(http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/PDF32000_2008.pdf):
  The leaves of the page tree are page objects, each of which is a dictionary specifying the attributes of a single page of the document. Table 30 shows the contents of this dictionary. The table also identifies which attributes a page may inherit from its ancestor nodes in the page tree, as described under 7.7.3.4, "Inheritance of Page Attributes." Attributes that are not explicitly identified in the table as inheritable shall not be inherited.
*/

class PDFPage extends PDFIndirectObject {
  parentDocument = null;
  contentStream = null;
  resources = {};
  fonts = {};

  constructor(objectNum, generationNum, parentDocument) {
    super(objectNum, generationNum);

    this.parentDocument = parentDocument;
    this.contentStream = PDFStreamObject(null, 0);
    this.resources.ProcSet = new PDFIndirectObject(null, 0, [
      PDFNameObject('PDF'),
      PDFNameObject('Text'),
    ]);
    this.resources.Font = PDFDictionaryObject(this.fonts);
    this.content = {
      'Type': PDFNameObject('Page'),
      'MediaBox': PDFArrayObject([0, 0, 612, 792]),
      'Contents': this.contentStream,
      'Resources': PDFDictionaryObject(this.resources),
    };

    parentDocument.addIndirectObject(this.contentStream);
    parentDocument.addIndirectObject(this.resources.ProcSet);
  }

  setParent = (pageTree) => {
    this.content.Parent = pageTree;
    return this;
  }

  addFont = (fontName, fontObj) => {
    this.fonts[fontName] = fontObj;
    return this;
  }

  text = (x, y, fontName, fontSize, text) => {
    const textObj = PDFTextObject()
      .setFont(PDFNameObject('F1'), fontSize)
      .moveText(x, y)
      .showText(text);
    this.contentStream.appendToStream(textObj);
    return this;
  }
}

export default PDFPage;
