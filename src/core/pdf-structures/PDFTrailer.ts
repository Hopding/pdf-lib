import _ from 'lodash';
import { addStringToBuffer } from 'utils';
import { isInstance, validate } from 'utils/validate';

import PDFDictionary from '../pdf-objects/PDFDictionary';

class PDFTrailer {
  public static from = (offset: number, dictionary: PDFDictionary) =>
    new PDFTrailer(offset, dictionary);

  public offset: number;
  public dictionary: PDFDictionary;

  constructor(offset: number, dictionary: PDFDictionary) {
    validate(offset, _.isNumber, 'PDFTrailer offsets can only be Numbers');
    validate(
      dictionary,
      isInstance(PDFDictionary),
      'PDFTrailer dictionaries can only be PDFDictionaries',
    );

    this.offset = offset;
    this.dictionary = dictionary;
  }

  public toString = (): string =>
    `trailer\n` +
    `${this.dictionary.toString()}\n` +
    `startxref\n` +
    `${this.offset}\n` +
    `%%EOF\n`;

  public bytesSize = () =>
    8 + // "trailer\n"
    this.dictionary.bytesSize() +
    1 + // "\n"
    10 + // "startxref\n"
    String(this.offset).length +
    1 + // "\n"
    5; // "%%EOF\n"

  public copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer('trailer\n', buffer);
    remaining = this.dictionary.copyBytesInto(remaining);
    remaining = addStringToBuffer(
      `\nstartxref\n${this.offset}\n%%EOF\n`,
      remaining,
    );
    return remaining;
  };
}

export default PDFTrailer;
