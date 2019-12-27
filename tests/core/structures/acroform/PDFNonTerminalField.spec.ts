import {
  DictMap,
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

  it('returns a valid kids array', () => {
    const kidsArray = PDFArray.withContext(context);
    dict = new Map([[PDFName.of('Kids'), kidsArray]]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const field = PDFNonTerminalField.fromDict(acroFormFieldDict);
    expect(field.Kids()).toBe(kidsArray);
  });
});
