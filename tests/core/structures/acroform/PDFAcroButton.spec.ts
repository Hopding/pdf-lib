import {
  DictMap,
  PDFAcroButton,
  PDFCheckBox,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFPushButton,
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

  it('returns a PDFPushButton when the appropriate field flag is set', () => {
    const fieldFlags = PDFNumber.of(1 << 17);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Btn],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const button = PDFAcroButton.fromDict(acroFormFieldDict);
    expect(button).toBeInstanceOf(PDFPushButton);
  });

  it('returns a Checkbox when neither the radio button nor pushbutton flags are set', () => {
    dict = new Map([[PDFName.FT, PDFName.Btn]]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const button = PDFAcroButton.fromDict(acroFormFieldDict);
    expect(button).toBeInstanceOf(PDFCheckBox);
  });

  it('throws an error on invalid field flags', () => {
    const fieldFlags = PDFNumber.of((1 << 17) | (1 << 16));
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Btn],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const createButton = () => {
      PDFAcroButton.fromDict(acroFormFieldDict);
    };
    expect(createButton).toThrow();
  });
});
