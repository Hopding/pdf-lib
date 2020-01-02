import {
  DictMap,
  PDFAcroButton,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PushButton,
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

  it('returns a PushButton when the appropriate field flag is set', () => {
    const fieldFlags = PDFNumber.of(1 << 17);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Btn],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const button = PDFAcroButton.fromDict(acroFormFieldDict);
    expect(button).toBeInstanceOf(PushButton);
  });
});
