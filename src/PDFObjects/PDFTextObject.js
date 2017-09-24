import { PDFString } from './PDFString';
import dedent from 'dedent';

/*
Represents a PDF Text Object.

From PDF 1.7 Specification, "9.4 Text Objects"
(http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/PDF32000_2008.pdf):

  A PDF text object consists of operators that may show text strings, move the text position, and set text state and certain other parameters. In addition, three parameters may be specified only within a text object and shall not persist from one text object to the next:
  • Tm , the text matrix
  • Tlm , the text line matrix
  • Trm, the text rendering matrix, which is actually just an intermediate result that combines the effects of text state parameters, the text matrix (Tm), and the current transformation matrix

  A text object begins with the BT operator and ends with the ET operator, as shown in the Example, and described in Table 107.

  EXAMPLE:
    BT
    ...Zero or more text operators or other allowed operators...
    ET
*/
class PDFTextObject {
  isPDFTextObject = true;

  constructor(content='') {
    this.content = content;
  }

  setContent = (content) => {
    this.content = content;
    return this;
  }

  addLine = (line) => {
    // Don't include newline at start of first line of content
    if (this.content) this.content += '\n';
    
    this.content += `${line}`;
    return this;
  }

  Tf = (fontName, fontSize) => this.addLine(`${fontName} ${fontSize} Tf`);
  setFont = this.Tf;

  Td = (x, y) => this.addLine(`${x} ${y} Td`);
  moveText = this.Td;

  Tj = (str) => this.addLine(`${PDFString(str)} Tj`);
  showText = this.Tj;

  toString = () => dedent(`
    BT
    ${this.content}
    ET
  `);
}

export default (...args) => new PDFTextObject(...args);
