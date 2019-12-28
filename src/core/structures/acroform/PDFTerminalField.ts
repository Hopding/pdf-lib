import { PDFDict, PDFName } from 'src/core';
import { acroFormFieldTypes, PDFAcroField } from './index';

class PDFTerminalField extends PDFAcroField {
  static fromDict(dict: PDFDict): PDFTerminalField {
    const ft = PDFName.FT;
    const hasValidFieldType =
      dict.has(ft) && acroFormFieldTypes.includes(dict.lookup(ft, PDFName));
    if (!hasValidFieldType) {
      throw new Error('Invalid PDFAcroField Type');
    }
    return new PDFTerminalField(dict);
  }

  readonly dict!: PDFDict;

  protected constructor(dict: PDFDict) {
    super(dict);
  }

  FT(): PDFName {
    return this.dict.lookup(PDFName.FT, PDFName);
  }
}

export default PDFTerminalField;
