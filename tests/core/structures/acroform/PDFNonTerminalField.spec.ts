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
  });

  it('returns a valid kids array of PDFAcroFields', () => {
    const kidsArray = PDFArray.withContext(context);
    const childDict = PDFDict.fromMapWithContext(
      new Map([[PDFName.FT, PDFName.Btn]]),
      context,
    );
    const childDictRef = context.register(childDict);
    const childAcroField = PDFAcroField.fromDict(childDict);
    kidsArray.push(childDictRef);
    dict = new Map([[PDFName.Kids, kidsArray]]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const field = PDFNonTerminalField.fromDict(acroFormFieldDict);
    expect(field.Kids()).toEqual([childAcroField]);
  });
});
