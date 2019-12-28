import { PDFDict } from 'src/core';
import { PDFTerminalField } from './index';

class PDFAcroButton extends PDFTerminalField {
  static fromDict(dict: PDFDict): PDFAcroButton {
    return new PDFAcroButton(dict);
  }
}

export default PDFAcroButton;
