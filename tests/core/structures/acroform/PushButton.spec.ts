import {
  DictMap,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PushButton,
} from 'src/index';

describe('PushButton', () => {
  let context: PDFContext;
  let dict: DictMap;

  beforeEach(() => {
    const fieldFlags = PDFNumber.of(1 << 17);
    context = PDFContext.create();
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Btn],
      [PDFName.Ff, fieldFlags],
    ]);
  });

  it('can be constructed from a PDFDict', () => {
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const pushButton = PushButton.fromDict(acroFormFieldDict);
    expect(pushButton).toBeInstanceOf(PushButton);
  });

  it('returns an undefined value', () => {
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const pushButton = PushButton.fromDict(acroFormFieldDict);
    expect(pushButton.V()).toBe(undefined);
  });

  it('returns an undefined default value', () => {
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const pushButton = PushButton.fromDict(acroFormFieldDict);
    expect(pushButton.DV()).toBe(undefined);
  });
});
