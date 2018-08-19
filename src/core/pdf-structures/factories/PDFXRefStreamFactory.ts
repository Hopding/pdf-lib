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

export interface IObjectMetadata {
  objectNumber: number;
  generationNumber: number;
  startOffset?: number;
  endOffset?: number;
  index?: number;
}

class PDFXRefStreamFactory {
  static forIndirectObjects = (
    startingOffset: number,
    objectStreamObjectNumber: number,
    objectsInfo: IObjectMetadata[],
    index: PDFObjectIndex,
    catalog: PDFIndirectReference<PDFCatalog>,
  ): PDFIndirectObject<PDFXRefStream> => {
    const xrefStream = PDFXRefStream.create(index);
    const xrefStreamRef = PDFIndirectReference.forNumbers(
      last(objectsInfo)!.objectNumber + 1,
      0,
    );

    xrefStream.dictionary.set(
      PDFName.from('Size'),
      PDFNumber.fromNumber(xrefStreamRef.objectNumber + 1),
    );
    xrefStream.dictionary.set(PDFName.from('Root'), catalog);

    /* ===== Add Index... ===== */
    objectsInfo.push({
      objectNumber: xrefStreamRef.objectNumber,
      generationNumber: xrefStreamRef.generationNumber,
      startOffset: startingOffset,
    });

    xrefStream.addFreeObjectEntry(0, 65535);
    const xrefSections = [{ firstObjectNumber: 0, size: 1 }];

    objectsInfo.forEach((obj, idx) => {
      const shouldStartNewSection =
        idx !== 0 && obj.objectNumber - objectsInfo[idx - 1].objectNumber > 1;

      if (shouldStartNewSection) {
        xrefSections.push({ firstObjectNumber: obj.objectNumber, size: 1 });
      } else {
        last(xrefSections)!.size += 1;
      }

      if (!isNil(obj.startOffset)) {
        xrefStream.addUncompressedObjectEntry(
          obj.startOffset,
          obj.generationNumber,
        );
      }
      if (!isNil(obj.index)) {
        xrefStream.addCompressedObjectEntry(
          objectStreamObjectNumber,
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
    return xrefStreamIndObj;
    // return [offset, xrefStreamIndObj];
  };
}

export default PDFXRefStreamFactory;
