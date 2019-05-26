import {
  PDFContext,
  PDFDict,
  PDFHexString,
  StandardFontEmbedder,
  StandardFonts,
} from 'src/index';

describe(`StandardFontEmbedder`, () => {
  it(`can be constructed with StandardFontEmbedder.for(...)`, () => {
    const embedder = StandardFontEmbedder.for(StandardFonts.Helvetica);
    expect(embedder).toBeInstanceOf(StandardFontEmbedder);
  });

  it(`can embed standard font dictionaries into PDFContexts`, () => {
    const context = PDFContext.create();
    const embedder = StandardFontEmbedder.for(StandardFonts.Courier);

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = embedder.embedIntoContext(context);
    expect(context.enumerateIndirectObjects().length).toBe(1);
    expect(context.lookup(ref)).toBeInstanceOf(PDFDict);
  });

  it(`can encode text strings into PDFHexString objects`, () => {
    const text = 'Stuff and thingz!';
    const embedder = StandardFontEmbedder.for(StandardFonts.TimesRoman);
    expect(embedder.encodeText(text)).toBeInstanceOf(PDFHexString);
    expect(String(embedder.encodeText(text))).toBe(
      String(PDFHexString.of('537475666620616E64207468696E677A21')),
    );
  });

  it(`can measure the width of text strings at the given font size`, () => {
    const text = 'Stuff and thingz!';
    const embedder = StandardFontEmbedder.for(StandardFonts.HelveticaBold);
    expect(embedder.widthOfTextAtSize(text, 12)).toBe(94.656);
    expect(embedder.widthOfTextAtSize(text, 24)).toBe(189.312);
  });

  it(`can measure the height of the font at the given size`, () => {
    const embedder = StandardFontEmbedder.for(StandardFonts.HelveticaBold);
    expect(embedder.heightOfFontAtSize(12)).toBeCloseTo(11.1);
    expect(embedder.heightOfFontAtSize(24)).toBeCloseTo(22.2);
  });

  it(`can measure the size of the font at a given height`, () => {
    const embedder = StandardFontEmbedder.for(StandardFonts.HelveticaBold);
    expect(embedder.sizeOfFontAtHeight(12)).toBeCloseTo(12.972);
    expect(embedder.sizeOfFontAtHeight(24)).toBeCloseTo(25.945);
  });
});
