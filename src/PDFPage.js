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
  // resources = {};
  // fonts = {};

  constructor(objectNum, generationNum, parentDocument, pdfDict, editable) {
    console.log('Creating new Page');
    super(objectNum, generationNum);
    this.parentDocument = parentDocument;

    if (editable) {
      this.contentStream = PDFStreamObject(null, 0);
      parentDocument.addIndirectObject(this.contentStream);
    }

    // if this is a new page
    if (!pdfDict) {
      const resources = PDFDictionaryObject({
        Font: PDFDictionaryObject({}),
        ProcSet: new PDFIndirectObject(null, 0, [
          PDFNameObject('PDF'),
          PDFNameObject('Text'),
        ]),
      });
      this.content = {
        Type: PDFNameObject('Page'),
        MediaBox: PDFArrayObject([0, 0, 612, 792]),
        Contents: this.contentStream,
        Resources: resources,
      };

      // parentDocument.addIndirectObject(this.contentStream);
      parentDocument.addIndirectObject(resources.get('ProcSet'));
    } else {
      // If this is an existing page
      // Need to make contents an array if it isn't already
      if (editable) {
        if (pdfDict.get('Contents').isPDFIndirectRefObject) {
          pdfDict.add(
            'Contents',
            PDFArrayObject([
              pdfDict.get('Contents'),
              this.contentStream.toIndirectRef(),
            ]),
          );
        }
      } else if (pdfDict.get('Contents').isPDFIndirectRefObject) {
        pdfDict.add('Contents', PDFArrayObject([pdfDict.get('Contents')]));
      }

      this.content = pdfDict.object;

      // TODO: Make sure ProcSet is up to date
    }
  }

  getResourcesDict = () => {
    if (this.content.Resources.isPDFIndirectRefObject) {
      const indirectObj = this.parentDocument.getIndirectObject(
        this.content.Resources,
      );
      const resourcesRef = this.content.Resources;
      resourcesRef.objectNum = indirectObj.objectNum;
      return indirectObj.content;
    }
    return this.content.Resources;
  };

  setParent = pageTree => {
    this.content.Parent = pageTree;
    return this;
  };

  addFont = (fontName, fontObj) => {
    console.log('RESOURCES DICT:', this.getResourcesDict());
    this.getResourcesDict()
      .get('Font')
      .add(fontName, fontObj);
    return this;
  };

  text = (x, y, fontName, fontSize, text) => {
    const textObj = PDFTextObject()
      .setFont(PDFNameObject('F1'), fontSize)
      .moveText(x, y)
      .showText(text);
    this.contentStream.appendToStream(textObj);
    return this;
  };
}

export default PDFPage;
