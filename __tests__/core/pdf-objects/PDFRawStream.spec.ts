import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFDictionary,
  PDFNumber,
  PDFRawStream,
  PDFStream,
} from 'core/pdf-objects';
import { arrayToString, typedArrayFor } from 'utils';

describe(`PDFRawStream`, () => {
  it(`requires a PDFDictionary and a Uint8Array to be constructed`, () => {
    expect(() => new PDFRawStream()).toThrowError();
    expect(() => new PDFRawStream('foo')).toThrowError(
      'PDFStream.dictionary must be of type PDFDictionary',
    );
    expect(
      () => new PDFRawStream(PDFDictionary.from({}, PDFObjectIndex.create())),
    ).toThrowError('PDFRawStream.content must be a Uint8Array');
    expect(
      new PDFRawStream(
        PDFDictionary.from({}, PDFObjectIndex.create()),
        new Uint8Array(),
      ),
    ).toBeInstanceOf(PDFRawStream);
  });

  it(`has a static "from" factory method`, () => {
    expect(() => PDFRawStream.from()).toThrowError();
    expect(() => PDFRawStream.from('foo')).toThrowError(
      'PDFStream.dictionary must be of type PDFDictionary',
    );
    expect(() =>
      PDFRawStream.from(PDFDictionary.from({}, PDFObjectIndex.create())),
    ).toThrowError('PDFRawStream.content must be a Uint8Array');
    expect(
      PDFRawStream.from(
        PDFDictionary.from({}, PDFObjectIndex.create()),
        new Uint8Array(),
      ),
    ).toBeInstanceOf(PDFRawStream);
  });

  it(`extends the PDFStream class`, () => {
    expect(
      PDFRawStream.from(
        PDFDictionary.from({}, PDFObjectIndex.create()),
        new Uint8Array(),
      ),
    ).toBeInstanceOf(PDFStream);
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFRawStream in bytes`, () => {
      const pdfRawStream = PDFRawStream.from(
        PDFDictionary.from(
          { Length: PDFNumber.fromNumber(10) },
          PDFObjectIndex.create(),
        ),
        typedArrayFor('cm 0 1 2 3'),
      );
      expect(pdfRawStream.bytesSize()).toEqual(44);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFRawStream into the buffer as bytes`, () => {
      const pdfRawStream = PDFRawStream.from(
        PDFDictionary.from(
          { Length: PDFNumber.fromNumber(10) },
          PDFObjectIndex.create(),
        ),
        typedArrayFor('cm 0 1 2 3'),
      );
      const buffer = new Uint8Array(pdfRawStream.bytesSize());
      pdfRawStream.copyBytesInto(buffer);
      expect(buffer).toEqual(
        typedArrayFor(
          '<<\n' +
            '/Length 10\n' +
            '>>\n' +
            'stream\n' +
            'cm 0 1 2 3\n' +
            'endstream',
        ),
      );
    });
  });
});
