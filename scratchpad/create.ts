import { degrees, PDFDocument, rgb, StandardFonts } from 'src/index';

// import { default as opentype } from 'opentype.js';

// import fs from 'fs';
// import { cmyk, degrees, PDFDocument, rgb, StandardFonts } from 'src/index';

// const main = async () => {
//   console.time('Scratchpad');

//   const ubuntuFontBytes = fs.readFileSync('assets/fonts/ubuntu/Ubuntu-R.ttf');

//   const catRidingUnicornBytes = fs.readFileSync(
//     'assets/images/cat_riding_unicorn.jpg',
//   );
//   const greyscaleBirdBytes = fs.readFileSync(
//     'assets/images/greyscale_bird.png',
//   );
//   const minionsBananaAlphaBytes = fs.readFileSync(
//     'assets/images/minions_banana_alpha.png',
//   );
//   const minionsBananaNoAlphaBytes = fs.readFileSync(
//     'assets/images/minions_banana_no_alpha.png',
//   );

//   const pdfDoc = PDFDocument.create();

//   const page = pdfDoc.insertPage(0);

//   const timesRomanItalicFont = pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
//   const helveticaFont = pdfDoc.embedFont(StandardFonts.Helvetica);
//   const ubuntuFont = pdfDoc.embedFont(ubuntuFontBytes);

//   const catRidingUnicornJpg = pdfDoc.embedJpg(catRidingUnicornBytes);
//   const greyscaleBirdPng = pdfDoc.embedPng(greyscaleBirdBytes);
//   const minionsBananaAlphaPng = pdfDoc.embedPng(minionsBananaAlphaBytes);
//   const minionsBananaNoAlphaPng = pdfDoc.embedPng(minionsBananaNoAlphaBytes);

//   page.moveTo(25, 25);
//   page.drawImage(greyscaleBirdPng, greyscaleBirdPng.scale(0.75));
//   page.moveTo(25, 25);
//   page.drawImage(minionsBananaAlphaPng, minionsBananaAlphaPng.scale(0.25));
//   page.moveTo(25, 325);
//   page.drawImage(minionsBananaNoAlphaPng, minionsBananaNoAlphaPng.scale(0.25));
//   page.drawImage(catRidingUnicornJpg, {
//     ...catRidingUnicornJpg.scale(0.25),
//     x: 25,
//     y: 450,
//     rotate: degrees(5),
//     xSkew: degrees(15),
//     ySkew: degrees(15),
//   });

//   page.setFontSize(24);
//   page.setFont(helveticaFont);
//   page.moveTo(100, 100);
//   page.drawText('Hello World and stuff!');
//   page.setFont(ubuntuFont);
//   page.moveTo(100, 300);
//   page.drawText('Ubuntu - Hello World and stuff!');

//   page.setFontSize(50);
//   page.moveTo(100, 100);
//   page.drawText('Qux Baz!!!\nFoo\tBar\b\v!!!', {
//     color: rgb(1, 0, 0),
//     font: timesRomanItalicFont,
//     size: 100,
//     x: 150,
//     y: 150,
//     rotate: degrees(45),
//     xSkew: degrees(-30),
//     ySkew: degrees(-30),
//     lineHeight: 100,
//   });

//   const page2 = pdfDoc.addPage();
//   page2.moveTo(50, 50);
//   page2.drawRectangle();
//   page2.drawRectangle({
//     x: 50,
//     y: 200,
//     borderColor: cmyk(0, 1, 0, 0),
//     borderWidth: 5,
//   });
//   page2.drawRectangle({
//     x: 100,
//     y: 400,
//     color: cmyk(1, 0, 0, 0),
//     borderColor: cmyk(0, 1, 0, 0),
//     borderWidth: 5,
//     width: 300,
//     height: 200,
//     rotate: degrees(15),
//     xSkew: degrees(15),
//     ySkew: degrees(15),
//   });

//   const page3 = pdfDoc.addPage();
//   page3.moveTo(100, 100);
//   page3.drawEllipse();
//   page3.drawEllipse({
//     x: 250,
//     y: 300,
//     color: cmyk(1, 0, 0, 0),
//     borderColor: cmyk(0, 1, 0, 0),
//     borderWidth: 5,
//     xScale: 200,
//     yScale: 50,
//   });

//   /*******************/

//   const pdfBytes2 = fs.readFileSync('./assets/pdfs/F1040V_tax_form.pdf');

//   const donorPdfDoc = PDFDocument.load(pdfBytes2);
//   const donorPage = donorPdfDoc.getPages()[0];
//   pdfDoc.addPage(donorPage);

