import PDFContext from 'src/core/PDFContext';

class PDFWriter {
  static forContext = (context: PDFContext) => new PDFWriter(context);

  private readonly context: PDFContext;
  private constructor(context: PDFContext) {
    this.context = context;
  }

  serializeToPDF(): Uint8Array {
    const indirectObjects = this.context.enumerateIndirectObjects();

    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      console.log(indirectObjects[idx][0].objectNumber);
    }

    return new Uint8Array();
  }
}

export default PDFWriter;
