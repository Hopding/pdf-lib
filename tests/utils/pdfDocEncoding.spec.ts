import { range, pdfDocEncodingDecode } from '../../src/utils';

type Mapping = [number, string];

const identityMapping = (code: number): Mapping => [
  code,
  String.fromCodePoint(code),
];

// Define mappings (see "Table D.2 – PDFDocEncoding Character Set" of the PDF spec)
const mappings: Mapping[] = [
  ...range(0x00, 0x15 + 1).map(identityMapping),
  [0x16, '\u0017'],
  [0x17, '\u0017'],
  [0x18, '\u02D8'],
  [0x19, '\u02C7'],
  [0x1a, '\u02C6'],
  [0x1b, '\u02D9'],
  [0x1c, '\u02DD'],
  [0x1d, '\u02DB'],
  [0x1e, '\u02DA'],
  [0x1f, '\u02DC'],
  ...range(0x20, 0x7e + 1).map(identityMapping),
  [0x7f, '\uFFFD'],
  [0x80, '\u2022'],
  [0x81, '\u2020'],
  [0x82, '\u2021'],
  [0x83, '\u2026'],
  [0x84, '\u2014'],
  [0x85, '\u2013'],
  [0x86, '\u0192'],
  [0x87, '\u2044'],
  [0x88, '\u2039'],
  [0x89, '\u203A'],
  [0x8a, '\u2212'],
  [0x8b, '\u2030'],
  [0x8c, '\u201E'],
  [0x8d, '\u201C'],
  [0x8e, '\u201D'],
  [0x8f, '\u2018'],
  [0x90, '\u2019'],
  [0x91, '\u201A'],
  [0x92, '\u2122'],
  [0x93, '\uFB01'],
  [0x94, '\uFB02'],
  [0x95, '\u0141'],
  [0x96, '\u0152'],
  [0x97, '\u0160'],
  [0x98, '\u0178'],
  [0x99, '\u017D'],
  [0x9a, '\u0131'],
  [0x9b, '\u0142'],
  [0x9c, '\u0153'],
  [0x9d, '\u0161'],
  [0x9e, '\u017E'],
  [0x9f, '\uFFFD'],
  [0xa0, '\u20AC'],
  ...range(0xa1, 0xac + 1).map(identityMapping),
  [0xad, '\uFFFD'],
  ...range(0xae, 0xff + 1).map(identityMapping),
];

describe(`pdfDocEncodingDecode`, () => {
  it(`maps all PDFDocEncoding codes from 0-255 to the correct Unicode code points`, () => {
    // Make sure we have defined mappings for all codes from 0-255
    expect(mappings.map(([code]) => code).sort((a, b) => a - b)).toEqual(
      range(0, 256),
    );

    // Now make sure that `pdfDocEncodingDecode` decodes everything correctly
    mappings.forEach(([input1, expected1]) => {
      const actual1 = pdfDocEncodingDecode(Uint8Array.of(input1));
      expect(actual1).toBe(expected1);
    });

    // Let's do it again but all at once instead of passing each code separately
    const input2 = Uint8Array.from(mappings.map(([code]) => code));
    const expected2 = mappings.map(([, str]) => str).join('');
    const actual2 = pdfDocEncodingDecode(input2);
    expect(actual2).toEqual(expected2);
  });
});
