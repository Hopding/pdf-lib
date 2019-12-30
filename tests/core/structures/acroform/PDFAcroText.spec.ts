import {
  DictMap,
  PDFAcroText,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFString
} from 'src/index';

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

  describe('it can return the rich text value', () => {
    it('when it is undefined', () => {
      dict = new Map([
        [PDFName.FT, PDFName.Tx],
      ]);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const textField = PDFAcroText.fromDict(acroFormFieldDict);
      expect(textField.RV()).toBe(undefined);
    });

    it('when it is defined', () => {
      const richTextValue = PDFString.of('abc');
      dict = new Map<PDFName, PDFObject>([
        [PDFName.FT, PDFName.Tx],
        [PDFName.RV, richTextValue]
      ]);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const textField = PDFAcroText.fromDict(acroFormFieldDict);
      expect(textField.RV()).toEqual(richTextValue);
    });
  });

  describe('it can return the maximum field length', () => {
    it('when it is undefined', () => {
      dict = new Map([
        [PDFName.FT, PDFName.Tx],
      ]);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const textField = PDFAcroText.fromDict(acroFormFieldDict);
      expect(textField.MaxLen()).toBe(undefined);
    });

    it('when it is defined', () => {
      dict = new Map<PDFName, PDFObject>([
        [PDFName.FT, PDFName.Tx],
        [PDFName.MaxLen, PDFNumber.of(3)],
      ]);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const textField = PDFAcroText.fromDict(acroFormFieldDict);
      expect(textField.MaxLen()).toEqual(PDFNumber.of(3));
    });
  });

  it('can return whether the text field is multiline', () => {
    const fieldFlags = PDFNumber.of(1 << 13);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Tx],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const textField = PDFAcroText.fromDict(acroFormFieldDict);
    expect(textField.isMultiLine()).toBe(true);
  });

  it('can return whether the field is for a secure password', () => {
    const fieldFlags = PDFNumber.of(1 << 14);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Tx],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const textField = PDFAcroText.fromDict(acroFormFieldDict);
    expect(textField.isPassword()).toBe(true);
  });

  it('can return whether the text field is for file selection', () => {
    const fieldFlags = PDFNumber.of(1 << 21);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Tx],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const textField = PDFAcroText.fromDict(acroFormFieldDict);
    expect(textField.isFileSelect()).toBe(true);
  });

  it('can return whether the text field is spell-checked', () => {
    const fieldFlags = PDFNumber.of(1 << 23);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Tx],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const textField = PDFAcroText.fromDict(acroFormFieldDict);
    expect(textField.isSpellChecked()).toBe(false);
  });

  it('can return whether the text field is scrollable', () => {
    const fieldFlags = PDFNumber.of(1 << 24);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Tx],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const textField = PDFAcroText.fromDict(acroFormFieldDict);
    expect(textField.isScrollable()).toBe(false);
  });

  it('can return whether the text field is combed', () => {
    const fieldFlags = PDFNumber.of(1 << 25);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Tx],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const textField = PDFAcroText.fromDict(acroFormFieldDict);
    expect(textField.isCombed()).toBe(true);
  });

  it('can return whether the text field is rich text', () => {
    const fieldFlags = PDFNumber.of(1 << 26);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Tx],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const textField = PDFAcroText.fromDict(acroFormFieldDict);
    expect(textField.isRichText()).toBe(true);
  });
});
