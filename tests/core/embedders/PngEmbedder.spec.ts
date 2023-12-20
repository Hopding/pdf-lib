import fs from 'fs';
import {
  PDFContext,
  PDFRawStream,
  PDFRef,
  PngEmbedder,
} from '../../../src/core';

const greyscalePng = fs.readFileSync('./assets/images/greyscale_bird.png');
const rgbaPng = fs.readFileSync('./assets/images/minions_banana_alpha.png');
const rgbPng = fs.readFileSync('./assets/images/minions_banana_no_alpha.png');

describe(`PngEmbedder`, () => {
  it(`can be constructed with PngEmbedder.for(...)`, async () => {
    const embedder = await PngEmbedder.for(greyscalePng);
    expect(embedder).toBeInstanceOf(PngEmbedder);
  });

  it(`can embed PNG images into PDFContexts with a predefined ref`, async () => {
    const context = PDFContext.create();
    const predefinedRef = PDFRef.of(9999);
    const embedder = await PngEmbedder.for(greyscalePng);

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = await embedder.embedIntoContext(context, predefinedRef);
    expect(context.enumerateIndirectObjects().length).toBe(1);
    expect(context.lookup(predefinedRef)).toBeInstanceOf(PDFRawStream);
    expect(ref).toBe(predefinedRef);
  });

  it(`can embed greyscale PNG images into PDFContexts`, async () => {
    const context = PDFContext.create();
    const embedder = await PngEmbedder.for(greyscalePng);

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = await embedder.embedIntoContext(context);
    expect(context.enumerateIndirectObjects().length).toBe(1);
    expect(context.lookup(ref)).toBeInstanceOf(PDFRawStream);
  });

  it(`can embed RGBA PNG images into PDFContexts`, async () => {
    const context = PDFContext.create();
    const embedder = await PngEmbedder.for(rgbaPng);

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = await embedder.embedIntoContext(context);
    expect(context.enumerateIndirectObjects().length).toBe(2);
    expect(context.lookup(ref)).toBeInstanceOf(PDFRawStream);
  });

  it(`can embed RGB PNG images into PDFContexts`, async () => {
    const context = PDFContext.create();
    const embedder = await PngEmbedder.for(rgbPng);

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = await embedder.embedIntoContext(context);
    expect(context.enumerateIndirectObjects().length).toBe(1);
    expect(context.lookup(ref)).toBeInstanceOf(PDFRawStream);
  });

  it(`can extract properties of greyscale PNG images`, async () => {
    const embedder = await PngEmbedder.for(greyscalePng);

    expect(embedder.bitsPerComponent).toBe(8);
    expect(embedder.height).toBe(375);
    expect(embedder.width).toBe(600);
    expect(embedder.colorSpace).toBe('DeviceRGB');
  });

  it(`can extract properties of RGBA PNG images`, async () => {
    const embedder = await PngEmbedder.for(rgbaPng);

    expect(embedder.bitsPerComponent).toBe(8);
    expect(embedder.height).toBe(640);
    expect(embedder.width).toBe(960);
    expect(embedder.colorSpace).toBe('DeviceRGB');
  });

  it(`can extract properties of RGB PNG images`, async () => {
    const embedder = await PngEmbedder.for(rgbPng);

    expect(embedder.bitsPerComponent).toBe(8);
    expect(embedder.height).toBe(640);
    expect(embedder.width).toBe(960);
    expect(embedder.colorSpace).toBe('DeviceRGB');
  });
});
