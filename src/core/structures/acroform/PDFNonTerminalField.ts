import { PDFDict } from 'src/index';
import { PDFAcroField } from './index';

class PDFNonTerminalField extends PDFAcroField {
  static fromDict(dict: PDFDict): PDFNonTerminalField {
    return new PDFNonTerminalField(dict);
  }

  readonly dict!: PDFDict;

  protected constructor(dict: PDFDict) {
    super(dict);
  }
}

export default PDFNonTerminalField;
