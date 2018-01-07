/* @flow */
import PDFDocument from './PDFDocument';
import PDFObjectIndex from './PDFObjectIndex';

import { PDFName, PDFStream } from '../pdf-objects';
import { PDFCatalog, PDFObjectStream } from '../pdf-structures';
import PDFParser from '../pdf-parser/PDFParser';
import { findInMap } from '../../utils';

import type { ParsedPDF } from '../pdf-parser/PDFParser';

class PDFDocumentFactory {
  static update = (data: Uint8Array): PDFDocument => {
    const pdfDoc = new PDFDocument();
    const index = PDFObjectIndex.for(data);

    pdfDoc.index = index;
    pdfDoc.catalog = index.lookup(index.trailer.dictionary.get('Root'));

    return pdfDoc;
  };

  static load = (data: Uint8Array): PDFDocument => {
    const pdfDoc = new PDFDocument();
    const pdfParser = new PDFParser();
    const index = PDFObjectIndex.for(data);

    console.time('ParsePDF');
    const parsedPdf = pdfParser.parse(data, index.lookup);
    console.timeEnd('ParsePDF');

    console.time('Normalize');
    PDFDocumentFactory.normalize(parsedPdf);
    console.timeEnd('Normalize');

    console.time('Finding Catalog');
    const catalog = findInMap(parsedPdf.original.body, obj =>
      obj.pdfObject.is(PDFCatalog),
    );
    console.timeEnd('Finding Catalog');

    pdfDoc
      .setCatalog(catalog)
      .setIndirectObjects(Array.from(parsedPdf.original.body.values()));

    return pdfDoc;
  };

  static normalize = ({
    dictionaries,
    arrays,
    original: { body },
    updates,
  }: ParsedPDF) => {
    // Update body with most recent version of each object
    updates.forEach(({ body: updateBody }) => {
      updateBody.forEach((obj, ref) => body.set(ref, obj));
    });

    // Replace references to PDFIndirectReferences with PDFIndirectObjects
    const failures = [
      ...dictionaries.map(dict => dict.dereference(body)),
      ...arrays.map(arr => arr.dereference(body)),
    ].filter(x => x.length > 0);

    // Remove Object Streams and Cross Reference Streams, because we've already
    // parsed the Object Streams into PDFIndirectObjects, and will just write
    // them as such and use normal xref tables to reference them.
    body.forEach(({ pdfObject }, ref) => {
      if (pdfObject.is(PDFObjectStream)) body.delete(ref);
      else if (
        pdfObject.is(PDFStream) &&
        pdfObject.dictionary.get('Type') === PDFName.from('XRef')
      ) {
        body.delete(ref);
      }
    });

    // Reset the objects numbers, starting from 0
    let objNum = 1;
    body.forEach(obj => {
      obj.setReferenceNumbers(objNum, 0);
      objNum += 1;
    });

    return failures;
  };
}

export default PDFDocumentFactory;
