import fs from 'fs';
import {
  PDFArray,
  PDFBool,
  PDFContext,
  PDFDict,
  PDFHexString,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFObjectStreamParser,
  PDFRawStream,
  PDFRef,
  PDFString,
  ReparseError,
} from '../../../src/index';

const readData = (file: string) =>
  new Uint8Array(fs.readFileSync(`./tests/core/parser/data/${file}`));

describe('PDFObjectStreamParser', () => {
  it('parses simple object streams', () => {
    const context = PDFContext.create();
    const dict = context.obj({
      N: 3,
      First: 18,
    });
    const contents = readData('object-stream1');
    const stream = PDFRawStream.of(dict, contents);

    PDFObjectStreamParser.forStream(stream).parseIntoContext();

    expect(context.enumerateIndirectObjects().length).toBe(3);
  });

  it(`can parse object streams containing the following PDF Object types: [
    PDFDictionary,
    PDFArray
    PDFName,
    PDFString,
    PDFIndirectReference,
    PDFNumber,
    PDFHexString,
    PDFBoolean,
    PDFNull
  ]`, () => {
    const context = PDFContext.create();
    const dict = context.obj({
      N: 9,
      First: 44,
    });
    const contents = readData('object-stream2');
    const stream = PDFRawStream.of(dict, contents);

    PDFObjectStreamParser.forStream(stream).parseIntoContext();

    expect(context.enumerateIndirectObjects().length).toBe(9);
    expect(context.lookup(PDFRef.of(1))).toBeInstanceOf(PDFDict);
    expect(context.lookup(PDFRef.of(2))).toBeInstanceOf(PDFArray);
    expect(context.lookup(PDFRef.of(3))).toBe(PDFName.of('QuxBaz'));
    expect(context.lookup(PDFRef.of(4))).toBeInstanceOf(PDFString);
    expect(context.lookup(PDFRef.of(5))).toBe(PDFRef.of(21));
    expect(context.lookup(PDFRef.of(6))).toBeInstanceOf(PDFNumber);
    expect(context.lookup(PDFRef.of(7))).toBeInstanceOf(PDFHexString);
    expect(context.lookup(PDFRef.of(8))).toBe(PDFBool.True);
    expect(context.lookup(PDFRef.of(9))).toBe(PDFNull);
  });

  it('handles object streams with newlines separating the integer pairs', () => {
    const context = PDFContext.create();
    const dict = context.obj({
      N: 182,
      First: 1786,
    });
    const contents = readData('object-stream3');
    const stream = PDFRawStream.of(dict, contents);

    PDFObjectStreamParser.forStream(stream).parseIntoContext();

    expect(context.enumerateIndirectObjects().length).toBe(182);
  });

  it('handles encoded object streams with PDFName filters', () => {
    const context = PDFContext.create();
    const dict = context.obj({
      Filter: 'FlateDecode',
      N: 115,
      First: 924,
    });
    const contents = readData('object-stream4');
    const stream = PDFRawStream.of(dict, contents);

    PDFObjectStreamParser.forStream(stream).parseIntoContext();

    expect(context.enumerateIndirectObjects().length).toBe(115);
  });

  it('handles encoded object streams with PDFArray filters', () => {
    const context = PDFContext.create();
    const dict = context.obj({
      Filter: ['FlateDecode'],
      N: 115,
      First: 924,
    });
    const contents = readData('object-stream4');
    const stream = PDFRawStream.of(dict, contents);

    PDFObjectStreamParser.forStream(stream).parseIntoContext();

    expect(context.enumerateIndirectObjects().length).toBe(115);
  });

  it('throws an error for invalid Filters', () => {
    const context = PDFContext.create();
    const dict = context.obj({
      Filter: 42,
      N: 115,
      First: 924,
    });
    const contents = readData('object-stream4');
    const stream = PDFRawStream.of(dict, contents);

    expect(() =>
      PDFObjectStreamParser.forStream(stream).parseIntoContext(),
    ).toThrow();
  });

  it('throws an error for invalid object streams', async () => {
    const context = PDFContext.create();
    const dict = context.obj({
      N: 1,
      First: 5,
    });
    const contents = readData('object-stream-invalid');
    const stream = PDFRawStream.of(dict, contents);

    await expect(
      PDFObjectStreamParser.forStream(stream).parseIntoContext(),
    ).rejects.toThrow();
  });

  it('prevents reparsing', async () => {
    const context = PDFContext.create();
    const dict = context.obj({
      N: 3,
      First: 18,
    });
    const contents = readData('object-stream1');
    const stream = PDFRawStream.of(dict, contents);

    const parser = PDFObjectStreamParser.forStream(stream);

    await expect(parser.parseIntoContext()).resolves.not.toThrow();
    await expect(parser.parseIntoContext()).rejects.toThrow(
      new ReparseError('PDFObjectStreamParser', 'parseIntoContext'),
    );
  });
});
