import fontkit from '@pdf-lib/fontkit';
import { Assets } from '..';
import { PDFDocument, PDFBuilder, StandardFonts } from '../../../cjs';

const ipsumLines =
  'Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.';

// This test creates a new PDF document and inserts pages to it.

export default async (assets: Assets) => {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Embed the CourierOblique font
  const HelveticaBoldFont = pdfDoc.embedStandardFont(
    StandardFonts.HelveticaBold,
  );

  const { jpg } = assets.images;

  pdfDoc.setTitle('🥚 The Life of an dev 🍳', { showInWindowTitleBar: true });
  pdfDoc.setAuthor('khaled AMARI');
  pdfDoc.setSubject('📘 An Epic Tale of Woe 📖');
  pdfDoc.setProducer('PDF App 9000 🤖');
  pdfDoc.setCreator('PDF App 9000 🤖');
  pdfDoc.setCreationDate(new Date('2021-02-24T01:58:37.228Z'));
  pdfDoc.setModificationDate(new Date('2021-02-24T07:00:11.000Z'));

  const jpgBuffer = jpg.cat_riding_unicorn;
  const jpgImage = await pdfDoc.embedJpg(jpgBuffer);
  const jpgDims = jpgImage.scale(0.30);

  let printPageNumber = async function (
    builder: PDFBuilder,
    pageNumber: number,
  ) {
    builder.addCenteredText(pageNumber.toString(), 10);
    builder.getPage().moveDown(1);
  };

  const builder1 = await PDFBuilder.create(pdfDoc, {
    font: HelveticaBoldFont,
    onAddPage: printPageNumber,
  });
  await builder1.addImage(jpgImage, {
    x: 10,
    y: 50,
    width: jpgDims.width,
    height: jpgDims.height * 2,
    opacity: 0.75,
  });
  await builder1.addPage();
  await builder1.addParagraph(ipsumLines);
  await builder1.addParagraph(ipsumLines, 24);
  await builder1.addParagraph(ipsumLines);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
