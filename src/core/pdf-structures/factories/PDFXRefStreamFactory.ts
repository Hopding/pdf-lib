import flatMap from 'lodash/flatMap';
import last from 'lodash/last';
import sortBy from 'lodash/sortBy';

import { PDFObjectIndex } from 'core/pdf-document';
import {
  PDFArray,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
} from 'core/pdf-objects';
import {
  PDFCatalog,
  PDFObjectStream,
  PDFXRefStream,
} from 'core/pdf-structures';

const computeIndices = (objectStream: PDFObjectStream) =>
  objectStream.objects.map((object, index) => ({
    objectNumber: object.reference.objectNumber,
    generationNumber: object.reference.generationNumber,
    index,
  }));

class PDFXRefStreamFactory {
  static forOffsetsAndObjectStream = (
    offsets: Array<{
      objectNumber: number;
      generationNumber: number;
      startOffset: number;
    }>,
    objectStream: PDFIndirectObject<PDFObjectStream>,
    catalog: PDFIndirectReference<PDFCatalog>,
    index: PDFObjectIndex,
  ): PDFIndirectObject<PDFXRefStream> => {
    const indices = computeIndices(objectStream.pdfObject);
    const merged = sortBy([...offsets, ...indices], 'objectNumber');

    const xrefObjectNumber = last(merged)!.objectNumber + 1;
    const xrefStream = PDFXRefStream.create(
      {
        Size: PDFNumber.fromNumber(xrefObjectNumber + 1),
        Root: catalog,
      },
      index,
    );

    merged.push({
      objectNumber: xrefObjectNumber,
      generationNumber: 0,
      startOffset: last(offsets)!.startOffset,
    });

    xrefStream.addFreeObjectEntry(0, 65535);
    const xrefSections = [{ firstObjectNumber: 0, size: 1 }];

    merged.forEach((obj, idx) => {
      const shouldStartNewSection =
        idx !== 0 && obj.objectNumber - merged[idx - 1].objectNumber > 1;

      if (shouldStartNewSection) {
        xrefSections.push({ firstObjectNumber: obj.objectNumber, size: 1 });
      } else {
        last(xrefSections)!.size += 1;
      }

      if ('startOffset' in obj) {
        xrefStream.addUncompressedObjectEntry(
          obj.startOffset,
          obj.generationNumber,
        );
      }
      if ('index' in obj) {
        xrefStream.addCompressedObjectEntry(
          objectStream.reference.objectNumber,
          obj.index,
        );
      }
    });

    xrefStream.dictionary.set(
      PDFName.from('Index'),
      PDFArray.fromArray(
        flatMap(xrefSections, ({ firstObjectNumber, size }) => [
          PDFNumber.fromNumber(firstObjectNumber),
          PDFNumber.fromNumber(size),
        ]),
        index,
      ),
    );
    xrefStream.encode();

    return PDFIndirectObject.of(xrefStream).setReferenceNumbers(
      xrefObjectNumber,
      0,
    );
  };
}

export default PDFXRefStreamFactory;
