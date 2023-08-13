import {
  PDFAcroTerminal,
  PDFContext,
  PDFRef,
  PDFArray,
} from '../../../src/index';

describe(`PDFAcroTerminal`, () => {
  it(`returns Kids when it has them`, () => {
    const context = PDFContext.create();

    const kids = context.obj(['Foo', PDFRef.of(21), 9001]);
    const kidsRef = context.register(kids);

    const dict = context.obj({
      Kids: kidsRef,
    });
    const dictRef = context.register(dict);

    const terminal = PDFAcroTerminal.fromDict(dict, dictRef);

    const { Kids } = terminal.normalizedEntries();
    expect(Kids).toBe(kids);
  });

  it(`returns itself as a Kid when it has none`, () => {
    const context = PDFContext.create();

    const dict = context.obj({});
    const dictRef = context.register(dict);

    const terminal = PDFAcroTerminal.fromDict(dict, dictRef);

    const { Kids } = terminal.normalizedEntries();
    expect(Kids).toBeInstanceOf(PDFArray);
    expect(Kids.size()).toBe(1);
    expect(Kids.get(0)).toBe(dictRef);
  });
});
