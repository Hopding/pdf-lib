import fs from 'fs';
import { PDFDocument } from 'src/index';

const fancyFieldsPdfBytes = fs.readFileSync('assets/pdfs/fancy_fields.pdf');

describe(`PDFOptionList`, () => {
  it(`can read its options`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const planets = form.getOptionList('Which Are Planets? 🌎');
    expect(planets.getOptions()).toEqual(['Earth', 'Mars', 'Pluto', 'Neptune']);
  });

  it(`can read its selected value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const planets = form.getOptionList('Which Are Planets? 🌎');
    expect(planets.getSelected()).toEqual(['Mars']);
  });

  it(`can clear its value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const planets = form.getOptionList('Which Are Planets? 🌎');
    planets.clear();
    expect(planets.getSelected()).toEqual([]);
  });

  it(`can select a single value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const planets = form.getOptionList('Which Are Planets? 🌎');
    planets.select('Neptune');
    expect(planets.getSelected()).toEqual(['Neptune']);
  });

  it(`can select multiple values`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const planets = form.getOptionList('Which Are Planets? 🌎');
    planets.select(['Pluto', 'Neptune']);
    expect(planets.getSelected()).toEqual(['Pluto', 'Neptune']);
  });

  it(`can merge options when selecting`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const planets = form.getOptionList('Which Are Planets? 🌎');
    planets.select(['Pluto'], true);
    expect(planets.getSelected()).toEqual(['Mars', 'Pluto']);
  });
});
