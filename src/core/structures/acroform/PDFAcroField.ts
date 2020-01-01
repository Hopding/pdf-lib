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
    return this.getInheritableAttribute(PDFName.FT, PDFName);
  }

  Parent(): PDFNonTerminalField | undefined {
    const parentDict = this.dict.lookupMaybe(PDFName.Parent, PDFDict);
    if (!parentDict) return undefined;
    return PDFNonTerminalField.fromDict(parentDict);
  }

  Kids(): PDFAcroField[] | PDFDict[] | undefined {
    const kidDicts = this.dict
      .lookupMaybe(PDFName.Kids, PDFArray)
      ?.lookupElements(PDFDict);
    if (!kidDicts) return undefined;
    if (this instanceof PDFTerminalField) {
      return kidDicts;
    }
    const kidsAcroFields = new Array<PDFAcroField>(kidDicts.length);
    for (let idx = 0, len = kidDicts.length; idx < len; idx++) {
      kidsAcroFields[idx] = PDFAcroField.fromDict(kidDicts[idx]);
    }
    return kidsAcroFields;
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

  Ff(): PDFNumber {
    const ownFieldFlags = this.dict.lookupMaybe(PDFName.Ff, PDFNumber);
    const fieldFlags =
      ownFieldFlags || this.getInheritableAttribute(PDFName.Ff, PDFNumber);
    return fieldFlags || PDFNumber.of(0);
  }

  V(): PDFObject | undefined {
    return this.getInheritableAttribute(PDFName.V);
  }

  DV(): PDFObject | undefined {
    return this.getInheritableAttribute(PDFName.DV);
  }

  AA(): PDFDict | undefined {
    return this.dict.lookupMaybe(PDFName.of('AA'), PDFDict);
  }

  getInheritableAttribute(name: PDFName): PDFObject | undefined;
  getInheritableAttribute(name: PDFName, type: typeof PDFName): PDFName;
  getInheritableAttribute(name: PDFName, type: typeof PDFNumber): PDFNumber;

  getInheritableAttribute(name: PDFName, type?: any): PDFObject | undefined {
    let attribute: PDFObject | undefined;
    this.ascend((node) => {
      if (!(type || attribute)) attribute = node.dict.lookup(name);
      else if (!attribute) attribute = node.dict.lookupMaybe(name, type);
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
