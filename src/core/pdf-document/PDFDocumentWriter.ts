import PDFDocument from 'core/pdf-document/PDFDocument';
import {
  PDFDictionary,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFStream,
} from 'core/pdf-objects';
import {
  PDFCatalog,
  PDFObjectStream,
  PDFTrailer,
  PDFXRefStream,
} from 'core/pdf-structures';
import PDFXRefTableFactory from 'core/pdf-structures/factories/PDFXRefTableFactory';
import { error } from 'utils';

import { PDFTrailerX } from 'core/pdf-structures/PDFTrailer';

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

  /**
   * Converts a [[PDFDocument]] object into the raw bytes of a PDF document.
   * These raw bytes could, for example, be saved as a file and opened in a
   * PDF reader.
   *
   * @param pdfDoc The [[PDFDocument]] to be converted to bytes.
   *
   * @returns A `Uint8Array` containing the raw bytes of a PDF document.
   */
  static saveToBytesWithObjectStreams = (pdfDoc: PDFDocument): Uint8Array => {
    // const streamObjects: Array<PDFIndirectObject<PDFStream>> = [];
    const streamObjects: Array<PDFIndirectObject<PDFObject>> = [];
    const nonStreamObjects: Array<PDFIndirectObject<PDFObject>> = [];
    let pdfCatalogRef: PDFIndirectReference<PDFCatalog>;

    pdfDoc.index.index.forEach((object, ref) => {
      if (object instanceof PDFCatalog) pdfCatalogRef = ref;
      // if (object instanceof PDFStream) {
      //   streamObjects.push(PDFIndirectObject.of(object).setReference(ref));
      // } else {
      //   nonStreamObjects.push(PDFIndirectObject.of(object).setReference(ref));
      // }
      streamObjects.push(PDFIndirectObject.of(object).setReference(ref));
    });

    if (!pdfCatalogRef!) error('Missing PDFCatalog');

    const { maxObjNum } = pdfDoc;

    // const objectStream = PDFObjectStream.create(pdfDoc.index, nonStreamObjects);
    // const objectStreamRef = PDFIndirectReference.forNumbers(maxObjNum + 1, 0);
    // const objectStreamIndObj = PDFIndirectObject.of(objectStream).setReference(
    //   objectStreamRef,
    // );
    // streamObjects.push(
    //   PDFIndirectObject.of(objectStream).setReference(objectStreamRef),
    // );

    const xrefStream = PDFXRefStream.create(pdfDoc.index);
    const xrefStreamRef = PDFIndirectReference.forNumbers(maxObjNum + 1, 0);
    const xrefStreamIndObj = PDFIndirectObject.of(xrefStream).setReference(
      xrefStreamRef,
    );
    // streamObjects.push(
    //   PDFIndirectObject.of(xrefStream).setReference(xrefStreamRef),
    // );

    xrefStream.dictionary.set(
      PDFName.from('Size'),
      PDFNumber.fromNumber(xrefStreamRef.objectNumber + 1),
    );
    xrefStream.dictionary.set(PDFName.from('Root'), pdfCatalogRef!);
    xrefStream.addFreeObjectEntry(0, 65535);

    // TODO: Do the entries have to be "in order"?
    let offset = pdfDoc.header.bytesSize();
    streamObjects.forEach((obj) => {
      const { generationNumber } = obj.reference;
      xrefStream.addUncompressedObjectEntry(offset, generationNumber);
      offset += obj.bytesSize();
    });
    console.log('Offset Before objectStreamRef:', offset);
    // xrefStream.addUncompressedObjectEntry(
    //   offset + 1,
    //   objectStreamRef.generationNumber,
    // );
    // offset += objectStreamIndObj.bytesSize();
    console.log('Offset After objectStreamRef:', offset);

    // objectStream.objects.forEach((obj, idx) => {
    //   xrefStream.addCompressedObjectEntry(objectStreamRef.objectNumber, idx);
    // });

    const trailer = PDFTrailerX.from(offset);

    xrefStream.addUncompressedObjectEntry(
      offset + 1,
      xrefStreamRef.generationNumber,
    );
    offset += xrefStreamIndObj.bytesSize();

    /* ----- */

    const bufferSize = offset + trailer.bytesSize();
    const buffer = new Uint8Array(bufferSize);

    let remaining = pdfDoc.header.copyBytesInto(buffer);
    remaining = streamObjects.reduce(
      (remBytes, obj) => obj.copyBytesInto(remBytes),
      remaining,
    );
    // remaining = objectStreamIndObj.copyBytesInto(remaining);
    remaining = xrefStreamIndObj.copyBytesInto(remaining);
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
