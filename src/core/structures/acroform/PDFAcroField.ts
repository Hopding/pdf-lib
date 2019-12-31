import {
  PDFArray,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFString,
} from 'src/core';
import { PDFNonTerminalField, PDFTerminalField } from './index';

export const acroFormFieldTypes = [
  PDFName.Btn,
  PDFName.Ch,
  PDFName.Tx,
  PDFName.Sig,
];

class PDFAcroField {
  static fromDict(dict: PDFDict): PDFAcroField {
    const kids = PDFName.Kids;
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

  Parent(): PDFAcroField | undefined {
    const parentDict = this.dict.lookupMaybe(PDFName.Parent, PDFDict);
    if (!parentDict) return undefined;
    return PDFAcroField.fromDict(parentDict);
  }

  Kids(): PDFAcroField[] | PDFDict[] | undefined {
    return this.dict
      .lookupMaybe(PDFName.Kids, PDFArray)
      ?.lookupElements(PDFDict);
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

  getInheritableAttribute(name: PDFName): PDFObject | undefined {
    let attribute: PDFObject | undefined;
    this.ascend((node) => {
      if (!attribute) attribute = node.dict.get(name);
    });
    return attribute;
  }

  ascend(visitor: (node: PDFAcroField) => any): void {
    visitor(this);
    const Parent = this.Parent();
    if (Parent) Parent.ascend(visitor);
  }
}

export default PDFAcroField;
