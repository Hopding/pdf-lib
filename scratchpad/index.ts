import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument, PDFName, StandardFonts, typedArrayFor } from 'src/index';

const whitespacePadding = new Array(20).fill(' '.repeat(100)).join('\n');

const addMetadataToDoc = (pdfDoc: PDFDocument, options: any) => {
  const metadataXML = `
    <?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
      <x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.2-c001 63.139439, 2010/09/27-13:37:26        ">
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">

          <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:format>application/pdf</dc:format>
            <dc:creator>
              <rdf:Seq>
                <rdf:li>${options.author}</rdf:li>
              </rdf:Seq>
            </dc:creator>
            <dc:title>
               <rdf:Alt>
                  <rdf:li xml:lang="x-default">${options.title}</rdf:li>
               </rdf:Alt>
            </dc:title>
            <dc:subject>
              <rdf:Bag>
                ${options.keywords
                  .map((keyword: any) => `<rdf:li>${keyword}</rdf:li>`)
                  .join('\n')}
              </rdf:Bag>
            </dc:subject>
          </rdf:Description>

          <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
            <xmp:CreatorTool>${options.creatorTool}</xmp:CreatorTool>
            <xmp:CreateDate>${options.documentCreationDate.toISOString()}</xmp:CreateDate>
            <xmp:ModifyDate>${options.documentModificationDate.toISOString()}</xmp:ModifyDate>
            <xmp:MetadataDate>${options.metadataModificationDate.toISOString()}</xmp:MetadataDate>
          </rdf:Description>

          <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
            <pdf:Subject>${options.subject}</pdf:Subject>
            <pdf:Producer>${options.producer}</pdf:Producer>
          </rdf:Description>

        </rdf:RDF>
      </x:xmpmeta>
      ${whitespacePadding}
    <?xpacket end="w"?>
  `.trim();

  const metadataStream = pdfDoc.context.stream(metadataXML, {
    Type: 'Metadata',
    Subtype: 'XML',
    Length: metadataXML.length,
  });

  const metadataStreamRef = pdfDoc.context.register(metadataStream);

  pdfDoc.catalog.set(PDFName.of('Metadata'), metadataStreamRef);
};

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

  addMetadataToDoc(pdfDoc, {
    author: 'Дмитрий Козлюк (Dmitry Kozlyuk) 💩💩 wut',
    title: 'The Life of an Egg',
    subject: 'An Epic Tale of Woe',
    keywords: ['eggs', 'wall', 'fall', 'king', 'horses', 'men'],
    producer: `Your App's Name Goes Here`,
    creatorTool:
      'pdf-lib pdf-lib_version_goes_here (https://github.com/Hopding/pdf-lib)',
    documentCreationDate: new Date(),
    documentModificationDate: new Date(),
    metadataModificationDate: new Date(),
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Acrobat);

  console.log();
  console.log(typedArrayFor('Дмитрий Козлюк (Dmitry Kozlyuk)'));
})();
