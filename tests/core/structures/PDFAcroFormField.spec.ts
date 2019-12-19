import {
    DictMap,
    PDFAcroFormField,
    PDFArray,
    PDFContext,
    PDFDict,
    PDFName,
    PDFObject,
} from 'src/index';

describe('PDFAcroFormField', () => {
    let context: PDFContext;
    let dict: DictMap;

    beforeEach(() => {
      context = PDFContext.create();
      dict = new Map<PDFName, PDFObject>([
        [PDFName.of('FT'), PDFName.Btn]
      ]);
    });

    describe('can be constructed from PDFAcroFormField.fromMapWithContext', () => {
      it('with a valid field type', () => {
        dict = new Map<PDFName, PDFObject>([
          [PDFName.of('FT'), PDFName.Btn]
        ]);
        const field = PDFAcroFormField.fromMapWithContext(dict, context);
        expect(field.FT()).toBe(PDFName.Btn);
      });

      it('only with a valid field type', () => {
        dict = new Map<PDFName, PDFObject>([
          [PDFName.of('FT'), PDFName.of('InvalidFieldType')]
        ]);
        const createField = () => PDFAcroFormField.fromMapWithContext(dict, context);
        expect(createField).toThrow(Error);
      });
    });

    it('returns the field type', () => {
      const field = PDFAcroFormField.fromMapWithContext(dict, context);
      expect(field.FT()).toBe(PDFName.Btn);
    });

    describe('returns the parent field dictionary', () => {
      it('when it is defined', () => {
        const parentDict = PDFDict.fromMapWithContext(
          new Map<PDFName, PDFObject>(),
          context
        );
        dict.set(PDFName.of('Parent'), parentDict);
        const field = PDFAcroFormField.fromMapWithContext(dict, context);
        expect(field.Parent()).toBe(parentDict);
      });

      it('when it is undefined', () => {
        const field = PDFAcroFormField.fromMapWithContext(dict, context);
        expect(field.Parent()).toBe(undefined);
      });
    });

    describe('returns the Kids array', () => {
      it('when it is defined', () => {
        const kids = PDFArray.withContext(context);
        dict.set(PDFName.of('Kids'), kids);
        const field = PDFAcroFormField.fromMapWithContext(dict, context);
        expect(field.Kids()).toBe(kids);
      });

      it('when it is undefined', () => {
        const field = PDFAcroFormField.fromMapWithContext(dict, context);
        expect(field.Kids()).toBe(undefined);
      });
    });

    // describe('returns the partial field name', () => {

    // });
});