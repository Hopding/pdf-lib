import { PDFDict, PDFName } from 'src/core';
import { acroFormFieldTypes, PDFAcroButton, PDFAcroField } from './index';

class PDFTerminalField extends PDFAcroField {
  static fromDict(dict: PDFDict): PDFTerminalField {
    const fieldType =  dict.lookup(PDFName.FT, PDFName);
    const hasValidFieldType = acroFormFieldTypes.includes(fieldType);
    if (!hasValidFieldType) {
      throw new Error('Invalid PDFAcroField Type');
    }
    if (fieldType === PDFName.Btn) {
      return PDFAcroButton.fromDict(dict);
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
