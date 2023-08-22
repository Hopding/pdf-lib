import fs from 'fs';
import { PDFDocument, AnnotationFlags } from 'src/index';

const fancyFieldsPdfBytes = fs.readFileSync('assets/pdfs/fancy_fields.pdf');
const pdfDocPromise = PDFDocument.load(fancyFieldsPdfBytes);

describe(`PDFCheckBox`, () => {
  it(`can read its value`, async () => {
    const pdfDoc = await pdfDocPromise;

    const form = pdfDoc.getForm();

    const isAFairy = form.getCheckBox('Are You A Fairy? 🌿');
    const isPowerLevelOver9000 = form.getCheckBox(
      'Is Your Power Level Over 9000? 💪',
    );
    const onePunch = form.getCheckBox(
      'Can You Defeat Enemies In One Punch? 👊',
    );
    const everLetMeDown = form.getCheckBox('Will You Ever Let Me Down? ☕️');

    expect(isAFairy.isChecked()).toBe(true);
    expect(isPowerLevelOver9000.isChecked()).toBe(false);
    expect(onePunch.isChecked()).toBe(true);
    expect(everLetMeDown.isChecked()).toBe(false);
  });

  it(`can read its flag states`, async () => {
    const pdfDoc = await pdfDocPromise;

    const form = pdfDoc.getForm();

    const isAFairy = form.getCheckBox('Are You A Fairy? 🌿');

    expect(isAFairy.isExported()).toBe(true);
    expect(isAFairy.isReadOnly()).toBe(false);
    expect(isAFairy.isRequired()).toBe(false);
  });

  it(`produces printable widgets when added to a page`, async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const form = pdfDoc.getForm();

    const checkBox = form.createCheckBox('a.new.check.box');

    const widgets = () => checkBox.acroField.getWidgets();
    expect(widgets().length).toBe(0);

    checkBox.addToPage(page);
    expect(widgets().length).toBe(1);
    expect(widgets()[0].hasFlag(AnnotationFlags.Print)).toBe(true);
  });

  it(`sets page reference when added to a page`, async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const form = pdfDoc.getForm();

    const checkBox = form.createCheckBox('a.new.check.box');

    const widgets = () => checkBox.acroField.getWidgets();
    expect(widgets().length).toBe(0);

    checkBox.addToPage(page);
    expect(widgets().length).toBe(1);
    expect(widgets()[0].P()).toBe(page.ref);
  });
});
