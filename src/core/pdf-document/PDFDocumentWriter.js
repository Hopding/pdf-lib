/* @flow */
import PDFDocument from './PDFDocument';
import PDFXRefTableFactory from '../pdf-structures/factories/PDFXRefTableFactory';
import { PDFTrailer, PDFCatalog } from '../pdf-structures';
import {
  PDFObject,
  PDFIndirectReference,
  PDFIndirectObject,
  PDFDictionary,
  PDFNumber,
} from '../pdf-objects';
import { error } from '../../utils';

class PDFDocumentWriter {
  static saveToBytes = (pdfDoc: PDFDocument): Uint8Array => {
    const sortedIndex = PDFDocumentWriter.sortIndex(pdfDoc.index);

    const { reference: catalogRef } =
      sortedIndex.find(({ pdfObject }) => pdfObject.is(PDFCatalog)) ||
      error('Missing PDFCatalog');

    const [table, tableOffset] = PDFXRefTableFactory.forIndirectObjects(
      pdfDoc.header,
      sortedIndex,
    );

    const trailer = PDFTrailer.from(
      tableOffset,
      PDFDictionary.from({
        // TODO: is "+1" necessary here?
        Size: PDFNumber.fromNumber(sortedIndex.length + 1),
        Root: catalogRef,
      }),
    );

    const bufferSize = tableOffset + table.bytesSize() + trailer.bytesSize();
    const buffer = new Uint8Array(bufferSize);

    let remaining = pdfDoc.header.copyBytesInto(buffer);
    sortedIndex.forEach(indirectObj => {
      remaining = indirectObj.copyBytesInto(remaining);
    });
    remaining = table.copyBytesInto(remaining);
    remaining = trailer.copyBytesInto(remaining);

    return buffer;
  };

  static sortIndex = (index: Map<PDFIndirectReference, PDFObject>) => {
    const indexArr: PDFIndirectObject<*>[] = [];
    index.forEach((object, ref) =>
      indexArr.push(PDFIndirectObject.of(object).setReference(ref)),
    );
    indexArr.sort(
      ({ reference: a }, { reference: b }) => a.objectNumber - b.objectNumber,
    );
    return indexArr;
  };
}

export default PDFDocumentWriter;
