import {
    DictMap,
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
        dict = new Map([[PDFName.of('FT'), PDFName.Btn]]);
    });

    describe('can be constructed from a PDFDict', () => {
        it('with a valid field type', () => {
          dict = new Map([[PDFName.FT, PDFName.Btn]]);
          const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
          const field = PDFTerminalField.fromDict(acroFormFieldDict);
          expect(field.FT()).toBe(PDFName.Btn);
        });

        it('only with a valid field type', () => {
          dict = new Map([
            [PDFName.of('FT'), PDFName.of('InvalidFieldType')],
          ]);
          const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
          const createField = () => PDFTerminalField.fromDict(acroFormFieldDict);
          expect(createField).toThrow(Error);
        });
    });
});
