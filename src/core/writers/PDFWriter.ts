import PDFCrossRefSection from 'src/core/document/PDFCrossRefSection';
import PDFHeader from 'src/core/document/PDFHeader';
import PDFTrailer from 'src/core/document/PDFTrailer';
import PDFTrailerDict from 'src/core/document/PDFTrailerDict';
import PDFContext from 'src/core/PDFContext';
import CharCodes from 'src/core/syntax/CharCodes';
import { copyStringIntoBuffer } from 'src/utils';

class PDFWriter {
  static serializeContextToBuffer(context: PDFContext): Uint8Array {
    const {
      size,
      header,
      indirectObjects,
      xref,
      trailerDict,
      trailer,
    } = PDFWriter.computeBufferSize(context);

    let offset = 0;
    const buffer = new Uint8Array(size);

    offset += header.copyBytesInto(buffer, offset);
    buffer[offset++] = CharCodes.Newline;
    buffer[offset++] = CharCodes.Newline;

    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      const [ref, object] = indirectObjects[idx];

      const objectNumber = String(ref.objectNumber);
      offset += copyStringIntoBuffer(objectNumber, buffer, offset);
      buffer[offset++] = CharCodes.Space;

      const generationNumber = String(ref.generationNumber);
      offset += copyStringIntoBuffer(generationNumber, buffer, offset);
      buffer[offset++] = CharCodes.Space;

      buffer[offset++] = CharCodes.o;
      buffer[offset++] = CharCodes.b;
      buffer[offset++] = CharCodes.j;
      buffer[offset++] = CharCodes.Newline;

      offset += object.copyBytesInto(buffer, offset);

      buffer[offset++] = CharCodes.Newline;
      buffer[offset++] = CharCodes.e;
      buffer[offset++] = CharCodes.n;
      buffer[offset++] = CharCodes.d;
      buffer[offset++] = CharCodes.o;
      buffer[offset++] = CharCodes.b;
      buffer[offset++] = CharCodes.j;
      buffer[offset++] = CharCodes.Newline;
      buffer[offset++] = CharCodes.Newline;
    }

    offset += xref.copyBytesInto(buffer, offset);
    buffer[offset++] = CharCodes.Newline;

    offset += trailerDict.copyBytesInto(buffer, offset);
    buffer[offset++] = CharCodes.Newline;
    buffer[offset++] = CharCodes.Newline;

    offset += trailer.copyBytesInto(buffer, offset);

    return buffer;
  }

  private static computeBufferSize(context: PDFContext) {
    const header = PDFHeader.forVersion(1, 7);

    let size = header.sizeInBytes() + 2;

    const xref = PDFCrossRefSection.create();

    const indirectObjects = context.enumerateIndirectObjects();

    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      const [ref, object] = indirectObjects[idx];
      xref.addEntry(ref, size);

      const refSize = ref.sizeInBytes() + 3; // 'R' -> 'obj\n'
      const objectSize = object.sizeInBytes() + 9; // '\nendobj\n\n'

      size += refSize + objectSize;
    }

    const xrefOffset = size;
    size += xref.sizeInBytes() + 1; // '\n'

    const trailerDict = PDFTrailerDict.of(
      context.obj({
        Size: context.largestObjectNumber + 1,
        Root: context.trailerInfo.Root,
        Encrypt: context.trailerInfo.Encrypt,
        Info: context.trailerInfo.Info,
        ID: context.trailerInfo.ID,
      }),
    );
    size += trailerDict.sizeInBytes() + 2; // '\n\n'

    const trailer = PDFTrailer.forLastCrossRefSectionOffset(xrefOffset);
    size += trailer.sizeInBytes();

    return { size, header, indirectObjects, xref, trailerDict, trailer };
  }
}

export default PDFWriter;
