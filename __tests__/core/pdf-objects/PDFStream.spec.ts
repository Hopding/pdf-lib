import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFDictionary,
  PDFNumber,
  PDFObject,
  PDFStream,
} from 'core/pdf-objects';
import { arrayToString, typedArrayFor } from 'utils';

describe(`PDFStream`, () => {
  it(`requires a PDFDictionary to be constructed`, () => {
    expect(() => new PDFStream()).toThrowError();
    expect(() => new PDFStream('foo')).toThrowError(
      'PDFStream.dictionary must be of type PDFDictionary',
    );
    expect(
      new PDFStream(PDFDictionary.from({}, PDFObjectIndex.create())),
    ).toBeInstanceOf(PDFStream);
  });

  it(`extends the PDFObject class`, () => {
    expect(
      new PDFStream(PDFDictionary.from({}, PDFObjectIndex.create())),
    ).toBeInstanceOf(PDFObject);
  });

  describe(`"validateDictionary" method`, () => {
    it(`throws an error if PDFStream's PDFDictionary contains no "Length" entry`, () => {
      const pdfStream = new PDFStream(
        PDFDictionary.from({}, PDFObjectIndex.create()),
      );
      expect(() => pdfStream.validateDictionary()).toThrowError(
        '"Length" is a required field for PDFStream dictionaries',
      );
    });
  });
});
