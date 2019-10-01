import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument, StandardFonts } from 'src/index';

(async () => {
  const pdfDoc = await PDFDocument.create();

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const page = pdfDoc.addPage([500, 600]);

  page.setFont(timesRomanFont);
  page.drawText('The Life of an Egg', { x: 60, y: 500, size: 50 });
  page.drawText('An Epic Tale of Woe', { x: 125, y: 460, size: 25 });

  page.setFont(helveticaFont);
  page.drawText(
    [
      'Humpty Dumpty sat on a wall',
      'Humpty Dumpty had a great fall;',
      `All the king's horses and all the king's men`,
      `Couldn't put Humpty together again.`,
    ].join('\n'),
    { x: 75, y: 275, size: 20, lineHeight: 25 },
  );
  page.drawText('- Humpty Dumpty', { x: 250, y: 150, size: 20 });

  pdfDoc.setTitle('🥚 The Life of an Egg 🍳');
  pdfDoc.setAuthor('Humpty Dumpty');
  pdfDoc.setSubject('📘 An Epic Tale of Woe 📖');
  pdfDoc.setKeywords(['eggs', 'wall', 'fall', 'king', 'horses', 'men']);
  pdfDoc.setProducer('PDF App 9000 🤖');
  pdfDoc.setCreator('pdf-lib (https://github.com/Hopding/pdf-lib)');
  pdfDoc.setCreationDate(new Date('2018-06-24T01:58:37.228Z'));
  pdfDoc.setModificationDate(new Date('2019-12-21T07:00:11.000Z'));

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
