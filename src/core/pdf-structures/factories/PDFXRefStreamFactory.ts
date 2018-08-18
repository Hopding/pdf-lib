import flatMap from 'lodash/flatMap';
import isNil from 'lodash/isNil';
import last from 'lodash/last';

import { PDFObjectIndex } from 'core/pdf-document';
import {
  PDFArray,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFStream,
} from 'core/pdf-objects';
import {
  PDFCatalog,
  PDFHeader,
  PDFObjectStream,
  PDFXRefStream,
} from 'core/pdf-structures';
import { PDFTrailerX } from 'core/pdf-structures/PDFTrailer';

interface IObjectMetadata {
  objectNumber: number;
  generationNumber: number;
  offset?: number;
  index?: number;
}

class PDFXRefStreamFactory {
  static forIndirectObjects = (
    header: PDFHeader,
    indirectObjects: PDFIndirectObject[],
    objectStream: PDFIndirectObject<PDFObjectStream>,
    index: PDFObjectIndex,
    catalog: PDFIndirectReference<PDFCatalog>,
  ): [number, PDFIndirectObject<PDFXRefStream>] => {
    const [offset, sortedObjects] = PDFXRefStreamFactory.sortObjects(
      header.bytesSize(),
      indirectObjects,
      objectStream.pdfObject,
    );

    const xrefStream = PDFXRefStream.create(index);
    const xrefStreamRef = PDFIndirectReference.forNumbers(
      last(sortedObjects)!.objectNumber + 1,
      0,
    );

    xrefStream.dictionary.set(
      PDFName.from('Size'),
      PDFNumber.fromNumber(xrefStreamRef.objectNumber + 1),
    );
    xrefStream.dictionary.set(PDFName.from('Root'), catalog);

    /* ===== Add Index... ===== */
    sortedObjects.push({
      objectNumber: xrefStreamRef.objectNumber,
      generationNumber: xrefStreamRef.generationNumber,
      offset,
    });

    xrefStream.addFreeObjectEntry(0, 65535);
    const xrefSections = [{ firstObjectNumber: 0, size: 1 }];

    sortedObjects.forEach((obj, idx) => {
      const shouldStartNewSection =
        idx !== 0 && obj.objectNumber - sortedObjects[idx - 1].objectNumber > 1;

      if (shouldStartNewSection) {
        xrefSections.push({ firstObjectNumber: obj.objectNumber, size: 1 });
      } else {
        last(xrefSections)!.size += 1;
      }

      if (!isNil(obj.offset)) {
        xrefStream.addUncompressedObjectEntry(obj.offset, obj.generationNumber);
      }
      if (!isNil(obj.index)) {
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
    /* ======================== */

    const xrefStreamIndObj = PDFIndirectObject.of(xrefStream).setReference(
      xrefStreamRef,
    );
    return [offset, xrefStreamIndObj];
  };

  private static sortObjects = (
    startingOffset: number,
    indirectObjects: Array<PDFIndirectObject<PDFObject>>,
    objectStream: PDFObjectStream,
  ): [number, IObjectMetadata[]] => {
    let offset = startingOffset;

    const x: IObjectMetadata[] = indirectObjects.map((object) => {
      const metadata = {
        objectNumber: object.reference.objectNumber,
        generationNumber: object.reference.generationNumber,
        offset,
      };
      offset += object.bytesSize();
      return metadata;
    });

    const y: IObjectMetadata[] = objectStream.objects.map((object, index) => ({
      objectNumber: object.reference.objectNumber,
      generationNumber: object.reference.generationNumber,
      index,
    }));

    return [
      offset,
      x.concat(y).sort((a, b) => a.objectNumber - b.objectNumber),
    ];
  };
}

export default PDFXRefStreamFactory;
