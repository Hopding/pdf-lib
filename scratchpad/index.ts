import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument, PDFName, StandardFonts, PDFHexString } from 'src/index';
import {
  PDFAcroRadioButton,
  PDFAcroCheckBox,
  PDFAcroPushButton,
  PDFAcroText,
  PDFAcroChoice,
} from 'src/core/acroform';

(() => [fs, openPdf, Reader])();

(async () => {
  const pdfDoc = await PDFDocument.load(
    // fs.readFileSync('/Users/user/Desktop/f1040.pdf'),
    // fs.readFileSync('/Users/user/Desktop/copy_f1040.pdf'),
    // fs.readFileSync('/Users/user/Desktop/pdfbox_f1040.pdf'),

    // fs.readFileSync('/Users/user/Desktop/comb_form.pdf'),
    // fs.readFileSync('/Users/user/Desktop/f1099msc.pdf'),
    fs.readFileSync('/Users/user/Desktop/radios.pdf'),
  );

  // TODO: getValueForExport(), getExportForValue()

  const helveticaFont = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);

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

    if (field instanceof PDFAcroText) {
      field.setValue('Foo\nbar\nQuxbaz\nLorem ipsum\nDolor');
    }

    if (field instanceof PDFAcroChoice) {
      field.setOptions([
        { value: PDFHexString.fromText('foo') },
        { value: PDFHexString.fromText('bar') },
      ]);
      field.setValues([field.getOptions()[1].value]);
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

  (() => [helveticaFont])();

  fields?.forEach((field) => {
    if (field instanceof PDFAcroChoice) {
      // field.updateAppearances(helveticaFont);
      const widgets = field.getWidgets();
      widgets.forEach((_widget) => {
        _widget.dict.delete(PDFName.of('AP'));
      });
    }
    if (field instanceof PDFAcroText) {
      console.log(`${field.getFullyQualifiedName()} isComb: ${field.isComb()}`);
      field.updateAppearances(helveticaFont);
      const widgets = field.getWidgets();
      widgets.forEach((_widget) => {
        // console.log(String(widget.dict));
      });
    }
    if (field instanceof PDFAcroPushButton) {
      field.updateAppearances(helveticaFont);
      const widgets = field.getWidgets();
      widgets.forEach((_widget) => {
        // console.log(String(widget.dict));
      });
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
