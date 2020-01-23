import {
  DictMap,
  PDFArray,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFRadioButton,
  PDFRef,
  PDFStream,
} from 'src/index';

describe('PDFRadioButton', () => {
  let context: PDFContext;
  let dict: DictMap;

  beforeEach(() => {
    const fieldFlags = PDFNumber.of(1 << 15);
    context = PDFContext.create();
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Btn],
      [PDFName.Ff, fieldFlags],
    ]);
  });

  describe('can return the options array', () => {
    it('when it is defined', () => {
      const optionsArray = PDFArray.withContext(context);
      dict.set(PDFName.Opt, optionsArray);
      const radioButtonDict = PDFDict.fromMapWithContext(dict, context);
      const radioButton = PDFRadioButton.fromDict(radioButtonDict);
      expect(radioButton.Opt()).toBe(optionsArray);
    });

    it('when it is undefined', () => {
      const radioButtonDict = PDFDict.fromMapWithContext(dict, context);
      const radioButton = PDFRadioButton.fromDict(radioButtonDict);
      expect(radioButton.Opt()).toBe(undefined);
    });
  });

  it('can return the options as an array of PDFName', () => {
    const optionsArray = PDFArray.withContext(context);
    optionsArray.push(PDFName.of('Option1'));
    dict.set(PDFName.Opt, optionsArray);
    const radioButtonDict = PDFDict.fromMapWithContext(dict, context);
    const radioButton = PDFRadioButton.fromDict(radioButtonDict);
    expect(radioButton.getOptions()).toEqual([PDFName.of('Option1')]);
  });

  it('can return whether the NoToggleToOff flag is set', () => {
    const fieldFlags = PDFNumber.of(1 << 14);
    dict.set(PDFName.Ff, fieldFlags);
    const radioButtonDict = PDFDict.fromMapWithContext(dict, context);
    const radioButton = PDFRadioButton.fromDict(radioButtonDict);
    expect(radioButton.NoToggleToOff()).toBe(true);
  });

  it('can return whether the RadiosInUnison flag is set', () => {
    const fieldFlags = PDFNumber.of(1 << 25);
    dict.set(PDFName.Ff, fieldFlags);
    const radioButtonDict = PDFDict.fromMapWithContext(dict, context);
    const radioButton = PDFRadioButton.fromDict(radioButtonDict);
    expect(radioButton.RadiosInUnison()).toBe(true);
  });

  it('can return the kids array', () => {
    const kidsArray = PDFArray.withContext(context);
    dict.set(PDFName.Kids, kidsArray);
    const radioButtonDict = PDFDict.fromMapWithContext(dict, context);
    const radioButton = PDFRadioButton.fromDict(radioButtonDict);
    expect(radioButton.Kids()).toBe(kidsArray);
  });

  it('can return the dereferenced kids PDFDict objects', () => {
    const childDict = PDFDict.fromMapWithContext(new Map(), context);
    const childDictRef = context.register(childDict);
    const kidsArray = PDFArray.withContext(context);
    kidsArray.push(childDictRef);
    dict.set(PDFName.Kids, kidsArray);
    const radioButtonDict = PDFDict.fromMapWithContext(dict, context);
    const radioButton = PDFRadioButton.fromDict(radioButtonDict);
    expect(radioButton.getKids()).toEqual([childDict]);
  });

  describe('can toggle an option', () => {
    let onAppearanceStream1: PDFStream;
    let onAppearanceStream2: PDFStream;
    let offAppearanceStream: PDFStream;
    let onAppearanceStream1Ref: PDFRef;
    let onAppearanceStream2Ref: PDFRef;
    let offAppearanceStreamRef: PDFRef;
    let firstChildNormalAppearanceDict: PDFDict;
    let secondChildNormalAppearanceDict: PDFDict;
    let firstChildAppearanceDict: PDFDict;
    let secondChildAppearanceDict: PDFDict;
    let firstChildDict: PDFDict;
    let secondChildDict: PDFDict;
    let firstChildRef: PDFRef;
    let secondChildRef: PDFRef;
    let radioButton: PDFRadioButton;

    beforeEach(() => {
      onAppearanceStream1 = new PDFStream(
        PDFDict.fromMapWithContext(new Map(), context),
      );
      onAppearanceStream1Ref = context.register(onAppearanceStream1);
      offAppearanceStream = new PDFStream(
        PDFDict.fromMapWithContext(new Map(), context),
      );
      offAppearanceStreamRef = context.register(offAppearanceStream);
      onAppearanceStream2 = new PDFStream(
        PDFDict.fromMapWithContext(new Map(), context),
      );
      onAppearanceStream2Ref = context.register(onAppearanceStream2);
      firstChildNormalAppearanceDict = PDFDict.fromMapWithContext(
        new Map([
          [PDFName.of('normal1'), onAppearanceStream1Ref],
          [PDFName.Off, offAppearanceStreamRef],
        ]),
        context,
      );
      secondChildNormalAppearanceDict = PDFDict.fromMapWithContext(
        new Map([
          [PDFName.of('normal2'), onAppearanceStream2Ref],
          [PDFName.Off, offAppearanceStreamRef],
        ]),
        context,
      );
      firstChildAppearanceDict = PDFDict.fromMapWithContext(
        new Map([[PDFName.N, firstChildNormalAppearanceDict]]),
        context,
      );
      secondChildAppearanceDict = PDFDict.fromMapWithContext(
        new Map([[PDFName.N, secondChildNormalAppearanceDict]]),
        context,
      );

      firstChildDict = PDFDict.fromMapWithContext(
        new Map<PDFName, PDFObject>([
          [PDFName.AP, firstChildAppearanceDict],
          [PDFName.Subtype, PDFName.Widget],
        ]),
        context,
      );
      secondChildDict = PDFDict.fromMapWithContext(
        new Map<PDFName, PDFObject>([
          [PDFName.AP, secondChildAppearanceDict],
          [PDFName.Subtype, PDFName.Widget],
        ]),
        context,
      );
      firstChildRef = context.register(firstChildDict);
      secondChildRef = context.register(secondChildDict);
      const kidsArray = PDFArray.withContext(context);
      kidsArray.push(firstChildRef);
      kidsArray.push(secondChildRef);
      dict.set(PDFName.Kids, kidsArray);
      const radioButtonDict = PDFDict.fromMapWithContext(dict, context);
      radioButton = PDFRadioButton.fromDict(radioButtonDict);
    });

    it('when no children are in unison and no option needs to be selected', () => {
      radioButton.toggle(0);
      expect(radioButton.getValue()).toEqual(PDFName.of('normal1'));
      radioButton.toggle(0);
      expect(radioButton.getValue()).toEqual(PDFName.Off);
    });

    it('when the radio button options cannot all be off', () => {
      dict.set(PDFName.Ff, PDFNumber.of(radioButton.getFlags() | (1 << 14)));
      radioButton.toggle(0);
      expect(radioButton.getValue()).toEqual(PDFName.of('normal1'));
    });
  });
});
