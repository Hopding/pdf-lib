import {
  DictMap,
  PDFAcroButton,
  PDFContext,
  PDFDict,
  PDFName,
} from 'src/index';

describe('PDFAcroButton', () => {
  let context: PDFContext;
  let dict: DictMap;

  beforeEach(() => {
    context = PDFContext.create();
    dict = new Map([[PDFName.FT, PDFName.Btn]]);
  });

  it('can be created from a PDFDict', () => {
    dict = new Map([[PDFName.FT, PDFName.Btn]]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const button = PDFAcroButton.fromDict(acroFormFieldDict);
    expect(button).toBeInstanceOf(PDFAcroButton);
  });
});
