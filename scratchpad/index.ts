import fs from 'fs';
import { openPdf, Reader } from './open';
import { PDFDocument, rgb, drawCheckBox, StandardFonts } from 'src/index';

// import { PDFDocument, PDFName, StandardFonts, PDFHexString } from 'src/index';
// import {
//   PDFAcroRadioButton,
//   PDFAcroCheckBox,
//   PDFAcroPushButton,
//   PDFAcroText,
//   PDFAcroChoice,
// } from 'src/core/acroform';

(() => [fs, openPdf, Reader, rgb, drawCheckBox])();

// (async () => {
//   const pdfDoc = await PDFDocument.load(
//     // fs.readFileSync('/Users/user/Desktop/f1040.pdf'),
//     // fs.readFileSync('/Users/user/Desktop/copy_f1040.pdf'),
//     // fs.readFileSync('/Users/user/Desktop/pdfbox_f1040.pdf'),

//     // fs.readFileSync('/Users/user/Desktop/comb_form.pdf'),
//     // fs.readFileSync('/Users/user/Desktop/f1099msc.pdf'),
//     fs.readFileSync('/Users/user/Desktop/radios.pdf'),
//   );

//   // TODO: getValueForExport(), getExportForValue()

//   const helveticaFont = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);

//   const acroForm = pdfDoc.catalog.getAcroForm();
//   console.log('AcroForm:');
//   console.log(String(acroForm?.dict));
//   console.log();
//   acroForm?.dict.delete(PDFName.of('XFA'));

//   const fields = acroForm?.getAllFields();

//   fields?.forEach((field) => {
//     if (field.getFullyQualifiedName() === 'Group2') {
//       (field as PDFAcroRadioButton).setValue(PDFName.of('Choice2'));
//     }

//     if (field instanceof PDFAcroCheckBox) {
//       field.setValue(field.getOnValue()!);
//     }

//     if (field instanceof PDFAcroText) {
//       field.setValue('Foo\nbar\nQuxbaz\nLorem ipsum\nDolor');
//     }

//     if (field instanceof PDFAcroChoice) {
//       field.setOptions([
//         { value: PDFHexString.fromText('foo') },
//         { value: PDFHexString.fromText('bar') },
//       ]);
//       field.setValues([field.getOptions()[1].value]);
//     }

//     const fieldType = field.constructor.name;

//     console.log(`${field.getFullyQualifiedName()} (${fieldType})`);
//     if (field instanceof PDFAcroRadioButton) {
//       const value = field.getValue();
//       console.log(value);
//       const onValues = field.getOnValues();
//       console.log(onValues);
//       const exportValues = field.getExportValues();
//       console.log(exportValues);
//     }
//     if (field instanceof PDFAcroCheckBox) {
//       const value = field.getValue();
//       console.log(value);
//       const onValue = field.getOnValue();
//       console.log(onValue);
//       const exportValues = field.getExportValues();
//       console.log(exportValues);
//     }
//     console.log();
//   });

//   (() => [helveticaFont])();

//   fields?.forEach((field) => {
//     if (field instanceof PDFAcroChoice) {
//       // field.updateAppearances(helveticaFont);
//       const widgets = field.getWidgets();
//       widgets.forEach((_widget) => {
//         _widget.dict.delete(PDFName.of('AP'));
//       });
//     }
//     if (field instanceof PDFAcroText) {
//       console.log(`${field.getFullyQualifiedName()} isComb: ${field.isComb()}`);
//       field.updateAppearances(helveticaFont);
//       const widgets = field.getWidgets();
//       widgets.forEach((_widget) => {
//         // console.log(String(widget.dict));
//       });
//     }
//     if (field instanceof PDFAcroPushButton) {
//       field.updateAppearances(helveticaFont);
//       const widgets = field.getWidgets();
//       widgets.forEach((_widget) => {
//         // console.log(String(widget.dict));
//       });
//     }
//     if (field instanceof PDFAcroCheckBox) {
//       field.updateAppearances();
//       const widgets = field.getWidgets();
//       widgets.forEach((_widget) => {
//         // widget.dict.delete(PDFName.of('AP'));
//       });
//     }
//     if (field instanceof PDFAcroRadioButton) {
//       field.updateAppearances();
//       const widgets = field.getWidgets();
//       widgets.forEach((_widget) => {
//         // console.log(String(widget.dict));
//       });
//     }
//   });

//   fs.writeFileSync('out.pdf', await pdfDoc.save({ useObjectStreams: false }));
//   openPdf('out.pdf', Reader.Preview);
// })();

