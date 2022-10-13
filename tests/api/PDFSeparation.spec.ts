import { PDFDocument, PDFSeparation } from 'src/api';
import { SeparationEmbedder } from 'src/core';

describe(`PDFSeparation`, () => {
  describe(`embed() method`, () => {
    it(`gets name from the embedder`, async () => {
      const pdfDoc = await PDFDocument.create();

      const embedder = SeparationEmbedder.for('PANTONE 123 C', 'DeviceCMYK', [
        0,
        0.22,
        0.83,
      ]);
      const ref = pdfDoc.context.nextRef();
      const pdfSeparation = PDFSeparation.of(ref, pdfDoc, embedder);
      expect(pdfSeparation.name).toBe('PANTONE 123 C');
    });

    it(`may be called multiple times without causing an error`, async () => {
      const pdfDoc = await PDFDocument.create();

      const embedder = SeparationEmbedder.for('PANTONE 123 C', 'DeviceCMYK', [
        0,
        0.22,
        0.83,
      ]);
      const ref = pdfDoc.context.nextRef();
      const pdfSeparation = PDFSeparation.of(ref, pdfDoc, embedder);

      await expect(pdfSeparation.embed()).resolves.not.toThrowError();
      await expect(pdfSeparation.embed()).resolves.not.toThrowError();
    });

    it(`may be called in parallel without causing an error`, async () => {
      const pdfDoc = await PDFDocument.create();

      const embedder = SeparationEmbedder.for('PANTONE 123 C', 'DeviceCMYK', [
        0,
        0.22,
        0.83,
      ]);
      jest.spyOn(embedder, 'embedIntoContext');
      const ref = pdfDoc.context.nextRef();
      const pdfSeparation = PDFSeparation.of(ref, pdfDoc, embedder);

      const task1 = pdfSeparation.embed();
      const task2 = pdfSeparation.embed();

      await Promise.all([task1, task2]);

      expect(embedder.embedIntoContext).toHaveBeenCalledTimes(1);
    });
  });
});
