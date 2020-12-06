import PDFString from 'src/core/objects/PDFString';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFContext from 'src/core/PDFContext';
import PDFRef from 'src/core/objects/PDFRef';

/**
 * From the PDF-A3 specification, section **3.1. Requirements - General**.
 * See:
 * * https://www.pdfa.org/wp-content/uploads/2018/10/PDF20_AN002-AF.pdf
 */
export enum AFRelationship {
  Source = 'Source',
  Data = 'Data',
  Alternative = 'Alternative',
  Supplement = 'Supplement',
  EncryptedPayload = 'EncryptedPayload',
  FormData = 'EncryptedPayload',
  Schema = 'Schema',
  Unspecified = 'Unspecified',
}

export interface EmbeddedFileOptions {
  mimeType?: string;
  description?: string;
  creationDate?: Date;
  modificationDate?: Date;
  afRelationship?: AFRelationship;
}

class FileEmbedder {
  static for(
    bytes: Uint8Array,
    fileName: string,
    options: EmbeddedFileOptions = {},
  ) {
    return new FileEmbedder(bytes, fileName, options);
  }

  private readonly fileData: Uint8Array;
  readonly fileName: string;
  readonly options: EmbeddedFileOptions;

  private constructor(
    fileData: Uint8Array,
    fileName: string,
    options: EmbeddedFileOptions = {},
  ) {
    this.fileData = fileData;
    this.fileName = fileName;
    this.options = options;
  }

  async embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef> {
    const {
      mimeType,
      description,
      creationDate,
      modificationDate,
      afRelationship,
    } = this.options;

    const embeddedFileStream = context.flateStream(this.fileData, {
      Type: 'EmbeddedFile',
      Subtype: mimeType ?? undefined,
      Params: {
        Size: this.fileData.length,
        CreationDate: creationDate
          ? PDFString.fromDate(creationDate)
          : undefined,
        ModDate: modificationDate
          ? PDFString.fromDate(modificationDate)
          : undefined,
      },
    });
    const embeddedFileStreamRef = context.register(embeddedFileStream);

    const fileSpecDict = context.obj({
      Type: 'Filespec',
      F: PDFString.of(this.fileName), // TODO: Assert that this is plain ASCII
      UF: PDFHexString.fromText(this.fileName),
      EF: { F: embeddedFileStreamRef },
      Desc: description ? PDFHexString.fromText(description) : undefined,
      AFRelationship: afRelationship ?? undefined,
    });

    if (ref) {
      context.assign(ref, fileSpecDict);
      return ref;
    } else {
      return context.register(fileSpecDict);
    }
  }
}

export default FileEmbedder;
