import {
  PDFAcroFormField,
  PDFArray,
  PDFBool,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFString,
} from 'src/core';
import { DictMap } from 'src/core/objects/PDFDict';
import PDFObject from '../objects/PDFObject';

class PDFAcroForm extends PDFDict {
  static fromMapWithContext(dict: DictMap, context: PDFContext): PDFAcroForm {
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
    return fieldRefs.map((fieldRef) =>
      this.context.lookup(fieldRef, PDFAcroFormField),
    );
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

  XFA(): PDFObject | undefined {
    return this.lookup(PDFName.of('XFA'));
  }
}

export default PDFAcroForm;
