import fs from 'fs';
import { PDFDocument } from 'src/api';
import {
  PDFContext,
  PDFObjectCopier,
  PDFPageEmbedder,
  PDFRawStream,
  PDFRef,
} from 'src/core';

const examplePdf = fs.readFileSync('./assets/pdfs/normal.pdf');

const examplePage = async () => {
  const doc = await PDFDocument.load(examplePdf);
  return doc.getPages()[0];
};

const copier = (doc: PDFDocument) =>
  PDFObjectCopier.for(doc.context, doc.context);

describe(`PDFPageEmbedder`, () => {
  it(`can be constructed with PDFPageEmbedder.for(...)`, async () => {
    const page = await examplePage();
    const embedder = await PDFPageEmbedder.for(page, copier(page.doc));
    expect(embedder).toBeInstanceOf(PDFPageEmbedder);
  });

  it(`can embed PDF pages into PDFContexts with a predefined ref`, async () => {
    const context = PDFContext.create();
    const predefinedRef = PDFRef.of(9999);
    const page = await examplePage();
    const embedder = await PDFPageEmbedder.for(page, copier(page.doc));

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = await embedder.embedIntoContext(context, predefinedRef);
    expect(context.enumerateIndirectObjects().length).toBe(1);
    expect(context.lookup(predefinedRef)).toBeInstanceOf(PDFRawStream);
    expect(ref).toBe(predefinedRef);
  });

  it(`can extract properties of the PDF page`, async () => {
    const page = await examplePage();
    const embedder = await PDFPageEmbedder.for(page, copier(page.doc));

    expect(embedder.boundingBox).toEqual({
      left: 0,
      bottom: 0,
      right: page.getSize().width,
      top: page.getSize().height,
    });
    expect(embedder.transformationMatrix).toEqual([1, 0, 0, 1, 0, 0]);
  });
});
