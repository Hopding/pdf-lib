import { Assets } from '..';
import {
  degrees,
  ParseSpeeds,
  PDFDocument,
  rgb,
  StandardFonts,
  LineCapStyle,
} from '../../..';

export default async (assets: Assets) => {
  const { pdfs, images } = assets;

  const pdfDoc = await PDFDocument.load(pdfs.with_update_sections_base64_uri, {
    parseSpeed: ParseSpeeds.Fastest,
    updateMetadata: false,
  });

  await pdfDoc.attach(pdfs.normal_base64, 'tax_form.pdf', {
    mimeType: 'application/pdf',
    description: 'D-2210 tax form for 2012 🏦',
    creationDate: new Date('2004/04/04'),
    modificationDate: new Date('2005/05/05'),
  });

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const catRidingUnicornImage = await pdfDoc.embedJpg(
    images.jpg.cat_riding_unicorn,
  );
  const cmykImage = await pdfDoc.embedJpg(images.jpg.cmyk_colorspace);

  const catRidingUnicornDims = catRidingUnicornImage.scale(0.13);
  const cmykDims = cmykImage.scale(0.5);

  const page0 = pdfDoc.insertPage(0, [305, 250]);
  const page1 = pdfDoc.getPage(1);

  const docWithAnnots = await PDFDocument.load(assets.pdfs.with_annots);
  const [page2] = await pdfDoc.copyPages(docWithAnnots, [0]);
  page2.scaleContent(0.5, 0.5);
  pdfDoc.addPage(page2);
  const [page3] = await pdfDoc.copyPages(docWithAnnots, [0]);
  page3.scaleAnnotations(0.5, 0.5);
  pdfDoc.addPage(page3);
  const [page4] = await pdfDoc.copyPages(docWithAnnots, [0]);
  page4.scale(0.5, 0.5);
  pdfDoc.addPage(page4);

  const page5 = pdfDoc.addPage([305, 250]);

  const hotPink = rgb(1, 0, 1);
  const red = rgb(1, 0, 0);

  page0.drawText('This is the new first page!', {
    x: 5,
    y: 200,
    font: helveticaFont,
    color: hotPink,
  });
  page0.drawLine({
    start: { x: 10, y: 207 },
    end: { x: 295, y: 207 },
    color: rgb(0, 1, 1),
    thickness: 5,
    opacity: 0.7,
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
  page1.drawText(page1Text, {
    x: page1.getWidth() / 2 - page1TextWidth / 2 + 45,
    y: page1.getHeight() / 2 + 45,
    color: red,
    rotate: degrees(-30),
    xSkew: degrees(15),
    ySkew: degrees(15),
  });

  page5.setFontSize(24);
  page5.drawText('This is the last page!', {
    x: 30,
    y: 215,
    font: helveticaFont,
    color: hotPink,
  });
  page5.drawLine({
    start: { x: 30, y: 205 },
    end: { x: 30 + lastPageTextWidth, y: 205 },
    color: hotPink,
    thickness: 5,
  });
  page5.drawImage(cmykImage, {
    ...cmykDims,
    x: 30,
    y: 30,
  });
  page5.drawLine({
    start: { x: 30, y: 240 },
    end: { x: 30 + lastPageTextWidth, y: 240 },
    color: hotPink,
    thickness: 5,
    lineCap: LineCapStyle.Round,
  });

  console.log('Title:', pdfDoc.getTitle());
  console.log('Author:', pdfDoc.getAuthor());
  console.log('Subject:', pdfDoc.getSubject());
  console.log('Creator:', pdfDoc.getCreator());
  console.log('Keywords:', pdfDoc.getKeywords());
  console.log('Producer:', pdfDoc.getProducer());
  console.log('Creation Date:', pdfDoc.getCreationDate());
  console.log('Modification Date:', pdfDoc.getModificationDate());

  const base64Pdf = await pdfDoc.saveAsBase64();

  const pdfBytes = Buffer.from(base64Pdf, 'base64');

  return pdfBytes;
};
