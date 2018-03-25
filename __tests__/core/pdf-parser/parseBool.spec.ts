import { PDFBoolean } from 'core/pdf-objects';
import parseBool from 'core/pdf-parser/parseBool';
import { arrayToString, charCodes } from 'utils';

const typedArrFor = (str: string) => new Uint8Array(charCodes(str));

describe(`parseBool`, () => {
  it(`parses "true" PDF boolean objects from its input array`, () => {
    const input = typedArrFor('trueFOOBAR');
    const res = parseBool(input);
    expect(res).toEqual([expect.any(PDFBoolean), expect.any(Uint8Array)]);
    expect(res[0].boolean).toEqual(true);
    expect(res[1]).toEqual(typedArrFor('FOOBAR'));
  });

  it(`parses "false" PDF boolean objects from its input array`, () => {
    const input = typedArrFor('falseFOOBAR');
    const res = parseBool(input);
    expect(res).toEqual([expect.any(PDFBoolean), expect.any(Uint8Array)]);
    expect(res[0].boolean).toEqual(false);
    expect(res[1]).toEqual(typedArrFor('FOOBAR'));
  });

  it(`returns null when leading input is not a PDFBoolean`, () => {
    const input = typedArrFor('FOOBARtrue');
    const res = parseBool(input);
    expect(res).toBeNull();
  });

  it(`invokes the "onParseBool" parse handler with the parsed PDFBoolean object`, () => {
    const parseHandlers = {
      onParseBool: jest.fn(),
    };
    const input = typedArrFor('trueFOOBAR');
    parseBool(input, parseHandlers);
    expect(parseHandlers.onParseBool).toHaveBeenCalledWith(
      expect.any(PDFBoolean),
    );
  });

  it(`allows leading whitespace and line endings before & after the PDFBoolean object`, () => {
    const input = typedArrFor(' \n \r\n false \r\n FOOBAR');
    const res = parseBool(input);
    expect(res).toEqual([expect.any(PDFBoolean), expect.any(Uint8Array)]);
    expect(res[0].boolean).toEqual(false);
    expect(res[1]).toEqual(typedArrFor(' \r\n FOOBAR'));
  });
});
