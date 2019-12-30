import {
  PDFDict,
  PDFName,
  PDFNumber
} from 'src/core';
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

  private static validateFieldType(fieldType: PDFName) {
    const hasValidFieldType = acroFormFieldTypes.includes(fieldType);
    if (!hasValidFieldType) {
      throw new Error('Invalid PDFAcroField Type');
    }
  }

  readonly dict!: PDFDict;

  protected constructor(dict: PDFDict) {
    const fieldType = dict.lookup(PDFName.FT, PDFName);
    PDFTerminalField.validateFieldType(fieldType);
    if (!dict.has(PDFName.Ff)) {
      dict.set(PDFName.Ff, dict.context.obj(0));
    }
    super(dict);
  }

  FT(): PDFName {
    return this.dict.lookup(PDFName.FT, PDFName);
  }

  Ff(): PDFNumber {
    return this.dict.lookup(PDFName.Ff, PDFNumber);
  }
}

export default PDFTerminalField;
