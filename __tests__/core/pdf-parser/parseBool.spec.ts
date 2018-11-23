import { PDFBoolean } from 'core/pdf-objects';
import parseBool from 'core/pdf-parser/parseBool';
import { charCodes, typedArrayFor } from 'utils';

describe(`parseBool`, () => {
  it(`parses "true" PDF boolean objects from its input array`, () => {
    const input = typedArrayFor('trueFOOBAR');
    const res = parseBool(input);
    expect(res).toEqual([expect.any(PDFBoolean), expect.any(Uint8Array)]);
    expect(res[0].boolean).toEqual(true);
    expect(res[1]).toEqual(typedArrayFor('FOOBAR'));
  });

  it(`parses "false" PDF boolean objects from its input array`, () => {
    const input = typedArrayFor('falseFOOBAR');
    const res = parseBool(input);
    expect(res).toEqual([expect.any(PDFBoolean), expect.any(Uint8Array)]);
    expect(res[0].boolean).toEqual(false);
    expect(res[1]).toEqual(typedArrayFor('FOOBAR'));
  });

  it(`allows leading comments before the PDFBoolean object`, () => {
    const input = typedArrayFor('\n% This is a % comment!\ntrue% Another one!');
    const res = parseBool(input);
    expect(res).toEqual([expect.any(PDFBoolean), expect.any(Uint8Array)]);
    expect(res[0].boolean).toEqual(true);
    expect(res[1]).toEqual(typedArrayFor('% Another one!'));
  });

  it(`returns undefined when leading input is not a PDFBoolean`, () => {
    const input = typedArrayFor('FOOBARtrue');
    const res = parseBool(input);
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseBool" parse handler with the parsed PDFBoolean object`, () => {
    const parseHandlers = {
      onParseBool: jest.fn(),
    };
    const input = typedArrayFor('trueFOOBAR');
    parseBool(input, parseHandlers);
    expect(parseHandlers.onParseBool).toHaveBeenCalledWith(
      expect.any(PDFBoolean),
    );
  });

  it(`allows leading whitespace and line endings before & after the PDFBoolean object`, () => {
    const input = typedArrayFor(' \0\f \t\n \r\n false \r\n FOOBAR');
    const res = parseBool(input);
    expect(res).toEqual([expect.any(PDFBoolean), expect.any(Uint8Array)]);
    expect(res[0].boolean).toEqual(false);
    expect(res[1]).toEqual(typedArrayFor(' \r\n FOOBAR'));
  });
});
