import fs from 'fs';
import { PDFDocument, AnnotationFlags } from 'src/index';

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

  it(`can't select a value not in the options list`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const planets = form.getOptionList('Which Are Planets? 🌎');
    expect(() => planets.select('One Punch Man')).toThrow();
  });

  it(`can merge options when selecting`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const planets = form.getOptionList('Which Are Planets? 🌎');
    planets.select(['Pluto'], true);
    expect(planets.getSelected()).toEqual(['Mars', 'Pluto']);
  });

  it(`can read its flag states`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const planets = form.getOptionList('Which Are Planets? 🌎');

    expect(planets.isExported()).toBe(true);
    expect(planets.isReadOnly()).toBe(false);
    expect(planets.isRequired()).toBe(false);
    expect(planets.isMultiselect()).toBe(false);
    expect(planets.isSelectOnClick()).toBe(false);
    expect(planets.isSorted()).toBe(false);
  });

  it(`produces printable widgets when added to a page`, async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const form = pdfDoc.getForm();

    const optionList = form.createOptionList('a.new.option.list');

    const widgets = () => optionList.acroField.getWidgets();
    expect(widgets().length).toBe(0);

    optionList.addToPage(page);
    expect(widgets().length).toBe(1);
    expect(widgets()[0].hasFlag(AnnotationFlags.Print)).toBe(true);
  });

  it(`sets page reference when added to a page`, async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const form = pdfDoc.getForm();

    const optionList = form.createOptionList('a.new.option.list');

    const widgets = () => optionList.acroField.getWidgets();
    expect(widgets().length).toBe(0);

    optionList.addToPage(page);
    expect(widgets().length).toBe(1);
    expect(widgets()[0].P()).toBe(page.ref);
  });
});
