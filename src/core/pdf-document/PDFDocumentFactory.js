/* @flow */
import PDFDocument from './PDFDocument';

import { PDFName, PDFStream } from '../pdf-objects';
import { PDFObjectStream, PDFPage } from '../pdf-structures';
import PDFParser from '../pdf-parser/PDFParser';

import type { ParsedPDF } from '../pdf-parser/PDFParser';

class PDFDocumentFactory {
  static load = (data: Uint8Array): PDFDocument => {
    const pdfDoc = new PDFDocument();
    const pdfParser = new PDFParser();

    console.time('ParsePDF');
    const parsedPdf = pdfParser.parse(data);
    console.timeEnd('ParsePDF');
    PDFDocumentFactory.normalize(parsedPdf);

    parsedPdf.dictionaries.forEach(dict => {
      if (dict instanceof PDFPage) dict.setPdfDocument(pdfDoc);
    });

    pdfDoc
      .setCatalog(parsedPdf.catalog)
      .setIndirectObjects(Array.from(parsedPdf.indirectObjects.values()));

    return pdfDoc;
  };

  static normalize = ({ dictionaries, arrays, indirectObjects }: ParsedPDF) => {
    // Replace references to PDFIndirectReferences with PDFIndirectObjects
    dictionaries.forEach(dict => dict.dereference(indirectObjects));
    arrays.forEach(arr => arr.dereference(indirectObjects));

    // Remove Object Streams and Cross Reference Streams, because we've already
    // parsed the Object Streams into PDFIndirectObjects, and will just write
    // them as such and use normal xref tables to reference them.
    indirectObjects.forEach(({ pdfObject }, ref) => {
      if (pdfObject.is(PDFObjectStream)) indirectObjects.delete(ref);
      else if (
        pdfObject.is(PDFStream) &&
        pdfObject.dictionary.get('Type') === PDFName.from('XRef')
      ) {
        indirectObjects.delete(ref);
      }
    });

    // Reset the objects numbers, starting from 0
    let objNum = 1;
    indirectObjects.forEach(obj => {
      obj.setReferenceNumbers(objNum, 0);
      objNum += 1;
    });
  };
}

export default PDFDocumentFactory;
