import PDFHeader from 'src/core/document/PDFHeader';
import PDFTrailer from 'src/core/document/PDFTrailer';
import PDFRef from 'src/core/objects/PDFRef';
import PDFStream from 'src/core/objects/PDFStream';
import PDFContext from 'src/core/PDFContext';
import PDFCrossRefStream from 'src/core/structures/PDFCrossRefStream';
import PDFObjectStream from 'src/core/structures/PDFObjectStream';
import PDFWriter from 'src/core/writers/PDFWriter';

class PDFStreamWriter extends PDFWriter {
  static forContext = (context: PDFContext) => new PDFStreamWriter(context);

  // TODO: Cleanup
  // TODO: Support multiple object streams
  protected computeBufferSize() {
    const objectStreamRef = PDFRef.of(this.context.largestObjectNumber + 1);
    const xrefStreamRef = PDFRef.of(this.context.largestObjectNumber + 2);

    const header = PDFHeader.forVersion(1, 7);

    let size = header.sizeInBytes() + 2;

    const xrefStream = PDFCrossRefStream.create(
      this.context.obj({
        Size: this.context.largestObjectNumber + 3,
        Root: this.context.trailerInfo.Root,
        Encrypt: this.context.trailerInfo.Encrypt,
        Info: this.context.trailerInfo.Info,
        ID: this.context.trailerInfo.ID,
      }),
    );

    const streams = [];
    const nonStreams = [];

    const indirectObjects = this.context.enumerateIndirectObjects();
    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      const indirectObject = indirectObjects[idx];
      const [ref, object] = indirectObject;

      if (object instanceof PDFStream) {
        streams.push(indirectObject);
        xrefStream.addUncompressedEntry(ref, size);
        size += this.computeIndirectObjectSize(indirectObject);
      } else {
        nonStreams.push(indirectObject);
        xrefStream.addCompressedEntry(ref, objectStreamRef, nonStreams.length);
      }
    }

    const objectStream = PDFObjectStream.withContextAndObjects(
      this.context,
      nonStreams,
    );

    xrefStream.addUncompressedEntry(objectStreamRef, size);
    size += this.computeIndirectObjectSize([objectStreamRef, objectStream]);

    xrefStream.addUncompressedEntry(xrefStreamRef, size);
    const xrefOffset = size;
    size += this.computeIndirectObjectSize([xrefStreamRef, xrefStream]);

    const trailer = PDFTrailer.forLastCrossRefSectionOffset(xrefOffset);
    size += trailer.sizeInBytes();

    return {
      size,
      header,
      indirectObjects: streams.concat([
        [objectStreamRef, objectStream],
        [xrefStreamRef, xrefStream],
      ]),
      trailer,
    };
  }
}

export default PDFStreamWriter;
