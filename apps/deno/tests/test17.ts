import fontkit from 'https://cdn.skypack.dev/@pdf-lib/fontkit@^1.0.0?dts';

import { Assets } from '../index.ts';

// @deno-types="../dummy.d.ts"
import {
  PDFDocument,
  StandardFonts,
  drawRectangle,
  rgb,
  degrees,
  drawText,
  PDFFont,
  drawEllipse,
  PDFWidgetAnnotation,
} from '../../../dist/pdf-lib.esm.js';

export default async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.fancy_fields);

  pdfDoc.registerFontkit(fontkit);
  const ubuntuFont = await pdfDoc.embedFont(assets.fonts.ttf.ubuntu_r);

  const form = pdfDoc.getForm();

  // Text Fields
  const prefix = form.getTextField('Prefix ⚽️');
  prefix.updateAppearances(ubuntuFont);

  const firstName = form.getTextField('First Name 🚀');
  firstName.updateAppearances(ubuntuFont);

  const middleInitial = form.getTextField('MiddleInitial 🎳');
  middleInitial.updateAppearances(ubuntuFont);

  const lastName = form.getTextField('LastName 🛩');
  lastName.updateAppearances(ubuntuFont);

  // Check Boxes
  const isAFairy = form.getCheckBox('Are You A Fairy? 🌿');
  isAFairy.updateAppearances();

  const isPowerLevelOver9000 = form.getCheckBox(
    'Is Your Power Level Over 9000? 💪',
  );
  isPowerLevelOver9000.updateAppearances();

  const onePunch = form.getCheckBox('Can You Defeat Enemies In One Punch? 👊');
  onePunch.updateAppearances();

  const everLetMeDown = form.getCheckBox('Will You Ever Let Me Down? ☕️');
  everLetMeDown.updateAppearances();

  // Buttons
  const eject = form.getButton('Eject 📼');
  eject.updateAppearances(ubuntuFont);

  const submit = form.getButton('Submit 📝');
  submit.updateAppearances(ubuntuFont);

  const play = form.getButton('Play ▶️');
  play.updateAppearances(ubuntuFont);

  const launch = form.getButton('Launch 🚀');
  launch.updateAppearances(ubuntuFont);

  // Radio Group
  const historicalFigures = form.getRadioGroup('Historical Figures 🐺');
  historicalFigures.updateAppearances();

  // Option List
  const planets = form.getOptionList('Which Are Planets? 🌎');
  planets.updateAppearances(ubuntuFont);

  // Dropdown
  const gundams = form.getDropdown('Choose A Gundam 🤖');
  gundams.select('One Punch Man');
  gundams.updateAppearances(ubuntuFont);

  // ===================== Custom Appearance Providers ========================
  const page = pdfDoc.addPage();
  const symbol = await pdfDoc.embedFont(StandardFonts.Symbol);

  const btn = form.createButton('custom.button.field');
  const cb = form.createCheckBox('custom.checkbox.field');
  const dd = form.createDropdown('custom.dropdown.field');
  const ol = form.createOptionList('custom.optionlist.field');
  const rg = form.createRadioGroup('custom.radiogroup.field');
  const tf = form.createTextField('custom.text.field');
  const tfFontSize = form.createTextField('custom.text.fieldFontSize');

  dd.addOptions('∑');
  ol.addOptions('∑');

  const width = 100;
  const height = 50;
  const x = page.getWidth() / 2 - width / 2;
  let y = page.getHeight();

  y -= height + 25;
  btn.addToPage('∑', page, { x, y, width, height, font: symbol });
  y -= height + 25;
  cb.addToPage(page, { x, y, width, height });
  y -= height + 25;
  dd.addToPage(page, { x, y, width, height, font: symbol });
  y -= height + 25;
  ol.addToPage(page, { x, y, width, height, font: symbol });
  y -= height + 25;
  rg.addOptionToPage('bar', page, { x, y, width, height });
  y -= height + 25;
  tf.addToPage(page, { x, y, width, height, font: symbol });
  y -= height * 4 + 25;
  tfFontSize.addToPage(page, {
    x: x - width * 2,
    y,
    width: width * 5,
    height: height * 4,
    font: ubuntuFont,
  });
  tfFontSize.enableMultiline();
  tfFontSize.setFontSize(71.999);
  tfFontSize.setText('This text should be huge');

  const rectangle = drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    borderWidth: 2,
    color: rgb(1, 0.1, 0.75),
    borderColor: rgb(0, 0.1, 1),
    rotate: degrees(0),
    xSkew: degrees(0),
    ySkew: degrees(0),
  });

  const circle = drawEllipse({
    x: 15,
    y: height - 15,
    xScale: 15,
    yScale: 15,
    borderWidth: 0,
    color: rgb(0, 0, 0),
    borderColor: undefined,
    rotate: degrees(0),
  });

  const text = symbol.encodeText('ℑ');
  const textW = symbol.widthOfTextAtSize('ℑ', 35);
  const textH = symbol.heightAtSize(35);
  const symbolText = (font: PDFFont) =>
    drawText(text, {
      x: width / 2 - textW / 2,
      y: height / 2 - textH / 2 + 10,
      color: rgb(0, 0, 0),
      font: font.name,
      size: 35,
      rotate: degrees(0),
      xSkew: degrees(0),
      ySkew: degrees(0),
    });

  const assert = (condition: boolean, msg = '') => {
    if (!condition) throw new Error(msg || 'Assertion failed');
  };

  btn.updateAppearances(symbol, (field: any, widget: any, font: any) => {
    assert(field === btn);
    assert(widget instanceof PDFWidgetAnnotation);
    return [...rectangle, ...symbolText(font)];
  });
  cb.updateAppearances((field: any, widget: any) => {
    assert(field === cb);
    assert(widget instanceof PDFWidgetAnnotation);
    return { on: [...rectangle, ...circle], off: [...rectangle, ...circle] };
  });
  dd.updateAppearances(symbol, (field: any, widget: any, font: any) => {
    assert(field === dd);
    assert(widget instanceof PDFWidgetAnnotation);
    return [...rectangle, ...symbolText(font)];
  });
  ol.updateAppearances(symbol, (field: any, widget: any, font: any) => {
    assert(field === ol);
    assert(widget instanceof PDFWidgetAnnotation);
    return [...rectangle, ...symbolText(font)];
  });
  rg.updateAppearances((field: any, widget: any) => {
    assert(field === rg);
    assert(widget instanceof PDFWidgetAnnotation);
    return { on: [...rectangle, ...circle], off: [...rectangle, ...circle] };
  });
  tf.updateAppearances(symbol, (field: any, widget: any, font: any) => {
    assert(field === tf);
    assert(widget instanceof PDFWidgetAnnotation);
    return [...rectangle, ...symbolText(font)];
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
