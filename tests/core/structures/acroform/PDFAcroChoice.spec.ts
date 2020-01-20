import {
  DictMap,
  PDFAcroChoice,
  PDFArray,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
} from 'src/index';

describe('PDFAcroChoice', () => {
  let context: PDFContext;
  let dict: DictMap;

  beforeEach(() => {
    context = PDFContext.create();
  });

  it('can be created from a PDFDict', () => {
    dict = new Map([[PDFName.FT, PDFName.Ch]]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const choiceField = PDFAcroChoice.fromDict(acroFormFieldDict);
    expect(choiceField).toBeInstanceOf(PDFAcroChoice);
  });

  it('can return the options array', () => {
    const options = PDFArray.withContext(context);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.Opt, options],
      [PDFName.FT, PDFName.Ch],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const choiceField = PDFAcroChoice.fromDict(acroFormFieldDict);
    expect(choiceField.Opt()).toBe(options);
  });

  it('can return the top index', () => {
    const topIndex = PDFNumber.of(1);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Ch],
      [PDFName.TI, topIndex],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const choiceField = PDFAcroChoice.fromDict(acroFormFieldDict);
    expect(choiceField.TI()).toEqual(PDFNumber.of(1));
  });

  it('can return the selection options indices array', () => {
    const optionIndicesArray = PDFArray.withContext(context);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.I, optionIndicesArray],
      [PDFName.FT, PDFName.Ch],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const choiceField = PDFAcroChoice.fromDict(acroFormFieldDict);
    expect(choiceField.I()).toBe(optionIndicesArray);
  });

  it('can return whether the choice field is a combo box', () => {
    const fieldFlags = PDFNumber.of(1 << 17);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Ch],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const choiceField = PDFAcroChoice.fromDict(acroFormFieldDict);
    expect(choiceField.isCombo()).toBe(true);
  });

  it('can return whether the choice field has an editable text box', () => {
    const fieldFlags = PDFNumber.of(1 << 18);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Ch],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const choiceField = PDFAcroChoice.fromDict(acroFormFieldDict);
    expect(choiceField.isEditable()).toBe(true);
  });

  it('can return whether the choices are sorted alphabetically', () => {
    const fieldFlags = PDFNumber.of(1 << 19);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Ch],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const choiceField = PDFAcroChoice.fromDict(acroFormFieldDict);
    expect(choiceField.isSorted()).toBe(true);
  });

  it('can return whether the field is a multi-select', () => {
    const fieldFlags = PDFNumber.of(1 << 21);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Ch],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const choiceField = PDFAcroChoice.fromDict(acroFormFieldDict);
    expect(choiceField.isMultiSelect()).toBe(true);
  });

  it('can return whether conforming readers will spell-check the field', () => {
    const fieldFlags = PDFNumber.of(1 << 22);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Ch],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const choiceField = PDFAcroChoice.fromDict(acroFormFieldDict);
    expect(choiceField.isSpellChecked()).toBe(false);
  });

  it('can return whether a selection change is committed before the user leaves the field', () => {
    const fieldFlags = PDFNumber.of(1 << 26);
    dict = new Map<PDFName, PDFObject>([
      [PDFName.FT, PDFName.Ch],
      [PDFName.Ff, fieldFlags],
    ]);
    const acroFormFieldDict = PDFDict.fromMapWithContext(dict, context);
    const choiceField = PDFAcroChoice.fromDict(acroFormFieldDict);
    expect(choiceField.isCommittedOnSelChange()).toBe(true);
  });
});
