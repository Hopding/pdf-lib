import {
  DictMap,
  PDFAcroFormField,
  PDFArray,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFString,
} from 'src/index';

describe('PDFAcroFormField', () => {
  let context: PDFContext;
  let dict: DictMap;

  beforeEach(() => {
    context = PDFContext.create();
    dict = new Map<PDFName, PDFObject>([[PDFName.of('FT'), PDFName.Btn]]);
  });

  describe('can be constructed from PDFAcroFormField.fromMapWithContext', () => {
    it('with a valid field type', () => {
      dict = new Map<PDFName, PDFObject>([[PDFName.of('FT'), PDFName.Btn]]);
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.FT()).toBe(PDFName.Btn);
    });

    it('only with a valid field type', () => {
      dict = new Map<PDFName, PDFObject>([
        [PDFName.of('FT'), PDFName.of('InvalidFieldType')],
      ]);
      const createField = () =>
        PDFAcroFormField.fromMapWithContext(dict, context);
      expect(createField).toThrow(Error);
    });
  });

  it('returns the field type', () => {
    const field = PDFAcroFormField.fromMapWithContext(dict, context);
    expect(field.FT()).toBe(PDFName.Btn);
  });

  describe('returns the parent field dictionary', () => {
    it('when it is defined', () => {
      const parentDict = PDFDict.fromMapWithContext(
        new Map<PDFName, PDFObject>(),
        context,
      );
      dict.set(PDFName.of('Parent'), parentDict);
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.Parent()).toBe(parentDict);
    });

    it('when it is undefined', () => {
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.Parent()).toBe(undefined);
    });
  });

  describe('returns the Kids array', () => {
    it('when it is defined', () => {
      const kids = PDFArray.withContext(context);
      dict.set(PDFName.of('Kids'), kids);
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.Kids()).toBe(kids);
    });

    it('when it is undefined', () => {
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.Kids()).toBe(undefined);
    });
  });

  describe('returns the partial field name', () => {
    it('when it is defined', () => {
      const fieldName = PDFString.of('PersonalData');
      dict.set(PDFName.of('T'), fieldName);
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.T()).toEqual(fieldName);
    });

    it('when it is undefined', () => {
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.T()).toBe(undefined);
    });
  });

  describe('returns the alternative field name', () => {
    it('when it is defined', () => {
      const altFieldName = PDFString.of('PersonalData');
      dict.set(PDFName.of('TU'), altFieldName);
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.TU()).toEqual(altFieldName);
    });

    it('when it is undefined', () => {
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.TU()).toBe(undefined);
    });
  });

  describe('returns the mapping name', () => {
    it('when it is defined', () => {
      const mappingName = PDFString.of('MappingName');
      dict.set(PDFName.of('TM'), mappingName);
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.TM()).toEqual(mappingName);
    });

    it('when it is undefined', () => {
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.TM()).toBe(undefined);
    });
  });

  describe('returns the field flags', () => {
    it('when it is defined', () => {
      const flags = PDFNumber.of(1);
      dict.set(PDFName.of('Ff'), flags);
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.Ff()).toEqual(flags);
    });

    it('when it is undefined', () => {
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.Ff()).toBe(undefined);
    });
  });

  describe('returns the field value', () => {
    it('when it is defined', () => {
      const value = PDFNumber.of(1);
      dict.set(PDFName.of('V'), value);
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.V()).toEqual(value);
    });

    it('when it is undefined', () => {
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.V()).toBe(undefined);
    });
  });

  describe('returns the default value', () => {
    it('when it is defined', () => {
      const defaultValue = PDFNumber.of(1);
      dict.set(PDFName.of('DV'), defaultValue);
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.DV()).toEqual(defaultValue);
    });

    it('when it is undefined', () => {
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.DV()).toBe(undefined);
    });
  });

  describe('returns the additional actions dictionary', () => {
    it('when it is defined', () => {
      const additionalActions = PDFDict.withContext(context);
      dict.set(PDFName.of('AA'), additionalActions);
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.AA()).toEqual(additionalActions);
    });

    it('when it is undefined', () => {
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.AA()).toBe(undefined);
    });
  });
});
