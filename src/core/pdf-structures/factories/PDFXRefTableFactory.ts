import { PDFHeader } from '..';
import { PDFIndirectObject } from '../../pdf-objects';
import { Entry, Subsection, Table } from '../PDFXRef';

class PDFXRefTableFactory {
  public static forIndirectObjects = (
    header: PDFHeader,
    sortedIndex: PDFIndirectObject[],
  ): [Table, number] => {
    const table = new Table();
    let subsection = new Subsection().setFirstObjNum(0);
    subsection.addEntry(
      Entry.create()
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
        subsection = new Subsection().setFirstObjNum(
          indirectObj.reference.objectNumber,
        );
        table.addSubsection(subsection);
      }

      subsection.addEntry(
        Entry.create()
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
