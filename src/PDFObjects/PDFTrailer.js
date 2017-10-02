import PDFDictionaryObject from './PDFDictionaryObject';
import dedent from 'dedent';

/*
Represents a PDF Trailer.

From PDF 1.7 Specification, "7.5.5 File Trailer"
(http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/PDF32000_2008.pdf):

  The trailer of a PDF file enables a conforming reader to quickly find the cross-reference table and certain special objects. Conforming readers should read a PDF file from its end. The last line of the file shall contain only the end-of-file marker, %%EOF. The two preceding lines shall contain, one per line and in order, the keyword startxref and the byte offset in the decoded stream from the beginning of the file to the beginning of the xref keyword in the last cross-reference section. The startxref line shall be preceded by the trailer dictionary, consisting of the keyword trailer followed by a series of key-value pairs enclosed in double angle brackets (<<...>>) (using LESS-THAN SIGNs (3Ch) and GREATER-THAN SIGNs (3Eh)). Thus, the trailer has the following overall structure:
    trailer
      << key1 value1
         key2 value2
         ...
         key_n value_n
      >>
    startxref
    Byte_offset_of_last_cross-reference_section
    %%EOF
*/
class PDFTrailer {
  dictionary = null;
  offset = null;

  constructor(dictionary, offset) {
    this.dictionary = dictionary;
    this.offset = offset;
  }

  toString = () => dedent(`
    trailer
    ${PDFDictionaryObject(this.dictionary)}
    startxref
    ${this.offset}
    %%EOF
  `);
}

export default (...args) => new PDFTrailer(...args);
// export default (dictionary, offset) => dedent(`
//   trailer
//   ${PDFDictionaryObject(dictionary)}
//   startxref
//   ${offset}
//   %%EOF
// `);
