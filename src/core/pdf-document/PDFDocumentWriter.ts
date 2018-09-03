import isFunction from 'lodash/isFunction';
import last from 'lodash/last';
import sortBy from 'lodash/sortBy';

import { PDFDocument, PDFObjectIndex } from 'core/pdf-document';
import {
  PDFDictionary,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFNumber,
  PDFObject,
  PDFStream,
} from 'core/pdf-objects';
import { PDFCatalog, PDFObjectStream, PDFTrailer } from 'core/pdf-structures';
import PDFXRefStreamFactory from 'core/pdf-structures/factories/PDFXRefStreamFactory';
import PDFXRefTableFactory from 'core/pdf-structures/factories/PDFXRefTableFactory';
import { error } from 'utils';

const createIndirectObjectsFromIndex = ({ index }: PDFObjectIndex) => {
  let catalogRef: PDFIndirectReference<PDFCatalog> | undefined;

  const streamObjects: Array<PDFIndirectObject<PDFStream>> = [];
  const nonStreamObjects: Array<PDFIndirectObject<PDFObject>> = [];

  index.forEach((object, ref) => {
    if (object instanceof PDFCatalog) catalogRef = ref;
    const array =
      object instanceof PDFStream ? streamObjects : nonStreamObjects;
    array.push(PDFIndirectObject.of(object).setReference(ref));
  });

  return { catalogRef, streamObjects, nonStreamObjects };
};

const computeOffsets = (
  startingOffset: number,
  indirectObjects: Array<PDFIndirectObject<PDFObject>>,
) =>
  indirectObjects.map((object) => ({
    objectNumber: object.reference.objectNumber,
    generationNumber: object.reference.generationNumber,
    startOffset: startingOffset,
    endOffset: (startingOffset += object.bytesSize()),
  }));

class PDFDocumentWriter {
  /**
   * Converts a [[PDFDocument]] object into the raw bytes of a PDF document.
   * These raw bytes could, for example, be saved as a file and opened in a
   * PDF reader.
   *
   * `options.useObjectStreams` controls whether or not to use Object Streams
   * when saving the document. Using Object Streams will result in a smaller
   * file size for many documents. This option is `true` by default. If set to
   * `false`, then Object Streams will not be used.
   *
   * @param pdfDoc  The [[PDFDocument]] to be converted to bytes.
   * @param options An options object.
   *
   * @returns A `Uint8Array` containing the raw bytes of a PDF document.
   */
  static saveToBytes = (
    pdfDoc: PDFDocument,
    options = { useObjectStreams: true },
  ): Uint8Array => {
    return options.useObjectStreams === false
      ? PDFDocumentWriter.saveToBytesWithXRefTable(pdfDoc)
      : PDFDocumentWriter.saveToBytesWithObjectStreams(pdfDoc);
  };

  private static saveToBytesWithXRefTable = (
    pdfDoc: PDFDocument,
  ): Uint8Array => {
    /* ===== (1) Compute indirect object offsets and sort by objectnumber ===== */
    const {
      catalogRef,
      streamObjects,
      nonStreamObjects,
    } = createIndirectObjectsFromIndex(pdfDoc.index);

    if (!catalogRef) error('Missing PDFCatalog');
    streamObjects.forEach((streamObj: PDFIndirectObject<any>) => {
      if (isFunction(streamObj.pdfObject.encode)) streamObj.pdfObject.encode();
    });

    const merged = [...streamObjects, ...nonStreamObjects];
    const offsets = computeOffsets(pdfDoc.header.bytesSize(), merged);
    const sortedOffsets = sortBy(offsets, 'objectNumber');

    /* ===== (2) Create XRefTable and Trailer ===== */
    const table = PDFXRefTableFactory.forOffsets(sortedOffsets);
    const tableOffset = last(offsets)!.endOffset;
    const trailer = PDFTrailer.from(
      tableOffset,
      PDFDictionary.from(
        {
          Size: PDFNumber.fromNumber(last(offsets)!.objectNumber + 1),
          Root: catalogRef!,
        },
        pdfDoc.index,
      ),
    );

    /* ===== (3) Create buffer and copy objects into it ===== */
    const bufferSize = tableOffset + table.bytesSize() + trailer.bytesSize();
    const buffer = new Uint8Array(bufferSize);

    let remaining = pdfDoc.header.copyBytesInto(buffer);
    remaining = merged.reduce(
      (remBytes, indirectObj) => indirectObj.copyBytesInto(remBytes),
      remaining,
    );
    remaining = table.copyBytesInto(remaining);
    remaining = trailer.copyBytesInto(remaining);

    return buffer;
  };

  private static saveToBytesWithObjectStreams = (
    pdfDoc: PDFDocument,
  ): Uint8Array => {
    /* ===== (1) Split objects into streams and nonstreams ===== */
    const {
      catalogRef,
      streamObjects,
      nonStreamObjects,
    } = createIndirectObjectsFromIndex(pdfDoc.index);

    if (!catalogRef!) error('Missing PDFCatalog');
    streamObjects.forEach((streamObj: PDFIndirectObject<any>) => {
      if (isFunction(streamObj.pdfObject.encode)) streamObj.pdfObject.encode();
    });

    /* ===== (2) Create ObjectStream ===== */
    const objectStream = PDFObjectStream.create(pdfDoc.index, nonStreamObjects);
    objectStream.encode();

    const objectStreamIndObj = PDFIndirectObject.of(
      objectStream,
    ).setReferenceNumbers(pdfDoc.maxObjNum + 1, 0);

    streamObjects.push(objectStreamIndObj);

    /* ===== (3) Compute indirect object offsets ===== */
    const offsets = computeOffsets(pdfDoc.header.bytesSize(), streamObjects);
    const trailerOffset = last(offsets)!.endOffset;

    /* ===== (4) Create XRefStream and Trailer ===== */
    const xrefStream = PDFXRefStreamFactory.forOffsetsAndObjectStream(
      offsets,
      objectStreamIndObj,
      catalogRef!,
      pdfDoc.index,
    );
    streamObjects.push(xrefStream);

    const trailer = PDFTrailer.from(trailerOffset);

    /* ===== (5) Create buffer and copy objects into it ===== */
    const bufferSize =
      trailerOffset + xrefStream.bytesSize() + trailer.bytesSize();
    const buffer = new Uint8Array(bufferSize);

    let remaining = pdfDoc.header.copyBytesInto(buffer);
    remaining = streamObjects.reduce(
      (remBytes, obj) => obj.copyBytesInto(remBytes),
      remaining,
    );
    remaining = trailer.copyBytesInto(remaining);

    return buffer;
  };
}

export default PDFDocumentWriter;
