import { UnexpectedObjectTypeError, UnsupportedEncodingError } from '../errors';
import PDFArray from '../objects/PDFArray';
import PDFDict from '../objects/PDFDict';
import PDFName from '../objects/PDFName';
import PDFNull from '../objects/PDFNull';
import PDFNumber from '../objects/PDFNumber';
import PDFRawStream from '../objects/PDFRawStream';
import Ascii85Stream from './Ascii85Stream';
import AsciiHexStream from './AsciiHexStream';
import FlateStream from './FlateStream';
import LZWStream from './LZWStream';
import RunLengthStream from './RunLengthStream';
import Stream, { StreamType } from './Stream';

const decodeStream = (
  stream: StreamType,
  encoding: PDFName,
  params: undefined | typeof PDFNull | PDFDict,
) => {
  if (encoding === PDFName.of('FlateDecode')) {
    return new FlateStream(stream);
  }
  if (encoding === PDFName.of('LZWDecode')) {
    let earlyChange = 1;
    if (params instanceof PDFDict) {
      const EarlyChange = params.lookup(PDFName.of('EarlyChange'));
      if (EarlyChange instanceof PDFNumber) {
        earlyChange = EarlyChange.asNumber();
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
  throw new UnsupportedEncodingError(encoding.asString());
};

export const decodePDFRawStream = ({
  dict,
  contents,
  transform,
}: PDFRawStream) => {
  let stream: StreamType = new Stream(contents);

  if (transform) {
    stream = transform.createStream(stream, contents.length);
  }

  const Filter = dict.lookup(PDFName.of('Filter'));
  const DecodeParms = dict.lookup(PDFName.of('DecodeParms'));

  if (Filter instanceof PDFName) {
    stream = decodeStream(
      stream,
      Filter,
      DecodeParms as PDFDict | typeof PDFNull | undefined,
    );
  } else if (Filter instanceof PDFArray) {
    for (let idx = 0, len = Filter.size(); idx < len; idx++) {
      stream = decodeStream(
        stream,
        Filter.lookup(idx, PDFName),
        DecodeParms && (DecodeParms as PDFArray).lookupMaybe(idx, PDFDict),
      );
    }
  } else if (!!Filter) {
    throw new UnexpectedObjectTypeError([PDFName, PDFArray], Filter);
  }

  return stream;
};
