import {
  PDFArray,
  PDFBool,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFString,
} from 'src/core';

class PDFAcroForm {
  static fromDict(dict: PDFDict): PDFAcroForm {
    if (!dict.has(PDFName.of('Fields'))) {
      dict.set(PDFName.of('Fields'), dict.context.obj([]));
    }
    return new PDFAcroForm(dict);
  }

  private readonly dict: PDFDict;

  protected constructor(dict: PDFDict) {
    this.dict = dict;
  }

  Fields(): PDFArray {
    return this.dict.lookup(PDFName.of('Fields'), PDFArray);
  }

  fieldDicts(): PDFDict[] {
    return this.Fields().lookupElements(PDFDict);
  }

  NeedsAppearances(): PDFBool | undefined {
    return this.dict.lookupMaybe(PDFName.of('NeedsAppearances'), PDFBool);
  }

  SigFlags(): PDFNumber | undefined {
    return this.dict.lookupMaybe(PDFName.of('SigFlags'), PDFNumber);
  }

  DR(): PDFDict | undefined {
    return this.dict.lookupMaybe(PDFName.of('DR'), PDFDict);
  }

  DA(): PDFString | undefined {
    return this.dict.lookupMaybe(PDFName.of('DA'), PDFString);
  }

  Q(): PDFNumber | undefined {
    return this.dict.lookupMaybe(PDFName.of('Q'), PDFNumber);
  }

  XFA(): PDFObject | undefined {
    return this.dict.lookup(PDFName.of('XFA'));
  }
}

export default PDFAcroForm;
