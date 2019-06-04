import PDFHeader from 'src/core/document/PDFHeader';
import PDFTrailer from 'src/core/document/PDFTrailer';
import PDFRef from 'src/core/objects/PDFRef';
import PDFStream from 'src/core/objects/PDFStream';
import PDFContext from 'src/core/PDFContext';
import PDFCrossRefStream from 'src/core/structures/PDFCrossRefStream';
import PDFObjectStream from 'src/core/structures/PDFObjectStream';
import CharCodes from 'src/core/syntax/CharCodes';
import { copyStringIntoBuffer } from 'src/utils';

class PDFStreamWriter {
  static serializeContextToBuffer(context: PDFContext): Uint8Array {
    const {
      size,
      header,
      indirectObjects,
      trailer,
    } = PDFStreamWriter.computeBufferSize(context);

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

    offset += trailer.copyBytesInto(buffer, offset);

    return buffer;
  }

  private static computeBufferSize(context: PDFContext) {
    const objectStreamRef = PDFRef.of(context.largestObjectNumber + 1);
    const xrefStreamRef = PDFRef.of(context.largestObjectNumber + 2);

    const header = PDFHeader.forVersion(1, 7);

    let size = header.sizeInBytes() + 2;

    const xrefStream = PDFCrossRefStream.create(
      context.obj({
        Size: context.largestObjectNumber + 3,
        Root: context.trailerInfo.Root,
        Encrypt: context.trailerInfo.Encrypt,
        Info: context.trailerInfo.Info,
        ID: context.trailerInfo.ID,
      }),
    );

    const streams = [];
    const nonStreams = [];

    const indirectObjects = context.enumerateIndirectObjects();
    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      const indirectObject = indirectObjects[idx];
      const [ref, object] = indirectObject;

      if (object instanceof PDFStream) {
        streams.push(indirectObject);

        xrefStream.addUncompressedEntry(ref, size);

        const refSize = ref.sizeInBytes() + 3; // 'R' -> 'obj\n'
        const objectSize = object.sizeInBytes() + 9; // '\nendobj\n\n'

        size += refSize + objectSize;
      } else {
        nonStreams.push(indirectObject);
        xrefStream.addCompressedEntry(ref, objectStreamRef, nonStreams.length);
      }
    }

    const objectStream = PDFObjectStream.withContextAndObjects(
      context,
      nonStreams,
    );

    xrefStream.addUncompressedEntry(objectStreamRef, size);
    size += objectStreamRef.sizeInBytes() + 3 + objectStream.sizeInBytes() + 9;

    xrefStream.addUncompressedEntry(xrefStreamRef, size);
    const xrefOffset = size;
    size += xrefStreamRef.sizeInBytes() + 3 + xrefStream.sizeInBytes() + 9;

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
