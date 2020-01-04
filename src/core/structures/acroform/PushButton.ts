import { PDFDict } from 'src/core';
import { PDFAcroButton } from './index';

class PushButton extends PDFAcroButton {
  static fromDict(dict: PDFDict): PDFAcroButton {
    return new PushButton(dict);
  }

  readonly dict!: PDFDict;

  protected constructor(dict: PDFDict) {
    super(dict);
  }

  V(): undefined {
    return undefined;
  }

  DV(): undefined {
    return undefined;
  }
}

export default PushButton;
