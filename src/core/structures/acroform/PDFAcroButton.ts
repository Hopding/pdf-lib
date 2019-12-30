import { PDFDict, PDFName, PDFNumber } from 'src/core';
import { PDFTerminalField, PushButton } from './index';

class PDFAcroButton extends PDFTerminalField {
  static fromDict(dict: PDFDict): PDFAcroButton {
    const fieldFlags = dict.lookupMaybe(PDFName.Ff, PDFNumber)?.value() || 0;
    const isPushButton = !!(fieldFlags & (1 << 17));
    if (isPushButton) {
      return new PushButton(dict);
    }
    return new PDFAcroButton(dict);
  }
}

export default PDFAcroButton;
