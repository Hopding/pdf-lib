import { ReparseError } from 'src/core/errors';
import PDFArray from 'src/core/objects/PDFArray';
import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFRawStream from 'src/core/objects/PDFRawStream';
import PDFRef from 'src/core/objects/PDFRef';
import ByteStream from 'src/core/parser/ByteStream';
import PDFContext from 'src/core/PDFContext';

export interface Entry {
  ref: PDFRef;
  offset: number;
  deleted: boolean;
  inObjectStream: boolean;
}

class PDFXRefStreamParser {
  static forStream = (rawStream: PDFRawStream) =>
    new PDFXRefStreamParser(rawStream);

  private alreadyParsed: boolean;

  private readonly dict: PDFDict;
  private readonly context: PDFContext;
  private readonly bytes: ByteStream;
  private readonly subsections: {
    firstObjectNumber: number;
    length: number;
  }[];
  private readonly byteWidths: [number, number, number];

  constructor(rawStream: PDFRawStream) {
    this.alreadyParsed = false;

    this.dict = rawStream.dict;
    this.bytes = ByteStream.fromPDFRawStream(rawStream);
    this.context = this.dict.context;

    const Size = this.dict.lookup(PDFName.of('Size'), PDFNumber);

    const Index = this.dict.lookup(PDFName.of('Index'));
    if (Index instanceof PDFArray) {
      this.subsections = [];
      for (let idx = 0, len = Index.size(); idx < len; idx += 2) {
        const firstObjectNumber = Index.lookup(idx + 0, PDFNumber).asNumber();
        const length = Index.lookup(idx + 1, PDFNumber).asNumber();
        this.subsections.push({ firstObjectNumber, length });
      }
    } else {
      this.subsections = [{ firstObjectNumber: 0, length: Size.asNumber() }];
    }

    const W = this.dict.lookup(PDFName.of('W'), PDFArray);
    this.byteWidths = [-1, -1, -1];
    for (let idx = 0, len = W.size(); idx < len; idx++) {
      this.byteWidths[idx] = W.lookup(idx, PDFNumber).asNumber();
    }
  }

  parseIntoContext(): Entry[] {
    if (this.alreadyParsed) {
      throw new ReparseError('PDFXRefStreamParser', 'parseIntoContext');
    }
    this.alreadyParsed = true;

    this.context.trailerInfo = {
      Root: this.dict.get(PDFName.of('Root')),
      Encrypt: this.dict.get(PDFName.of('Encrypt')),
      Info: this.dict.get(PDFName.of('Info')),
      ID: this.dict.get(PDFName.of('ID')),
    };

    const entries = this.parseEntries();

    // for (let idx = 0, len = entries.length; idx < len; idx++) {
    // const entry = entries[idx];
    // if (entry.deleted) this.context.delete(entry.ref);
    // }

    return entries;
  }

  private parseEntries(): Entry[] {
    const entries = [];
    const [typeFieldWidth, offsetFieldWidth, genFieldWidth] = this.byteWidths;

    for (
      let subsectionIdx = 0, subsectionLen = this.subsections.length;
      subsectionIdx < subsectionLen;
      subsectionIdx++
    ) {
      const { firstObjectNumber, length } = this.subsections[subsectionIdx];

      for (let objIdx = 0; objIdx < length; objIdx++) {
        let type = 0;
        for (let idx = 0, len = typeFieldWidth; idx < len; idx++) {
          type = (type << 8) | this.bytes.next();
        }

        let offset = 0;
        for (let idx = 0, len = offsetFieldWidth; idx < len; idx++) {
          offset = (offset << 8) | this.bytes.next();
        }

        let generationNumber = 0;
        for (let idx = 0, len = genFieldWidth; idx < len; idx++) {
          generationNumber = (generationNumber << 8) | this.bytes.next();
        }

        // When the `type` field is absent, it defaults to 1
        if (typeFieldWidth === 0) type = 1;

        const objectNumber = firstObjectNumber + objIdx;
        const entry = {
          ref: PDFRef.of(objectNumber, generationNumber),
          offset,
          deleted: type === 0,
          inObjectStream: type === 2,
        };

        entries.push(entry);
      }
    }

    return entries;
  }
}

export default PDFXRefStreamParser;
