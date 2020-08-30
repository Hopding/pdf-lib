import fs from 'fs';
import { PDFDocument } from 'src/index';

const fancyFieldsPdfBytes = fs.readFileSync('assets/pdfs/fancy_fields.pdf');

describe(`PDFDropdown`, () => {
  it(`can read its options`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const gundams = form.getDropdown('Choose A Gundam 🤖');
    expect(gundams.getOptions()).toEqual([
      'Exia',
      'Kyrios',
      'Virtue',
      'Dynames',
    ]);
  });

  it(`can read its selected value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const gundams = form.getDropdown('Choose A Gundam 🤖');
    expect(gundams.getSelected()).toEqual(['Dynames']);
  });

  it(`can clear its value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const gundams = form.getDropdown('Choose A Gundam 🤖');
    gundams.clear();
    expect(gundams.getSelected()).toEqual([]);
  });

  it(`can select a single value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const gundams = form.getDropdown('Choose A Gundam 🤖');
    gundams.select('Kyrios');
    expect(gundams.getSelected()).toEqual(['Kyrios']);
  });

  it(`can select multiple values`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const gundams = form.getDropdown('Choose A Gundam 🤖');
    gundams.select(['Exia', 'Virtue']);
    expect(gundams.getSelected()).toEqual(['Exia', 'Virtue']);
  });

  it(`can merge options when selecting`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const gundams = form.getDropdown('Choose A Gundam 🤖');
    gundams.select(['Exia'], true);
    expect(gundams.getSelected()).toEqual(['Dynames', 'Exia']);
  });
});
