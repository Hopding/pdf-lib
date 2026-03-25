import fs from 'fs';
import {
  PDFContext,
  PDFRawStream,
  PDFXRefStreamParser,
  ReparseError,
} from '../../../src/index';

const readData = (file: string) =>
  new Uint8Array(fs.readFileSync(`./tests/core/parser/data/${file}`));

describe('PDFXRefStreamParser', () => {
  it('can parse XRef streams (1)', () => {
    const context = PDFContext.create();
    const dict = context.obj({
      DecodeParms: { Columns: 4, Predictor: 12 },
      Filter: 'FlateDecode',
      Length: 373,
      Size: 319,
      W: [1, 2, 1],
    });
    const contents = readData('xref-stream1');
    const stream = PDFRawStream.of(dict, contents);

    const entries = PDFXRefStreamParser.forStream(stream).parseIntoContext();
    const normal = entries.filter(
      (entry) => !entry.deleted && !entry.inObjectStream,
    );
    const deleted = entries.filter((entry) => entry.deleted);
    const inObjectStream = entries.filter((entry) => entry.inObjectStream);

    expect(entries.length).toBe(319);
    expect(normal.length).toBe(51);
    expect(deleted.length).toBe(201);
    expect(inObjectStream.length).toBe(67);
  });

  it('can parse XRef streams (2)', () => {
    const context = PDFContext.create();
    const dict = context.obj({
      DecodeParms: { Columns: 4, Predictor: 12 },
      Filter: 'FlateDecode',
      // prettier-ignore
      Index: [
        1, 1,
        16, 1,
        18, 2,
        25, 3,
        30, 6,
        50, 1,
        78, 11,
        90, 2,
        95, 1,
        119, 19,
        139, 1,
        141, 1,
        143, 11,
        156, 61,
        219, 2,
        223, 9,
        243, 2,
        246, 13,
        282, 7,
        290, 1,
        308, 1,
        319, 4,
      ],
      Length: 120,
      Size: 323,
      W: [1, 2, 1],
    });
    const contents = readData('xref-stream2');
    const stream = PDFRawStream.of(dict, contents);

    const entries = PDFXRefStreamParser.forStream(stream).parseIntoContext();
    const normal = entries.filter(
      (entry) => !entry.deleted && !entry.inObjectStream,
    );
    const deleted = entries.filter((entry) => entry.deleted);
    const inObjectStream = entries.filter((entry) => entry.inObjectStream);

    expect(entries.length).toBe(160);
    expect(normal.length).toBe(32);
    expect(deleted.length).toBe(95);
    expect(inObjectStream.length).toBe(33);
  });

  it('can parse XRef streams (3)', () => {
    const context = PDFContext.create();
    const dict = context.obj({
      DecodeParms: { Columns: 3, Predictor: 12 },
      Filter: ['FlateDecode'],
      Index: [32, 1, 291, 1, 308, 1, 323, 2],
      Length: 31,
      Size: 325,
      W: [1, 2, 0],
    });
    const contents = readData('xref-stream3');
    const stream = PDFRawStream.of(dict, contents);

    const entries = PDFXRefStreamParser.forStream(stream).parseIntoContext();
    const normal = entries.filter(
      (entry) => !entry.deleted && !entry.inObjectStream,
    );
    const deleted = entries.filter((entry) => entry.deleted);
    const inObjectStream = entries.filter((entry) => entry.inObjectStream);

    expect(entries.length).toBe(5);
    expect(normal.length).toBe(3);
    expect(deleted.length).toBe(0);
    expect(inObjectStream.length).toBe(2);
  });

  it('can parse XRef streams (4)', () => {
    const context = PDFContext.create();
    const dict = context.obj({
      Filter: 'FlateDecode',
      Index: [0, 146],
      Length: 332,
      Size: 146,
      W: [1, 2, 2],
    });
    const contents = readData('xref-stream4');
    const stream = PDFRawStream.of(dict, contents);

    const entries = PDFXRefStreamParser.forStream(stream).parseIntoContext();
    const normal = entries.filter(
      (entry) => !entry.deleted && !entry.inObjectStream,
    );
    const deleted = entries.filter((entry) => entry.deleted);
    const inObjectStream = entries.filter((entry) => entry.inObjectStream);

    expect(entries.length).toBe(146);
    expect(normal.length).toBe(30);
    expect(deleted.length).toBe(1);
    expect(inObjectStream.length).toBe(115);
  });

  // it(`removes objects from the PDFContext that are marked as deleted`, () => {
  //   const context = PDFContext.create();
  //   const dict = context.obj({
  //     DecodeParms: { Columns: 4, Predictor: 12 },
  //     Filter: 'FlateDecode',
  //     Length: 373,
  //     Size: 319,
  //     W: [1, 2, 1],
  //   });
  //   const contents = readData('xref-stream1');
  //   const stream = PDFRawStream.of(dict, contents);

  //   const fooStr = PDFString.of('foo');
  //   const fooRef = PDFRef.of(1, 1);
  //   context.assign(fooRef, fooStr);

  //   const barStr = PDFString.of('bar');
  //   const barRef = PDFRef.of(2, 2);
  //   context.assign(barRef, barStr);

  //   expect(context.lookup(fooRef)).not.toBeUndefined();
  //   expect(context.lookup(barRef)).not.toBeUndefined();

  //   PDFXRefStreamParser.forStream(stream).parseIntoContext();

  //   expect(context.lookup(fooRef)).toBeUndefined();
  //   expect(context.lookup(barRef)).not.toBeUndefined();
  // });

  it('prevents reparsing', () => {
    const context = PDFContext.create();
    const dict = context.obj({
      Filter: 'FlateDecode',
      Index: [0, 146],
      Length: 332,
      Size: 146,
      W: [1, 2, 2],
    });
    const contents = readData('xref-stream4');
    const stream = PDFRawStream.of(dict, contents);

    const parser = PDFXRefStreamParser.forStream(stream);

    expect(() => parser.parseIntoContext()).not.toThrow();
    expect(() => parser.parseIntoContext()).toThrow(
      new ReparseError('PDFXRefStreamParser', 'parseIntoContext'),
    );
  });
});
