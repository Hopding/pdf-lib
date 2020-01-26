import {
  DictMap,
  PDFAcroField,
  PDFArray,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNonTerminalField,
} from 'src/index';

describe('PDFNonTerminalField', () => {
  let context: PDFContext;
  let dict: DictMap;

  beforeEach(() => {
    context = PDFContext.create();
    dict = new Map();
  });

  it('can be constructed from a PDFDict', () => {
    dict = new Map();
    const kids = PDFArray.withContext(context);
    const childDict = PDFDict.fromMapWithContext(
      new Map([[PDFName.FT, PDFName.Btn]]),
      context,
    );
    const childDictRef = context.register(childDict);
    kids.push(childDictRef);
    dict.set(PDFName.Kids, kids);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const field = PDFNonTerminalField.fromDict(acroFormFieldDict);
    expect(field).toBeInstanceOf(PDFNonTerminalField);
  });

  describe('can return the kids as PDFAcroFields', () => {
    it('when the Kids array is defined', () => {
      const kids = PDFArray.withContext(context);
      const childDict = PDFDict.fromMapWithContext(
        new Map([[PDFName.FT, PDFName.Btn]]),
        context,
      );
      const childDictRef = context.register(childDict);
      const childAcroField = PDFAcroField.fromDict(childDict);
      kids.push(childDictRef);
      dict.set(PDFName.Kids, kids);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFNonTerminalField.fromDict(acroFormFieldDict);
      expect(field.getKids()).toEqual([childAcroField]);
    });

    it('when the kids array is undefined', () => {
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFNonTerminalField.fromDict(acroFormFieldDict);
      expect(field.getKids()).toBe(undefined);
    });
  });
});
