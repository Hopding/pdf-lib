import fs from 'fs';
import {
  PDFDocument,
  PDFTextField,
  PDFCheckBox,
  PDFButton,
  PDFRadioGroup,
  PDFOptionList,
  PDFDropdown,
} from 'src/index';

const fancyFieldsPdfBytes = fs.readFileSync('assets/pdfs/fancy_fields.pdf');
// const sampleFormPdfBytes = fs.readFileSync('assets/pdfs/sample_form.pdf');
// const cannabisPdfBytes = fs.readFileSync('assets/pdfs/with_combed_fields.pdf');
// const dodPdfBytes = fs.readFileSync('assets/pdfs/dod_character.pdf');
// const xfaPdfBytes = fs.readFileSync('assets/pdfs/with_xfa_fields.pdf');

describe(`PDFForm`, () => {
  // prettier-ignore
  it(`provides access to all terminal fields in an AcroForm`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    expect(fields.length).toBe(15);

    expect(form.getField('Prefix ⚽️')).toBeInstanceOf(PDFTextField);
    expect(form.getField('First Name 🚀')).toBeInstanceOf(PDFTextField);
    expect(form.getField('MiddleInitial 🎳')).toBeInstanceOf(PDFTextField);
    expect(form.getField('LastName 🛩')).toBeInstanceOf(PDFTextField);
    expect(form.getField('Are You A Fairy? 🌿')).toBeInstanceOf(PDFCheckBox);
    expect(form.getField('Is Your Power Level Over 9000? 💪')).toBeInstanceOf(PDFCheckBox);
    expect(form.getField('Can You Defeat Enemies In One Punch? 👊')).toBeInstanceOf(PDFCheckBox);
    expect(form.getField('Will You Ever Let Me Down? ☕️')).toBeInstanceOf(PDFCheckBox);
    expect(form.getField('Eject 📼')).toBeInstanceOf(PDFButton);
    expect(form.getField('Submit 📝')).toBeInstanceOf(PDFButton);
    expect(form.getField('Play ▶️')).toBeInstanceOf(PDFButton);
    expect(form.getField('Launch 🚀')).toBeInstanceOf(PDFButton);
    expect(form.getField('Historical Figures 🐺')).toBeInstanceOf(PDFRadioGroup);
    expect(form.getField('Which Are Planets? 🌎')).toBeInstanceOf(PDFOptionList);
    expect(form.getField('Choose A Gundam 🤖')).toBeInstanceOf(PDFDropdown);

    const fieldDicts = fields.map(f => f.acroField.dict);
    const getFieldDict = (name: string) => form.getField(name)?.acroField.dict;

    expect(fieldDicts).toContain(getFieldDict('Prefix ⚽️'));
    expect(fieldDicts).toContain(getFieldDict('First Name 🚀'));
    expect(fieldDicts).toContain(getFieldDict('MiddleInitial 🎳'));
    expect(fieldDicts).toContain(getFieldDict('LastName 🛩'));
    expect(fieldDicts).toContain(getFieldDict('Are You A Fairy? 🌿'));
    expect(fieldDicts).toContain(getFieldDict('Is Your Power Level Over 9000? 💪'));
    expect(fieldDicts).toContain(getFieldDict('Can You Defeat Enemies In One Punch? 👊'));
    expect(fieldDicts).toContain(getFieldDict('Will You Ever Let Me Down? ☕️'));
    expect(fieldDicts).toContain(getFieldDict('Eject 📼'));
    expect(fieldDicts).toContain(getFieldDict('Submit 📝'));
    expect(fieldDicts).toContain(getFieldDict('Play ▶️'));
    expect(fieldDicts).toContain(getFieldDict('Launch 🚀'));
    expect(fieldDicts).toContain(getFieldDict('Historical Figures 🐺'));
    expect(fieldDicts).toContain(getFieldDict('Which Are Planets? 🌎'));
    expect(fieldDicts).toContain(getFieldDict('Choose A Gundam 🤖'));
  });

  // it(``, () => {});
});
