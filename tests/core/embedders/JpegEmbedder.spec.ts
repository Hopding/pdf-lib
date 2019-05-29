import fs from 'fs';
import { JpegEmbedder, PDFContext, PDFRawStream } from 'src/core';

const catUnicornJpg = fs.readFileSync('./assets/images/cat_riding_unicorn.jpg');
const minionsLaughing = fs.readFileSync('./assets/images/minions_laughing.jpg');

describe(`JpegEmbedder`, () => {
  it(`can be constructed with JpegEmbedder.for(...)`, () => {
    const embedder = JpegEmbedder.for(catUnicornJpg);
    expect(embedder).toBeInstanceOf(JpegEmbedder);
  });

  it(`can embed JPEG images into PDFContexts`, () => {
    const context = PDFContext.create();
    const embedder = JpegEmbedder.for(catUnicornJpg);

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = embedder.embedIntoContext(context);
    expect(context.enumerateIndirectObjects().length).toBe(1);
    expect(context.lookup(ref)).toBeInstanceOf(PDFRawStream);
  });

  it(`can extract properties of JPEG images (1)`, () => {
    const embedder = JpegEmbedder.for(catUnicornJpg);

    expect(embedder.bitsPerComponent).toBe(8);
    expect(embedder.height).toBe(1080);
    expect(embedder.width).toBe(1920);
    expect(embedder.colorSpace).toBe('DeviceRGB');
  });

  it(`can extract properties of JPEG images (2)`, () => {
    const embedder = JpegEmbedder.for(minionsLaughing);

    expect(embedder.bitsPerComponent).toBe(8);
    expect(embedder.height).toBe(354);
    expect(embedder.width).toBe(630);
    expect(embedder.colorSpace).toBe('DeviceRGB');
  });
});
