import { PDFHexString } from '../../../src/core';
import { toCharCode, typedArrayFor } from '../../../src/utils';

describe(`PDFHexString`, () => {
  it(`can be constructed from PDFHexString.of(...)`, () => {
    expect(PDFHexString.of('4E6F762073686D6F7A2')).toBeInstanceOf(PDFHexString);
    expect(PDFHexString.of('901FA3')).toBeInstanceOf(PDFHexString);
    expect(PDFHexString.of('901FA')).toBeInstanceOf(PDFHexString);
  });

  it(`can be constructed from a string of text (using UTF-16BE encoding)`, () => {
    expect(String(PDFHexString.fromText(''))).toBe('<FEFF>');
    expect(String(PDFHexString.fromText('ä☺𠜎️☁️💩'))).toBe(
      '<FEFF00E4263AD841DF0EFE0F2601FE0FD83DDCA9>',
    );
    expect(String(PDFHexString.fromText('stuff 💩 and 🎂things'))).toBe(
      '<FEFF007300740075006600660020D83DDCA900200061006E00640020D83CDF82007400680069006E00670073>',
    );
  });

  describe(`converting to bytes`, () => {
    it(`can handle an even number of hex digits`, () => {
      const hex = 'FEFF0045006700670020D83CDF73';

      // prettier-ignore
      expect(PDFHexString.of(hex).asBytes()).toEqual(Uint8Array.of(
        0xFE, 0xFF, 
        0x00, 0x45, 
        0x00, 0x67, 
        0x00, 0x67, 
        0x00, 0x20, 
        0xD8, 0x3C, 
        0xDF, 0x73,
      ));
    });

    it(`can handle an odd number of hex digits`, () => {
      const hex = '6145627300623';

      // prettier-ignore
      expect(PDFHexString.of(hex).asBytes()).toEqual(Uint8Array.of(
        0x61, 0x45, 
        0x62, 0x73, 
        0x00, 0x62, 
        0x30,
      ));
    });
  });

  describe(`decoding to string`, () => {
    it(`can interpret UTF-16BE strings`, () => {
      const hex = 'FEFF0045006700670020D83CDF73';
      expect(PDFHexString.of(hex).decodeText()).toBe('Egg 🍳');
    });

    it(`can interpret UTF-16LE strings`, () => {
      const hex = 'FFFE45006700670020003CD873DF';
      expect(PDFHexString.of(hex).decodeText()).toBe('Egg 🍳');
    });

    it(`can interpret PDFDocEncoded strings`, () => {
      const hex = '61456273006236';
      expect(PDFHexString.of(hex).decodeText()).toBe('aEbs\0b6');
    });
  });

  describe(`decoding to date`, () => {
    it(`can interpret date strings of the form D:YYYYMMDDHHmmSSOHH'mm`, () => {
      expect(
        PDFHexString.fromText(`D:20200321165011+01'01`).decodeDate(),
      ).toStrictEqual(new Date('2020-03-21T15:49:11Z'));
      expect(
        PDFHexString.fromText(`D:20200321165011-01'01`).decodeDate(),
      ).toStrictEqual(new Date('2020-03-21T17:51:11Z'));
      expect(
        PDFHexString.fromText(`D:20200321165011Z00'00`).decodeDate(),
      ).toStrictEqual(new Date('2020-03-21T16:50:11Z'));
    });

    it(`can interpret date strings of the form D:YYYYMMDDHHmmSSOHH`, () => {
      expect(
        PDFHexString.fromText('D:20200321165011+01').decodeDate(),
      ).toStrictEqual(new Date('2020-03-21T15:50:11Z'));
      expect(
        PDFHexString.fromText('D:20200321165011-01').decodeDate(),
      ).toStrictEqual(new Date('2020-03-21T17:50:11Z'));
      expect(
        PDFHexString.fromText('D:20200321165011Z00').decodeDate(),
      ).toStrictEqual(new Date('2020-03-21T16:50:11Z'));
    });

    it(`can interpret date strings of the form D:YYYYMMDDHHmmSSO`, () => {
      expect(
        PDFHexString.fromText('D:20200321165011Z').decodeDate(),
      ).toStrictEqual(new Date('2020-03-21T16:50:11Z'));
    });

    it(`can interpret date strings of the form D:YYYYMMDDHHmmSS`, () => {
      expect(
        PDFHexString.fromText('D:20200321165011').decodeDate(),
      ).toStrictEqual(new Date('2020-03-21T16:50:11Z'));
    });

    it(`can interpret date strings of the form D:YYYYMMDDHHmm`, () => {
      expect(
        PDFHexString.fromText('D:202003211650').decodeDate(),
      ).toStrictEqual(new Date('2020-03-21T16:50:00Z'));
    });

    it(`can interpret date strings of the form D:YYYYMMDDHH`, () => {
      expect(PDFHexString.fromText('D:2020032116').decodeDate()).toStrictEqual(
        new Date('2020-03-21T16:00:00Z'),
      );
    });

    it(`can interpret date strings of the form D:YYYYMMDD`, () => {
      expect(PDFHexString.fromText('D:20200321').decodeDate()).toStrictEqual(
        new Date('2020-03-21T00:00:00Z'),
      );
    });

    it(`can interpret date strings of the form D:YYYYMM`, () => {
      expect(PDFHexString.fromText('D:202003').decodeDate()).toStrictEqual(
        new Date('2020-03-01T00:00:00Z'),
      );
    });

    it(`can interpret date strings of the form D:YYYY`, () => {
      expect(PDFHexString.fromText('D:2020').decodeDate()).toStrictEqual(
        new Date('2020-01-01T00:00:00Z'),
      );
    });
  });

  it(`can be converted to a string`, () => {
    expect(PDFHexString.of('901FA').asString()).toBe('901FA');
    expect(PDFHexString.fromText('stuff 💩 and 🎂things').asString()).toBe(
      'FEFF007300740075006600660020D83DDCA900200061006E00640020D83CDF82007400680069006E00670073',
    );
  });

  it(`can be cloned`, () => {
    const original = PDFHexString.of('901FA');
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.toString()).toBe(original.toString());
  });

  it(`can be converted to a string`, () => {
    expect(String(PDFHexString.of('4E6F762073686D6F7A2'))).toBe(
      '<4E6F762073686D6F7A2>',
    );
    expect(String(PDFHexString.of('901FA3'))).toBe('<901FA3>');
    expect(String(PDFHexString.of('901FA'))).toBe('<901FA>');
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFHexString.of('4E6F762073686D6F7A2').sizeInBytes()).toBe(21);
    expect(PDFHexString.of('901FA3').sizeInBytes()).toBe(8);
    expect(PDFHexString.of('901FA').sizeInBytes()).toBe(7);
  });

  it(`can be serialized`, () => {
    const buffer = new Uint8Array(11).fill(toCharCode(' '));
    expect(PDFHexString.of('901FA').copyBytesInto(buffer, 3)).toBe(7);
    expect(buffer).toEqual(typedArrayFor('   <901FA> '));
  });
});
