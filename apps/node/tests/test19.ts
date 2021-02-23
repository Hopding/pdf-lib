import fontkit from '@pdf-lib/fontkit';
import { Assets } from '..';
import {
  PDFDocument,
  PDFBuilder,
  AFRelationship,
  StandardFonts,
} from '../../../cjs';

const ipsumLines = "Eligendi est pariatur quidem in non excepturi et Consectetur non tenetur magnam.";

// This test creates a new PDF document and inserts pages to it.

export default async (assets: Assets) => {

  const pdfDoc = await PDFDocument.create();

  // Embed the CourierOblique font
  const CourierObliqueFont = await pdfDoc.embedFont(StandardFonts.CourierOblique);

  pdfDoc.setTitle('🥚 The Life of an dev 🍳', { showInWindowTitleBar: true });
  pdfDoc.setAuthor('khaled AMARI');
  pdfDoc.setSubject('📘 An Epic Tale of Woe 📖');
  pdfDoc.setProducer('PDF App 9000 🤖');
  pdfDoc.setCreator('PDF App 9000 🤖');
  pdfDoc.setCreationDate(new Date('2021-02-24T01:58:37.228Z'));
  pdfDoc.setModificationDate(new Date('2021-02-24T07:00:11.000Z'));

  pdfDoc.registerFontkit(fontkit);

  await pdfDoc.attach(assets.images.png.greyscale_bird, 'bird.png', {
    mimeType: 'image/png',
    description: 'A bird in greyscale 🐦',
    creationDate: new Date('2006/06/06'),
    modificationDate: new Date('2007/07/07'),
    afRelationship: AFRelationship.Data,
  });

  const builder = await PDFBuilder.create(pdfDoc);
  await builder.drawTextLine(ipsumLines, {
    textSize: 12,
    leftPos: 7,
    font: CourierObliqueFont
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
