import { PDFDict, PDFName } from 'src/core';
import {
  acroFormFieldTypes,
  PDFAcroButton,
  PDFAcroChoice,
  PDFAcroField,
  PDFAcroText,
} from './index';

class PDFTerminalField extends PDFAcroField {
  static fromDict(dict: PDFDict): PDFTerminalField {
    const fieldType = dict.lookup(PDFName.FT, PDFName);
    switch (fieldType) {
      case PDFName.Btn:
        return PDFAcroButton.fromDict(dict);
      case PDFName.Tx:
        return PDFAcroText.fromDict(dict);
      case PDFName.Ch:
        return PDFAcroChoice.fromDict(dict);
      default:
        return new PDFTerminalField(dict);
    }
  }

  readonly dict!: PDFDict;

  protected constructor(dict: PDFDict) {
    super(dict);
    this.validateFieldType();
  }

  FT(): PDFName {
    return this.lookupMaybeInheritableAttribute(PDFName.FT, PDFName);
  }

  private validateFieldType() {
    const fieldType = this.FT();
    const hasValidFieldType = acroFormFieldTypes.includes(fieldType);
    if (!hasValidFieldType) {
      throw new Error('Invalid PDFAcroField Type');
    }
  }
}

export default PDFTerminalField;
