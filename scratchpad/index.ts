import fs from 'fs';
import { openPdf, Reader } from './open';
import {
  PDFDocument,
  rgb,
  drawCheckBox,
  StandardFonts,
  degrees,
} from 'src/index';

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
  await (async () => {
    console.log('---------- DOC ----------');
    const d = await PDFDocument.create();
    const f = d.getForm();
    const h = await d.embedFont(StandardFonts.Helvetica);

    const p = d.addPage([300, 300]);
    const tf = f.createTextField('foo.bar');
    tf.addToPage(h, p, {
      backgroundColor: rgb(1, 1, 0),
      borderColor: rgb(1, 0, 1),
    });

    fs.writeFileSync('out2.pdf', await d.save({ useObjectStreams: false }));
    console.log('-------------------------');
  })();

  const pdfDoc = await PDFDocument.load(
    // fs.readFileSync('/Users/user/Desktop/f1040.pdf'),
    // fs.readFileSync('/Users/user/Desktop/copy_f1040.pdf'),
    // fs.readFileSync('/Users/user/Desktop/pdfbox_f1040.pdf'),

    // fs.readFileSync('/Users/user/Desktop/comb_form.pdf'),
    // fs.readFileSync('/Users/user/Desktop/f1099msc.pdf'),
    fs.readFileSync('/Users/user/Desktop/radios.pdf'),
  );

  // const pdfDoc = await PDFDocument.create();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const courier = await pdfDoc.embedFont(StandardFonts.CourierOblique);
  (() => courier)();

  const form = pdfDoc.getForm();

  const fields = form.getFields();

  console.log(
    'Fields:',
    fields.map((f) => [f.getName(), f.constructor.name]),
  );

  // const page1 = pdfDoc.addPage();
  const page1 = pdfDoc.getPage(0);
  const page2 = pdfDoc.addPage();

  const newRg3 = form.createRadioGroup('exia.kyrios.dynames.virtue');
  newRg3.addOptionToPage('qux 💩', page1, {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    backgroundColor: rgb(1, 0, 0),
    borderColor: rgb(0, 0.1, 0),
    borderWidth: 5,
  });

  // TODO: Need to use export values when adding these options
  newRg3.addOptionToPage('baz 😊', page2, {
    x: 0,
    y: 50,
    width: 50,
    height: 50,
  });

  newRg3.addOptionToPage('qux 💩', page1, {
    x: 0,
    y: 100,
    width: 50,
    height: 50,
  });

  // newRg.setAllowTogglingOff(true);
  newRg3.setRadiosAreMutuallyExclusive(false);
  newRg3.select('qux');

  const newCb1 = form.createCheckBox('superbooster 🚀');
  newCb1.addToPage(page2, {
    x: 5 + 1,
    y: page2.getHeight() - (50 + 5),
    width: 50,
    height: 50,
    backgroundColor: rgb(1, 0, 0),
    borderColor: rgb(0, 0.1, 0),
    borderWidth: 2,
    rotate: degrees(0),
  });
  newCb1.addToPage(page2, {
    x: 5 + 1,
    y: page2.getHeight() - (50 + 5),
    width: 50,
    height: 50,
    backgroundColor: rgb(1, 0, 0),
    borderColor: rgb(0, 0.1, 0),
    borderWidth: 2,
    rotate: degrees(90),
  });
  newCb1.addToPage(page2, {
    x: 5 + 1,
    y: page2.getHeight() - (50 + 5),
    width: 50,
    height: 50,
    backgroundColor: rgb(1, 0, 0),
    borderColor: rgb(0, 0.1, 0),
    borderWidth: 2,
    rotate: degrees(180),
  });
  newCb1.addToPage(page2, {
    x: 5 + 1,
    y: page2.getHeight() - (50 + 5),
    width: 50,
    height: 50,
    backgroundColor: rgb(1, 0, 0),
    borderColor: rgb(0, 0.1, 0),
    borderWidth: 2,
    rotate: degrees(270),
  });
  newCb1.check();
  page2.drawRectangle({
    x: 5 + 1,
    y: page2.getHeight() - (50 + 5) * 2,
    width: 50,
    height: 50,
    color: rgb(0, 0.1, 0),
    borderColor: rgb(1, 0, 0),
    borderWidth: 2,
  });

  const newBtn1 = form.createButton('super duper button!');
  newBtn1.addToPage('Foo Bar', helvetica, page2, {
    x: page2.getWidth() - (100 + 5),
    y: page2.getHeight() - (50 + 5),
    width: 100,
    height: 50,
    backgroundColor: rgb(1, 0, 0),
    borderColor: rgb(0, 1, 0.75),
    borderWidth: 5,
    // borderWidth: 1,
    rotate: degrees(0),
  });
  newBtn1.addToPage('Foo Bar', helvetica, page2, {
    x: page2.getWidth() - (100 + 5),
    y: page2.getHeight() - (50 + 5),
    width: 100,
    height: 50,
    backgroundColor: rgb(1, 0, 0),
    borderColor: rgb(0, 1, 0.75),
    borderWidth: 5,
    // borderWidth: 1,
    rotate: degrees(90),
  });
  newBtn1.addToPage('Foo Bar', helvetica, page2, {
    x: page2.getWidth() - (100 + 5),
    y: page2.getHeight() - (50 + 5),
    width: 100,
    height: 50,
    backgroundColor: rgb(1, 0, 0),
    borderColor: rgb(0, 1, 0.75),
    borderWidth: 5,
    // borderWidth: 1,
    rotate: degrees(180),
  });
  newBtn1.addToPage('Foo Bar', helvetica, page2, {
    x: page2.getWidth() - (100 + 5),
    y: page2.getHeight() - (50 + 5),
    width: 100,
    height: 50,
    backgroundColor: rgb(1, 0, 0),
    borderColor: rgb(0, 1, 0.75),
    borderWidth: 5,
    // borderWidth: 1,
    rotate: degrees(270),
  });

  page2.drawRectangle({
    x: page2.getWidth() - (100 + 5) * 4,
    y: page2.getHeight() - (50 + 5) * 2,
    width: 100,
    height: 50,
    color: rgb(1, 0, 0),
    borderColor: rgb(0, 1, 0.75),
    borderWidth: 5,
    rotate: degrees(0),
  });
  page2.drawRectangle({
    x: page2.getWidth() - (100 + 5) * 4,
    y: page2.getHeight() - (50 + 5) * 2,
    width: 100,
    height: 50,
    color: rgb(1, 0, 0),
    borderColor: rgb(0, 1, 0.75),
    borderWidth: 5,
    rotate: degrees(90),
  });
  page2.drawRectangle({
    x: page2.getWidth() - (100 + 5) * 4,
    y: page2.getHeight() - (50 + 5) * 2,
    width: 100,
    height: 50,
    color: rgb(1, 0, 0),
    borderColor: rgb(0, 1, 0.75),
    borderWidth: 5,
    rotate: degrees(180),
  });
  page2.drawRectangle({
    x: page2.getWidth() - (100 + 5) * 4,
    y: page2.getHeight() - (50 + 5) * 2,
    width: 100,
    height: 50,
    color: rgb(1, 0, 0),
    borderColor: rgb(0, 1, 0.75),
    borderWidth: 5,
    rotate: degrees(270),
  });

  const newDd1 = form.createDropdown('spooky boo 👻');
  newDd1.setAllowEditing(true);
  newDd1.setOptions(['foo', 'bar', 'qux', 'baz']);
  newDd1.select('bar');
  newDd1.addToPage(helvetica, page2, {
    x: page2.getWidth() / 2 - 100 / 2,
    y: page2.getHeight() - (50 + 5),
    width: 100,
    height: 50,
    backgroundColor: rgb(1, 0, 0),
    borderColor: rgb(0, 1, 0.75),
    borderWidth: 5,
  });

  const newOl1 = form.createOptionList('booky poo!');
  newOl1.setOptions(['foo', 'bar', 'qux', 'baz']);
  newOl1.select('bar');
  newOl1.addToPage(helvetica, page2, {
    x: page2.getWidth() / 2 - 100 / 2,
    y: page2.getHeight() - (100 + 50 + 5),
    width: 100,
    height: 50,
    backgroundColor: rgb(1, 0, 0),
    borderColor: rgb(0, 1, 0.75),
    borderWidth: 5,
  });

  const newTf1 = form.createTextField('lah dee dah 1');
  newTf1.setText('Lorem ipsum dolor');
  console.log('---------------');
  newTf1.addToPage(helvetica, page2, {
    x: 250,
    y: page2.getHeight() - (100 + 50 + 5) - 250,
    width: 100,
    height: 50,
    backgroundColor: rgb(1, 0, 0),
    borderColor: rgb(0, 1, 0.75),
    borderWidth: 5,
    // borderWidth: 0,
    // rotate: degrees(90),
  });
  console.log('---------------');
  page2.drawRectangle({
    x: 305 + 1,
    y: page2.getHeight() - (100 + 50 + 5) - 250,
    width: 100,
    height: 50,
    color: rgb(0, 1, 0.75),
    borderColor: rgb(1, 0, 0),
    borderWidth: 5,
    rotate: degrees(90),
  });

  const newTf2 = form.createTextField('lah dee dah 2');
  newTf2.setText('Lorem ipsum dolor');
  newTf2.setIsMultiline(true);
  newTf2.addToPage(helvetica, page2, {
    x: 5,
    y: page2.getHeight() - (175 + 50 + 5),
    width: 100,
    height: 50,
  });
  newTf2.addToPage(helvetica, page2, {
    x: 5,
    y: page2.getHeight() - (175 + 50 + 5) - 200,
    width: 100,
    height: 50,
    backgroundColor: rgb(0, 1, 0.75),
    borderColor: rgb(1, 0, 0),
    borderWidth: 5,
  });

  const newTf3 = form.createTextField('lah dee dah 3');
  newTf3.setText('Lorem');
  newTf3.setMaxLength(5);
  newTf3.setIsEvenlySpaced(true);
  newTf3.addToPage(helvetica, page2, {
    x: 5,
    y: page2.getHeight() - (250 + 50 + 5),
    width: 100,
    height: 50,
  });
  newTf3.addToPage(helvetica, page2, {
    x: 5,
    y: page2.getHeight() - (250 + 50 + 5) - 200,
    width: 100,
    height: 50,
    backgroundColor: rgb(0, 1, 0.75),
    borderColor: rgb(1, 0, 0),
    borderWidth: 5,
  });

  // === Buttons ===

  // const btn8 = form.getButton('Button8');
  // btn8.updateAppearances(helvetica);

  // const btn9 = form.getButton('Button9');
  // btn9.updateAppearances(helvetica);

  // const btn10 = form.getButton('Button10');
  // btn10.updateAppearances(helvetica);

  // === Radio Groups ===

  const rg1 = form.getRadioGroup('Group1');
  rg1.select('Choice2 - 🦄');
  rg1.clear();
  console.log('rg1.getSelected():', rg1.getSelected());
  console.log('rg1.getOptions():', rg1.getOptions());
  rg1.updateAppearances();

  const rg2 = form.getRadioGroup('Group2');
  rg2.select('Choice1');
  console.log('rg2.getSelected():', rg2.getSelected());
  console.log('rg2.getOptions():', rg2.getOptions());
  rg2.updateAppearances();

  rg1.addOptionToPage('Testing lulz 🛁', page1, {
    x: page2.getWidth() - 50,
    y: 50,
    width: 50,
    height: 50,
  });

  // === Check Boxes ===

  const cb1 = form.getCheckBox('Check Box 1');
  cb1.check();
  console.log('cb1.isChecked():', cb1.isChecked());
  // cb1.updateAppearances();

  const cb2 = form.getCheckBox('Check Box 2');
  cb2.check();
  console.log('cb2.isChecked():', cb1.isChecked());
  // cb2.updateAppearances();

  const cb5 = form.getCheckBox('Check Box5');
  cb5.check();
  console.log('cb5.isChecked():', cb1.isChecked());
  // cb5.updateAppearances();

  const cb6 = form.getCheckBox('Check Box6');
  cb6.check();
  console.log('cb6.isChecked():', cb1.isChecked());
  // cb6.updateAppearances();

  const cb7 = form.getCheckBox('Check Box7');
  cb7.check();
  console.log('cb7.isChecked():', cb1.isChecked());
  // cb7.updateAppearances();

  // === Dropdowns ===

  const dd1 = form.getDropdown('Dropdown1');
  dd1.addOptions('foo');
  dd1.addOptions(['bar', 'qux']);
  dd1.select('Item2');
  console.log('dd1.getSelected():', dd1.getSelected());
  console.log('dd1.getOptions():', dd1.getOptions());
  // dd1.updateAppearances(courier);

  const dd4 = form.getDropdown('Dropdown4');
  dd4.select(['Item3', 'Item1']);
  console.log('dd4.getSelected():', dd4.getSelected());
  console.log('dd4.getOptions():', dd4.getOptions());
  // dd4.updateAppearances(courier);

  // === Option Lists ===

  const ol2 = form.getOptionList('List Box2');
  ol2.select(['Item2', 'Item4']);
  console.log('ol2.getSelected():', ol2.getSelected());
  console.log('ol2.getOptions():', ol2.getOptions());
  // ol2.updateAppearances(helvetica);

  // === Text Fields ===

  const tf5 = form.getTextField('Text5');
  tf5.setText('Foo\nbar\nQuxbaz\nLorem ipsum\nDolor');
  console.log('tf5.getText():', tf5.getText());
  // tf5.updateAppearances(helvetica);

  const tf6 = form.getTextField('Text6');
  tf6.setText('Foo\nbar\nQuxbaz\nLorem ipsum\nDolor');
  console.log('tf6.getText():', tf6.getText());
  // tf6.updateAppearances(helvetica);

  const tf7 = form.getTextField('Text7');
  tf7.setText('Foo\nbar\nQuxbaz\nLorem ipsum\nDolor');
  console.log('tf7.getText():', tf7.getText());
  // tf7.updateAppearances(helvetica);

  const tfDate = form.getTextField('Date1_af_date');
  tfDate.setText('Foo\nbar\nQuxbaz\nLorem ipsum\nDolor');
  console.log('tfDate.getText():', tfDate.getText());
  // tfDate.updateAppearances(helvetica);

  // // === Comb Form ===

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

  fs.writeFileSync(
    'out.pdf',
    await pdfDoc.save({
      useObjectStreams: false,
      // updateFieldAppearances: false,
    }),
  );
  openPdf('out.pdf', Reader.Acrobat);
})();
