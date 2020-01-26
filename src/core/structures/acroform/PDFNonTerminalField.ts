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

  getKids(): PDFAcroField[] | undefined {
    const kidDicts = this.Kids()?.lookupElements(PDFDict);
    return kidDicts?.map((childDict) => PDFAcroField.fromDict(childDict));
  }
}

export default PDFNonTerminalField;
