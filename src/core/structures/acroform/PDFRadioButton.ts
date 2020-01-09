import { PDFArray, PDFDict, PDFName } from 'src/core';
import { PDFAcroButton } from './index';

class PDFRadioButton extends PDFAcroButton {
  static fromDict(dict: PDFDict): PDFAcroButton {
    return new PDFRadioButton(dict);
  }

  readonly dict!: PDFDict;

  protected constructor(dict: PDFDict) {
    super(dict);
  }

  Opt(): PDFArray | undefined {
    return this.dict.lookupMaybe(PDFName.Opt, PDFArray);
  }

  getOptions(): PDFName[] {
    const optionsArray = this.Opt();
    return optionsArray ? optionsArray.lookupElements(PDFName) : [];
  }

  NoToggleToOff(): boolean {
    return !!(this.getFlags() | (1 << 15));
  }

  RadiosInUnsion(): boolean {
    return !!(this.getFlags() | (1 << 26));
  }

  Kids(): PDFArray {
    return this.dict.lookup(PDFName.Kids, PDFArray);
  }

  getKids(): PDFDict[] {
      return this.Kids().lookupElements(PDFDict);
  }

  select(index: number): void {
      // TODO: Refactor to use annotation dictionary structure. See #309
      const kids = this.getKids();
      const selectedChild = kids[index];
      const childAppearanceDictionary = selectedChild.lookup(PDFName.AP, PDFDict);
      const childNormalAppearanceDict = childAppearanceDictionary.lookup(PDFName.N);
      const childNormalAppearanceOptions = childAppearanceDictionary.entries();
      const childNormalAppearanceOnValue = childNormalAppearanceOptions.filter(option => option[0] !== PDFName.Off)[0][0];

      this.setValue();
  }
}

export default PDFRadioButton;