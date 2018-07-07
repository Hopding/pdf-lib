// This is required to prevent an issue with dependency resolution in this test
import 'core/pdf-objects';

import parseXRefTable from 'core/pdf-parser/parseXRefTable';
import { PDFXRef } from 'core/pdf-structures';
import { arrayToString, typedArrayFor } from 'utils';

const xRefTable = `
xref
0 2
0000000000 65535 f
0000000001 00000 n
2 3
0000000002 00000 n
0000000003 00000 n
0000000004 00000 n
`.trim();

describe(`parseXRefTable`, () => {
  it(`parses a single PDF Cross Reference Table from its input array`, () => {
    const input = typedArrayFor(xRefTable + xRefTable);
    const res = parseXRefTable(input);
    expect(res).toEqual([expect.any(PDFXRef.Table), expect.any(Uint8Array)]);

    expect(res[0].subsections).toHaveLength(2);

    expect(res[0].subsections[0].firstObjNum).toBe(0);
    expect(res[0].subsections[0].entries).toHaveLength(2);
    expect(res[0].subsections[0].entries[0]).toMatchObject({
      offset: 0,
      generationNum: 65535,
      isInUse: false,
    });
    expect(res[0].subsections[0].entries[1]).toMatchObject({
      offset: 1,
      generationNum: 0,
      isInUse: true,
    });

    expect(res[0].subsections[1].firstObjNum).toBe(2);
    expect(res[0].subsections[1].entries).toHaveLength(3);
    expect(res[0].subsections[1].entries[0]).toMatchObject({
      offset: 2,
      generationNum: 0,
      isInUse: true,
    });
    expect(res[0].subsections[1].entries[1]).toMatchObject({
      offset: 3,
      generationNum: 0,
      isInUse: true,
    });
    expect(res[0].subsections[1].entries[2]).toMatchObject({
      offset: 4,
      generationNum: 0,
      isInUse: true,
    });

    expect(res[1]).toEqual(typedArrayFor(xRefTable));
  });

  it(`returns undefined when leading input is not a PDF Cross Reference Table`, () => {
    const input = typedArrayFor(`(Look, a string!)`);
    const res = parseXRefTable(input);
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseXRefTable" parseHandler with the parsed PDFXRef.Table object`, () => {
    const parseHandlers = {
      onParseXRefTable: jest.fn(),
    };
    const input = typedArrayFor(xRefTable);
    parseXRefTable(input, parseHandlers);
    expect(parseHandlers.onParseXRefTable).toHaveBeenCalledWith(
      expect.any(PDFXRef.Table),
    );
  });

  it(`returns undefined when a subsection has no entries`, () => {
    const input = typedArrayFor(`
      xref
      0 0
    `);
    const res = parseXRefTable(input);
    expect(res).toBeUndefined();
  });

  it(`can parse Cross Reference Tables with multiple EOL characters`, () => {
    const input = typedArrayFor(
      `xref\n0 851\r\n0000000000 65535 f\r\n0000229614 00000 n\r\n0000229916 00000 n\r\n0000230276 00000 n\r\n0000239589 00000 n\r\n0000260433 00000 n\r\n0000260685 00000 n\r\n0000261106 00000 n\r\n0000261398 00000 n\r\n0000261443 00000 n\r\n0000268136 00000 n\r\n0000268451 00000 n\r\n0000268766 00000 n\r\n0000269022 00000 n\r\n0000269283 00000 n\r\n0000269565 00000 n\r\n0000269845 00000 n\r\n0000270123 00000 n\r\n`,
    );
    const res = parseXRefTable(input);
    expect(res).not.toBeNull();
    expect(res[0].subsections).toHaveLength(1);
    expect(res[0].subsections[0].entries).toHaveLength(18);
  });
});
