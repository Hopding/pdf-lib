import { PDFDict, PDFName, PDFNumber, PDFObject } from 'src/core';
import { PDFTerminalField } from './index';

class PDFAcroText extends PDFTerminalField {
  static fromDict(dict: PDFDict): PDFAcroText {
    return new PDFAcroText(dict);
  }

  RV(): PDFObject | undefined {
    return this.dict.lookup(PDFName.RV);
  }

  MaxLen(): PDFNumber | undefined {
    return this.dict.lookupMaybe(PDFName.MaxLen, PDFNumber);
  }

  isMultiLine(): boolean {
    return !!(this.Ff().value() & (1 << 13));
  }

  isPassword(): boolean {
    return !!(this.Ff().value() & (1 << 14));
  }

  isFileSelect(): boolean {
    return !!(this.Ff().value() & (1 << 21));
  }

  isSpellChecked(): boolean {
    return !(this.Ff().value() & (1 << 23));
  }

  isScrollable(): boolean {
    return !(this.Ff().value() & (1 << 24));
  }

  isCombed(): boolean {
    return !!(this.Ff().value() & (1 << 25));
  }

  isRichText(): boolean {
    return !!(this.Ff().value() & (1 << 26));
  }
}

export default PDFAcroText;
