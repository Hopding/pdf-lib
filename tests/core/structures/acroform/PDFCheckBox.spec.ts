import {
  DictMap,
  PDFArray,
  PDFCheckBox,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
} from 'src/index';

describe('PDFCheckBox', () => {
  let context: PDFContext;
  let dict: DictMap;

  beforeEach(() => {
    context = PDFContext.create();
    dict = new Map([[PDFName.FT, PDFName.Btn]]);
  });

  it('can be constructed from a PDFDict', () => {
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Btn],
      [PDFName.Ff, PDFNumber.of(1 << 16 && 1 << 17)],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const checkbox = PDFCheckBox.fromDict(acroFormFieldDict);
    expect(checkbox).toBeInstanceOf(PDFCheckBox);
    expect(checkbox.getFlags()).toEqual(0);
  });

  describe('can return the options array', () => {
    it('when it is defined', () => {
      const optionsArray = PDFArray.withContext(context);
      dict = new Map<PDFName, PDFObject>([
        [PDFName.FT, PDFName.Btn],
        [PDFName.Opt, optionsArray],
      ]);
      const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
      const checkbox = PDFCheckBox.fromDict(acroFormFieldDict);
      expect(checkbox.Opt()).toBe(optionsArray);
    });

    it('when it is undefined', () => {
      const acroFormFieldDict = PDFDict.fromMapWithContext(
        new Map([[PDFName.FT, PDFName.Btn]]),
        context,
      );
      const checkbox = PDFCheckBox.fromDict(acroFormFieldDict);
      expect(checkbox.Opt()).toBe(undefined);
    });
  });

  it('can return the options as an array of PDFString', () => {
    const optionsArray = PDFArray.withContext(context);
    optionsArray.push(PDFName.Yes);
    optionsArray.push(PDFName.Off);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Btn],
      [PDFName.Opt, optionsArray],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const checkbox = PDFCheckBox.fromDict(acroFormFieldDict);
    expect(checkbox.getOptions()).toEqual([PDFName.Yes, PDFName.Off]);
  });

  it('can check the checkbox', () => {
    const acroFormFieldDict = PDFDict.fromMapWithContext(
      new Map([
        [PDFName.FT, PDFName.Btn],
        [PDFName.V, PDFName.Off],
      ]),
      context,
    );
    const checkbox = PDFCheckBox.fromDict(acroFormFieldDict);
    checkbox.check();
    expect(checkbox.V()).toEqual(PDFName.Yes);
  });

  it('can uncheck the checkbox', () => {
    const acroFormFieldDict = PDFDict.fromMapWithContext(
      new Map([
        [PDFName.FT, PDFName.Btn],
        [PDFName.V, PDFName.Yes],
      ]),
      context,
    );
    const checkbox = PDFCheckBox.fromDict(acroFormFieldDict);
    checkbox.uncheck();
    expect(checkbox.V()).toEqual(PDFName.Off);
  });

  it('can toggle the checkbox state', () => {
    const acroFormFieldDict = PDFDict.fromMapWithContext(
      new Map([
        [PDFName.FT, PDFName.Btn],
        [PDFName.V, PDFName.Off],
      ]),
      context,
    );
    const checkbox = PDFCheckBox.fromDict(acroFormFieldDict);
    checkbox.toggle();
    expect(checkbox.V()).toEqual(PDFName.Yes);
    checkbox.toggle();
    expect(checkbox.V()).toEqual(PDFName.Off);
  });

  it('can set the value', () => {
    const acroFormFieldDict = PDFDict.fromMapWithContext(
      new Map([
        [PDFName.FT, PDFName.Btn],
        [PDFName.V, PDFName.Off],
      ]),
      context,
    );
    const checkbox = PDFCheckBox.fromDict(acroFormFieldDict);
    checkbox.setValue(PDFName.Yes);
    expect(checkbox.V()).toEqual(PDFName.Yes);
  });
});
