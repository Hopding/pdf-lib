import { PDFName, PDFString, PDFHexString, PDFContext } from 'src/core';
import PDFNumber from '../objects/PDFNumber';
import PDFRef from '../objects/PDFRef';
import { AttachmentOptions } from 'src/api/PDFDocumentOptions';

class PDFAttachmentEmbedder {
  static for(bytes: Uint8Array, fileName: string, options: AttachmentOptions) {
    return new PDFAttachmentEmbedder(bytes, fileName, options);
  }

  private readonly fileData: Uint8Array;
  readonly fileName: string;
  readonly options: AttachmentOptions;

  private constructor(
    fileData: Uint8Array,
    fileName: string,
    options: AttachmentOptions,
  ) {
    this.fileData = fileData;
    this.fileName = fileName;
    this.options = options;
  }

  async embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef> {
    const embeddedFileStream = context.flateStream(this.fileData, {
      Type: 'EmbeddedFile',
      Subtype: PDFName.of(this.options.mimeType),
      Params: {
        Size: PDFNumber.of(this.options.size ?? this.fileData.length),
        CreationDate: PDFString.fromDate(
          this.options.creationDate ?? new Date(),
        ),
        ModDate: PDFString.fromDate(
          this.options.modificationDate ?? new Date(),
        ),
        CheckSum: PDFString.of(this.options.checkSum ?? ''),
      },
    });
    const embeddedFileStreamRef = context.register(embeddedFileStream);

    const fileSpecDict = context.obj({
      Type: 'Filespec',
      F: PDFString.of(this.fileName),
      UF: PDFHexString.fromText(this.fileName),
      EF: { F: embeddedFileStreamRef },
      Desc: PDFString.of(this.options.description ?? ''),
    });

    if (ref) {
      context.assign(ref, fileSpecDict);
      return ref;
    } else {
      return context.register(fileSpecDict);
    }
  }
}

export default PDFAttachmentEmbedder;
