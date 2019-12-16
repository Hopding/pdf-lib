import {
  PDFArray,
  PDFBool,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFStream,
  PDFString,
} from 'src/core';

class PDFAcroForm extends PDFDict {
  static fromMapWithContext(
    dict: Map<PDFName, PDFObject>,
    context: PDFContext,
  ): PDFAcroForm {
    return new PDFAcroForm(dict, context);
  }

  protected constructor(map: Map<PDFName, PDFObject>, context: PDFContext) {
    super(map, context);
  }

  get Fields(): PDFArray {
    return this.lookup(PDFName.of('Fields'), PDFArray);
  }

  get NeedsAppearances(): PDFBool | undefined {
    return this.get(PDFName.of('NeedsAppearances')) as PDFBool;
  }

  get SigFlags(): PDFNumber | undefined {
    return this.get(PDFName.of('SigFlags')) as PDFNumber;
  }

  get DR(): PDFDict | undefined {
    return this.get(PDFName.of('DR')) as PDFDict;
  }

  get DA(): PDFString | undefined {
    return this.get(PDFName.of('DA')) as PDFString;
  }

  get Q(): PDFNumber | undefined {
    return this.get(PDFName.of('Q')) as PDFNumber;
  }

  get XFA(): PDFArray | PDFStream | undefined {
    return this.get(PDFName.of('XFA')) as PDFArray | PDFStream | undefined;
  }
}

export default PDFAcroForm;
