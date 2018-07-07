import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import { PDFDictionary, PDFStream } from 'core/pdf-objects';
import parseDictOrStream from 'core/pdf-parser/parseDictOrStream';
import { typedArrayFor } from 'utils';

describe(`parseDictOrStream`, () => {
  it(`parses a single PDF Dictionary object from its input array`, () => {
    const input = typedArrayFor('<< /Foo /Bar >><< /Qux /Baz >>');
    const res = parseDictOrStream(input, PDFObjectIndex.create());
    expect(res).toEqual([expect.any(PDFDictionary), expect.any(Uint8Array)]);
    expect(res[1]).toEqual(typedArrayFor('<< /Qux /Baz >>'));
  });

  it(`parses a single PDF Stream object from its input array`, () => {
    // Note that the "endobj" keyword is not _technically_ part of the stream.
    // But it will always appear after a stream ends within an actual PDF.
    // And it is used to parse the stream, so it must be included here.
    const input = typedArrayFor(`
      << /Foo /Bar >>
      stream
       FOO BAR AND QUX BAZ
      \nendstream
      endobj
      << /Qux /Baz >>
      stream
       QUX BAZ AND FOO BAR
      \nendstream
      endobj
    `);
    const res = parseDictOrStream(input, PDFObjectIndex.create());
    expect(res).toEqual([expect.any(PDFStream), expect.any(Uint8Array)]);
    expect(res[1]).toEqual(
      typedArrayFor(`
      endobj
      << /Qux /Baz >>
      stream
       QUX BAZ AND FOO BAR
      \nendstream
      endobj
    `),
    );
  });

  it(`returns undefined when leading input is not a PDF Dictionary or a PDF Stream`, () => {
    const input = typedArrayFor('(Foo)<< /Stuff /AndThings >>');
    const res = parseDictOrStream(input, PDFObjectIndex.create());
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseDict" parseHandler with the parsing a PDFDictionary object`, () => {
    const parseHandlers = {
      onParseDict: jest.fn(),
      onParseStream: jest.fn(),
    };
    const input = typedArrayFor('<< /Foo /Bar >>');
    parseDictOrStream(input, PDFObjectIndex.create(), parseHandlers);
    expect(parseHandlers.onParseDict).toHaveBeenCalledWith(
      expect.any(PDFDictionary),
    );
    expect(parseHandlers.onParseStream).not.toHaveBeenCalled();
  });

  it(`invokes the "onParseStream" and "onParseDict" parseHandlers when parsing a PDFStream object`, () => {
    const parseHandlers = {
      onParseDict: jest.fn(),
      onParseStream: jest.fn(),
    };
    const input = typedArrayFor(`
      << /Foo /Bar >>
      stream
       FOO BAR AND QUX BAZ
      \nendstream
      endobj
    `);
    parseDictOrStream(input, PDFObjectIndex.create(), parseHandlers);
    expect(parseHandlers.onParseStream).toHaveBeenCalledWith(
      expect.any(PDFStream),
    );
    expect(parseHandlers.onParseDict).toHaveBeenCalledWith(
      expect.any(PDFDictionary),
    );
  });
});
