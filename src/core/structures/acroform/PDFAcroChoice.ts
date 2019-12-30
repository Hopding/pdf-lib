import { PDFDict } from 'src/core';
import { PDFTerminalField } from './index';

class PDFAcroChoice extends PDFTerminalField {
  static fromDict(dict: PDFDict): PDFAcroChoice {
    return new PDFAcroChoice(dict);
  }
}

export default PDFAcroChoice;
