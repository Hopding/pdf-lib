import { PDFDict, PDFName } from 'src/core';
import { PDFTerminalField } from './index';

class PDFSignature extends PDFTerminalField {
  static fromDict(dict: PDFDict): PDFSignature {
    return new PDFSignature(dict);
  }

  readonly dict!: PDFDict;

  protected constructor(dict: PDFDict) {
    super(dict);
  }

  Lock(): PDFDict | undefined {
    return this.dict.lookupMaybe(PDFName.Lock, PDFDict);
  }

  SV(): PDFDict | undefined {
    return this.dict.lookupMaybe(PDFName.SV, PDFDict);
  }
}

export default PDFSignature;
