import PDFStream from 'src/core/objects/PDFStream';
import { PDFDict } from '..';

class PDFRawStream extends PDFStream {
  static of = (dict: PDFDict, contents: Uint8Array) =>
    new PDFRawStream(dict, contents);

  private readonly contents: Uint8Array;

  private constructor(dict: PDFDict, contents: Uint8Array) {
    super(dict);
    this.contents = contents;
  }

  clone(): PDFRawStream {
    return PDFRawStream.of(this.dict.clone(), this.contents.slice());
  }

  getContentsString(): string {
    return `<${this.contents.length} bytes>`;
  }

  getContents(): Uint8Array {
    return this.contents;
  }

  getContentsSize(): number {
    return this.contents.length;
  }
}

export default PDFRawStream;
