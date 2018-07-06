// Need this here to prevent error from circular imports
import 'core/pdf-objects';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFDictionary,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';
import { PDFXRef } from 'core/pdf-structures';
import { typedArrayFor } from 'utils';

describe(`PDFXRef.Entry`, () => {
  describe(`"setOffset" method`, () => {
    it(`requires a Number as its argument`, () => {
      const entry = PDFXRef.Entry.create();
      expect(() => entry.setOffset('foo')).toThrowError(
        'offset must be a number',
      );
      expect(entry.setOffset(21)).toBe(entry);
    });

    it(`sets the "setOffset" member`, () => {
      const entry = PDFXRef.Entry.create();
      expect(entry.offset).toBeUndefined();

      entry.setOffset(21);
      expect(entry.offset).toBe(21);
    });
  });

  describe(`"setGenerationNum" method`, () => {
    it(`requires a Number as its argument`, () => {
      const entry = PDFXRef.Entry.create();
      expect(() => entry.setGenerationNum('foo')).toThrowError(
        'generationNum must be a number',
      );
      expect(entry.setGenerationNum(21)).toBe(entry);
    });

    it(`sets the "generationNum" member`, () => {
      const entry = PDFXRef.Entry.create();
      expect(entry.generationNum).toBeUndefined();

      entry.setGenerationNum(21);
      expect(entry.generationNum).toBe(21);
    });
  });

  describe(`"setIsInUse" method`, () => {
    it(`requires a Number as its argument`, () => {
      const entry = PDFXRef.Entry.create();
      expect(() => entry.setIsInUse('foo')).toThrowError(
        'isInUse must be a boolean',
      );
      expect(entry.setIsInUse(true)).toBe(entry);
    });

    it(`sets the "generationNum" member`, () => {
      const entry = PDFXRef.Entry.create();
      expect(entry.isInUse).toBe(false);

      entry.setIsInUse(true);
      expect(entry.isInUse).toBe(true);
    });
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFXRef.Entry as a string`, () => {
      const entry = PDFXRef.Entry.create()
        .setOffset(21)
        .setGenerationNum(3)
        .setIsInUse(true);
      expect(entry.toString()).toBe(`0000000021 00003 n \n`);

      entry.setIsInUse(false);
      expect(entry.toString()).toBe(`0000000021 00003 f \n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFXRef.Entry in bytes`, () => {
      const entry = PDFXRef.Entry.create()
        .setOffset(21)
        .setGenerationNum(3)
        .setIsInUse(true);
      expect(entry.bytesSize()).toBe(20);

      entry.setIsInUse(false);
      expect(entry.bytesSize()).toBe(20);
    });
  });
});

describe(`PDFXRef.Subsection`, () => {
  it(`requires a PDFXRef.Entry[] to be constructed`, () => {
    expect(() => new PDFXRef.Subsection(['foo'])).toThrowError(
      'PDFXRef.Subsection.entries must be an array of PDFXRef.Entry',
    );
    expect(new PDFXRef.Subsection([PDFXRef.Entry.create()])).toBeInstanceOf(
      PDFXRef.Subsection,
    );
  });

  it(`has a static "from" factory method`, () => {
    expect(() => PDFXRef.Subsection.from(['foo'])).toThrowError(
      'PDFXRef.Subsection.entries must be an array of PDFXRef.Entry',
    );
    expect(PDFXRef.Subsection.from([PDFXRef.Entry.create()])).toBeInstanceOf(
      PDFXRef.Subsection,
    );
  });

  describe(`"addEntry" method`, () => {
    it(`requires a PDFXRef.Entry as its argument`, () => {
      const subsection = PDFXRef.Subsection.from();
      expect(() => subsection.addEntry('foo')).toThrowError(
        '"entry" must be instance of PDFXRef.Entry',
      );
      expect(subsection.addEntry(PDFXRef.Entry.create())).toBe(subsection);
    });

    it(`adds the PDFXRef.Entry to the entries array`, () => {
      const subsection = PDFXRef.Subsection.from();
      const entry = PDFXRef.Entry.create();
      subsection.addEntry(entry);

      expect(subsection.entries).toEqual([entry]);
    });
  });

  describe(`"setFirstObjNum" method`, () => {
    it(`requires a Number as its argument`, () => {
      const subsection = PDFXRef.Subsection.from();
      expect(() => subsection.setFirstObjNum('foo')).toThrowError(
        'firstObjNum must be a number',
      );
      expect(subsection.setFirstObjNum(21)).toBe(subsection);
    });

    it(`sets the "firstObjNum" member`, () => {
      const subsection = PDFXRef.Subsection.from();
      expect(subsection.firstObjNum).toBeUndefined();

      subsection.setFirstObjNum(21);
      expect(subsection.firstObjNum).toBe(21);
    });
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFXRef.Subsection as a string`, () => {
      const entry1 = PDFXRef.Entry.create()
        .setOffset(21)
        .setGenerationNum(3)
        .setIsInUse(true);
      const entry2 = PDFXRef.Entry.create()
        .setOffset(54)
        .setGenerationNum(3)
        .setIsInUse(false);
      const subsection = PDFXRef.Subsection.from([
        entry1,
        entry2,
      ]).setFirstObjNum(21);

      expect(subsection.toString()).toBe(
        `21 2\n` + `0000000021 00003 n \n` + `0000000054 00003 f \n`,
      );
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFXRef.Entry in bytes`, () => {
      const entry1 = PDFXRef.Entry.create()
        .setOffset(21)
        .setGenerationNum(3)
        .setIsInUse(true);
      const entry2 = PDFXRef.Entry.create()
        .setOffset(54)
        .setGenerationNum(3)
        .setIsInUse(false);
      const subsection = PDFXRef.Subsection.from([
        entry1,
        entry2,
      ]).setFirstObjNum(21);

      expect(subsection.bytesSize()).toBe(45);
    });
  });
});

describe(`PDFXRef.Table`, () => {
  it(`requires a PDFXRef.Subsection[] to be constructed`, () => {
    expect(() => new PDFXRef.Table(['foo'])).toThrowError(
      'subsections must be an array of PDFXRef.Subsection',
    );
    expect(new PDFXRef.Table([PDFXRef.Subsection.from()])).toBeInstanceOf(
      PDFXRef.Table,
    );
  });

  it(`has a static "from" factory method`, () => {
    expect(() => PDFXRef.Table.from(['foo'])).toThrowError(
      'subsections must be an array of PDFXRef.Subsection',
    );
    expect(PDFXRef.Table.from([PDFXRef.Subsection.from()])).toBeInstanceOf(
      PDFXRef.Table,
    );
  });

  describe(`"addSubsection" method`, () => {
    it(`requires a PDFXRef.Subsection as its argument`, () => {
      const table = PDFXRef.Table.from();
      expect(() => table.addSubsection('foo')).toThrowError(
        '"subsection" must be instance of PDFXRef.Subsection',
      );
      expect(table.addSubsection(PDFXRef.Subsection.from())).toBe(table);
    });

    it(`adds the PDFXRef.Subsection to the subsections array`, () => {
      const table = PDFXRef.Table.from();
      const subsection = PDFXRef.Subsection.from();
      table.addSubsection(subsection);

      expect(table.subsections).toEqual([subsection]);
    });
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFXRef.Table as a string`, () => {
      const entry1 = PDFXRef.Entry.create()
        .setOffset(21)
        .setGenerationNum(3)
        .setIsInUse(true);
      const subsection1 = PDFXRef.Subsection.from([entry1]).setFirstObjNum(21);

      const entry2 = PDFXRef.Entry.create()
        .setOffset(54)
        .setGenerationNum(5)
        .setIsInUse(false);
      const subsection2 = PDFXRef.Subsection.from([entry2]).setFirstObjNum(25);

      const table = PDFXRef.Table.from([subsection1, subsection2]);

      expect(table.toString()).toBe(
        `xref\n` +
          `21 1\n` +
          `0000000021 00003 n \n` +
          `\n` +
          `25 1\n` +
          `0000000054 00005 f \n` +
          `\n`,
      );
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFXRef.Entry in bytes`, () => {
      const entry1 = PDFXRef.Entry.create()
        .setOffset(21)
        .setGenerationNum(3)
        .setIsInUse(true);
      const subsection1 = PDFXRef.Subsection.from([entry1]).setFirstObjNum(21);

      const entry2 = PDFXRef.Entry.create()
        .setOffset(54)
        .setGenerationNum(5)
        .setIsInUse(false);
      const subsection2 = PDFXRef.Subsection.from([entry2]).setFirstObjNum(25);

      const table = PDFXRef.Table.from([subsection1, subsection2]);

      expect(table.bytesSize()).toBe(57);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFXRef.Table into the buffer as bytes`, () => {
      const entry1 = PDFXRef.Entry.create()
        .setOffset(21)
        .setGenerationNum(3)
        .setIsInUse(true);
      const subsection1 = PDFXRef.Subsection.from([entry1]).setFirstObjNum(21);

      const entry2 = PDFXRef.Entry.create()
        .setOffset(54)
        .setGenerationNum(5)
        .setIsInUse(false);
      const subsection2 = PDFXRef.Subsection.from([entry2]).setFirstObjNum(25);

      const table = PDFXRef.Table.from([subsection1, subsection2]);

      const buffer = new Uint8Array(table.bytesSize());
      table.copyBytesInto(buffer);

      expect(buffer).toEqual(
        typedArrayFor(
          `xref\n` +
            `21 1\n` +
            `0000000021 00003 n \n` +
            `\n` +
            `25 1\n` +
            `0000000054 00005 f \n` +
            `\n`,
        ),
      );
    });
  });
});
