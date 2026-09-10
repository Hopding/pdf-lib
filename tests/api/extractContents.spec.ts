import fontkit from '@cantoo/fontkit';
import fs from 'fs';

import {
  PDFDocument,
  PDFRawStream,
  StandardFonts,
  decodePDFRawStream,
  rgb,
} from '../../src/index';
import { PNG } from '../../src/utils/png';

const jpgBytes = new Uint8Array(
  fs.readFileSync('assets/images/cat_riding_unicorn.jpg'),
);
const pngBytes = fs.readFileSync('assets/images/minions_banana_no_alpha.png');
const ubuntuFont = fs.readFileSync('assets/fonts/ubuntu/Ubuntu-R.ttf');

describe('PDFPage.extractContents()', () => {
  it('extracts text drawn with a standard font', async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage([400, 200]);
    page.drawText('Hello World', { font, size: 12, x: 10, y: 100 });

    await pdfDoc.flush();

    const assets = page.extractContents();
    const texts = assets.filter((a) => a.kind === 'text');
    expect(texts.length).toBeGreaterThanOrEqual(1);
    const textAsset = texts.find(
      (a) => a.kind === 'text' && a.getText().includes('Hello World'),
    );
    expect(textAsset).toBeDefined();
    if (!textAsset || textAsset.kind !== 'text') {
      throw new Error('expected text asset');
    }
    expect(textAsset.x).toBeCloseTo(10, 5);
    expect(textAsset.y).toBeCloseTo(100, 5);
    expect(textAsset.fontSize).toBe(12);
    expect(textAsset.fontFamily).toMatch(/Helvetica/);
  });

  it('extracts text drawn with a custom font (ToUnicode)', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(ubuntuFont);
    const page = pdfDoc.addPage([400, 200]);
    page.drawText('Café', { font, size: 18, x: 10, y: 100 });

    await pdfDoc.flush();

    const assets = page.extractContents();
    const textAsset = assets.find(
      (a) => a.kind === 'text' && a.getText().includes('Café'),
    );
    expect(textAsset).toBeDefined();
    if (!textAsset || textAsset.kind !== 'text') {
      throw new Error('expected text asset');
    }
    expect(textAsset.x).toBeCloseTo(10, 5);
    expect(textAsset.y).toBeCloseTo(100, 5);
    expect(textAsset.fontSize).toBe(18);
    expect(textAsset.fontFamily).toMatch(/Ubuntu/i);
  });

  it('extracts a JPEG image as image/jpeg bytes', async () => {
    const pdfDoc = await PDFDocument.create();
    const image = await pdfDoc.embedJpg(jpgBytes);
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    await pdfDoc.flush();

    const assets = page.extractContents();
    const images = assets.filter((a) => a.kind === 'image');
    expect(images).toHaveLength(1);
    const asset = images[0];
    if (asset.kind !== 'image') throw new Error('expected image');
    expect(asset.mimeType).toBe('image/jpeg');
    expect(asset.width).toBe(image.width);
    expect(asset.height).toBe(image.height);
    expect(asset.x).toBeCloseTo(0, 5);
    expect(asset.y).toBeCloseTo(0, 5);
    expect(asset.drawWidth).toBeCloseTo(image.width, 5);
    expect(asset.drawHeight).toBeCloseTo(image.height, 5);
    expect(asset.getBytes()).toEqual(jpgBytes);
  });

  it('extracts a PNG-embedded image as a decodable PNG', async () => {
    const pdfDoc = await PDFDocument.create();
    const image = await pdfDoc.embedPng(pngBytes);
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    await pdfDoc.flush();

    const assets = page.extractContents();
    const images = assets.filter((a) => a.kind === 'image');
    expect(images).toHaveLength(1);
    const asset = images[0];
    if (asset.kind !== 'image') throw new Error('expected image');
    expect(asset.mimeType).toBe('image/png');
    expect(asset.width).toBe(image.width);
    expect(asset.height).toBe(image.height);
    expect(asset.x).toBeCloseTo(0, 5);
    expect(asset.y).toBeCloseTo(0, 5);

    const decoded = PNG.load(asset.getBytes());
    expect(decoded.width).toBe(image.width);
    expect(decoded.height).toBe(image.height);
  });

  it('reports drawn image position and size', async () => {
    const pdfDoc = await PDFDocument.create();
    const image = await pdfDoc.embedJpg(jpgBytes);
    const page = pdfDoc.addPage([800, 600]);
    page.drawImage(image, {
      x: 50,
      y: 75,
      width: 200,
      height: 100,
    });

    await pdfDoc.flush();

    const assets = page.extractContents();
    const asset = assets.find((a) => a.kind === 'image');
    expect(asset).toBeDefined();
    if (!asset || asset.kind !== 'image') throw new Error('expected image');
    expect(asset.x).toBeCloseTo(50, 5);
    expect(asset.y).toBeCloseTo(75, 5);
    expect(asset.drawWidth).toBeCloseTo(200, 5);
    expect(asset.drawHeight).toBeCloseTo(100, 5);
  });

  it('extracts a stroked line as graphics SVG', async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 400]);
    page.drawLine({
      start: { x: 10, y: 20 },
      end: { x: 110, y: 20 },
      thickness: 2,
      color: rgb(1, 0, 0),
    });

    await pdfDoc.flush();

    const assets = page.extractContents();
    const gfx = assets.filter((a) => a.kind === 'graphics');
    expect(gfx.length).toBeGreaterThanOrEqual(1);
    const asset = gfx[0];
    if (asset.kind !== 'graphics') throw new Error('expected graphics');
    expect(asset.getSvg()).toContain('<path');
    expect(asset.getSvg()).toMatch(/stroke="#[fF]{2}0000"/);
    expect(asset.getSvg()).toContain('fill="none"');
    expect(asset.x).toBeCloseTo(10, 0);
    expect(asset.y).toBeCloseTo(20, 0);
  });

  it('extracts a filled rectangle as graphics SVG', async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 400]);
    page.drawRectangle({
      x: 50,
      y: 60,
      width: 100,
      height: 40,
      color: rgb(0, 0, 1),
      borderWidth: 0,
    });

    await pdfDoc.flush();

    const assets = page.extractContents();
    const gfx = assets.filter((a) => a.kind === 'graphics');
    expect(gfx.length).toBeGreaterThanOrEqual(1);
    const asset = gfx[0];
    if (asset.kind !== 'graphics') throw new Error('expected graphics');
    const svg = asset.getSvg();
    expect(svg).toContain('<path');
    expect(svg).toMatch(/fill="#[0-9a-fA-F]*00[0-9a-fA-F]*[fF]{2}"/);
    expect(asset.width).toBeGreaterThan(0);
    expect(asset.height).toBeGreaterThan(0);
  });

  it('extracts drawSvgPath geometry as graphics SVG', async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 400]);
    page.drawSvgPath('M 0 0 L 50 0 L 50 30 Z', {
      x: 100,
      y: 200,
      color: rgb(0, 0.5, 0),
      borderWidth: 0,
    });

    await pdfDoc.flush();

    const assets = page.extractContents();
    const gfx = assets.find((a) => a.kind === 'graphics');
    expect(gfx).toBeDefined();
    if (!gfx || gfx.kind !== 'graphics') throw new Error('expected graphics');
    expect(gfx.getSvg()).toContain('M ');
    expect(gfx.getSvg()).toContain('Z');
  });

  it('extracts assets from Form XObjects', async () => {
    const formDoc = await PDFDocument.create();
    const formFont = await formDoc.embedFont(StandardFonts.Helvetica);
    const formPage = formDoc.addPage([200, 100]);
    formPage.drawText('Inside Form', { font: formFont, size: 12, x: 5, y: 50 });

    const pdfDoc = await PDFDocument.create();
    const [embedded] = await pdfDoc.embedPdf(await formDoc.save());
    const page = pdfDoc.addPage([400, 400]);
    page.drawPage(embedded, { x: 0, y: 0 });

    await pdfDoc.flush();

    const assets = page.extractContents();
    const texts = assets.filter((a) => a.kind === 'text');
    expect(
      texts.some(
        (a) => a.kind === 'text' && a.getText().includes('Inside Form'),
      ),
    ).toBe(true);
  });

  it('still returns compressed bytes from PDFRawStream.getContents()', async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage();
    page.drawText('Keep compressed', { font, x: 10, y: 100 });

    const saved = await pdfDoc.save();
    const loaded = await PDFDocument.load(saved);
    const loadedPage = loaded.getPage(0);

    // Extraction still works after load
    const assets = loadedPage.extractContents();
    expect(
      assets.some(
        (a) => a.kind === 'text' && a.getText().includes('Keep compressed'),
      ),
    ).toBe(true);

    loadedPage.node.normalize();
    const { Contents } = loadedPage.node.normalizedEntries();
    const stream = Contents!.lookup(0);
    // After round-trip the content stream is a raw (possibly flate) stream
    if (stream instanceof PDFRawStream) {
      const compressed = stream.getContents();
      const decoded = decodePDFRawStream(stream).decode();
      expect(compressed.byteLength).toBeLessThan(decoded.byteLength);
    }
  });
});
