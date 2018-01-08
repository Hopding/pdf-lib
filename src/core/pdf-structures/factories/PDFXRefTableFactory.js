/* @flow */
import { PDFIndirectObject } from '../../pdf-objects';
import { PDFHeader, PDFXRef } from '..';

class PDFXRefTableFactory {
  static fromObjectIndex = (
    header: PDFHeader,
    sortedIndex: PDFIndirectObject<*>[],
  ): [PDFXRef.Table, number] => {
    const table = new PDFXRef.Table();
    let subsection = new PDFXRef.Subsection().setFirstObjNum(0);
    subsection.addEntry(
      PDFXRef.Entry
        .create()
        .setOffset(0)
        .setGenerationNum(65535)
        .setIsInUse(false),
    );
    table.addSubsection(subsection);

    let offset = header.bytesSize();
    sortedIndex.forEach((indirectObj, idx) => {
      // Add new subsection if needed...
      const { reference } = indirectObj;
      const { reference: prevReference } = sortedIndex[idx - 1] || indirectObj;
      if (reference.objectNumber - prevReference.objectNumber > 1) {
        subsection = new PDFXRef.Subsection().setFirstObjNum(
          indirectObj.reference.objectNumber,
        );
        table.addSubsection(subsection);
      }

      subsection.addEntry(
        PDFXRef.Entry
          .create()
          .setOffset(offset)
          .setGenerationNum(0)
          .setIsInUse(true),
      );
      offset += indirectObj.bytesSize();
    });

    return [table, offset];
  };
}

export default PDFXRefTableFactory;
