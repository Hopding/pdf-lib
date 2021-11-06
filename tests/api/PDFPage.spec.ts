import fs from 'fs';
import { PDFArray, PDFDocument, PDFName, StandardFonts } from 'src/index';

const birdPng = fs.readFileSync('assets/images/greyscale_bird.png');

describe(`PDFDocument`, () => {
  describe(`getSize() method`, () => {
    it(`returns the width and height of the the page's MediaBox`, async () => {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      page.node.set(PDFName.MediaBox, pdfDoc.context.obj([5, 5, 20, 50]));
      expect(page.getSize()).toEqual({ width: 15, height: 45 });
    });
  });

  describe(`setSize() method`, () => {
    it(`sets the width and height of only the the page's MediaBox when the other boxes are not defined`, async () => {
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

    it(`sets the width and height of the the page's CropBox, BleedBox, TrimBox, and ArtBox when they equal the MediaBox`, async () => {
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

    it(`does not set the width and height of the the page's CropBox, BleedBox, TrimBox, or ArtBox when they do not equal the MediaBox`, async () => {
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

  // https://github.com/Hopding/pdf-lib/issues/1075
  it(`drawImage() does not reuse existing XObject keys`, async () => {
    const pdfDoc1 = await PDFDocument.create();
    const image1 = await pdfDoc1.embedPng(birdPng);
    const page1 = pdfDoc1.addPage();

    expect(page1.node.normalizedEntries().XObject.keys().length).toEqual(0);
    page1.drawImage(image1);
    expect(page1.node.normalizedEntries().XObject.keys().length).toEqual(1);

    const key1 = page1.node.normalizedEntries().XObject.keys()[0];

    const pdfDoc2 = await PDFDocument.load(await pdfDoc1.save());
    const image2 = await pdfDoc2.embedPng(birdPng);
    const page2 = pdfDoc2.getPage(0);

    expect(page2.node.normalizedEntries().XObject.keys().length).toEqual(1);
    page2.drawImage(image2);
    expect(page2.node.normalizedEntries().XObject.keys().length).toEqual(2);

    const key2 = page2.node.normalizedEntries().XObject.keys()[1];
    expect(key1).not.toEqual(key2);
    expect(page2.node.normalizedEntries().XObject.keys()).toEqual([key1, key2]);
  });

  // https://github.com/Hopding/pdf-lib/issues/1075
  it(`setFont() does not reuse existing Font keys`, async () => {
    const pdfDoc1 = await PDFDocument.create();
    const font1 = await pdfDoc1.embedFont(StandardFonts.Helvetica);
    const page1 = pdfDoc1.addPage();

    expect(page1.node.normalizedEntries().Font.keys().length).toEqual(0);
    page1.setFont(font1);
    expect(page1.node.normalizedEntries().Font.keys().length).toEqual(1);

    const key1 = page1.node.normalizedEntries().Font.keys()[0];

    const pdfDoc2 = await PDFDocument.load(await pdfDoc1.save());
    const font2 = await pdfDoc2.embedFont(StandardFonts.Helvetica);
    const page2 = pdfDoc2.getPage(0);

    expect(page2.node.normalizedEntries().Font.keys().length).toEqual(1);
    page2.setFont(font2);
    expect(page2.node.normalizedEntries().Font.keys().length).toEqual(2);

    const key2 = page2.node.normalizedEntries().Font.keys()[1];
    expect(key1).not.toEqual(key2);
    expect(page2.node.normalizedEntries().Font.keys()).toEqual([key1, key2]);
  });
});
