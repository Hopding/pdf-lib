import { Assets } from '..';
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
  moveTo,
  PDFDocument,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  setDashPattern,
  setLineCap,
  setLineJoin,
  StandardFonts,
} from '../../..';
import fontkit from '@pdf-lib/fontkit';

const ipsumLines = [
  'Eligendi est pariatur quidem in non excepturi et.',
  'Consectetur non tenetur magnam est corporis tempor.',
  'Labore nisi officiis quia ipsum qui voluptatem omnis.',
];

export default async (assets: Assets) => {
  const pdfDoc = PDFDocument.create();

  pdfDoc.registerFontkit(fontkit);

  const timesRomanFont = pdfDoc.embedFont(StandardFonts.TimesRoman);

  const size = 750;

  /********************** Page 1 **********************/

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
  page1.pushOperators(
    pushGraphicsState(),
    setDashPattern([25], 25),
    setLineCap(LineCapStyle.Round),
  );
  page1.drawCircle({
    x: size / 4,
    y: size / 4,
    size: 150,
    borderWidth: 10,
    borderColor: cmyk(0, 1, 0, 0),
  });
  page1.pushOperators(popGraphicsState());

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

  /********************** Page 2 **********************/

  // TODO: Figure out font subsetting errors

  const page2 = pdfDoc.addPage([size, size]);

  page2.drawSquare({ size, color: rgb(253 / 255, 246 / 255, 227 / 255) });
  page2.setFontColor(rgb(101 / 255, 123 / 255, 131 / 255));

  const { fonts } = assets;

  const ubuntuFont = pdfDoc.embedFont(fonts.ttf.ubuntu_r, { subset: true });
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 20,
    size: 20,
    font: ubuntuFont,
    lineHeight: 20,
  });

  const fantasqueFont = pdfDoc.embedFont(fonts.otf.fantasque_sans_mono_bi);
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 105,
    size: 25,
    font: fantasqueFont,
    lineHeight: 25,
  });

  const indieFlowerFont = pdfDoc.embedFont(fonts.ttf.indie_flower_r, {
    subset: true,
  });
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 200,
    size: 25,
    font: indieFlowerFont,
    lineHeight: 25,
  });

  const greatVibesFont = pdfDoc.embedFont(fonts.ttf.great_vibes_r, {
    subset: true,
  });
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 300,
    size: 30,
    font: greatVibesFont,
    lineHeight: 30,
  });

  const appleStormFont = pdfDoc.embedFont(fonts.otf.apple_storm_r);
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 425,
    size: 25,
    font: appleStormFont,
    lineHeight: 25,
  });

  const bioRhymeFont = pdfDoc.embedFont(fonts.ttf.bio_rhyme_r, {
    subset: true,
  });
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 500,
    size: 15,
    font: bioRhymeFont,
    lineHeight: 15,
  });

  const pressStart2PFont = pdfDoc.embedFont(fonts.ttf.press_start_2p_r, {
    subset: true,
  });
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 575,
    size: 15,
    font: pressStart2PFont,
    lineHeight: 15,
  });

  const hussar3DFont = pdfDoc.embedFont(fonts.otf.hussar_3d_r);
  page2.drawText(ipsumLines.join('\n'), {
    y: size - 650,
    size: 25,
    font: hussar3DFont,
    lineHeight: 25,
  });

  /********************** Page 3 **********************/

  const page3Height = 1750;
  const page3 = pdfDoc.addPage([size, page3Height]);

  const { jpg, png } = assets.images;

  const catRidingUnicornImage = pdfDoc.embedJpg(jpg.cat_riding_unicorn);
  const minionsLaughingImage = pdfDoc.embedJpg(jpg.minions_laughing);
  const greyscaleBirdImage = pdfDoc.embedPng(png.greyscale_bird);
  const minionsBananaAlphaImage = pdfDoc.embedPng(png.minions_banana_alpha);
  const minionsBananaNoAlphaImage = pdfDoc.embedPng(
    png.minions_banana_no_alpha,
  );
  const smallMarioImage = pdfDoc.embedPng(png.small_mario);

  const catRidingUnicornDims = catRidingUnicornImage.scale(0.2);
  const minionsLaughingDims = minionsLaughingImage.scale(0.75);
  const greyscaleBirdDims = greyscaleBirdImage.scale(0.75);
  const minionsBananaAlphaDims = minionsBananaAlphaImage.scale(0.5);
  const minionsBananaNoAlphaDims = minionsBananaNoAlphaImage.scale(0.5);
  const smallMarioDims = smallMarioImage.scale(0.18);

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

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
