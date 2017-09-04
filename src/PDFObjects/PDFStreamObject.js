import PDFIndirectObject from './PDFIndirectObject';
import PDFDictionaryObject from './PDFDictionaryObject';

/*
Represents a PDF Stream Object.

From PDF 1.7 Specification, "7.3.8 Stream Objects"
(http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/PDF32000_2008.pdf):
  A stream object, like a string object, is a sequence of bytes. Furthermore, a stream may be of unlimited length, whereas a string shall be subject to an implementation limit. For this reason, objects with potentially large amounts of data, such as images and page descriptions, shall be represented as streams.

  A stream shall consist of a dictionary followed by zero or more bytes bracketed between the keywords stream (followed by newline) and endstream:
  EXAMPLE:
    dictionary
    stream
    ...Zero or more bytes...
    endstream

  All streams shall be indirect objects (see 7.3.10, "Indirect Objects") and the stream dictionary shall be a direct object. The keyword stream that follows the stream dictionary shall be followed by an end-of-line marker consisting of either a CARRIAGE RETURN and a LINE FEED or just a LINE FEED, and not by a CARRIAGE RETURN alone. The sequence of bytes that make up a stream lie between the end-of-line marker following the stream keyword and the endstream keyword; the stream dictionary specifies the exact number of bytes. There should be an end-of-line marker after the data and before endstream; this marker shall not be included in the stream length. There shall not be any extra bytes, other than white space, between endstream and endobj.
*/
class PDFStreamObject extends PDFIndirectObject {
  isPDFStreamObject = true;

  constructor(objectNum, generationNum, dictionary, streamContent) {
    super(
      objectNum,
      generationNum,
      `${new PDFDictionaryObject(dictionary)}\nstream\n${streamContent}\nendstream`,
    );
  }
}

export default (...args) => new PDFStreamObject(...args);
