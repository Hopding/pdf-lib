import fontkit from '@pdf-lib/fontkit';
import {
  clip,
  clipEvenOdd,
  closePath,
  cmyk,
  degrees,
  drawRectangle,
  endPath,
  grayscale,
  LineCapStyle,
  LineJoinStyle,
  lineTo,
  typedArrayFor,
  moveTo,
  PDFDocument,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  setLineJoin,
  StandardFonts,
  AFRelationship,
} from 'pdf-lib';

import { fetchAsset } from './assets';

const ipsumLines = [
  'Eligendi est pariatur quidem in non excepturi et.',
  'Consectetur non tenetur magnam est corporis tempor.',
  'Labore nisi officiis quia ipsum qui voluptatem omnis.',
];

// This test creates a new PDF document and inserts pages to it.
// Each page is testing different features of pdf-lib.
export default async () => {
  const pdfDoc = await PDFDocument.create();

  pdfDoc.setTitle('🥚 The Life of an Egg 🍳', { showInWindowTitleBar: true });
  pdfDoc.setAuthor('Humpty Dumpty');
  pdfDoc.setSubject('📘 An Epic Tale of Woe 📖');
  pdfDoc.setKeywords(['eggs', 'wall', 'fall', 'king', 'horses', 'men']);
  pdfDoc.setProducer('PDF App 9000 🤖');
  pdfDoc.setCreator('PDF App 9000 🤖');
  pdfDoc.setCreationDate(new Date('2018-06-24T01:58:37.228Z'));
  pdfDoc.setModificationDate(new Date('2018-12-21T07:00:11.000Z'));

  pdfDoc.registerFontkit(fontkit);

  await pdfDoc.attach(
    await fetchAsset('images/greyscale_bird.png'),
    'bird.png',
    {
      mimeType: 'image/png',
      description: 'A bird in greyscale 🐦',
      creationDate: new Date('2006/06/06'),
      modificationDate: new Date('2007/07/07'),
      afRelationship: AFRelationship.Data,
    },
  );

  const csvString = [
    'Year,Make,Model',
    '1997,Ford,E350',
    '2000,Mercury,Cougar',
  ].join('\n');
  await pdfDoc.attach(typedArrayFor(csvString), 'cars.csv', {
    mimeType: 'text/csv',
    description: 'Some car info 🚗',
    creationDate: new Date('2000/01/13'),
    modificationDate: new Date('2012/12/12'),
    afRelationship: AFRelationship.Unspecified,
  });

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const size = 750;

  pdfDoc.addJavaScript(
    'main',
    'console.show(); console.println("Hello World!")',
  );

  /********************** Page 1 **********************/

  // This page tests different drawing operations as well as adding custom
  // operators to the page content.

  const page1 = pdfDoc.addPage([size, size]);

  // Upper-left Quadrant
  page1.moveTo(0, size / 2);
  page1.drawSquare({ size: size / 2, color: rgb(1, 0, 0) });
  page1.pushOperators(
    pushGraphicsState(),
    moveTo(0, size / 2),
    lineTo(0, size),
    lineTo(size / 2, size),
    closePath(),
    clip(),
    endPath(),
    ...drawRectangle({
      x: size / 8,
      y: size / 2 + size / 8,
      width: size / 4,
      height: size / 4,
      borderWidth: 50,
      borderColor: rgb(1, 1, 0),
      rotate: degrees(0),
      xSkew: degrees(0),
      ySkew: degrees(0),
      color: undefined,
    }),
    popGraphicsState(),
  );

  // Upper-right quadrant
  page1.pushOperators(pushGraphicsState());
  page1.moveTo(size / 2, size / 2);
  page1.drawSquare({ size: size / 2, color: rgb(0, 1, 0) });
  page1.drawEllipse({
    x: size / 2 + size / 4,
    y: size / 2 + size / 4,
    xScale: 25,
    yScale: 150,
    color: rgb(255 / 255, 153 / 255, 51 / 255),
    borderWidth: 2,
    borderColor: rgb(0, 1, 1),
    borderDashArray: [10],
  });
  page1.drawEllipse({
    x: size / 2 + size / 4,
    y: size / 2 + size / 4,
    xScale: 75,
    yScale: 50,
    color: undefined,
  });
  page1.drawEllipse({
    x: size / 2 + size / 4,
    y: size / 2 + size / 4,
    xScale: 150,
    yScale: 100,
    color: undefined,
  });
  page1.pushOperators(clipEvenOdd(), endPath());
  page1.setFont(timesRomanFont);
  page1.setFontColor(rgb(1, 0, 1));
  page1.setFontSize(32);
  page1.setLineHeight(32);
  page1.moveTo(size / 2 + 5, size - 5 - 25);
  page1.drawText(
    [...ipsumLines, ...ipsumLines, ...ipsumLines, ...ipsumLines].join('\n'),
  );
  page1.pushOperators(popGraphicsState());

  // Lower-left quadrant
  page1.moveTo(0, 0);
  page1.drawSquare({ size: size / 2, color: cmyk(1, 0, 0, 0) });
  page1.drawCircle({
    x: size / 4,
    y: size / 4,
    size: 150,
    borderWidth: 10,
    borderDashArray: [25],
    borderDashPhase: 25,
    borderColor: cmyk(0, 1, 0, 0),
    borderLineCap: LineCapStyle.Round,
  });

  page1.drawLine({
    start: {
      x: size / 4,
      y: size / 4,
    },
    end: {
      x: size / 4 + 100,
      y: size / 4 + 100,
    },
    color: rgb(0, 1, 0),
    thickness: 3,
    dashArray: [12, 6],
    lineCap: LineCapStyle.Round,
  });

  // Lower-right quadrant
  page1.moveTo(size / 2, 0);
  page1.drawSquare({ size: size / 2, color: grayscale(0.8) });
  page1.pushOperators(pushGraphicsState(), setLineJoin(LineJoinStyle.Round));
  page1.drawSquare({
    x: size / 2 + size / 4,
    y: 25,
    size: size / 2.25 - 2 * 50,
    rotate: degrees(45),
    borderColor: grayscale(0.6),
    borderWidth: 15,
  });
  page1.pushOperators(setLineJoin(LineJoinStyle.Bevel));
  page1.drawSquare({
    x: size / 2 + 54,
    y: size / 4 + 1,
    size: size / 2.25 - 2 * 100,
    rotate: degrees(-45),
    xSkew: degrees(45 / 2),
    ySkew: degrees(45 / 2),
    color: grayscale(1),
    borderColor: grayscale(0),
    borderWidth: 15,
  });
  page1.pushOperators(popGraphicsState());

  // Middle
  const squareSize = 40;
  page1.drawSquare({
    x: size / 2 - squareSize / 2,
    y: size / 2 - squareSize / 2,
    size: squareSize,
    borderWidth: 2,
    borderColor: rgb(1, 0, 1),
    borderDashArray: [2, 4],
  });

  const rectangleSizeX = 60;
  const rectangleSizeY = 50;
  page1.drawRectangle({
    x: size / 2 - rectangleSizeX / 2,
    y: size / 2 - rectangleSizeY / 2,
    width: rectangleSizeX,
    height: rectangleSizeY,
    borderWidth: 2,
    borderColor: rgb(1, 1, 1),
    borderDashArray: [4, 8],
  });

  /********************** Page 2 **********************/

  // This page tests placement of text with different fonts

  const page2 = pdfDoc.addPage([size, size]);

  page2.drawSquare({ size, color: rgb(253 / 255, 246 / 255, 227 / 255) });
  page2.setFontColor(rgb(101 / 255, 123 / 255, 131 / 255));

  const [
    ubuntuBytes,
    fantasqueBytes,
    indieFlowerBytes,
    greatVibesBytes,
    appleStormBytes,
    bioRhymeBytes,
    pressStart2PBytes,
    hussar3DBytes,
  ] = await Promise.all([
    fetchAsset('fonts/ubuntu/Ubuntu-R.ttf'),
    fetchAsset('fonts/fantasque/OTF/FantasqueSansMono-BoldItalic.otf'),
    fetchAsset('fonts/indie_flower/IndieFlower.ttf'),
    fetchAsset('fonts/great_vibes/GreatVibes-Regular.ttf'),
    fetchAsset('fonts/apple_storm/AppleStormCBo.otf'),
    fetchAsset('fonts/bio_rhyme/BioRhymeExpanded-Regular.ttf'),
    fetchAsset('fonts/press_start_2p/PressStart2P-Regular.ttf'),
    fetchAsset('fonts/hussar_3d/Hussar3DFour.otf'),
  ]);

  const ubuntuFont = await pdfDoc.embedFont(ubuntuBytes, { subset: true });
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 20,
    size: 20,
    font: ubuntuFont,
    lineHeight: 20,
  });

  const fantasqueFont = await pdfDoc.embedFont(fantasqueBytes);
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 105,
    size: 25,
    font: fantasqueFont,
    lineHeight: 25,
  });

  const indieFlowerFont = await pdfDoc.embedFont(indieFlowerBytes, {
    subset: true,
  });
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 200,
    size: 25,
    font: indieFlowerFont,
    lineHeight: 25,
  });

  const greatVibesFont = await pdfDoc.embedFont(greatVibesBytes, {
    subset: true,
  });
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 300,
    size: 30,
    font: greatVibesFont,
    lineHeight: 30,
  });

  const appleStormFont = await pdfDoc.embedFont(appleStormBytes);
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 425,
    size: 25,
    font: appleStormFont,
    lineHeight: 25,
  });

  const bioRhymeFont = await pdfDoc.embedFont(bioRhymeBytes, {
    subset: true,
  });
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 500,
    size: 15,
    font: bioRhymeFont,
    lineHeight: 15,
  });

  const pressStart2PFont = await pdfDoc.embedFont(pressStart2PBytes, {
    subset: true,
  });
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 575,
    size: 15,
    font: pressStart2PFont,
    lineHeight: 15,
  });

  const hussar3DFont = await pdfDoc.embedFont(hussar3DBytes);
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 650,
    size: 25,
    font: hussar3DFont,
    lineHeight: 25,
  });

  /********************** Page 3 **********************/

  // This page tests embedding and placing different images.

  const page3Height = 1750;
  const page3 = pdfDoc.addPage([size, page3Height]);

  const [
    catRidingUnicornBytes,
    minionsLaughingBytes,
    greyscaleBirdBytes,
    minionsBananaAlphaBytes,
    minionsBananaNoAlphaBytes,
    smallMarioBytes,
  ] = await Promise.all([
    fetchAsset('images/cat_riding_unicorn_resized.jpg'),
    fetchAsset('images/minions_laughing.jpg'),
    fetchAsset('images/greyscale_bird.png'),
    fetchAsset('images/minions_banana_alpha.png'),
    fetchAsset('images/minions_banana_no_alpha_resized.png'),
    fetchAsset('images/small_mario_resized.png'),
  ]);

  const catRidingUnicornImage = await pdfDoc.embedJpg(catRidingUnicornBytes);
  const minionsLaughingImage = await pdfDoc.embedJpg(minionsLaughingBytes);
  const greyscaleBirdImage = await pdfDoc.embedPng(greyscaleBirdBytes);
  const minionsBananaAlphaImage = await pdfDoc.embedPng(
    minionsBananaAlphaBytes,
  );
  const minionsBananaNoAlphaImage = await pdfDoc.embedPng(
    minionsBananaNoAlphaBytes,
  );
  const smallMarioImage = await pdfDoc.embedPng(smallMarioBytes);

  const catRidingUnicornDims = catRidingUnicornImage.scale(0.52);
  const minionsLaughingDims = minionsLaughingImage.scale(0.75);
  const greyscaleBirdDims = greyscaleBirdImage.scale(0.75);
  const minionsBananaAlphaDims = minionsBananaAlphaImage.scale(0.5);
  const minionsBananaNoAlphaDims = minionsBananaNoAlphaImage.scale(0.75);
  const smallMarioDims = smallMarioImage.scale(0.75);

  // const {
  //   setTextRenderingMode,
  //   setStrokingColor,
  //   TextRenderingMode,
  // } = PDFLib;
  // page3.pushOperators(
  //   setTextRenderingMode(TextRenderingMode.OutlineAndClip),
  //   setStrokingColor(rgb(0.5, 0.5, 0.5)),
  // );
  // page3.drawText('Unicornz!', {
  //   x: 75,
  //   y: page3Height - catRidingUnicornDims.height + 75,
  //   font: ubuntuFont,
  //   size: 50,
  // });
  // page3.pushOperators(clip(), endPath());

  page3.moveTo(0, 0);
  page3.drawRectangle({
    width: minionsBananaAlphaDims.width,
    height:
      minionsBananaAlphaDims.height +
      minionsBananaNoAlphaDims.height +
      smallMarioDims.height,
    color: rgb(0, 1, 0),
  });

  page3.moveTo(0, page3Height);
  page3.moveDown(catRidingUnicornDims.height);
  page3.drawImage(catRidingUnicornImage, catRidingUnicornDims);

  page3.moveDown(minionsLaughingDims.height);
  page3.drawImage(minionsLaughingImage, minionsLaughingDims);

  page3.moveDown(greyscaleBirdDims.height);
  page3.drawImage(greyscaleBirdImage, greyscaleBirdDims);

  page3.moveDown(minionsBananaAlphaDims.height);
  page3.drawImage(minionsBananaAlphaImage, minionsBananaAlphaDims);

  page3.moveDown(minionsBananaNoAlphaDims.height);
  page3.drawImage(minionsBananaNoAlphaImage, minionsBananaNoAlphaDims);

  page3.moveDown(smallMarioDims.height);
  page3.drawImage(smallMarioImage, smallMarioDims);

  /********************** Page 4 **********************/

  // This page tests embedding other PDF pages. First we embed page 3 of
  // this document but rotate and scale it. Then we take an external PDF
  // document and embed two pages of it next to each other.

  const page4 = pdfDoc.addPage([size, size]);

  const embeddedPage3 = await pdfDoc.embedPage(page3);
  page4.drawPage(embeddedPage3, {
    x: 10,
    y: size - 10,
    xScale: 1.52,
    yScale: 0.42,
    rotate: degrees(-90),
  });

  const [normalPdfBytes] = await Promise.all([fetchAsset('pdfs/normal.pdf')]);

  const [embeddedPage1, embeddedPage2] = await pdfDoc.embedPdf(normalPdfBytes, [
    0,
    1,
  ]);
  page4.drawPage(embeddedPage1, {
    x: 40,
    y: 100,
    xScale: 0.5,
    yScale: 0.5,
    opacity: 0.5,
  });
  page4.drawPage(embeddedPage2, {
    x: 400,
    y: 100,
    xScale: 0.5,
    yScale: 0.5,
  });

  /********************** Page 5 **********************/

  // This page tests creating new AcroForm fields.

  const pastels = {
    greyishGreen: rgb(85 / 255, 117 / 255, 113 / 255),
    brownish: rgb(212 / 255, 154 / 255, 137 / 255),
    tan: rgb(247 / 255, 209 / 255, 186 / 255),
    whiteish: rgb(244 / 255, 244 / 255, 244 / 255),
    lightBlue: rgb(221 / 255, 243 / 255, 245 / 255),
    blue: rgb(166 / 255, 220 / 255, 239 / 255),
    pinkish: rgb(242 / 255, 170 / 255, 170 / 255),
    hotPink: rgb(227 / 255, 99 / 255, 135 / 255),
    yellow: rgb(250 / 255, 240 / 255, 175 / 255),
    darkBlue: rgb(7 / 255, 104 / 255, 159 / 255),
  };

  const page5 = pdfDoc.addPage([size, size]);

  const form = pdfDoc.getForm();

  const fWidth = 100;
  const fHeight = 50;
  const fPadding = 25;
  const fMax = Math.max(fWidth, fHeight);

  // Text Fields
  [
    { name: 'moi.text.field[0]', text: 'Foo', font: ubuntuFont },
    { name: 'moi.text.field[1]', text: 'Bar' },
    { name: 'moi.text.field[2]', text: 'Qux', font: ubuntuFont },
    { name: 'moi.text.field[3]', text: 'Baz' },
  ].forEach(({ name, text, font }, idx) => {
    const textField = form.createTextField(name);
    textField.setText(text);
    textField.addToPage(page5, {
      x: fPadding + fWidth,
      y: size - fMax - fPadding,
      width: fWidth,
      height: fHeight,
      rotate: degrees(90 * idx),
      borderWidth: 4,
      backgroundColor: pastels.pinkish,
      borderColor: pastels.blue,
      textColor: pastels.whiteish,
      font: ubuntuFont,
    });
    if (font) textField.updateAppearances(font);
  });

  // Buttons
  [
    { name: 'moi.button.field[0]', text: 'Earth', font: ubuntuFont },
    { name: 'moi.button.field[1]', text: 'Mars', font: timesRomanFont },
    { name: 'moi.button.field[2]', text: 'Venus', font: ubuntuFont },
    { name: 'moi.button.field[3]', text: 'Saturn', font: timesRomanFont },
  ].forEach(({ name, text, font }, idx) => {
    const button = form.createButton(name);
    button.addToPage(text, page5, {
      x: fPadding * 2 + fWidth * 3,
      y: size - fMax - fPadding,
      width: fWidth,
      height: fHeight,
      rotate: degrees(90 * idx),
      borderWidth: 4,
      backgroundColor: pastels.brownish,
      borderColor: pastels.tan,
      textColor: pastels.greyishGreen,
      font,
    });
  });

  // Dropdowns
  [
    { name: 'moi.dropdown.field[0]', choice: 'Exia', font: ubuntuFont },
    { name: 'moi.dropdown.field[1]', choice: 'Kyrios', font: timesRomanFont },
    { name: 'moi.dropdown.field[2]', choice: 'Dynames', font: ubuntuFont },
    { name: 'moi.dropdown.field[3]', choice: 'Virtue', font: timesRomanFont },
  ].forEach(({ name, choice, font }, idx) => {
    const dropdown = form.createDropdown(name);
    dropdown.addOptions(['Exia', 'Dynames', 'Kyrios', 'Virtue']);
    dropdown.select(choice);
    dropdown.addToPage(page5, {
      x: fPadding * 3 + fWidth * 5,
      y: size - fMax - fPadding,
      width: fWidth,
      height: fHeight,
      rotate: degrees(90 * idx),
      borderWidth: 4,
      backgroundColor: pastels.greyishGreen,
      borderColor: pastels.hotPink,
      textColor: pastels.brownish,
      font,
    });
  });

  // Check Boxes
  [
    { name: 'moi.checkBox.field[0]' },
    { name: 'moi.checkBox.field[1]' },
    { name: 'moi.checkBox.field[2]' },
    { name: 'moi.checkBox.field[3]' },
  ].forEach(({ name }, idx) => {
    const checkBox = form.createCheckBox(name);
    checkBox.check();
    checkBox.addToPage(page5, {
      x: fPadding + fWidth,
      y: size - fMax * 3 - fPadding * 2,
      width: fHeight,
      height: fHeight,
      rotate: degrees(90 * idx),
      borderWidth: 4,
      backgroundColor: pastels.whiteish,
      borderColor: pastels.greyishGreen,
      textColor: pastels.hotPink,
    });
  });

  // Option Lists
  [
    { name: 'moi.optionList.field[0]', choice: 'TypeScript', font: ubuntuFont },
    { name: 'moi.optionList.field[1]', choice: 'Kotlin', font: timesRomanFont },
    { name: 'moi.optionList.field[2]', choice: 'Python', font: ubuntuFont },
    { name: 'moi.optionList.field[3]', choice: 'Swift', font: timesRomanFont },
  ].forEach(({ name, choice, font }, idx) => {
    const optionList = form.createOptionList(name);
    optionList.addOptions(['TypeScript', 'Kotlin', 'Python', 'Swift']);
    optionList.select(choice);
    optionList.addToPage(page5, {
      x: fPadding * 2 + fWidth * 3,
      y: size - fMax * 3 - fPadding * 2,
      width: fWidth,
      height: fHeight,
      rotate: degrees(90 * idx),
      borderWidth: 4,
      backgroundColor: pastels.tan,
      borderColor: pastels.yellow,
      textColor: pastels.hotPink,
      font,
    });
  });

  // Radio Group
  const radioGroup = form.createRadioGroup('moi.radioGroup.field[0]');

  [
    { option: 'Bing' },
    { option: 'Boing' },
    { option: 'Bang' },
    { option: 'Bloop' },
  ].forEach(({ option }, idx) => {
    radioGroup.addOptionToPage(option, page5, {
      x: fPadding * 3 + fWidth * 5,
      y: size - fMax * 3 - fPadding * 2,
      width: fHeight,
      height: fHeight,
      rotate: degrees(90 * idx),
      borderWidth: 4,
      backgroundColor: pastels.blue,
      borderColor: pastels.pinkish,
      textColor: pastels.yellow,
    });
  });

  radioGroup.select('Bing');

  // Combed Text Field
  const combedTf = form.createTextField('moi.combed.text.field');
  combedTf.setMaxLength(7);
  combedTf.enableCombing();
  combedTf.setText('ABC-123');
  combedTf.addToPage(page5, {
    x: fPadding + fWidth / 2,
    y: size - fMax * 5 - fPadding * 3,
    width: fWidth * 2.5,
    height: fHeight,
    borderWidth: 4,
    backgroundColor: pastels.yellow,
    borderColor: pastels.brownish,
    textColor: pastels.darkBlue,
    font: ubuntuFont,
  });

  // Multiline Text Field
  const multilineTf = form.createTextField('moi.multiline.text.field');
  multilineTf.enableMultiline();
  multilineTf.setText(
    `In the morning, when you can't get out of bed, tell yourself: "I'm getting up to do the work only a man can do. How can I possibly hesitate or complain when I'm about to accomplish the task for which I was born? Was I made for lying warm in bed under a pile of blankets?"\n\n"But I enjoy it here."\n\nWas it for enjoyment you were born? Are you designed to act or to be acted upon?\n\n\t\t\t\t\t\t\t\t\t\t - Marcus Aurelius`,
  );
  multilineTf.addToPage(page5, {
    x: fPadding * 3 + fWidth / 2 + fWidth * 2.5,
    y: size - fMax * 5 - fPadding * 3 - fHeight * 3,
    width: fWidth * 2.5,
    height: fHeight * 5,
    borderWidth: 4,
    backgroundColor: pastels.whiteish,
    borderColor: pastels.brownish,
    textColor: pastels.greyishGreen,
    font: ubuntuFont,
  });

  page5.drawText('There should be no remnant of a field\nbelow this text!!', {
    y: size - fMax * 5 - fPadding * 0 - fHeight * 3,
    x: fPadding,
    size: 18,
    font: indieFlowerFont,
    lineHeight: 18,
  });
  const textField = form.createTextField('a.new.text.field');
  textField.setText('This Should Not Be Visible');
  textField.addToPage(page5, {
    x: fPadding,
    y: size - fMax * 5 - fPadding * 3.5 - fHeight * 3,
    width: fWidth * 2.5,
    height: fHeight * 1,
    borderWidth: 4,
    backgroundColor: pastels.pinkish,
    borderColor: pastels.blue,
    textColor: pastels.darkBlue,
    font: ubuntuFont,
  });

  form.removeField(textField);

  /********************** Print Metadata **********************/

  console.log('Title:', pdfDoc.getTitle());
  console.log('Author:', pdfDoc.getAuthor());
  console.log('Subject:', pdfDoc.getSubject());
  console.log('Creator:', pdfDoc.getCreator());
  console.log('Keywords:', pdfDoc.getKeywords());
  console.log('Producer:', pdfDoc.getProducer());
  console.log('Creation Date:', pdfDoc.getCreationDate());
  console.log('Modification Date:', pdfDoc.getModificationDate());

  /********************** Export PDF **********************/

  const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

  return { base64Pdf };
};
