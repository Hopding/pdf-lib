import { PDFArray, PDFDocument, PDFName } from 'src/index';

describe(`PDFDocument`, () => {
  describe.only(`getSize() method`, () => {
    it(`Returns the width and height of the the page's MediaBox`, async () => {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      page.node.set(PDFName.MediaBox, pdfDoc.context.obj([5, 5, 20, 50]));
      expect(page.getSize()).toEqual({ width: 15, height: 45 });
    });
  });

  describe.only(`setSize() method`, () => {
    it(`Sets the width and height of only the the page's MediaBox when the other boxes are not defined`, async () => {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();

      page.setMediaBox(5, 5, 20, 50);
      expect(page.getMediaBox()).toEqual({ x: 5, y: 5, width: 20, height: 50 });
      expect(page.node.MediaBox()).toBeInstanceOf(PDFArray);
      expect(page.node.CropBox()).toBeUndefined();
      expect(page.node.BleedBox()).toBeUndefined();
      expect(page.node.TrimBox()).toBeUndefined();
      expect(page.node.ArtBox()).toBeUndefined();

      page.setSize(15, 45);
      expect(page.getSize()).toEqual({ width: 15, height: 45 });
      expect(page.getMediaBox()).toEqual({ x: 5, y: 5, width: 15, height: 45 });
      expect(page.node.MediaBox()).toBeInstanceOf(PDFArray);
      expect(page.node.CropBox()).toBeUndefined();
      expect(page.node.BleedBox()).toBeUndefined();
      expect(page.node.TrimBox()).toBeUndefined();
      expect(page.node.ArtBox()).toBeUndefined();
    });

    it(`Sets the width and height of the the page's CropBox, BleedBox, TrimBox, and ArtBox when they equal the MediaBox`, async () => {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();

      page.setMediaBox(5, 5, 20, 50);
      page.setCropBox(5, 5, 20, 50);
      page.setBleedBox(5, 5, 20, 50);
      page.setTrimBox(5, 5, 20, 50);
      page.setArtBox(5, 5, 20, 50);

      expect(page.getMediaBox()).toEqual({ x: 5, y: 5, width: 20, height: 50 });
      expect(page.getCropBox()).toEqual({ x: 5, y: 5, width: 20, height: 50 });
      expect(page.getBleedBox()).toEqual({ x: 5, y: 5, width: 20, height: 50 });
      expect(page.getTrimBox()).toEqual({ x: 5, y: 5, width: 20, height: 50 });
      expect(page.getArtBox()).toEqual({ x: 5, y: 5, width: 20, height: 50 });

      expect(page.node.MediaBox()).toBeInstanceOf(PDFArray);
      expect(page.node.CropBox()).toBeInstanceOf(PDFArray);
      expect(page.node.BleedBox()).toBeInstanceOf(PDFArray);
      expect(page.node.TrimBox()).toBeInstanceOf(PDFArray);
      expect(page.node.ArtBox()).toBeInstanceOf(PDFArray);

      page.setSize(15, 45);
      expect(page.getSize()).toEqual({ width: 15, height: 45 });
      expect(page.getMediaBox()).toEqual({ x: 5, y: 5, width: 15, height: 45 });
      expect(page.getCropBox()).toEqual({ x: 5, y: 5, width: 15, height: 45 });
      expect(page.getBleedBox()).toEqual({ x: 5, y: 5, width: 15, height: 45 });
      expect(page.getTrimBox()).toEqual({ x: 5, y: 5, width: 15, height: 45 });
      expect(page.getArtBox()).toEqual({ x: 5, y: 5, width: 15, height: 45 });
    });

    it(`Does not set the width and height of the the page's CropBox, BleedBox, TrimBox, or ArtBox when they do not equal the MediaBox`, async () => {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();

      page.setMediaBox(5, 5, 20, 50);
      page.setCropBox(0, 0, 20, 50);
      page.setBleedBox(5, 5, 10, 25);
      page.setTrimBox(5, 0, 10, 50);
      page.setArtBox(0, 5, 20, 25);

      expect(page.getMediaBox()).toEqual({ x: 5, y: 5, width: 20, height: 50 });
      expect(page.getCropBox()).toEqual({ x: 0, y: 0, width: 20, height: 50 });
      expect(page.getBleedBox()).toEqual({ x: 5, y: 5, width: 10, height: 25 });
      expect(page.getTrimBox()).toEqual({ x: 5, y: 0, width: 10, height: 50 });
      expect(page.getArtBox()).toEqual({ x: 0, y: 5, width: 20, height: 25 });

      expect(page.node.MediaBox()).toBeInstanceOf(PDFArray);
      expect(page.node.CropBox()).toBeInstanceOf(PDFArray);
      expect(page.node.BleedBox()).toBeInstanceOf(PDFArray);
      expect(page.node.TrimBox()).toBeInstanceOf(PDFArray);
      expect(page.node.ArtBox()).toBeInstanceOf(PDFArray);

      page.setSize(15, 45);
      expect(page.getSize()).toEqual({ width: 15, height: 45 });
      expect(page.getMediaBox()).toEqual({ x: 5, y: 5, width: 15, height: 45 });
      expect(page.getCropBox()).toEqual({ x: 0, y: 0, width: 20, height: 50 });
      expect(page.getBleedBox()).toEqual({ x: 5, y: 5, width: 10, height: 25 });
      expect(page.getTrimBox()).toEqual({ x: 5, y: 0, width: 10, height: 50 });
      expect(page.getArtBox()).toEqual({ x: 0, y: 5, width: 20, height: 25 });
    });
  });
});
