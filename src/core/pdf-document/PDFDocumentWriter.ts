import flatMap from 'lodash/flatMap';
import isNil from 'lodash/isNil';
import last from 'lodash/last';
import sortBy from 'lodash/sortBy';

import { PDFDocument, PDFObjectIndex } from 'core/pdf-document';
import {
  PDFArray,
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
import PDFXRefStreamFactory from 'core/pdf-structures/factories/PDFXRefStreamFactory';
import PDFXRefTableFactory from 'core/pdf-structures/factories/PDFXRefTableFactory';
import { error } from 'utils';

import { PDFTrailerX } from 'core/pdf-structures/PDFTrailer';

interface IIndirectObjectInfo {
  objectNumber: number;
  generationNumber: number;
  offset?: number;
  index?: number;
}

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

const computeIndices = (objectStream: PDFObjectStream) =>
  objectStream.objects.map((object, index) => ({
    objectNumber: object.reference.objectNumber,
    generationNumber: object.reference.generationNumber,
    index,
  }));

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
    const {
      catalogRef,
      streamObjects,
      nonStreamObjects,
    } = createIndirectObjectsFromIndex(pdfDoc.index);

    if (!catalogRef) error('Missing PDFCatalog');

    const merged = [...streamObjects, ...nonStreamObjects];
    const offsets = computeOffsets(pdfDoc.header.bytesSize(), merged);
    const sortedOffsets = sortBy(offsets, 'objectNumber');

    const table = PDFXRefTableFactory.forIndirectObjectOffsets(sortedOffsets);
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
    const {
      catalogRef,
      streamObjects,
      nonStreamObjects,
    } = createIndirectObjectsFromIndex(pdfDoc.index);

    if (!catalogRef!) error('Missing PDFCatalog');

    const objectStream = PDFObjectStream.create(pdfDoc.index, nonStreamObjects);
    objectStream.encode();

    const objectStreamIndObj = PDFIndirectObject.of(
      objectStream,
    ).setReferenceNumbers(pdfDoc.maxObjNum + 1, 0);

    streamObjects.push(objectStreamIndObj);

    const offsets = computeOffsets(pdfDoc.header.bytesSize(), streamObjects);
    const indices = computeIndices(objectStream);
    const merged = sortBy([...offsets, ...indices], 'objectNumber');

    const trailerOffset = last(offsets)!.endOffset;
    const xrefStream = PDFXRefStreamFactory.forIndirectObjects(
      trailerOffset,
      objectStreamIndObj.reference.objectNumber,
      merged,
      pdfDoc.index,
      catalogRef!,
    );

    streamObjects.push(xrefStream);

    const trailer = PDFTrailerX.from(trailerOffset);

    /* ----- */

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
