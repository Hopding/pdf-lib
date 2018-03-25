import { addStringToBuffer } from 'utils';
import { isInstance, validate } from 'utils/validate';

import { PDFDictionary, PDFStream } from '.';

class PDFRawStream extends PDFStream {
  static from = (dictionary: PDFDictionary, content: Uint8Array) =>
    new PDFRawStream(dictionary, content);

  content: Uint8Array;

  constructor(dictionary: PDFDictionary, content: Uint8Array) {
    super(dictionary);
    validate(
      content,
      isInstance(Uint8Array),
      'PDFRawStream.content must be a Uint8Array',
    );
    this.content = content;
  }

  bytesSize = () =>
    this.dictionary.bytesSize() +
    1 + // "\n"
    7 + // "stream\n"
    this.content.length +
    10; // "\nendstream"

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    this.validateDictionary();
    let remaining = this.dictionary.copyBytesInto(buffer);
    remaining = addStringToBuffer('\nstream\n', remaining);

    remaining.set(this.content, 0);
    remaining = remaining.subarray(this.content.length);

    remaining = addStringToBuffer('\nendstream', remaining);
    return remaining;
  };
}

export default PDFRawStream;
