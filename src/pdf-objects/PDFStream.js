/* @flow */
import { PDFObject, PDFDictionary } from '.';
import { addStringToBuffer } from '../utils';
import { validate, isInstance } from '../utils/validate';

class PDFStream extends PDFObject {
  dictionary: PDFDictionary;
  content: Uint8Array | string;
  encoded: boolean;
  locked: boolean = false;

  constructor(
    dictionary: PDFDictionary = new PDFDictionary(),
    content?: Uint8Array,
    encoded?: boolean,
  ) {
    super();
    validate(
      dictionary,
      isInstance(PDFDictionary),
      'PDFStream.dictionary must be of type PDFDictionary',
    );

    if (content) this.locked = true;

    this.dictionary = dictionary;
    this.content = content || '';
    this.encoded = encoded || false;
  }

  static from = (dictionary: PDFDictionary, content: Uint8Array) =>
    new PDFStream(dictionary, content, true);

  bytesSize = () =>
    this.dictionary.bytesSize() + 1 + 7 + this.content.length + 10;

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = this.dictionary.copyBytesInto(buffer);
    remaining = addStringToBuffer('\nstream\n', remaining);
    if (typeof this.content === 'string') {
      remaining = addStringToBuffer(this.content, remaining);
    } else {
      remaining.set(this.content, 0);
      remaining = remaining.subarray(this.content.length);
    }
    remaining = addStringToBuffer('\nendstream', remaining);
    return remaining;
  };
}

export default PDFStream;
