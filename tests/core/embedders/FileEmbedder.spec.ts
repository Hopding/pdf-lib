import fs from 'fs';
import { PDFContext, PDFDict, PDFRef, FileEmbedder } from '../../../src/index';

const catRidingUnicornJpg = fs.readFileSync(
  'assets/images/cat_riding_unicorn.jpg',
);
const usConstitutionPdf = fs.readFileSync('assets/pdfs/us_constitution.pdf');

describe(`FileEmbedder`, () => {
  it(`can be constructed with FileEmbedder.for(...)`, () => {
    const embedder = FileEmbedder.for(catRidingUnicornJpg, 'cat.jpg');
    expect(embedder).toBeInstanceOf(FileEmbedder);
  });

  it(`can embed files into PDFContexts without a predefined ref`, async () => {
    const context = PDFContext.create();
    const embedder = FileEmbedder.for(
      catRidingUnicornJpg,
      'cat_riding_unicorn.jpg',
      {
        mimeType: 'image/jpeg',
        description: 'Cool cat riding a unicorn! 🦄🐈🕶️',
        creationDate: new Date('2019/12/01'),
        modificationDate: new Date('2020/04/19'),
      },
    );

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = await embedder.embedIntoContext(context);
    expect(context.enumerateIndirectObjects().length).toBe(2);
    expect(context.lookup(ref)).toBeInstanceOf(PDFDict);
  });

  it(`can embed files into PDFContexts with a predefined ref`, async () => {
    const context = PDFContext.create();
    const predefinedRef = PDFRef.of(9999);
    const embedder = FileEmbedder.for(
      usConstitutionPdf,
      'us_constitution.pdf',
      {
        mimeType: 'application/pdf',
        description: 'Constitution of the United States 🇺🇸🦅',
        creationDate: new Date('1787/09/17'),
        modificationDate: new Date('1992/05/07'),
      },
    );

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = await embedder.embedIntoContext(context, predefinedRef);
    expect(context.enumerateIndirectObjects().length).toBe(2);
    expect(context.lookup(predefinedRef)).toBeInstanceOf(PDFDict);
    expect(ref).toBe(predefinedRef);
  });
});
