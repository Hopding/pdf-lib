import {
  PDFCrossRef,
  PDFTrailer,
  PDFArrayObject,
  PDFNameObject,
} from './PDFObjects';
import { PDFIndirectObject } from './PDFObjects/PDFIndirectObject';
import _ from 'lodash';
import dedent from 'dedent';

/*
Represents a PDF Page Tree Node.

From PDF 1.7 Specification, "7.3.3 Page Tree"
(http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/PDF32000_2008.pdf):
  The pages of a document are accessed through a structure known as the page tree, which defines the ordering of pages in the document. Using the tree structure, conforming readers using only limited memory, can quickly open a document containing thousands of pages. The tree contains nodes of two types—intermediate nodes, called page tree nodes, and leaf nodes, called page objects—whose form is described in the subsequent sub- clauses. Conforming products shall be prepared to handle any form of tree structure built of such nodes.

  NOTE: The simplest structure can consist of a single page tree node that references all of the document’s page objects directly. However, to optimize application performance, a conforming writer can construct trees of a particular form, known as balanced trees. Further information on this form of tree can be found in Data Structures and Algorithms, by Aho, Hopcroft, and Ullman (see the Bibliography).
*/
class PDFPageTree extends PDFIndirectObject {
  pagesArrayObj = PDFArrayObject();
  content = {};

  constructor(...args) {
    super(...args);
    this.content = {
      Type: PDFNameObject('Pages'),
      Kids: this.pagesArrayObj,
      Count: 0,
    };
  }

  addPage = pageObj => {
    this.pagesArrayObj.push(pageObj.toIndirectRef());
    this.content.Count += 1;
    return this;
  };
}

export default (...args) => new PDFPageTree(...args);
