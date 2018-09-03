import { Entry, Subsection, Table } from '../PDFXRef';

class PDFXRefTableFactory {
  static forOffsets = (
    offsets: Array<{
      objectNumber: number;
      generationNumber: number;
      startOffset: number;
    }>,
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

    offsets.forEach((info, idx) => {
      // Add new subsection if needed...
      const prevObjectMeta = offsets[idx - 1] || info;
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
