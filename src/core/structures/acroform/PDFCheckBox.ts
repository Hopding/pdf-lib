import { PDFArray, PDFDict, PDFName } from 'src/core';
import { PDFAcroButton } from './index';

class PDFCheckBox extends PDFAcroButton {
  static fromDict(dict: PDFDict): PDFCheckBox {
    return new PDFCheckBox(dict);
  }

  protected constructor(dict: PDFDict) {
    super(dict);
    this.unsetFlag(16);
    this.unsetFlag(17);
  }

  Opt(): PDFArray | undefined {
    return this.dict.lookupMaybe(PDFName.Opt, PDFArray);
  }

  getOptions(): PDFName[] {
    const optionsArray = this.Opt();
    return optionsArray ? optionsArray.lookupElements(PDFName) : [];
  }

  check(): void {
    this.dict.set(PDFName.V, PDFName.Yes);
  }

  uncheck(): void {
    this.dict.set(PDFName.V, PDFName.Off);
  }

  toggle(): void {
    const value = this.getValue();
    if (value === PDFName.Yes) {
      this.uncheck();
    } else {
      this.check();
    }
  }

  setValue(value: PDFName): void {
    this.dict.set(PDFName.V, value);
  }
}

export default PDFCheckBox;
