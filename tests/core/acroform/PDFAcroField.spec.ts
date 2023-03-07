import {
  PDFAcroTerminal,
  PDFContext,
  PDFString,
  PDFHexString,
} from '../../../src/index';

describe(`PDFAcroField`, () => {
  it(`returns undefined for missing (DAs)`, () => {
    const context = PDFContext.create();

    const dict = context.obj({
      DA: null,
    });
    const dictRef = context.register(dict);
    const field = PDFAcroTerminal.fromDict(dict, dictRef);

    expect(field.getDefaultAppearance()).toBe(undefined);
  });

  it(`returns normal direct appearance strings (DAs)`, () => {
    const context = PDFContext.create();

    const dict = context.obj({
      DA: PDFString.of('/ZaDb 10 Tf 0 g'),
    });
    const dictRef = context.register(dict);
    const field = PDFAcroTerminal.fromDict(dict, dictRef);

    expect(field.getDefaultAppearance()).toBe('/ZaDb 10 Tf 0 g');
  });

  it(`returns hexadecimal (non-standard) direct appearance strings (DAs)`, () => {
    const context = PDFContext.create();

    const dict = context.obj({
      DA: PDFHexString.fromText('/ZaDb 10 Tf 0 g'),
    });
    const dictRef = context.register(dict);
    const field = PDFAcroTerminal.fromDict(dict, dictRef);

    expect(field.getDefaultAppearance()).toBe('/ZaDb 10 Tf 0 g');
  });

  describe(`setFontSize()`, () => {
    it(`throws an error if the /DA entry is missing`, () => {
      const context = PDFContext.create();

      const dict = context.obj({
        DA: null,
      });
      const dictRef = context.register(dict);
      const field = PDFAcroTerminal.fromDict(dict, dictRef);

      expect(() => field.setFontSize(8)).toThrow();
    });

    it(`throw an error if the /DA string does not contain a Tf operator`, () => {
      const context = PDFContext.create();

      const dict = context.obj({
        DA: PDFString.of('0 g 2 j'),
      });
      const dictRef = context.register(dict);
      const field = PDFAcroTerminal.fromDict(dict, dictRef);

      expect(() => field.setFontSize(8)).toThrow();
    });

    it(`replaces the font size of the last occurring Tf operator`, () => {
      const context = PDFContext.create();

      const dict = context.obj({
        DA: PDFString.of('/ZaDb 10 Tf\n0 g\n/AbCd 87 Tf\n2 j'),
      });
      const dictRef = context.register(dict);
      const field = PDFAcroTerminal.fromDict(dict, dictRef);
      field.setFontSize(8);

      expect(field.getDefaultAppearance()).toBe(
        '/ZaDb 10 Tf\n0 g\n /AbCd 8 Tf \n2 j',
      );
    });

    it(`tolerates invalid Tfs with missing font sizes`, () => {
      const context = PDFContext.create();

      const dict = context.obj({
        DA: PDFString.of('/ZaDb Tf 0 g'),
      });
      const dictRef = context.register(dict);
      const field = PDFAcroTerminal.fromDict(dict, dictRef);
      field.setFontSize(21.7);

      expect(field.getDefaultAppearance()).toBe(' /ZaDb 21.7 Tf  0 g');
    });
  });
});
