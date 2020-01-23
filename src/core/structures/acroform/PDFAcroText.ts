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
    return !!(this.getFlags() & (1 << 12));
  }

  isPassword(): boolean {
    return !!(this.getFlags() & (1 << 13));
  }

  isFileSelect(): boolean {
    return !!(this.getFlags() & (1 << 20));
  }

  isSpellChecked(): boolean {
    return !(this.getFlags() & (1 << 22));
  }

  isScrollable(): boolean {
    return !(this.getFlags() & (1 << 23));
  }

  isCombed(): boolean {
    return !!(this.getFlags() & (1 << 24));
  }

  isRichText(): boolean {
    return !!(this.getFlags() & (1 << 25));
  }
}

export default PDFAcroText;
