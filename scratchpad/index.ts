import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument, PDFName } from 'src/index';
import { PDFAcroRadioButton, PDFAcroCheckBox } from 'src/core/acroform';

// const getButtonType = (button: PDFAcroButton) => {
//   if (button.isPushButton()) return 'Push Button';
//   if (button.isRadioButton()) return 'Radio Button';
//   if (button.isCheckBoxButton()) return 'Check Box Button';
//   throw new Error('Unknown button type');
// };

(() => [fs, openPdf, Reader])();

(async () => {
  const pdfDoc = await PDFDocument.load(
    // fs.readFileSync('/Users/user/Desktop/f1040.pdf'),
    // fs.readFileSync('/Users/user/Desktop/copy_f1040.pdf'),
    // fs.readFileSync('/Users/user/Desktop/pdfbox_f1040.pdf'),

    fs.readFileSync('/Users/user/Desktop/f1099msc.pdf'),
    // fs.readFileSync('/Users/user/Desktop/radios.pdf'),
  );

  const acroForm = pdfDoc.catalog.getAcroForm();
  console.log('AcroForm:');
  console.log(String(acroForm?.dict));
  console.log();
  acroForm?.dict.delete(PDFName.of('XFA'));

  const fields = acroForm?.getAllFields();

  fields?.forEach((field) => {
    if (field.getFullyQualifiedName() === 'Group2') {
      (field as PDFAcroRadioButton).setValue(PDFName.of('Choice2'));
    }

    if (
      field.getFullyQualifiedName() ===
        'topmostSubform[0].CopyA[0].CopyAHeader[0].c1_1[0]' ||
      field.getFullyQualifiedName() ===
        'topmostSubform[0].CopyA[0].CopyAHeader[0].c1_1[1]'
    ) {
      const x = field as PDFAcroCheckBox;
      x.setValue(x.getOnValue()!);
    }

    const fieldType = field.constructor.name;

    console.log(`${field.getFullyQualifiedName()} (${fieldType})`);
    if (field instanceof PDFAcroRadioButton) {
      const value = field.getValue();
      console.log(value);
      const onValues = field.getOnValues();
      console.log(onValues);
      const exportValues = field.getExportValues();
      console.log(exportValues);
    }
    if (field instanceof PDFAcroCheckBox) {
      const value = field.getValue();
      console.log(value);
      const onValue = field.getOnValue();
      console.log(onValue);
      const exportValues = field.getExportValues();
      console.log(exportValues);
    }
    console.log();
  });

  fs.writeFileSync('out.pdf', await pdfDoc.save());
  openPdf('out.pdf', Reader.Acrobat);
})();
