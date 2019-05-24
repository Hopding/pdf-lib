import {
  ReparseError,
  UnexpectedObjectTypeError,
  UnsupportedEncodingError,
} from 'src/core/errors';
import PDFArray from 'src/core/objects/PDFArray';
import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNull from 'src/core/objects/PDFNull';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFRawStream from 'src/core/objects/PDFRawStream';
import PDFRef from 'src/core/objects/PDFRef';
import ByteStream from 'src/core/parser/ByteStream';
import PDFObjectParser from 'src/core/parser/PDFObjectParser';
import Ascii85Stream from 'src/core/streams/Ascii85Stream';
import AsciiHexStream from 'src/core/streams/AsciiHexStream';
import DecodeStream from 'src/core/streams/DecodeStream';
import FlateStream from 'src/core/streams/FlateStream';
import LZWStream from 'src/core/streams/LZWStream';
import RunLengthStream from 'src/core/streams/RunLengthStream';
import Stream from 'src/core/streams/Stream';

const decodeStream = (
  stream: Stream | DecodeStream,
  encoding: PDFName,
  params: undefined | typeof PDFNull | PDFDict,
): DecodeStream => {
  if (encoding === PDFName.of('FlateDecode')) {
    return new FlateStream(stream);
  }
  if (encoding === PDFName.of('LZWDecode')) {
    let earlyChange = 1;
    if (params instanceof PDFDict) {
      const EarlyChange = params.lookup(PDFName.of('EarlyChange'));
      if (EarlyChange instanceof PDFNumber) {
        earlyChange = EarlyChange.value();
      }
    }
    return new LZWStream(stream, undefined, earlyChange as 0 | 1);
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
  throw new UnsupportedEncodingError(encoding.value());
};

class PDFObjectStreamParser extends PDFObjectParser {
  static forStream = (rawStream: PDFRawStream) =>
    new PDFObjectStreamParser(rawStream);

  private alreadyParsed: boolean;
  private readonly firstOffset: number;
  private readonly objectCount: number;

  constructor({ dict, contents }: PDFRawStream) {
    let stream: Stream | DecodeStream = new Stream(contents);

    const Filter = dict.lookup(PDFName.of('Filter'));
    const DecodeParms = dict.lookup(PDFName.of('DecodeParms'));

    if (Filter instanceof PDFName) {
      stream = decodeStream(stream, Filter, DecodeParms);
    } else if (Filter instanceof PDFArray) {
      for (let idx = 0, len = Filter.size(); idx < len; idx++) {
        stream = decodeStream(
          stream,
          Filter.lookup(idx, PDFName),
          DecodeParms && (DecodeParms as PDFArray).lookup(idx),
        );
      }
    } else if (!!Filter) {
      throw new UnexpectedObjectTypeError([PDFName, PDFArray], Filter);
    }

    super(ByteStream.of(stream.decode()), dict.context);

    this.alreadyParsed = false;
    this.firstOffset = dict.lookup(PDFName.of('First'), PDFNumber).value();
    this.objectCount = dict.lookup(PDFName.of('N'), PDFNumber).value();
  }

  parseIntoContext(): void {
    if (this.alreadyParsed) {
      throw new ReparseError('PDFObjectStreamParser', 'parseIntoContext');
    }
    this.alreadyParsed = true;

    const offsetsAndObjectNumbers = this.parseOffsetsAndObjectNumbers();
    for (let idx = 0, len = offsetsAndObjectNumbers.length; idx < len; idx++) {
      const { objectNumber, offset } = offsetsAndObjectNumbers[idx];
      this.bytes.moveTo(this.firstOffset + offset);
      const object = this.parseObject();
      const ref = PDFRef.of(objectNumber, 0);
      this.context.assign(ref, object);
    }
  }

  private parseOffsetsAndObjectNumbers(): Array<{
    objectNumber: number;
    offset: number;
  }> {
    const offsetsAndObjectNumbers = [];
    for (let idx = 0, len = this.objectCount; idx < len; idx++) {
      this.skipWhitespaceAndComments();
      const objectNumber = this.parseRawInt();

      this.skipWhitespaceAndComments();
      const offset = this.parseRawInt();

      offsetsAndObjectNumbers.push({ objectNumber, offset });
    }
    return offsetsAndObjectNumbers;
  }
}

export default PDFObjectStreamParser;
