import { PDFDocument, PDFImage } from 'src/api';
import { PngEmbedder } from 'src/core';
import { toUint8Array } from 'src/utils';

const examplePngImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TxaoVBzuIdMhQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi5uak6CIl/i8ptIjx4Lgf7+497t4BQqPCVLNrAlA1y0jFY2I2tyr2vKIfAgLoRVhipp5IL2bgOb7u4ePrXZRneZ/7cwwoeZMBPpF4jumGRbxBPLNp6Zz3iUOsJCnE58TjBl2Q+JHrsstvnIsOCzwzZGRS88QhYrHYwXIHs5KhEk8TRxRVo3wh67LCeYuzWqmx1j35C4N5bSXNdZphxLGEBJIQIaOGMiqwEKVVI8VEivZjHv4Rx58kl0yuMhg5FlCFCsnxg//B727NwtSkmxSMAd0vtv0xCvTsAs26bX8f23bzBPA/A1da219tALOfpNfbWuQIGNwGLq7bmrwHXO4Aw0+6ZEiO5KcpFArA+xl9Uw4YugX61tzeWvs4fQAy1NXyDXBwCIwVKXvd492Bzt7+PdPq7wcdn3KFLu4iBAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAlFJREFUeNrt289r02AYB/Dvk6Sl4EDKpllTlFKsnUdBHXgUBEHwqHj2IJ72B0zwKHhxJ08i/gDxX/AiRfSkBxELXTcVxTa2s2xTsHNN8ngQbQL70RZqG/Z9b29JnvflkydP37whghG3ZaegoxzfwB5vBCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgwB5rstWPtnP0LqBX/vZNyLF6vVrpN/hucewhb4g+B2AyAwiwY7NGOXijviS9vBeYh6CEP4edBLDADCAAAQhAAAIQgAAEIAABCDAUAFF/GIN1DM+PBYCo/ohMXDQ1WPjoeUZH1mMBEEh0oqLGvsHCy0S4NzWVWotJBogbvZB+brDwQT7UWSmXy5sxyQB9HQEROdVv4HQ+vx+QmS4iXsWmCK7Usu8AhOqAXMzlcn3VgWTbugQgEYrxMkZ/gyUPgnuhe2C6/Stxvdeg2ezMJERvhOuoZ+JBrNYBRuDdBtDuXkDM25nCHLbZSv9X6A4VHU+DpwCcbvbjcetLtTaOANtuirrux08HM0euisjDEMKC7RQuq+C+pVJqpzx3NZ3+eeBza9I0rWJgyHnxg2sAJrqnaHUzFcyN60Jox13hprv8aNopZBS4GcqWWVHM+lAkN0zY7ncgkYBukRoKLPpiXVj9UFkfV4Bdl8Jf60u3IMZZAG/6iLuhkDvaSZ74VqtUx3kp3NN7gUZt8RmA43a2eEY1OCfQ04AcBpAGkAKwpkBLIG8BfQE/eNJsvG/G4VlARj0BfjDBx2ECEIAABCAAAQhAAAIQgAAE+P/tN8YvpvbTDBOlAAAAAElFTkSuQmCC';

describe(`PDFImage`, () => {
  describe(`embed() method`, () => {
    it(`clears the 'embedder' field after the first call`, async () => {
      const pdfDoc = await PDFDocument.create();

      const bytes = toUint8Array(examplePngImage);
      const embedder = await PngEmbedder.for(bytes);
      const ref = pdfDoc.context.nextRef();
      const pdfImage = PDFImage.of(ref, pdfDoc, embedder);

      const embedderVariable = 'embedder';
      expect(pdfImage[embedderVariable]).toBeDefined();
      await pdfImage.embed();
      expect(pdfImage[embedderVariable]).toBeUndefined();
    });

    it(`may be called multiple times without causing an error`, async () => {
      const pdfDoc = await PDFDocument.create();

      const bytes = toUint8Array(examplePngImage);
      const embedder = await PngEmbedder.for(bytes);
      const ref = pdfDoc.context.nextRef();
      const pdfImage = PDFImage.of(ref, pdfDoc, embedder);

      await expect(pdfImage.embed()).resolves.not.toThrowError();
      await expect(pdfImage.embed()).resolves.not.toThrowError();
    });

    it(`may be called in parallel without causing an error`, async () => {
      const pdfDoc = await PDFDocument.create();

      const bytes = toUint8Array(examplePngImage);
      const embedder = await PngEmbedder.for(bytes);
      const ref = pdfDoc.context.nextRef();
      const pdfImage = PDFImage.of(ref, pdfDoc, embedder);

      // tslint:disable-next-line
      const task = () => pdfImage['embedTask'];

      expect(task()).toBeUndefined();

      const task1 = pdfImage.embed();
      const firstTask = task();

      const task2 = pdfImage.embed();
      const secondTask = task();

      await Promise.all([task1, task2]);

      expect(firstTask).toEqual(secondTask);
    });
  });
});
