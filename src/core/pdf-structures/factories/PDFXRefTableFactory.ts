import { PDFIndirectObject, PDFObject } from 'core/pdf-objects';
import { PDFHeader } from 'core/pdf-structures';
import { Entry, Subsection, Table } from '../PDFXRef';

export interface IObjectMetadata {
  objectNumber: number;
  generationNumber: number;
  startOffset: number;
  endOffset: number;
}

class PDFXRefTableFactory {
  static forIndirectObjectOffsets = (
    indirectObjectsInfo: IObjectMetadata[],
  ): Table => {
    const table = new Table();

    let subsection = new Subsection().setFirstObjNum(0);
    subsection.addEntry(
      Entry.create()
        .setOffset(0)
        .setGenerationNum(65535)
        .setIsInUse(false),
    );
    table.addSubsection(subsection);

    indirectObjectsInfo.forEach((info, idx) => {
      // Add new subsection if needed...
      const prevObjectMeta = indirectObjectsInfo[idx - 1] || info;
      if (info.objectNumber - prevObjectMeta.objectNumber > 1) {
        subsection = new Subsection().setFirstObjNum(info.objectNumber);
        table.addSubsection(subsection);
      }

      subsection.addEntry(
        Entry.create()
          .setOffset(info.startOffset)
          .setGenerationNum(0)
          .setIsInUse(true),
      );
    });

    return table;
  };
}

export default PDFXRefTableFactory;
