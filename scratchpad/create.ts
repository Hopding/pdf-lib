import { PDFDocument, rgb, StandardFonts } from 'src/index';

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
    normal: readPdf('normal.pdf'),
    with_update_sections: readPdf('with_update_sections.pdf'),
    linearized_with_object_streams: readPdf(
      'linearized_with_object_streams.pdf',
    ),
    with_large_page_count: readPdf('with_large_page_count.pdf'),
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

  const pdfDoc = PDFDocument.load(pdfs.with_large_page_count);

  const timesRomanFont = pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
  const minionsBananaImage = pdfDoc.embedPng(images.png.minions_banana_alpha);
  const minionsBananaDims = minionsBananaImage.scale(0.5);

  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    page.drawImage(minionsBananaImage, {
      ...minionsBananaDims,
      x: width / 2 - minionsBananaDims.width / 2,
      y: height / 2 - minionsBananaDims.height / 2,
    });
  });

  // Interleave new pages between all existing ones
  pages.forEach((_, idx) => {
    const newPage = pdfDoc.insertPage(2 * idx + 1, [500, 150]);

    const fontSize = 24;
    const { width, height } = newPage.getSize();

    newPage.setFont(timesRomanFont);
    newPage.setFontSize(fontSize);

    const text = 'This page was interleaved by pdf-lib!';
    const textWidth = timesRomanFont.widthOfTextAtSize(text, fontSize);
    const textHeight = timesRomanFont.heightAtSize(fontSize);

    newPage.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      color: rgb(0.7, 0.4, 0.9),
    });
  });

  const buffer = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', buffer);
  console.log('File written to ./out.pdf');
})();
