import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFIndirectObject,
  PDFName,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';
import { typedArrayFor } from 'utils';

describe(`PDFName`, () => {
  it(`does not allow its constructor to be called`, () => {
    expect(() => new PDFName()).toThrowError(
      'Cannot create PDFName via constructor. Use PDFName.from instead.',
    );
  });

  describe(`static "from" factory method`, () => {
    it(`requires a String as its argument`, () => {
      expect(() => PDFName.from(0)).toThrowError(
        'PDFName.from() requires string as argument',
      );
    });

    it(`it rejects Strings with a leading space or forward slash`, () => {
      expect(() => PDFName.from(' Bar')).toThrowError(
        'PDFName objects may not begin with a space or slash character.',
      );
      expect(() => PDFName.from('/Bar')).toThrowError(
        'PDFName objects may not begin with a space or slash character.',
      );
    });

    it(`returns a PDFName object`, () => {
      expect(PDFName.from('Foo_Bar')).toBeInstanceOf(PDFName);
    });

    it(`creates a singleton for each String`, () => {
      const fooName = PDFName.from('Foo');
      const barName = PDFName.from('Bar');

      expect(fooName).toBe(PDFName.from('Foo'));
      expect(barName).toBe(PDFName.from('Bar'));

      expect(fooName).not.toBe(barName);
    });
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFName as a string`, () => {
      const pdfName = PDFName.from('Foo');
      expect(pdfName.toString()).toEqual('/Foo');
    });

    it(`replaces "#" characters with "#23"`, () => {
      const pdfName = PDFName.from('#Bar');
      expect(pdfName.toString()).toEqual('/#23Bar');
    });

    it(`replaces characters outside the range "!" to "~" with their hexadecimal character codes`, () => {
      const pdfName = PDFName.from('Bar√ß');
      expect(pdfName.toString()).toEqual('/Bar#221a#df');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFName in bytes`, () => {
      const pdfName = PDFName.from('Foo');
      expect(pdfName.bytesSize()).toEqual(4);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFName into the buffer as bytes`, () => {
      const pdfName = PDFName.from('Foo');
      const buffer = new Uint8Array(pdfName.bytesSize());
      pdfName.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('/Foo'));
    });
  });
});
