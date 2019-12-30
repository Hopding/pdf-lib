import { PDFArray, PDFDict, PDFName } from 'src/index';
import { PDFAcroField } from './index';

class PDFNonTerminalField extends PDFAcroField {
  static fromDict(dict: PDFDict): PDFNonTerminalField {
    return new PDFNonTerminalField(dict);
  }

  readonly dict!: PDFDict;

  protected constructor(dict: PDFDict) {
    super(dict);
  }

  Kids(): PDFAcroField[] {
    const kidsDicts = this.dict
      .lookup(PDFName.Kids, PDFArray)
      .lookupElements(PDFDict);
    const kidsAcroFields = new Array<PDFAcroField>(kidsDicts.length);
    for (let idx = 0, len = kidsDicts.length; idx < len; idx++) {
      kidsAcroFields[idx] = PDFAcroField.fromDict(kidsDicts[idx]);
    }
    return kidsAcroFields;
  }
}

export default PDFNonTerminalField;
