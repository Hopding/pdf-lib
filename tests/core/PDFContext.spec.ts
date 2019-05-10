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
  it(`retains assigned objects`, () => {
    const context = PDFContext.create();

    const pdfBool = PDFBool.True;
    const pdfHexString = PDFHexString.of('ABC123');
    const pdfName = PDFName.of('Foo#Bar!');
    const pdfNull = PDFNull;
    const pdfNumber = PDFNumber.of(-24.179);
    const pdfString = PDFString.of('foobar');
    const pdfDict = context.obj({ Foo: PDFName.of('Bar') });
    const pdfArray = context.obj([PDFBool.True, pdfDict]);

    context.assign(PDFRef.of(0), pdfBool);
    context.assign(PDFRef.of(1), pdfHexString);
    context.assign(PDFRef.of(2), pdfName);
    context.assign(PDFRef.of(3), pdfNull);
    context.assign(PDFRef.of(4), pdfNumber);
    context.assign(PDFRef.of(5), pdfString);
    context.assign(PDFRef.of(6), pdfDict);
    context.assign(PDFRef.of(7), pdfArray);

    expect(context.lookup(PDFRef.of(0))).toBe(pdfBool);
    expect(context.lookup(PDFRef.of(1))).toBe(pdfHexString);
    expect(context.lookup(PDFRef.of(2))).toBe(pdfName);
    expect(context.lookup(PDFRef.of(3))).toBe(pdfNull);
    expect(context.lookup(PDFRef.of(4))).toBe(pdfNumber);
    expect(context.lookup(PDFRef.of(5))).toBe(pdfString);
    expect(context.lookup(PDFRef.of(6))).toBe(pdfDict);
    expect(context.lookup(PDFRef.of(7))).toBe(pdfArray);
  });

  it(`does not use object number 0 during registration`, () => {
    const context = PDFContext.create();
    expect(context.register(PDFBool.True)).toBe(PDFRef.of(1));
  });

  it(`returns the given object during lookup if it is not a PDFRef`, () => {
    const context = PDFContext.create();
    const pdfNumber = PDFNumber.of(21);
    expect(context.lookup(pdfNumber)).toBe(pdfNumber);
  });

  it(`assigns the next highest object number during registration`, () => {
    const context = PDFContext.create();

    const pdfBool = PDFBool.True;
    const pdfName = PDFName.of('FooBar');
    const pdfNumber = PDFNumber.of(-21.436);

    const boolRef = context.register(pdfBool);
    expect(boolRef).toBe(PDFRef.of(1));
    expect(context.lookup(boolRef)).toBe(pdfBool);

    context.assign(PDFRef.of(9000), pdfName);

    const numberRef = context.register(pdfNumber);
    expect(numberRef).toBe(PDFRef.of(9001));
    expect(context.lookup(numberRef)).toBe(pdfNumber);
  });

  describe(`literal conversions`, () => {
    const context = PDFContext.create();

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
