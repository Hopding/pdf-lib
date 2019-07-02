import { ReparseError } from 'src/core/errors';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFRawStream from 'src/core/objects/PDFRawStream';
import PDFRef from 'src/core/objects/PDFRef';
import ByteStream from 'src/core/parser/ByteStream';
import PDFObjectParser from 'src/core/parser/PDFObjectParser';
import { waitForTick } from 'src/utils';

class PDFObjectStreamParser extends PDFObjectParser {
  static forStream = (
    rawStream: PDFRawStream,
    shouldWaitForTick?: () => boolean,
  ) => new PDFObjectStreamParser(rawStream, shouldWaitForTick);

  private alreadyParsed: boolean;
  private readonly shouldWaitForTick: () => boolean;
  private readonly firstOffset: number;
  private readonly objectCount: number;

  constructor(rawStream: PDFRawStream, shouldWaitForTick?: () => boolean) {
    super(ByteStream.fromPDFRawStream(rawStream), rawStream.dict.context);

    const { dict } = rawStream;

    this.alreadyParsed = false;
    this.shouldWaitForTick = shouldWaitForTick || (() => false);
    this.firstOffset = dict.lookup(PDFName.of('First'), PDFNumber).value();
    this.objectCount = dict.lookup(PDFName.of('N'), PDFNumber).value();
  }

  async parseIntoContext(): Promise<void> {
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
      if (this.shouldWaitForTick()) await waitForTick();
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