(async () => {
  const pdfDoc = await PDFDocument.load(
    // fs.readFileSync('/Users/user/Desktop/f1040.pdf'),
    // fs.readFileSync('/Users/user/Desktop/copy_f1040.pdf'),
    // fs.readFileSync('/Users/user/Desktop/pdfbox_f1040.pdf'),

    // fs.readFileSync('/Users/user/Desktop/comb_form.pdf'),
    // fs.readFileSync('/Users/user/Desktop/f1099msc.pdf'),
    fs.readFileSync('/Users/user/Desktop/radios.pdf'),
  );

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const courier = await pdfDoc.embedFont(StandardFonts.CourierOblique);

  const form = pdfDoc.getForm()!;

  const fields = form.getFields();

  console.log(
    'Fields:',
    fields.map((f) => [f.getName(), f.constructor.name]),
  );

  // === Buttons ===

  const btn8 = form.getButton('Button8');
  btn8.updateAppearances(helvetica);

  const btn9 = form.getButton('Button9');
  btn9.updateAppearances(helvetica);

  const btn10 = form.getButton('Button10');
  btn10.updateAppearances(helvetica);

  // === Radio Groups ===

  const rg1 = form.getRadioGroup('Group1');
  rg1.select('Choice2 - 🦄');
  console.log('rg1.getSelected():', rg1.getSelected());
  console.log('rg1.getOptions():', rg1.getOptions());
  rg1.updateAppearances();

  const rg2 = form.getRadioGroup('Group2');
  rg2.select('Choice3');
  console.log('rg2.getSelected():', rg2.getSelected());
  console.log('rg2.getOptions():', rg2.getOptions());
  rg2.updateAppearances();

  // === Check Boxes ===

  const cb1 = form.getCheckBox('Check Box 1');
  cb1.check();
  console.log('cb1.isChecked():', cb1.isChecked());
  cb1.updateAppearances();

  const cb2 = form.getCheckBox('Check Box 2');
  cb2.check();
  console.log('cb2.isChecked():', cb1.isChecked());
  cb2.updateAppearances();

  const cb5 = form.getCheckBox('Check Box5');
  cb5.check();
  console.log('cb5.isChecked():', cb1.isChecked());
  cb5.updateAppearances();

  const cb6 = form.getCheckBox('Check Box6');
  cb6.check();
  console.log('cb6.isChecked():', cb1.isChecked());
  cb6.updateAppearances();

  const cb7 = form.getCheckBox('Check Box7');
  cb7.check();
  console.log('cb7.isChecked():', cb1.isChecked());
  cb7.updateAppearances();

  // === Dropdowns ===

  const dd1 = form.getDropdown('Dropdown1');
  dd1.select('Item2');
  console.log('dd1.getSelectedIndices():', dd1.getSelectedIndices());
  console.log('dd1.getSelected():', dd1.getSelected());
  console.log('dd1.getOptions():', dd1.getOptions());
  dd1.updateAppearances(courier);

  const dd4 = form.getDropdown('Dropdown4');
  dd4.select(['Item3', 'Item1']);
  console.log('dd4.getSelectedIndices():', dd4.getSelectedIndices());
  console.log('dd4.getSelected():', dd4.getSelected());
  console.log('dd4.getOptions():', dd4.getOptions());
  dd4.updateAppearances(courier);

  // === Text Fields ===

  const tf5 = form.getTextField('Text5');
  tf5.setText('Foo\nbar\nQuxbaz\nLorem ipsum\nDolor');
  console.log('tf5.getText():', tf5.getText());
  tf5.updateAppearances(helvetica);

  const tf6 = form.getTextField('Text6');
  tf6.setText('Foo\nbar\nQuxbaz\nLorem ipsum\nDolor');
  console.log('tf6.getText():', tf6.getText());
  tf6.updateAppearances(helvetica);

  const tf7 = form.getTextField('Text7');
  tf7.setText('Foo\nbar\nQuxbaz\nLorem ipsum\nDolor');
  console.log('tf7.getText():', tf7.getText());
  tf7.updateAppearances(helvetica);

  const tfDate = form.getTextField('Date1_af_date');
  tfDate.setText('Foo\nbar\nQuxbaz\nLorem ipsum\nDolor');
  console.log('tfDate.getText():', tfDate.getText());
  tfDate.updateAppearances(helvetica);

  // === Comb Form ===

  // fields.forEach((field) => {
  //   if (field instanceof PDFTextField) {
  //     if (!field.isReadOnly()) {
  //       field.setText(
  //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam fermentum massa et tortor malesuada, at mollis mauris auctor. Quisque ac auctor dui, vel luctus dui.'.substring(
  //           0,
  //           field.getMaxLength(),
  //         ),
  //       );
  //     }
  //     field.updateAppearances(helvetica);
  //   }
  // });

  fs.writeFileSync('out.pdf', await pdfDoc.save({ useObjectStreams: false }));
  openPdf('out.pdf', Reader.Preview);
})();
