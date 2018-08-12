import flatMap from 'lodash/flatMap';
import isNil from 'lodash/isNil';
import last from 'lodash/last';
import sortBy from 'lodash/sortBy';

import PDFDocument from 'core/pdf-document/PDFDocument';
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
    const streamObjects: Array<PDFIndirectObject<PDFStream>> = [];
    // const streamObjects: Array<PDFIndirectObject<PDFObject>> = [];
    const nonStreamObjects: Array<PDFIndirectObject<PDFObject>> = [];
    let pdfCatalogRef: PDFIndirectReference<PDFCatalog>;

    pdfDoc.index.index.forEach((object, ref) => {
      if (object instanceof PDFCatalog) pdfCatalogRef = ref;
      if (object instanceof PDFStream) {
        streamObjects.push(PDFIndirectObject.of(object).setReference(ref));
      } else {
        nonStreamObjects.push(PDFIndirectObject.of(object).setReference(ref));
      }
    });

    if (!pdfCatalogRef!) error('Missing PDFCatalog');

    const { maxObjNum } = pdfDoc;

    const objectStream = PDFObjectStream.create(pdfDoc.index, nonStreamObjects);
    const objectStreamRef = PDFIndirectReference.forNumbers(maxObjNum + 1, 0);
    streamObjects.push(
      PDFIndirectObject.of(objectStream).setReference(objectStreamRef),
    );

    const xrefStream = PDFXRefStream.create(pdfDoc.index);
    const xrefStreamRef = PDFIndirectReference.forNumbers(maxObjNum + 2, 0);
    const xrefStreamIndObj = PDFIndirectObject.of(xrefStream).setReference(
      xrefStreamRef,
    );

    xrefStream.dictionary.set(
      PDFName.from('Size'),
      PDFNumber.fromNumber(xrefStreamRef.objectNumber + 1),
    );
    xrefStream.dictionary.set(PDFName.from('Root'), pdfCatalogRef!);
    xrefStream.addFreeObjectEntry(0, 65535);

    interface IGroupElement {
      objectNumber: number;
      generationNumber: number;
      offset?: number;
      index?: number;
    }
    const group: IGroupElement[] = [];

    objectStream.objects.forEach((obj, idx) => {
      // xrefStream.addCompressedObjectEntry(objectStreamRef.objectNumber, idx);
      group.push({
        objectNumber: obj.reference.objectNumber,
        generationNumber: obj.reference.generationNumber,
        index: idx,
      });
    });

    let offset = pdfDoc.header.bytesSize();
    streamObjects.forEach((obj) => {
      const { generationNumber } = obj.reference;
      // xrefStream.addUncompressedObjectEntry(offset, generationNumber);
      group.push({
        objectNumber: obj.reference.objectNumber,
        generationNumber: obj.reference.generationNumber,
        offset,
      });
      offset += obj.bytesSize();
    });

    const trailer = PDFTrailerX.from(offset);

    /* ===== Add Index... ===== */
    group.push({
      objectNumber: xrefStreamRef.objectNumber,
      generationNumber: xrefStreamRef.generationNumber,
      offset,
    });

    const sortedGroup: IGroupElement[] = sortBy(group, 'objectNumber');
    const groupChunks: Array<{ firstObjectNumber: number; size: number }> = [
      { firstObjectNumber: 0, size: 1 },
    ];

    sortedGroup.forEach((obj, idx) => {
      const shouldStartNewSection =
        idx !== 0 && obj.objectNumber - sortedGroup[idx - 1].objectNumber > 1;

      if (shouldStartNewSection) {
        groupChunks.push({ firstObjectNumber: obj.objectNumber, size: 1 });
      } else {
        last(groupChunks)!.size += 1;
      }

      if (!isNil(obj.offset)) {
        xrefStream.addUncompressedObjectEntry(obj.offset, obj.generationNumber);
      }
      if (!isNil(obj.index)) {
        xrefStream.addCompressedObjectEntry(
          objectStreamRef.objectNumber,
          obj.index,
        );
      }
    });

    const index = PDFArray.fromArray(
      flatMap(groupChunks, ({ firstObjectNumber, size }) => [
        PDFNumber.fromNumber(firstObjectNumber),
        PDFNumber.fromNumber(size),
      ]),
      pdfDoc.index,
    );

    xrefStream.dictionary.set(PDFName.from('Index'), index);
    /* ======================== */

    offset += xrefStreamIndObj.bytesSize();

    /* ----- */

    const bufferSize = offset + trailer.bytesSize();
    const buffer = new Uint8Array(bufferSize);

    let remaining = pdfDoc.header.copyBytesInto(buffer);
    remaining = streamObjects.reduce(
      (remBytes, obj) => obj.copyBytesInto(remBytes),
      remaining,
    );
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
