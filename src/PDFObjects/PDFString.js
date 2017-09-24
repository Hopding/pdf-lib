/*
Creates a valid PDF String Object.

From PDF 1.7 Specification, "7.3.4 String Objects"
(http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/PDF32000_2008.pdf):
  A string object shall consist of a series of zero or more bytes. String objects are not integer objects, but are stored in a more compact format. The length of a string may be subject to implementation limits; see Annex C.

  String objects shall be written in one of the following two ways:
    • As a sequence of literal characters enclosed in parentheses ( ) (using LEFT PARENTHESIS (28h) and RIGHT PARENThESIS (29h)); see 7.3.4.2, "Literal Strings."
    • As hexadecimal data enclosed in angle brackets < > (using LESS-THAN SIGN (3Ch) and GREATER- THAN SIGN (3Eh)); see 7.3.4.3, "Hexadecimal Strings."
*/
export const PDFString = (str) => `(${str})`;
