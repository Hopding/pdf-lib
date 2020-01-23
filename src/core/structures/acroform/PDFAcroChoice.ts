import { PDFArray, PDFDict, PDFName, PDFNumber } from 'src/core';
import { PDFTerminalField } from './index';

class PDFAcroChoice extends PDFTerminalField {
  static fromDict(dict: PDFDict): PDFAcroChoice {
    return new PDFAcroChoice(dict);
  }

  Opt(): PDFArray | undefined {
    return this.dict.lookupMaybe(PDFName.Opt, PDFArray);
  }

  TI(): PDFNumber | undefined {
    return this.dict.lookupMaybe(PDFName.TI, PDFNumber);
  }

  I(): PDFArray | undefined {
    return this.dict.lookupMaybe(PDFName.I, PDFArray);
  }

  isCombo(): boolean {
    return !!(this.getFlags() & (1 << 17));
  }

  isEditable(): boolean {
    return !!(this.getFlags() & (1 << 18));
  }

  isSorted(): boolean {
    return !!(this.getFlags() & (1 << 19));
  }

  isMultiSelect(): boolean {
    return !!(this.getFlags() & (1 << 21));
  }

  isSpellChecked(): boolean {
    return !(this.getFlags() & (1 << 22));
  }

  isCommittedOnSelChange(): boolean {
    return !!(this.getFlags() & (1 << 26));
  }
}

export default PDFAcroChoice;
