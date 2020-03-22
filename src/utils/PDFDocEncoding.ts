/**
 * Class used to support the PDFDocEncoding.
 */
export class PDFDocEncoding {
  static singleton: PDFDocEncoding = new PDFDocEncoding();

  /**
   * Decodes a byte array to string using the PDFDocEncoding.
   *
   * @param input a byte array (decimal representation) containing the PDFDocEncoding of the input string
   */
  static decode(input: number[]): string {
    return String.fromCodePoint(
      ...input.map(
        (pdfDocCodePoint) =>
          this.singleton.PDFDocEncodingCodepointToUnicodeCodepoint[
            pdfDocCodePoint
          ],
      ),
    );
  }

  private readonly PDFDocEncodingCodepointToUnicodeCodepoint: number[];

  private constructor() {
    // Map from pdfdocencoding code point to unicode code point (one way since only this is needed atm)
    this.PDFDocEncodingCodepointToUnicodeCodepoint = [];

    // initialize the code points which are the same
    let i;
    for (i = 0; i < 256; i++) {
      // skip differences.
      if (i > 0x17 && i < 0x20) {
        continue;
      }
      if (i > 0x7e && i < 0xa1) {
        continue;
      }
      if (i === 0xad) {
        continue;
      }
      this.PDFDocEncodingCodepointToUnicodeCodepoint[i] = i;
    }
    const replacementChar = '\uFFFD'; // box with questionmark

    // set differences see Annex D --> D.3 --> Table D.2
    // block 1
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x18] = '\u02D8'.charCodeAt(
      0,
    ); // BREVE
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x19] = '\u02C7'.charCodeAt(
      0,
    ); // CARON
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x1a] = '\u02C6'.charCodeAt(
      0,
    ); // MODIFIER LETTER CIRCUMFLEX ACCENT
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x1b] = '\u02D9'.charCodeAt(
      0,
    ); // DOT ABOVE
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x1c] = '\u02DD'.charCodeAt(
      0,
    ); // DOUBLE ACUTE ACCENT
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x1d] = '\u02DB'.charCodeAt(
      0,
    ); // OGONEK
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x1e] = '\u02DA'.charCodeAt(
      0,
    ); // RING ABOVE
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x1f] = '\u02DC'.charCodeAt(
      0,
    ); // SMALL TILDE
    // block 2
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x7f] = replacementChar.charCodeAt(
      0,
    ); // undefined
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x80] = '\u2022'.charCodeAt(
      0,
    ); // BULLET
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x81] = '\u2020'.charCodeAt(
      0,
    ); // DAGGER
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x82] = '\u2021'.charCodeAt(
      0,
    ); // DOUBLE DAGGER
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x83] = '\u2026'.charCodeAt(
      0,
    ); // HORIZONTAL ELLIPSIS
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x84] = '\u2014'.charCodeAt(
      0,
    ); // EM DASH
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x85] = '\u2013'.charCodeAt(
      0,
    ); // EN DASH
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x86] = '\u0192'.charCodeAt(
      0,
    ); // LATIN SMALL LETTER SCRIPT F
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x87] = '\u2044'.charCodeAt(
      0,
    ); // FRACTION SLASH (solidus)
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x88] = '\u2039'.charCodeAt(
      0,
    ); // SINGLE LEFT-POINTING ANGLE QUOTATION MARK
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x89] = '\u203A'.charCodeAt(
      0,
    ); // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x8a] = '\u2212'.charCodeAt(
      0,
    ); // MINUS SIGN
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x8b] = '\u2030'.charCodeAt(
      0,
    ); // PER MILLE SIGN
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x8c] = '\u201E'.charCodeAt(
      0,
    ); // DOUBLE LOW-9 QUOTATION MARK (quotedblbase)
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x8d] = '\u201C'.charCodeAt(
      0,
    ); // LEFT DOUBLE QUOTATION MARK (quotedblleft)
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x8e] = '\u201D'.charCodeAt(
      0,
    ); // RIGHT DOUBLE QUOTATION MARK (quotedblright)
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x8f] = '\u2018'.charCodeAt(
      0,
    ); // LEFT SINGLE QUOTATION MARK (quoteleft)
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x90] = '\u2019'.charCodeAt(
      0,
    ); // RIGHT SINGLE QUOTATION MARK (quoteright)
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x91] = '\u201A'.charCodeAt(
      0,
    ); // SINGLE LOW-9 QUOTATION MARK (quotesinglbase)
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x92] = '\u2122'.charCodeAt(
      0,
    ); // TRADE MARK SIGN
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x93] = '\uFB01'.charCodeAt(
      0,
    ); // LATIN SMALL LIGATURE FI
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x94] = '\uFB02'.charCodeAt(
      0,
    ); // LATIN SMALL LIGATURE FL
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x95] = '\u0141'.charCodeAt(
      0,
    ); // LATIN CAPITAL LETTER L WITH STROKE
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x96] = '\u0152'.charCodeAt(
      0,
    ); // LATIN CAPITAL LIGATURE OE
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x97] = '\u0160'.charCodeAt(
      0,
    ); // LATIN CAPITAL LETTER S WITH CARON
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x98] = '\u0178'.charCodeAt(
      0,
    ); // LATIN CAPITAL LETTER Y WITH DIAERESIS
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x99] = '\u017D'.charCodeAt(
      0,
    ); // LATIN CAPITAL LETTER Z WITH CARON
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x9a] = '\u0131'.charCodeAt(
      0,
    ); // LATIN SMALL LETTER DOTLESS I
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x9b] = '\u0142'.charCodeAt(
      0,
    ); // LATIN SMALL LETTER L WITH STROKE
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x9c] = '\u0153'.charCodeAt(
      0,
    ); // LATIN SMALL LIGATURE OE
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x9d] = '\u0161'.charCodeAt(
      0,
    ); // LATIN SMALL LETTER S WITH CARON
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x9e] = '\u017E'.charCodeAt(
      0,
    ); // LATIN SMALL LETTER Z WITH CARON
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0x9f] = replacementChar.charCodeAt(
      0,
    ); // undefined
    this.PDFDocEncodingCodepointToUnicodeCodepoint[0xa0] = '\u20AC'.charCodeAt(
      0,
    ); // EURO SIGN
  }
}
