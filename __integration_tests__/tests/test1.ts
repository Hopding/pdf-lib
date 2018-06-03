import PDFDocumentFactory from 'core/pdf-document/PDFDocumentFactory';
import PDFDocumentWriter from 'core/pdf-document/PDFDocumentWriter';
import { PDFDictionary, PDFName } from 'core/pdf-objects';
import PDFOperators from 'core/pdf-operators/index';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';
import { PDFContentStream } from 'core/pdf-structures';
import PDFPage from 'core/pdf-structures/PDFPage';

import { IPDFCreator, ITest, ITestAssets } from '../models';

const { rg, Tf, Td, Tj } = PDFOperators;

const kernel: IPDFCreator = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.create();

  const FontTimesRoman = pdfDoc.register(
    PDFDictionary.from(
      {
        Type: PDFName.from('Font'),
        Subtype: PDFName.from('Type1'),
        BaseFont: PDFName.from('Times-Roman'),
      },
      pdfDoc.index,
    ),
  );

  const page1ContentStream = PDFContentStream.of(
    PDFDictionary.from({}, pdfDoc.index),
    PDFTextObject.of(
      // Draw red colored text at x-y coordinates (50, 500)
      rg.of(1.0, 0.0, 0.0),
      Tf.of('/FontTimesRoman', 50),
      Td.of(20, 20),
      Tj.of('This Is A Test Of The...'),
    ),
  );

  const page1ContentStreamRef = pdfDoc.register(page1ContentStream);

  const page1 = pdfDoc
    .createPage([500, 750])
    .addFontDictionary('FontTimesRoman', FontTimesRoman)
    .addContentStreams(page1ContentStreamRef);

  pdfDoc.addPage(page1);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'PDF Creation Test',
  description:
    `This test verifies that a PDF can be created from scratch.\n` +
    `It ensures that we can manipulate the PDF's pages, add fonts and images, ` +
    `and use all valid content stream operators.`,
  checklist: ['Foo', 'Bar', 'Qux', 'Baz'],
};
