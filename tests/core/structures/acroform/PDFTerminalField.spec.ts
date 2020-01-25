import {
  DictMap,
  PDFAcroButton,
  PDFAcroChoice,
  PDFAcroText,
  PDFAnnotation,
  PDFArray,
  PDFContext,
  PDFDict,
  PDFName,
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

  describe('can return the field kids as PDFAnnotation instances', () => {
    it('when the kids array is defined', () => {
      const kids = PDFArray.withContext(context);
      const childAnnotationDict = PDFDict.fromMapWithContext(
        new Map([[PDFName.Subtype, PDFName.Circle]]),
        context,
      );
      const childAnnotationRef = context.register(childAnnotationDict);
      const childAnnotation = PDFAnnotation.fromDict(childAnnotationDict);
      kids.push(childAnnotationRef);
      dict.set(PDFName.Kids, kids);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const field = PDFTerminalField.fromDict(acroFormFieldDict);
      expect(field.getKids()).toEqual([childAnnotation]);
    });
  });
});
