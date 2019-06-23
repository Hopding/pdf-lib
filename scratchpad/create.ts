import fs from 'fs';
import { degrees, PDFDocument, rgb, StandardFonts } from 'src/index';

const main = async () => {
  console.time('Scratchpad');

  const ubuntuFontBytes = fs.readFileSync('assets/fonts/ubuntu/Ubuntu-R.ttf');

  const catRidingUnicornBytes = fs.readFileSync(
    'assets/images/cat_riding_unicorn.jpg',
  );
  const greyscaleBirdBytes = fs.readFileSync(
    'assets/images/greyscale_bird.png',
  );
  const minionsBananaAlphaBytes = fs.readFileSync(
    'assets/images/minions_banana_alpha.png',
  );
  const minionsBananaNoAlphaBytes = fs.readFileSync(
    'assets/images/minions_banana_no_alpha.png',
  );

  const pdfDoc = PDFDocument.create();

  const page = pdfDoc.insertPage(0);

  const timesRomanItalicFont = pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const helveticaFont = pdfDoc.embedFont(StandardFonts.Helvetica);
  const ubuntuFont = pdfDoc.embedFont(ubuntuFontBytes);

  const catRidingUnicornJpg = pdfDoc.embedJpg(catRidingUnicornBytes);
  const greyscaleBirdPng = pdfDoc.embedPng(greyscaleBirdBytes);
  const minionsBananaAlphaPng = pdfDoc.embedPng(minionsBananaAlphaBytes);
  const minionsBananaNoAlphaPng = pdfDoc.embedPng(minionsBananaNoAlphaBytes);

  page.moveTo(25, 25);
  page.drawImage(greyscaleBirdPng, greyscaleBirdPng.scale(0.75));
  page.moveTo(25, 25);
  page.drawImage(minionsBananaAlphaPng, minionsBananaAlphaPng.scale(0.25));
  page.moveTo(25, 325);
  page.drawImage(minionsBananaNoAlphaPng, minionsBananaNoAlphaPng.scale(0.25));
  page.drawImage(catRidingUnicornJpg, {
    ...catRidingUnicornJpg.scale(0.25),
    x: 25,
    y: 450,
    rotate: degrees(5),
    xSkew: degrees(15),
    ySkew: degrees(15),
  });

  page.setFontSize(24);
  page.setFont(helveticaFont);
  page.moveTo(100, 100);
  page.drawText('Hello World and stuff!');
  page.setFont(ubuntuFont);
  page.moveTo(100, 300);
  page.drawText('Ubuntu - Hello World and stuff!');

  page.setFontSize(50);
  page.moveTo(100, 100);
  page.drawText('Qux Baz!!!\nFoo\tBar\b\v!!!', {
    color: rgb(1, 0, 0),
    font: timesRomanItalicFont,
    size: 100,
    x: 150,
    y: 150,
    rotate: degrees(45),
    xSkew: degrees(-30),
    ySkew: degrees(-30),
    lineHeight: 100,
  });

  /*******************/

  const pdfBytes2 = fs.readFileSync('./assets/pdfs/F1040V_tax_form.pdf');

  const donorPdfDoc = PDFDocument.load(pdfBytes2);
  const donorPage = donorPdfDoc.getPages()[0];
  pdfDoc.insertPage(1, donorPage);

  const buffer = await pdfDoc.save();
  console.timeEnd('Scratchpad');

  fs.writeFileSync('./out.pdf', buffer);
  console.log('File written to ./out.pdf');
};

main();

// (async () => {
//   const fs = require('fs');
//   const pdfDoc = PDFDocument.create();
//   pdfDoc.addPage().drawText('This is a test...');
//   const buffer = await pdfDoc.save();
//   fs.writeFileSync('./out.pdf', buffer);
//   console.log('File written to ./out.pdf');
// })();
