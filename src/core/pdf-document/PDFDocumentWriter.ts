import PDFDocument from 'core/pdf-document/PDFDocument';
import {
  PDFDictionary,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFNumber,
  PDFObject,
} from 'core/pdf-objects';
import { PDFCatalog, PDFTrailer } from 'core/pdf-structures';
import PDFXRefTableFactory from 'core/pdf-structures/factories/PDFXRefTableFactory';
import { error } from 'utils';

class PDFDocumentWriter {
  /**
   * Converts a [[PDFDocument]] object into the raw bytes of a PDF document.
   * These raw bytes could, for example, be saved as a file and opened in a
   * PDF reader.
   *
   * @param pdfDoc The [[PDFDocument]] to be converted to bytes.
   *
   * @returns A `Uint8Array` containing the raw bytes of a PDF document.
   */
  static saveToBytes = (pdfDoc: PDFDocument): Uint8Array => {
    const sortedIndex = PDFDocumentWriter.sortIndex(pdfDoc.index.index);

    const { reference: catalogRef } =
      sortedIndex.find(({ pdfObject }) => pdfObject instanceof PDFCatalog) ||
      error('Missing PDFCatalog');

    const [table, tableOffset] = PDFXRefTableFactory.forIndirectObjects(
      pdfDoc.header,
      sortedIndex,
    );

    const trailer = PDFTrailer.from(
      tableOffset,
      PDFDictionary.from(
        {
          // TODO: is "+1" necessary here?
          Size: PDFNumber.fromNumber(sortedIndex.length + 1),
          Root: catalogRef,
        },
        pdfDoc.index,
      ),
    );

    const bufferSize = tableOffset + table.bytesSize() + trailer.bytesSize();
    const buffer = new Uint8Array(bufferSize);

    let remaining = pdfDoc.header.copyBytesInto(buffer);
    sortedIndex.forEach((indirectObj) => {
      remaining = indirectObj.copyBytesInto(remaining);
    });
    remaining = table.copyBytesInto(remaining);
    remaining = trailer.copyBytesInto(remaining);

    return buffer;
  };

  /** @hidden */
  private static sortIndex = (index: Map<PDFIndirectReference, PDFObject>) => {
    const indexArr: PDFIndirectObject[] = [];
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
