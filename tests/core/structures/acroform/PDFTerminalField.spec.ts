import {
  DictMap,
  PDFAcroButton,
  PDFAcroChoice,
  PDFAcroText,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFTerminalField,
} from 'src/index';

describe('PDFTerminalField', () => {
  let context: PDFContext;
  let dict: DictMap;

  beforeEach(() => {
    context = PDFContext.create();
    dict = new Map([[PDFName.FT, PDFName.Btn]]);
  });

  describe('can be constructed from a PDFDict', () => {
    it('with a valid field type', () => {
      dict = new Map([[PDFName.FT, PDFName.Btn]]);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFTerminalField.fromDict(acroFormFieldDict);
      expect(field.FT()).toBe(PDFName.Btn);
    });

    it('only with a valid field type', () => {
      dict = new Map([[PDFName.FT, PDFName.of('InvalidFieldType')]]);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const createField = () => PDFTerminalField.fromDict(acroFormFieldDict);
      expect(createField).toThrow(Error);
    });
  });

  it('returns a PDFAcroButton if the field type is Btn', () => {
    dict = new Map([[PDFName.FT, PDFName.Btn]]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const field = PDFTerminalField.fromDict(acroFormFieldDict);
    expect(field).toBeInstanceOf(PDFAcroButton);
  });

  it('returns a PDFAcroText if the field type is Tx', () => {
    dict = new Map([[PDFName.FT, PDFName.Tx]]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const field = PDFTerminalField.fromDict(acroFormFieldDict);
    expect(field).toBeInstanceOf(PDFAcroText);
  });

  it('returns a PDFAcroChoice if the field type is Ch', () => {
    dict = new Map([[PDFName.FT, PDFName.Ch]]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const field = PDFTerminalField.fromDict(acroFormFieldDict);
    expect(field).toBeInstanceOf(PDFAcroChoice);
  });

  describe('sets the field flags value', () => {
    it('to 0 if the field flags are undefined', () => {
      dict = new Map([[PDFName.FT, PDFName.Ch]]);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFTerminalField.fromDict(acroFormFieldDict);
      expect(field.Ff()).toEqual(PDFNumber.of(0));
    });

    it('to a passed in value', () => {
      dict = new Map<PDFName, PDFObject>([
        [PDFName.FT, PDFName.Ch],
        [PDFName.Ff, PDFNumber.of(1)]
      ]);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFTerminalField.fromDict(acroFormFieldDict);
      expect(field.Ff()).toEqual(PDFNumber.of(1));
    });
  });
});
