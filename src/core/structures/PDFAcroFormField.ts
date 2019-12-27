import {
  PDFArray,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFString,
} from 'src/core';

const acroFormFieldTypes: Array<PDFObject | undefined> = [
  PDFName.Btn,
  PDFName.Ch,
  PDFName.Tx,
  PDFName.Sig,
];

class PDFAcroFormField {
  static fromDict(
    dict: PDFDict,
  ): PDFAcroFormField {
    const ft = PDFName.of('FT');
    const hasValidFieldType =
      dict.has(ft) && acroFormFieldTypes.includes(dict.get(ft));
    if (!hasValidFieldType) {
      throw new Error('Invalid PDFAcroFormField Type');
    }
    return new PDFAcroFormField(dict);
  }

  private readonly dict: PDFDict;

  protected constructor(dict: PDFDict) {
    this.dict = dict;
  }

  FT(): PDFName {
    return this.dict.lookup(PDFName.of('FT'), PDFName);
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

export default PDFAcroFormField;