//   const buffer = await pdfDoc.save();
//   console.timeEnd('Scratchpad');

//   fs.writeFileSync('./out.pdf', buffer);
//   console.log('File written to ./out.pdf');
// };

// main();

import fs from 'fs';

const readFont = (font: string) => fs.readFileSync(`assets/fonts/${font}`);

const readImage = (image: string) => fs.readFileSync(`assets/images/${image}`);

const readPdf = (pdf: string) => fs.readFileSync(`assets/pdfs/${pdf}`);

const assets = {
  fonts: {
    ttf: {
      ubuntu_r: readFont('ubuntu/Ubuntu-R.ttf'),
      bio_rhyme_r: readFont('bio_rhyme/BioRhymeExpanded-Regular.ttf'),
      press_start_2p_r: readFont('press_start_2p/PressStart2P-Regular.ttf'),
      indie_flower_r: readFont('indie_flower/IndieFlower.ttf'),
      great_vibes_r: readFont('great_vibes/GreatVibes-Regular.ttf'),
    },
    otf: {
      fantasque_sans_mono_bi: readFont(
        'fantasque/OTF/FantasqueSansMono-BoldItalic.otf',
      ),
      apple_storm_r: readFont('apple_storm/AppleStormCBo.otf'),
      hussar_3d_r: readFont('hussar_3d/Hussar3DFour.otf'),
      source_hans_jp: readFont('source_hans_jp/SourceHanSerifJP-Regular.otf'),
    },
  },
  images: {
    jpg: {
      cat_riding_unicorn: readImage('cat_riding_unicorn.jpg'),
      minions_laughing: readImage('minions_laughing.jpg'),
    },
    png: {
      greyscale_bird: readImage('greyscale_bird.png'),
      minions_banana_alpha: readImage('minions_banana_alpha.png'),
      minions_banana_no_alpha: readImage('minions_banana_no_alpha.png'),
      small_mario: readImage('small_mario.png'),
    },
  },
  pdfs: {
    normal: readPdf('D-2210_tax_form.pdf'),
    with_update_sections: readPdf('with_update_sections.pdf'),
    linearized_with_object_streams: readPdf(
      'linearized_with_object_streams.pdf',
    ),
    // with_large_page_count: fs.readFileSync('pdf_specification.pdf'),
    // with_missing_endstream_eol_and_polluted_ctm: fs.readFileSync(
    //   'test-pdfs/receipt.pdf',
    // ),
    // with_newline_whitespace_in_indirect_object_numbers: fs.readFileSync(
    //   'test-pdfs/agile_software_ukranian.pdf',
    // ),
    // with_comments: fs.readFileSync('test-pdfs/with_comments.pdf'),
  },
};

(async () => {
  const { pdfs, images } = assets;

  const pdfDoc = PDFDocument.load(pdfs.with_update_sections);

  const helveticaFont = pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const catRidingUnicornImage = pdfDoc.embedJpg(images.jpg.cat_riding_unicorn);
  const catRidingUnicornDims = catRidingUnicornImage.scale(0.13);

  const page0 = pdfDoc.insertPage(0, [305, 250]);
  const page1 = pdfDoc.getPages()[1];
  const page2 = pdfDoc.addPage([305, 125]);

  const hotPink = rgb(1, 0, 1);
  const red = rgb(1, 0, 0);

  page0.drawText('This is the new first page!', {
    x: 5,
    y: 200,
    font: helveticaFont,
    color: hotPink,
  });
  page0.drawImage(catRidingUnicornImage, {
    ...catRidingUnicornDims,
    x: 30,
    y: 30,
  });

  const lastPageText = 'This is the last page!';
  const lastPageTextWidth = helveticaFont.widthOfTextAtSize(lastPageText, 24);

  const page1Text = 'pdf-lib is awesome!';
  const page1TextWidth = helveticaFont.widthOfTextAtSize(page1Text, 70);
  page1.setFontSize(70);
  page1.drawText('pdf-lib is awesome!', {
    x: page1.getWidth() / 2 - page1TextWidth / 2 + 45,
    y: page1.getHeight() / 2 + 45,
    color: red,
    rotate: degrees(-30),
    xSkew: degrees(15),
    ySkew: degrees(15),
  });

  page2.setFontSize(24);
  page2.drawText('This is the last page!', {
    x: 30,
    y: 60,
    font: helveticaFont,
    color: hotPink,
  });
  page2.drawRectangle({
    x: 30,
    y: 50,
    width: lastPageTextWidth,
    height: 5,
    color: hotPink,
  });

  const buffer = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', buffer);
  console.log('File written to ./out.pdf');
})();
