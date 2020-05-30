import { PDFDocument } from 'https://cdn.pika.dev/pdf-lib@^1.7.0';

const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([350, 400]);
page.moveTo(110, 200);
page.drawText('Hello World!');
const pdfBytes = await pdfDoc.save();
await Deno.writeFile('./out.pdf', pdfBytes);
console.log('PDF file written to ./out.pdf');
console.log();
console.log(
  'See https://github.com/Hopding/pdf-lib#deno-usage for more Deno examples!',
);
