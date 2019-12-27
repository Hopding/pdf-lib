import {
  DictMap,
  PDFAcroField,
  PDFArray,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNonTerminalField,
  PDFNumber,
  PDFString,
  PDFTerminalField,
} from 'src/index';

describe('PDFAcroField', () => {
  let context: PDFContext;
  let dict: DictMap;

  beforeEach(() => {
    context = PDFContext.create();
    dict = new Map([[PDFName.FT, PDFName.Btn]]);
  });

  describe('can be constructed from a PDFDict', () => {
    it('representing as a terminal field', () => {
      dict = new Map([[PDFName.FT, PDFName.Btn]]);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.FT()).toBe(PDFName.Btn);
      expect(field).toBeInstanceOf(PDFTerminalField);
    });

    it('representing a non terminal field', () => {
      dict = new Map([[PDFName.Kids, PDFArray.withContext(context)]]);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field).toBeInstanceOf(PDFNonTerminalField);
    });
  });

  it('returns the field type', () => {
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const field = PDFAcroField.fromDict(acroFormFieldDict);
    expect(field.FT()).toBe(PDFName.Btn);
  });

  describe('returns the parent field dictionary', () => {
    it('when it is defined', () => {
      const parentDict = PDFDict.fromMapWithContext(new Map(), context);
      dict.set(PDFName.of('Parent'), parentDict);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.Parent()).toBe(parentDict);
    });

    it('when it is undefined', () => {
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.Parent()).toBe(undefined);
    });
  });

  describe('returns the Kids array', () => {
    it('when it is defined', () => {
      const kids = PDFArray.withContext(context);
      dict.set(PDFName.Kids, kids);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.Kids()).toBe(kids);
    });

    it('when it is undefined', () => {
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.Kids()).toBe(undefined);
    });
  });

  describe('returns the partial field name', () => {
    it('when it is defined', () => {
      const fieldName = PDFString.of('PersonalData');
      dict.set(PDFName.of('T'), fieldName);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.T()).toEqual(fieldName);
    });

    it('when it is undefined', () => {
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.T()).toBe(undefined);
    });
  });

  describe('returns the alternative field name', () => {
    it('when it is defined', () => {
      const altFieldName = PDFString.of('PersonalData');
      dict.set(PDFName.of('TU'), altFieldName);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.TU()).toEqual(altFieldName);
    });

    it('when it is undefined', () => {
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.TU()).toBe(undefined);
    });
  });

  describe('returns the mapping name', () => {
    it('when it is defined', () => {
      const mappingName = PDFString.of('MappingName');
      dict.set(PDFName.of('TM'), mappingName);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.TM()).toEqual(mappingName);
    });

    it('when it is undefined', () => {
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.TM()).toBe(undefined);
    });
  });

  describe('returns the field flags', () => {
    it('when it is defined', () => {
      const flags = PDFNumber.of(1);
      dict.set(PDFName.of('Ff'), flags);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.Ff()).toEqual(flags);
    });

    it('when it is undefined', () => {
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.Ff()).toBe(undefined);
    });
  });

  describe('returns the field value', () => {
    it('when it is defined', () => {
      const value = PDFNumber.of(1);
      dict.set(PDFName.of('V'), value);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.V()).toEqual(value);
    });

    it('when it is undefined', () => {
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.V()).toBe(undefined);
    });
  });

  describe('returns the default value', () => {
    it('when it is defined', () => {
      const defaultValue = PDFNumber.of(1);
      dict.set(PDFName.of('DV'), defaultValue);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.DV()).toEqual(defaultValue);
    });

    it('when it is undefined', () => {
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.DV()).toBe(undefined);
    });
  });

  describe('returns the additional actions dictionary', () => {
    it('when it is defined', () => {
      const additionalActions = PDFDict.withContext(context);
      dict.set(PDFName.of('AA'), additionalActions);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.AA()).toEqual(additionalActions);
    });

    it('when it is undefined', () => {
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFAcroField.fromDict(acroFormFieldDict);
      expect(field.AA()).toBe(undefined);
    });
  });
});
