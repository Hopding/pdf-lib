/* @flow */
import { PDFStream, PDFNumber } from '../pdf-objects';
import { PDFTextObject } from '.';

class PDFContentStream extends PDFStream {
  addLine = (str: string) => {
    if (this.locked) throw new Error('Cannot modify PDFStream - it is locked!');
    this.content += `${str}\n`;
    this.dictionary.set('Length', PDFNumber.fromNumber(this.content.length));
    return this;
  };

  beginText = () => this.addLine('BT');

  endText = () => this.addLine('ET');

  setFont = (fontName: string, fontSize: number) =>
    this.addLine(`/${fontName} ${fontSize} Tf`);

  moveText = (x: number, y: number) => this.addLine(`${x} ${y} Td`);

  // NEED TO LOOK INTO ESCAPING AND VALIDATING GIVEN STRING
  showText = (str: string) => this.addLine(`(${str}) Tj`);
}

export default PDFContentStream;
