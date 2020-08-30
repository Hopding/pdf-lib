import fs from 'fs';
import { PDFDocument, TextAlignment } from 'src/index';

const fancyFieldsPdfBytes = fs.readFileSync('assets/pdfs/fancy_fields.pdf');

describe(`PDFTextField`, () => {
  it(`can read its value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);

    const form = pdfDoc.getForm();

    const prefix = form.getTextField('Prefix ⚽️');
    const firstName = form.getTextField('First Name 🚀');
    const middleInitial = form.getTextField('MiddleInitial 🎳');
    const lastName = form.getTextField('LastName 🛩');

    expect(prefix.getText()).toEqual('Ms.');
    expect(firstName.getText()).toEqual('Cedar');
    expect(middleInitial.getText()).toEqual('M');
    expect(lastName.getText()).toEqual('Lightningtwirls');
  });

  it(`can read its alignment`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);

    const form = pdfDoc.getForm();

    const prefix = form.getTextField('Prefix ⚽️');
    const firstName = form.getTextField('First Name 🚀');
    const middleInitial = form.getTextField('MiddleInitial 🎳');
    const lastName = form.getTextField('LastName 🛩');

    expect(prefix.getAlignment()).toEqual(TextAlignment.Center);
    expect(firstName.getAlignment()).toEqual(TextAlignment.Left);
    expect(middleInitial.getAlignment()).toEqual(TextAlignment.Center);
    expect(lastName.getAlignment()).toEqual(TextAlignment.Right);
  });

  it(`can write a value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);

    const form = pdfDoc.getForm();

    const prefix = form.getTextField('Prefix ⚽️');
    const firstName = form.getTextField('First Name 🚀');
    const middleInitial = form.getTextField('MiddleInitial 🎳');
    const lastName = form.getTextField('LastName 🛩');

    prefix.setText('Some boats 🚤');
    firstName.setText('Chili peppers 🌶');
    middleInitial.setText('Pineapplez 🍍');
    lastName.setText('And christmas trees! 🎄');

    expect(prefix.getText()).toEqual('Some boats 🚤');
    expect(firstName.getText()).toEqual('Chili peppers 🌶');
    expect(middleInitial.getText()).toEqual('Pineapplez 🍍');
    expect(lastName.getText()).toEqual('And christmas trees! 🎄');
  });
});
