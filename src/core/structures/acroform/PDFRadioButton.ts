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
    return !!(this.getFlags() | (1 << 15));
  }

  RadiosInUnison(): boolean {
    return !!(this.getFlags() | (1 << 26));
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
   console.log(this.getValue());
   if (this.getValue() === PDFName.Off) {
    this.setValue(this._getChildOnAppearanceState(index));
   } else {
    this.setValue(PDFName.Off);
   }
  }

  _toggleInUnison(index: number): void {
    const childOnValues = this.getKids().map((_child, childIndex) => this._getChildOnAppearanceState(childIndex));
    const targetOnValue = childOnValues[index];
    childOnValues.forEach((onValue, childIndex) => {
      if (onValue === targetOnValue) {
        this._toggleChild(childIndex);
      }
    });
  }

  _toggleWithNoToggleToOff(index: number) {
    if (this.getValue() === PDFName.Off) {
      this._toggleChild(index);
    }
  }

  toggle(index: number): void {
    console.log(this.getFlags());
    if (this.RadiosInUnison() && this.NoToggleToOff()) {
      console.log("HERE");
      if (this.getValue() === PDFName.Off) {
        this._toggleInUnison(index);
      }
    } else if (this.RadiosInUnison()) {
      this._toggleInUnison(index);
    } else if (this.NoToggleToOff()) {
      this._toggleWithNoToggleToOff(index);
    } else {
      this._toggleChild(index);
    }
  }
}

export default PDFRadioButton;