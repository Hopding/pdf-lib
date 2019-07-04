import fs from 'fs';
import { PDFDocument } from 'src/index';

(async () => {
  // These should be a Uint8Arrays.
  // This data can be obtained in a number of different ways.
  // If your running in a Node environment, you could use fs.readFile().
  // In the browser, you could make a fetch() call and use res.arrayBuffer().
  const jpgImageBytes = fs.readFileSync('assets/images/cat_riding_unicorn.jpg');
  const pngImageBytes = fs.readFileSync(
    'assets/images/minions_banana_alpha.png',
  );

  const pdfDoc = await PDFDocument.create();

  const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
  const pngImage = await pdfDoc.embedPng(pngImageBytes);

  const jpgDims = jpgImage.scale(0.25);
  const pngDims = pngImage.scale(0.5);

  const page = pdfDoc.addPage();

  page.drawImage(jpgImage, {
    x: page.getWidth() / 2 - jpgDims.width / 2,
    y: page.getHeight() / 2 - jpgDims.height / 2,
    width: jpgDims.width,
    height: jpgDims.height,
  });

  page.drawImage(pngImage, {
    x: page.getWidth() / 2 - pngDims.width / 2 + 75,
    y: page.getHeight() / 2 - pngDims.height,
    width: pngDims.width,
    height: pngDims.height,
  });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);
  console.log('./out.pdf');
})();
