import {
  UnexpectedObjectTypeError,
  UnsupportedEncodingError,
} from 'src/core/errors';
import PDFArray from 'src/core/objects/PDFArray';
import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNull from 'src/core/objects/PDFNull';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFRawStream from 'src/core/objects/PDFRawStream';
import Ascii85Stream from 'src/core/streams/Ascii85Stream';
import AsciiHexStream from 'src/core/streams/AsciiHexStream';
import FlateStream from 'src/core/streams/FlateStream';
import LZWStream from 'src/core/streams/LZWStream';
import RunLengthStream from 'src/core/streams/RunLengthStream';
import Stream, { StreamType } from 'src/core/streams/Stream';

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

export const decodePDFRawStream = ({ dict, contents }: PDFRawStream) => {
  let stream: StreamType = new Stream(contents);

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
