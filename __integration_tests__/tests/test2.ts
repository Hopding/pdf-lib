import PDFDocumentFactory from 'core/pdf-document/PDFDocumentFactory';
import PDFDocumentWriter from 'core/pdf-document/PDFDocumentWriter';
import PDFOperators from 'core/pdf-operators/index';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';
import PDFPage from 'core/pdf-structures/PDFPage';

import { IPDFCreator, ITest, ITestAssets } from '../models';

const kernel: IPDFCreator = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.create();

  const page1 = pdfDoc.createPage([500, 1000]);
  pdfDoc.addPage(page1);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'PDF Modification Test (with Object Streams)',
  description: 'This is a test that does stuff and things.',
  checklist: ['Foo', 'Bar', 'Qux', 'Baz'],
};
