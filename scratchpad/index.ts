import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument, PDFName } from 'src/index';
import {
  PDFAcroRadioButton,
  PDFAcroCheckBox,
  PDFAcroPushButton,
} from 'src/core/acroform';

(() => [fs, openPdf, Reader])();

(async () => {
  const pdfDoc = await PDFDocument.load(
    // fs.readFileSync('/Users/user/Desktop/f1040.pdf'),
    // fs.readFileSync('/Users/user/Desktop/copy_f1040.pdf'),
    // fs.readFileSync('/Users/user/Desktop/pdfbox_f1040.pdf'),

    // fs.readFileSync('/Users/user/Desktop/f1099msc.pdf'),
    fs.readFileSync('/Users/user/Desktop/radios.pdf'),
  );

  // TODO: getValueForExport(), getExportForValue()

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

    if (field instanceof PDFAcroCheckBox) {
      field.setValue(field.getOnValue()!);
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

  fields?.forEach((field) => {
    if (field instanceof PDFAcroPushButton) {
      // field.updateAppearances();
      const widgets = field.getWidgets();
      widgets.forEach((widget) => {
        console.log('BEFORE:', String(widget.dict));
        widget.dict.delete(PDFName.of('AP'));
        console.log('AFTER:', String(widget.dict));
      });
      console.log();
    }
    if (field instanceof PDFAcroCheckBox) {
      field.updateAppearances();
      const widgets = field.getWidgets();
      widgets.forEach((_widget) => {
        // widget.dict.delete(PDFName.of('AP'));
      });
    }
    if (field instanceof PDFAcroRadioButton) {
      field.updateAppearances();
      const widgets = field.getWidgets();
      widgets.forEach((_widget) => {
        // console.log(String(widget.dict));
      });
    }
  });

  fs.writeFileSync('out.pdf', await pdfDoc.save({ useObjectStreams: false }));
  openPdf('out.pdf', Reader.Preview);
})();
