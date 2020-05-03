import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument } from 'src/index';
import { PDFAcroButton } from 'src/core/acroform';

(() => [fs, openPdf, Reader])();

const getButtonType = (button: PDFAcroButton) => {
  if (button.isPushButton()) return 'Push Button';
  if (button.isRadioButton()) return 'Radio Button';
  if (button.isCheckBoxButton()) return 'Check Box Button';
  throw new Error('Unknown button type');
};

(async () => {
  const pdfDoc = await PDFDocument.load(
    // fs.readFileSync('/Users/user/Desktop/f1040.pdf'),
    // fs.readFileSync('/Users/user/Desktop/copy_f1040.pdf'),
    // fs.readFileSync('/Users/user/Desktop/pdfbox_f1040.pdf'),

    // fs.readFileSync('/Users/user/Desktop/f1099msc.pdf'),
    fs.readFileSync('/Users/user/Desktop/radios.pdf'),
  );

  const acroForm = pdfDoc.catalog.getAcroForm();
  console.log('AcroForm:');
  console.log(String(acroForm?.dict));
  console.log();

  const fields = acroForm?.getAllFields();

  fields?.forEach((field) => {
    // if (
    //   field.getPartialName() !== 'FilingStatus[0]' &&
    //   field.getParent()?.getPartialName() !== 'FilingStatus[0]'
    // ) {
    //   return;
    // }

    const fieldType =
      field instanceof PDFAcroButton
        ? getButtonType(field)
        : field.constructor.name;

    console.log(`${field.getPartialName()} (${fieldType})`);
    console.log(String(field.dict));
    console.log();
  });
})();
