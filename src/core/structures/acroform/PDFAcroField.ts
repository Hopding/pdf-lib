import {
  PDFArray,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFString,
} from 'src/core';
import { PDFNonTerminalField, PDFTerminalField } from './internal';

export const acroFormFieldTypes = [
  PDFName.Btn,
  PDFName.Ch,
  PDFName.Tx,
  PDFName.Sig,
];

class PDFAcroField {
  static fromDict(dict: PDFDict): PDFAcroField {
    const kids = PDFName.of('Kids');
    const isTerminal = !dict.lookup(kids);
    if (isTerminal) {
      return PDFTerminalField.fromDict(dict);
    }
    return PDFNonTerminalField.fromDict(dict);
  }

  readonly dict: PDFDict;

  protected constructor(dict: PDFDict) {
    this.dict = dict;
  }

  FT(): PDFName | undefined {
    return this.dict.lookup(PDFName.FT, PDFName);
  }

  Parent(): PDFDict | undefined {
    return this.dict.lookupMaybe(PDFName.of('Parent'), PDFDict);
  }

  Kids(): PDFArray | undefined {
    return this.dict.lookupMaybe(PDFName.of('Kids'), PDFArray);
  }

  T(): PDFString | undefined {
    return this.dict.lookupMaybe(PDFName.of('T'), PDFString);
  }

  TU(): PDFString | undefined {
    return this.dict.lookupMaybe(PDFName.of('TU'), PDFString);
  }

  TM(): PDFString | undefined {
    return this.dict.lookupMaybe(PDFName.of('TM'), PDFString);
  }

  Ff(): PDFNumber | undefined {
    return this.dict.lookupMaybe(PDFName.of('Ff'), PDFNumber);
  }

  V(): PDFObject | undefined {
    return this.dict.lookup(PDFName.of('V'));
  }

  DV(): PDFObject | undefined {
    return this.dict.lookup(PDFName.of('DV'));
  }

  AA(): PDFDict | undefined {
    return this.dict.lookupMaybe(PDFName.of('AA'), PDFDict);
  }
}

export default PDFAcroField;
