import {
  PDFAnnotation,
  PDFArray,
  PDFDict,
  PDFName,
} from 'src/core';
import { PDFAcroButton } from './index';

class PDFRadioButton extends PDFAcroButton {
  static fromDict(dict: PDFDict): PDFRadioButton {
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
    return !!(this.getFlags() & (1 << 14));
  }

  RadiosInUnison(): boolean {
    return !!(this.getFlags() & (1 << 25));
  }

  Kids(): PDFArray {
    return this.dict.lookup(PDFName.Kids, PDFArray);
  }

  getKids(): PDFDict[] {
      return this.Kids().lookupElements(PDFDict);
  }

  getValue(): PDFName {
    const value = this.dict.lookup(PDFName.V);
    if (!value) {
      return PDFName.Off;
    }
    return this.dict.lookup(PDFName.V, PDFName);
  }

  _getChildOnAppearanceState(index: number): PDFName {
    const kids = this.getKids();
    const childAnnotation = PDFAnnotation.fromDict(kids[index]);
    const childAnnotationNormalAppearanceDict = childAnnotation.dict.lookup(PDFName.AP, PDFDict).lookup(PDFName.N, PDFDict);
    const childAnnotationNormalOnAppearance = childAnnotationNormalAppearanceDict.entries().filter(entry => entry[0] !== PDFName.Off)[0][0];
    return childAnnotationNormalOnAppearance;
  }

  _toggleChild(index: number): void {
   if (this.getValue() === PDFName.Off) {
    this.setValue(this._getChildOnAppearanceState(index));
   } else {
    this.setValue(PDFName.Off);
   }
  }

  toggle(index: number): void {
    const canToggle = !this.NoToggleToOff() || (this.NoToggleToOff() && this.getValue() === PDFName.Off);
    if (canToggle) {
      this._toggleChild(index);
    }
  }
}

export default PDFRadioButton;