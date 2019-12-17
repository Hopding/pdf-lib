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

  it('returns the dereferenced Fields array', () => {
    const formField = PDFDict.fromMapWithContext(new Map(), context);
    const formFieldRef = context.register(formField);
    const fieldsArray = PDFArray.withContext(context);
    fieldsArray.push(formFieldRef);
    dict = new Map<PDFName, PDFObject>([[PDFName.of('Fields'), fieldsArray]]);
    const acroForm = PDFAcroForm.fromMapWithContext(dict, context);
    const expectedArray = PDFArray.withContext(context);
    expectedArray.push(formField);
    expect(acroForm.Fields).toEqual(expectedArray);
  });

  describe('returns the NeedAppearances flag', () => {
    it('when it is undefined', () => {
      const acroForm = PDFAcroForm.fromMapWithContext(new Map(), context);
      expect(acroForm.NeedsAppearances).toBe(undefined);
    });

    it('when it is defined', () => {
      dict = new Map([[PDFName.of('NeedsAppearances'), PDFBool.True]]);
      const acroForm = PDFAcroForm.fromMapWithContext(dict, context);
      expect(acroForm.NeedsAppearances).toBe(PDFBool.True);
    });
  });

  describe('returns the SigFlags number', () => {
    it('when it is undefined', () => {
      const acroForm = PDFAcroForm.fromMapWithContext(new Map(), context);
      expect(acroForm.SigFlags).toBe(undefined);
    });

    it('when it is defined', () => {
      dict = new Map([[PDFName.of('SigFlags'), PDFNumber.of(1)]]);
      const acroForm = PDFAcroForm.fromMapWithContext(dict, context);
      expect(acroForm.SigFlags).toEqual(PDFNumber.of(1));
    });
  });

  describe('returns the resource dictionary', () => {
    it('when it is undefined', () => {
      const acroForm = PDFAcroForm.fromMapWithContext(new Map(), context);
      expect(acroForm.DR).toBe(undefined);
    });

    it('when it is defined', () => {
      const dr = PDFDict.withContext(context);
      dict = new Map([[PDFName.of('DR'), dr]]);
      const acroForm = PDFAcroForm.fromMapWithContext(dict, context);
      expect(acroForm.DR).toBe(dr);
    });
  });

  describe('returns the default appearance string', () => {
    it('when it is undefined', () => {
      const acroForm = PDFAcroForm.fromMapWithContext(new Map(), context);
      expect(acroForm.DA).toBe(undefined);
    });

    it('when it is defined', () => {
      const da = PDFString.of('da');
      dict = new Map([[PDFName.of('DA'), da]]);
      const acroForm = PDFAcroForm.fromMapWithContext(dict, context);
      expect(acroForm.DA).toBe(da);
    });
  });

  describe('returns the quadding number', () => {
    it('when it is undefined', () => {
      const acroForm = PDFAcroForm.fromMapWithContext(new Map(), context);
      expect(acroForm.Q).toBe(undefined);
    });

    it('when it is defined', () => {
      const q = PDFNumber.of(1);
      dict = new Map([[PDFName.of('Q'), q]]);
      const acroForm = PDFAcroForm.fromMapWithContext(dict, context);
      expect(acroForm.Q).toBe(q);
    });
  });

  describe('returns the XFA Form array or stream', () => {
    it('when it is undefined', () => {
      const acroForm = PDFAcroForm.fromMapWithContext(new Map(), context);
      expect(acroForm.XFA).toBe(undefined);
    });

    it('when it is defined', () => {
      const xfa = PDFArray.withContext(context);
      dict = new Map([[PDFName.of('XFA'), xfa]]);
      const acroForm = PDFAcroForm.fromMapWithContext(dict, context);
      expect(acroForm.XFA).toBe(xfa);
    });
  });
});
