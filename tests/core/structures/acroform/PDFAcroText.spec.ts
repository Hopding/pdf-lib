import { DictMap, PDFAcroText, PDFContext, PDFDict, PDFName } from 'src/index';

describe('PDFAcroText', () => {
  let context: PDFContext;
  let dict: DictMap;

  beforeEach(() => {
    context = PDFContext.create();
    dict = new Map([[PDFName.FT, PDFName.Tx]]);
  });

  it('can be created from a PDFDict', () => {
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const button = PDFAcroText.fromDict(acroFormFieldDict);
    expect(button).toBeInstanceOf(PDFAcroText);
  });
});
