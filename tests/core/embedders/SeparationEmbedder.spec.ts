import { PDFArray, PDFContext, PDFRef, SeparationEmbedder } from 'src/index';

describe(`SeparationEmbedder`, () => {
  it(`can be constructed with SeparationEmbedder.for(...)`, () => {
    const embedder = SeparationEmbedder.for('PANTONE 123 C', 'DeviceCMYK', [
      0,
      0.22,
      0.83,
    ]);
    expect(embedder).toBeInstanceOf(SeparationEmbedder);
  });

  it(`can embed separations into PDFContexts without a predefined ref`, async () => {
    const context = PDFContext.create();
    const embedder = SeparationEmbedder.for('PANTONE 123 C', 'DeviceCMYK', [
      0,
      0.22,
      0.83,
    ]);

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = embedder.embedIntoContext(context);
    expect(context.enumerateIndirectObjects().length).toBe(1);
    expect(context.lookup(ref)).toBeInstanceOf(PDFArray);
  });

  fit(`can embed separations into PDFContexts with a predefined ref`, async () => {
    const context = PDFContext.create();
    const predefinedRef = PDFRef.of(9999);
    const embedder = SeparationEmbedder.for('PANTONE 123 C', 'DeviceCMYK', [
      0,
      0.22,
      0.83,
    ]);

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = embedder.embedIntoContext(context, predefinedRef);
    expect(context.enumerateIndirectObjects().length).toBe(1);
    expect(context.lookup(predefinedRef)).toBeInstanceOf(PDFArray);
    expect(ref).toBe(predefinedRef);
  });
});
