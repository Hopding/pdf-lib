import {
  PDFAcroForm,
  PDFArray,
  PDFBool,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFString,
} from 'src/index';

describe('PDFAcroForm', () => {
  let context: PDFContext;
  let dict: Map<PDFName, PDFObject>;

  beforeEach(() => {
    context = PDFContext.create();
  });

  it('can return the Fields array', () => {
    const formField = PDFDict.fromMapWithContext(new Map(), context);
    const formFieldRef = context.register(formField);
    const fieldsArray = PDFArray.withContext(context);
    fieldsArray.push(formFieldRef);
    dict = new Map<PDFName, PDFObject>([[PDFName.of('Fields'), fieldsArray]]);
    const acroFormDict = PDFDict.fromMapWithContext(dict, context);
    const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
    expect(acroForm.Fields()).toEqual(fieldsArray);
  });

  it('can return the dereferenced Fields array', () => {
    const formField = PDFDict.fromMapWithContext(new Map(), context);
    const formFieldRef = context.register(formField);
    const fieldsArray = PDFArray.withContext(context);
    fieldsArray.push(formFieldRef);
    dict = new Map([[PDFName.of('Fields'), fieldsArray]]);
    const acroFormDict = PDFDict.fromMapWithContext(dict, context);
    const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
    const expectedArray = PDFArray.withContext(context);
    expectedArray.push(formField);
    const fieldDicts = acroForm.fieldDicts();
    expect(fieldDicts.length).toBe(1);
    expect(fieldDicts[0]).toEqual(formField);
  });

  describe('returns the NeedAppearances flag', () => {
    it('when it is undefined', () => {
      const acroFormDict = PDFDict.fromMapWithContext(dict, context);
      const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
      expect(acroForm.NeedsAppearances()).toBe(undefined);
    });

    it('when it is defined', () => {
      dict = new Map([[PDFName.of('NeedsAppearances'), PDFBool.True]]);
      const acroFormDict = PDFDict.fromMapWithContext(dict, context);
      const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
      expect(acroForm.NeedsAppearances()).toBe(PDFBool.True);
    });
  });

  describe('returns the SigFlags number', () => {
    it('when it is undefined', () => {
      const acroFormDict = PDFDict.fromMapWithContext(dict, context);
      const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
      expect(acroForm.SigFlags()).toBe(undefined);
    });

    it('when it is defined', () => {
      dict = new Map([[PDFName.of('SigFlags'), PDFNumber.of(1)]]);
      const acroFormDict = PDFDict.fromMapWithContext(dict, context);
      const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
      expect(acroForm.SigFlags()).toEqual(PDFNumber.of(1));
    });
  });

  describe('returns the resource dictionary', () => {
    it('when it is undefined', () => {
      const acroFormDict = PDFDict.fromMapWithContext(new Map(), context);
      const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
      expect(acroForm.DR()).toBe(undefined);
    });

    it('when it is defined', () => {
      const dr = PDFDict.withContext(context);
      dict = new Map([[PDFName.of('DR'), dr]]);
      const acroFormDict = PDFDict.fromMapWithContext(dict, context);
      const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
      expect(acroForm.DR()).toBe(dr);
    });
  });

  describe('returns the default appearance string', () => {
    it('when it is undefined', () => {
      const acroFormDict = PDFDict.fromMapWithContext(new Map(), context);
      const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
      expect(acroForm.DA()).toBe(undefined);
    });

    it('when it is defined', () => {
      const da = PDFString.of('da');
      dict = new Map([[PDFName.of('DA'), da]]);
      const acroFormDict = PDFDict.fromMapWithContext(dict, context);
      const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
      expect(acroForm.DA()).toBe(da);
    });
  });

  describe('returns the quadding number', () => {
    it('when it is undefined', () => {
      const acroFormDict = PDFDict.fromMapWithContext(new Map(), context);
      const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
      expect(acroForm.Q()).toBe(undefined);
    });

    it('when it is defined', () => {
      const q = PDFNumber.of(1);
      dict = new Map([[PDFName.of('Q'), q]]);
      const acroFormDict = PDFDict.fromMapWithContext(dict, context);
      const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
      expect(acroForm.Q()).toBe(q);
    });
  });

  describe('returns the XFA Form array or stream', () => {
    it('when it is undefined', () => {
      const acroFormDict = PDFDict.fromMapWithContext(new Map(), context);
      const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
      expect(acroForm.XFA()).toBe(undefined);
    });

    it('when it is defined', () => {
      const xfa = PDFArray.withContext(context);
      dict = new Map([[PDFName.of('XFA'), xfa]]);
      const acroFormDict = PDFDict.fromMapWithContext(dict, context);
      const acroForm = PDFAcroForm.fromDict(acroFormDict, context);
      expect(acroForm.XFA()).toBe(xfa);
    });
  });
});
