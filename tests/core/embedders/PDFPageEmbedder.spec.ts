import fs from 'fs';
import { PDFDocument } from '../../../src/api';
import {
  PDFContext,
  PDFName,
  PDFPageEmbedder,
  PDFRawStream,
  PDFRef,
} from '../../../src/core';

const examplePdf = fs.readFileSync('./assets/pdfs/normal.pdf');

const examplePage = async () => {
  const doc = await PDFDocument.load(examplePdf);
  return doc.getPages()[0];
};

describe('PDFPageEmbedder', () => {
  it('can be constructed with PDFPageEmbedder.for(...)', async () => {
    const page = await examplePage();
    const embedder = await PDFPageEmbedder.for(page.node);
    expect(embedder).toBeInstanceOf(PDFPageEmbedder);
  });

  it('can embed PDF pages into PDFContexts with a predefined ref', async () => {
    const context = PDFContext.create();
    const predefinedRef = PDFRef.of(9999);
    const page = await examplePage();
    const embedder = await PDFPageEmbedder.for(page.node);

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = await embedder.embedIntoContext(context, predefinedRef);
    expect(context.enumerateIndirectObjects().length).toBe(1);
    expect(context.lookup(predefinedRef)).toBeInstanceOf(PDFRawStream);
    expect(ref).toBe(predefinedRef);
  });

  it('can extract properties of the PDF page', async () => {
    const page = await examplePage();
    const embedder = await PDFPageEmbedder.for(page.node);

    expect(embedder.boundingBox).toEqual({
      left: 0,
      bottom: 0,
      right: page.getSize().width,
      top: page.getSize().height,
    });
    expect(embedder.transformationMatrix).toEqual([1, 0, 0, 1, -0, -0]);
    expect(embedder.width).toEqual(page.getWidth());
    expect(embedder.height).toEqual(page.getHeight());
  });

  it('calculates dimensions depending on the bounding box when given one', async () => {
    const page = await examplePage();
    const boundingBox = {
      left: 100,
      bottom: 100,
      right: 222,
      top: 333,
    };
    const embedder = await PDFPageEmbedder.for(page.node, boundingBox);

    expect(embedder.width).toEqual(122);
    expect(embedder.height).toEqual(233);
  });

  it('handles MediaBox coordinates in any order', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage();

    // Set MediaBox with reversed coordinates
    const mediaBox = doc.context.obj([200, 300, -100, -100]);
    page.node.set(PDFName.MediaBox, mediaBox);
    const embedder = await PDFPageEmbedder.for(page.node);

    // Should normalize the MediaBox coordinates
    expect(embedder.boundingBox).toEqual({
      left: -100, // Min of x coordinates
      bottom: -100, // Min of y coordinates
      right: 200, // Max of x coordinates
      top: 300, // Max of y coordinates
    });

    // Width and height should be positive
    expect(embedder.width).toBe(300); // right - left
    expect(embedder.height).toBe(400); // top - bottom
  });

  it('respects the provided bounding box for clipping', async () => {
    const page = await examplePage();

    // Define a clipping region
    const clipBox = {
      left: 100,
      bottom: 200,
      right: 200,
      top: 300,
    };
    const embedder = await PDFPageEmbedder.for(page.node, clipBox);

    // Should use the clipping box as-is
    expect(embedder.boundingBox).toEqual(clipBox);

    // Width and height should match the clipping dimensions
    expect(embedder.width).toBe(100); // right - left
    expect(embedder.height).toBe(100); // top - bottom
  });
});
