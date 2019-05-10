import {
  PDFArray,
  PDFBool,
  PDFContext,
  PDFDict,
  PDFHexString,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFRef,
  PDFString,
} from 'src/core';

describe(`PDFContext`, () => {
  const context = new PDFContext();

  describe(`literal conversions`, () => {
    it(`converts null literals to the PDFNull instance`, () => {
      expect(context.obj(null)).toBe(PDFNull);
    });

    it(`converts string literals to PDFString instances`, () => {
      expect(context.obj('foobar')).toBeInstanceOf(PDFString);
      expect(context.obj('foobar').toString()).toBe('(foobar)');
    });

    it(`converts number literals to PDFNumber instances`, () => {
      expect(context.obj(-21.4e-3)).toBeInstanceOf(PDFNumber);
      expect(context.obj(-21.4e-3).toString()).toBe('-0.0214');
    });

    it(`converts boolean literals to PDFBool instances`, () => {
      expect(context.obj(true)).toBe(PDFBool.True);
      expect(context.obj(false)).toBe(PDFBool.False);
    });

    it(`converts array literals to PDFArray instances`, () => {
      const array = [
        PDFRef.of(21),
        true,
        PDFHexString.of('ABC123'),
        PDFName.of('Foo#Bar!'),
        [null, -24.179],
        'foobar',
        { Foo: PDFName.of('Bar') },
      ];
      expect(context.obj(array)).toBeInstanceOf(PDFArray);
      expect(context.obj(array).toString()).toEqual(
        '[ 21 0 R true <ABC123> /Foo#23Bar! [ null -24.179 ] (foobar) <<\n/Foo /Bar\n>> ]',
      );
    });

    it(`converts object literals to PDFDict instances`, () => {
      const dict = {
        Ref: PDFRef.of(21),
        Boolean: true,
        HexString: PDFHexString.of('ABC123'),
        Name: PDFName.of('Foo#Bar!'),
        Null: null,
        Number: -24.179,
        String: 'foobar',
        Dictionary: { Array: [true, null] },
      };
      expect(context.obj(dict)).toBeInstanceOf(PDFDict);
      expect(context.obj(dict).toString()).toEqual(
        `<<
/Ref 21 0 R
/Boolean true
/HexString <ABC123>
/Name /Foo#23Bar!
/Null null
/Number -24.179
/String (foobar)
/Dictionary <<
/Array [ true null ]
>>
>>`,
      );
    });
  });
});
