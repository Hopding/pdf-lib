import { PDFDict } from 'src/core';
import { PDFTerminalField } from './index';

class PDFAcroText extends PDFTerminalField {
  static fromDict(dict: PDFDict): PDFAcroText {
    return new PDFAcroText(dict);
  }
}

export default PDFAcroText;
