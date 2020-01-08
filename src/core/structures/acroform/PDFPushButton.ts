import { PDFDict } from 'src/core';
import { PDFAcroButton } from './index';

class PDFPushButton extends PDFAcroButton {
  static fromDict(dict: PDFDict): PDFAcroButton {
    return new PDFPushButton(dict);
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

export default PDFPushButton;
