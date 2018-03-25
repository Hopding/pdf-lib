import { PDFBoolean } from 'core/pdf-objects';
import parseBool from 'core/pdf-parser/parseBool';
// import {} from 'jest';
import { charCodes } from 'utils';

describe(`parseBool`, () => {
  it(`parses "true" PDF boolean objects from its input array`, () => {
    const input = new Uint8Array(charCodes('truefoobar'));
    const res = parseBool(input);
    expect(res).toEqual([expect.any(PDFBoolean), expect.any(Uint8Array)]);
    expect(res[0].boolean).toEqual(true);
    expect(res[1]).toEqual(new Uint8Array(charCodes('foobar')));
  });
});
