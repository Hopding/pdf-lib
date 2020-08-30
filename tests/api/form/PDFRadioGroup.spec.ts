import fs from 'fs';
import { PDFDocument } from 'src/index';

const fancyFieldsPdfBytes = fs.readFileSync('assets/pdfs/fancy_fields.pdf');

describe(`PDFRadioGroup`, () => {
  it(`can read its options`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const historicalFigures = form.getRadioGroup('Historical Figures 🐺');
    expect(historicalFigures.getOptions()).toEqual([
      'Marcus Aurelius 🏛️',
      'Ada Lovelace 💻',
      'Marie Curie ☢️',
      'Alexander Hamilton 🇺🇸',
    ]);
  });

  it(`can read its selected value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const historicalFigures = form.getRadioGroup('Historical Figures 🐺');
    expect(historicalFigures.getSelected()).toEqual('Marcus Aurelius 🏛️');
  });

  it(`can clear its value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const historicalFigures = form.getRadioGroup('Historical Figures 🐺');
    historicalFigures.clear();
    expect(historicalFigures.getSelected()).toBe(undefined);
  });

  it(`can select a value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const historicalFigures = form.getRadioGroup('Historical Figures 🐺');
    historicalFigures.select('Marie Curie ☢️');
    expect(historicalFigures.getSelected()).toBe('Marie Curie ☢️');
  });
});
