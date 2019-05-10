import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import { PDFObject } from './index';

const byAscendingObjectNumber = (
  [a]: [PDFRef, PDFObject],
  [b]: [PDFRef, PDFObject],
) => a.objectNumber - b.objectNumber;

class PDFWriter {
  static forContext = (context: PDFContext) => new PDFWriter(context);

  private readonly context: PDFContext;
  private constructor(context: PDFContext) {
    this.context = context;
  }

  serializeToPDF(): Uint8Array {
    const indirectObjects = this.context
      .enumerateIndirectObjects()
      .sort(byAscendingObjectNumber);

    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      console.log(indirectObjects[idx][0].objectNumber);
    }

    return new Uint8Array();
  }
}

export default PDFWriter;
