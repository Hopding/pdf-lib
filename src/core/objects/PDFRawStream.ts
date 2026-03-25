import PDFDict from './PDFDict';
import PDFStream from './PDFStream';
import PDFContext from '../PDFContext';
import { arrayAsString } from '../../utils';
import { CipherTransform } from '../crypto';
import { PDFClasses } from '../../api/objects';

class PDFRawStream extends PDFStream {
  static className = () => PDFClasses.PDFRawStream;
  myClass(): PDFClasses {
    return PDFClasses.PDFRawStream;
  }
  static of = (
    dict: PDFDict,
    contents: Uint8Array,
    transform?: CipherTransform,
  ) => new PDFRawStream(dict, contents, transform);

  contents: Uint8Array;
  readonly transform?: CipherTransform;

  private constructor(
    dict: PDFDict,
    contents: Uint8Array,
    transform?: CipherTransform,
  ) {
    super(dict);
    this.contents = contents;
    this.transform = transform;
  }

  asUint8Array(): Uint8Array {
    return this.contents.slice();
  }

  clone(context?: PDFContext): PDFRawStream {
    return PDFRawStream.of(this.dict.clone(context), this.contents.slice());
  }

  getContentsString(): string {
    return arrayAsString(this.contents);
  }

  getContents(): Uint8Array {
    return this.contents;
  }

  getContentsSize(): number {
    return this.contents.length;
  }

  updateContents(contents: Uint8Array): void {
    this.dict.registerChange();
    this.contents = contents;
  }
}

export default PDFRawStream;
