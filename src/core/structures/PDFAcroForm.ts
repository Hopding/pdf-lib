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
    if (!dict.has(PDFName.of('Fields'))) {
      dict.set(PDFName.of('Fields'), context.obj([]));
    }
    return new PDFAcroForm(dict, context);
  }

  protected constructor(map: Map<PDFName, PDFObject>, context: PDFContext) {
    super(map, context);
  }

  Fields(): PDFArray {
    const fieldRefs = this.get(PDFName.of('Fields')) as PDFArray;
    return fieldRefs.map((fieldRef) => this.context.lookup(fieldRef, PDFDict));
  }

  get NeedsAppearances(): PDFBool | undefined {
    return this.lookupMaybe(PDFName.of('NeedsAppearances'), PDFBool);
  }

  get SigFlags(): PDFNumber | undefined {
    return this.lookupMaybe(PDFName.of('SigFlags'), PDFNumber);
  }

  get DR(): PDFDict | undefined {
    return this.lookupMaybe(PDFName.of('DR'), PDFDict);
  }

  get DA(): PDFString | undefined {
    return this.lookupMaybe(PDFName.of('DA'), PDFString);
  }

  get Q(): PDFNumber | undefined {
    return this.lookupMaybe(PDFName.of('Q'), PDFNumber);
  }

  get XFA(): PDFArray | PDFStream | undefined {
    return this.lookup(PDFName.of('XFA')) as PDFArray | PDFStream | undefined;
  }
}

export default PDFAcroForm;
