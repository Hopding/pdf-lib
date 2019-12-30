import {
  DictMap,
  PDFAcroChoice,
  PDFContext,
  PDFDict,
  PDFName,
} from 'src/index';

describe('PDFAcroChoice', () => {
  let context: PDFContext;
  let dict: DictMap;

  beforeEach(() => {
    context = PDFContext.create();
  });

  it('can be created from a PDFDict', () => {
    dict = new Map([[PDFName.FT, PDFName.Ch]]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const choiceField = PDFAcroChoice.fromDict(acroFormFieldDict);
    expect(choiceField).toBeInstanceOf(PDFAcroChoice);
  });
});
