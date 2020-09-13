import fs from 'fs';
import { PDFDocument } from 'src/index';

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
});
