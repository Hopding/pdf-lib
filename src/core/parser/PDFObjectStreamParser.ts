import PDFArray from 'src/core/objects/PDFArray';
import PDFName from 'src/core/objects/PDFName';
import PDFRawStream from 'src/core/objects/PDFRawStream';
import ByteStream from 'src/core/parser/ByteStream';
import PDFObjectParser from 'src/core/parser/PDFObjectParser';
import Ascii85Stream from 'src/core/streams/Ascii85Stream';
import AsciiHexStream from 'src/core/streams/AsciiHexStream';
import DecodeStream from 'src/core/streams/DecodeStream';
import FlateStream from 'src/core/streams/FlateStream';
import RunLengthStream from 'src/core/streams/RunLengthStream';
import Stream from 'src/core/streams/Stream';
import { arrayAsString } from 'src/utils';

// TODO: Handle `DecodeParms`, especially for LZWDecode...
const decodeStream = (
  stream: Stream | DecodeStream,
  encoding: PDFName,
): DecodeStream => {
  if (encoding === PDFName.of('FlateDecode')) {
    return new FlateStream(stream);
  }
  if (encoding === PDFName.of('LZWDecode')) {
    throw new Error('TODO');
  }
  if (encoding === PDFName.of('ASCII85Decode')) {
    return new Ascii85Stream(stream);
  }
  if (encoding === PDFName.of('ASCIIHexDecode')) {
    return new AsciiHexStream(stream);
  }
  if (encoding === PDFName.of('RunLengthDecode')) {
    return new RunLengthStream(stream);
  }
  throw new Error('FIX ME!');
};

class PDFObjectStreamParser extends PDFObjectParser {
  static forStream = (rawStream: PDFRawStream) =>
    new PDFObjectStreamParser(rawStream);

  constructor(rawStream: PDFRawStream) {
    let stream: Stream | DecodeStream = new Stream(rawStream.contents);

    const Filter = rawStream.dict.lookup(PDFName.of('Filter'));

    if (Filter instanceof PDFName) {
      stream = decodeStream(stream, Filter);
    } else if (Filter instanceof PDFArray) {
      for (let idx = 0, len = Filter.size(); idx < len; idx++) {
        stream = decodeStream(stream, Filter.lookup(idx, PDFName));
      }
    } else if (!!Filter) {
      throw new Error('FIX ME!');
    }

    super(ByteStream.of(stream.decode()), rawStream.dict.context);
  }

  parse(): void {
    console.log('OBJECT STREAM:');
    console.log(arrayAsString((this.bytes as any).bytes));
  }
}

export default PDFObjectStreamParser;
