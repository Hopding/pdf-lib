import {
  PDFArray,
  PDFBool,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFStream,
  PDFString,
  XFAResource,
} from 'src/core';
import { DictMap } from 'src/core/objects/PDFDict';

class PDFAcroForm extends PDFDict {
  static fromMapWithContext(
    dict: DictMap,
    context: PDFContext,
  ): PDFAcroForm {
    if (!dict.has(PDFName.of('Fields'))) {
      dict.set(PDFName.of('Fields'), context.obj([]));
    }
    return new PDFAcroForm(dict, context);
  }

  protected constructor(map: DictMap, context: PDFContext) {
    super(map, context);
  }

  Fields(): PDFArray {
    const fieldRefs = this.lookup(PDFName.of('Fields'), PDFArray);
    return fieldRefs.map((fieldRef) => this.context.lookup(fieldRef, PDFDict));
  }

  NeedsAppearances(): PDFBool | undefined {
    return this.lookupMaybe(PDFName.of('NeedsAppearances'), PDFBool);
  }

  SigFlags(): PDFNumber | undefined {
    return this.lookupMaybe(PDFName.of('SigFlags'), PDFNumber);
  }

  DR(): PDFDict | undefined {
    return this.lookupMaybe(PDFName.of('DR'), PDFDict);
  }

  DA(): PDFString | undefined {
    return this.lookupMaybe(PDFName.of('DA'), PDFString);
  }

  Q(): PDFNumber | undefined {
    return this.lookupMaybe(PDFName.of('Q'), PDFNumber);
  }

  XFA(): XFAResource | undefined {
    return this.lookupMaybe(PDFName.of('XFA'), PDFArray || PDFStream);
  }
}

export default PDFAcroForm;
