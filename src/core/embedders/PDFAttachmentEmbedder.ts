import { PDFName, PDFString, PDFHexString, PDFContext } from 'src/core';

class PDFAttachmentEmbedder {
  static for(bytes: Uint8Array, fileName: string, mime: string) {
    return new PDFAttachmentEmbedder(bytes, fileName, mime);
  }

  private readonly fileData: Uint8Array;
  readonly fileName: string;
  readonly mime: string;

  private constructor(fileData: Uint8Array, fileName: string, mime: string) {
    this.fileData = fileData;
    this.fileName = fileName;
    this.mime = mime;
  }

  async embedIntoContext(context: PDFContext) {
    const embeddedFileStream = context.flateStream(this.fileData, {
      Type: 'EmbeddedFile',
      Subtype: PDFName.of(this.mime),
    });
    const embeddedFileStreamRef = context.register(embeddedFileStream);

    const fileSpecDict = context.obj({
      Type: 'Filespec',
      F: PDFString.of(this.fileName),
      UF: PDFHexString.fromText(this.fileName),
      EF: { F: embeddedFileStreamRef },
    });
    return context.register(fileSpecDict);
  }
}

export default PDFAttachmentEmbedder;
