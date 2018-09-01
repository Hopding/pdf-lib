// Required to prevent import error in this test
import PDFStandardFontFactory from 'core/pdf-structures/factories/PDFStandardFontFactory';

const toHexString = function(...args) {
  return `<${args.map((charCode) => charCode.toString(16)).join('')}>`;
};

describe(`PDFStandardFontFactory`, () => {
  it(`PDFStandardFontFactory is a constructor and instance looks ok`, () => {
    expect(typeof PDFStandardFontFactory).toEqual('function');
    const myFont = new PDFStandardFontFactory('Helvetica');
    expect(myFont.fontName).toEqual('Helvetica');
  });
  it(`PDFStandardFontFactory encodes texts using WinAnsiEncoding`, () => {
    const myFont = new PDFStandardFontFactory('Helvetica');
    expect(typeof myFont.encodeText).toEqual('function');
    const encodedE = myFont.encodeText('e');
    expect(encodedE.toString()).toEqual(toHexString(101));
    // € charCode converted to Ansi = 128 (hex)
    const encodedEuro = myFont.encodeText('€');
    expect(encodedEuro.toString()).toEqual(toHexString(128));
    const encodedMore = myFont.encodeText('e€');
    expect(encodedMore.toString()).toEqual(toHexString(101, 128));
  });
});
