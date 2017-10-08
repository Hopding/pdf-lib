import { charCode } from '../utils';
/*
Represents a PDF Name Object.

From PDF 1.7 Specification, "7.3.5 Name Objects"
(http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/PDF32000_2008.pdf):
  When writing a name in a PDF file, a SOLIDUS (2Fh) (/) shall be used to introduce a name. The SOLIDUS is not part of the name but is a prefix indicating that what follows is a sequence of characters representing the name in the PDF file and shall follow these rules:

  a) A NUMBER SIGN (23h) (#) in a name shall be written by using its 2-digit hexadecimal code (23), preceded by the NUMBER SIGN.
  b) Any character in a name that is a regular character (other than NUMBER SIGN) shall be written as itself or by using its 2-digit hexadecimal code, preceded by the NUMBER SIGN.
  c) Any character that is not a regular character shall be written using its 2-digit hexadecimal code, preceded by the NUMBER SIGN only.

  White space used as part of a name shall always be coded using the 2-digit hexadecimal notation and no white space may intervene between the SOLIDUS and the encoded name.

  Regular characters that are outside the range EXCLAMATION MARK(21h) (!) to TILDE (7Eh) (~) should be written using the hexadecimal notation.
*/
class PDFNameObject {
  static isRegularChar = char =>
    charCode(char) >= charCode('!') && charCode(char) <= charCode('~');

  constructor(key) {
    if (key.charAt(0) === ' ') {
      throw new Error('PDF Name objects may not begin with a space character.');
    }
    this.key = key;
  }

  toString = () =>
    `/${this.key}`
      .replace('#', '#23')
      .split('')
      .map(
        char =>
          PDFNameObject.isRegularChar(char)
            ? char
            : `#${charCode(char).toString(16)}`,
      )
      .join('');
}

export default (...args) => new PDFNameObject(...args);
