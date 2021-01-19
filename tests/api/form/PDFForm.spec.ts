import fs from 'fs';
import {
  PDFDocument,
  PDFTextField,
  PDFCheckBox,
  PDFButton,
  PDFRadioGroup,
  PDFOptionList,
  PDFDropdown,
  PDFWidgetAnnotation,
  PDFDict,
  PDFName,
  PDFForm,
  PDFAcroForm,
  PDFRef,
} from 'src/index';

const getWidgets = (pdfDoc: PDFDocument) =>
  pdfDoc.context
    .enumerateIndirectObjects()
    .map(([, obj]) => obj)
    .filter(
      (obj) =>
        obj instanceof PDFDict &&
        obj.get(PDFName.of('Type')) === PDFName.of('Annot') &&
        obj.get(PDFName.of('Subtype')) === PDFName.of('Widget'),
    )
    .map((obj) => obj as PDFDict);

const getRefs = (pdfDoc: PDFDocument) =>
  pdfDoc.context.enumerateIndirectObjects().map(([ref]) => ref as PDFRef);

const getApRefs = (widget: PDFWidgetAnnotation) => {
  const onValue = widget.getOnValue() ?? PDFName.of('Yes');
  const aps = widget.getAppearances();
  return [
    (aps?.normal as PDFDict).get(onValue),
    (aps?.rollover as PDFDict | undefined)?.get(onValue),
    (aps?.down as PDFDict | undefined)?.get(onValue),
    (aps?.normal as PDFDict).get(PDFName.of('Off')),
    (aps?.rollover as PDFDict | undefined)?.get(PDFName.of('Off')),
    (aps?.down as PDFDict | undefined)?.get(PDFName.of('Off')),
  ].filter(Boolean);
};

const flatten = <T>(arr: T[][]): T[] =>
  arr.reduce((curr, acc) => [...acc, ...curr], []);

const fancyFieldsPdfBytes = fs.readFileSync('assets/pdfs/fancy_fields.pdf');
// const sampleFormPdfBytes = fs.readFileSync('assets/pdfs/sample_form.pdf');
// const combedPdfBytes = fs.readFileSync('assets/pdfs/with_combed_fields.pdf');
// const dodPdfBytes = fs.readFileSync('assets/pdfs/dod_character.pdf');
const xfaPdfBytes = fs.readFileSync('assets/pdfs/with_xfa_fields.pdf');
const signaturePdfBytes = fs.readFileSync('assets/pdfs/with_signature.pdf');

describe(`PDFForm`, () => {
  const origConsoleWarn = console.warn;

  beforeAll(() => {
    const ignoredWarnings = [
      'Removing XFA form data as pdf-lib does not support reading or writing XFA',
    ];
    console.warn = jest.fn((...args) => {
      const isIgnored = ignoredWarnings.find((iw) => args[0].includes(iw));
      if (!isIgnored) origConsoleWarn(...args);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    console.warn = origConsoleWarn;
  });

  // prettier-ignore
  it(`provides access to all terminal fields in an AcroForm`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    expect(fields.length).toBe(15);

    expect(form.getField('Prefix ⚽️')).toBeInstanceOf(PDFTextField);
    expect(form.getField('First Name 🚀')).toBeInstanceOf(PDFTextField);
    expect(form.getField('MiddleInitial 🎳')).toBeInstanceOf(PDFTextField);
    expect(form.getField('LastName 🛩')).toBeInstanceOf(PDFTextField);
    expect(form.getField('Are You A Fairy? 🌿')).toBeInstanceOf(PDFCheckBox);
    expect(form.getField('Is Your Power Level Over 9000? 💪')).toBeInstanceOf(PDFCheckBox);
    expect(form.getField('Can You Defeat Enemies In One Punch? 👊')).toBeInstanceOf(PDFCheckBox);
    expect(form.getField('Will You Ever Let Me Down? ☕️')).toBeInstanceOf(PDFCheckBox);
    expect(form.getField('Eject 📼')).toBeInstanceOf(PDFButton);
    expect(form.getField('Submit 📝')).toBeInstanceOf(PDFButton);
    expect(form.getField('Play ▶️')).toBeInstanceOf(PDFButton);
    expect(form.getField('Launch 🚀')).toBeInstanceOf(PDFButton);
    expect(form.getField('Historical Figures 🐺')).toBeInstanceOf(PDFRadioGroup);
    expect(form.getField('Which Are Planets? 🌎')).toBeInstanceOf(PDFOptionList);
    expect(form.getField('Choose A Gundam 🤖')).toBeInstanceOf(PDFDropdown);

    const fieldDicts = fields.map(f => f.acroField.dict);
    const getFieldDict = (name: string) => form.getField(name)?.acroField.dict;

    expect(fieldDicts).toContain(getFieldDict('Prefix ⚽️'));
    expect(fieldDicts).toContain(getFieldDict('First Name 🚀'));
    expect(fieldDicts).toContain(getFieldDict('MiddleInitial 🎳'));
    expect(fieldDicts).toContain(getFieldDict('LastName 🛩'));
    expect(fieldDicts).toContain(getFieldDict('Are You A Fairy? 🌿'));
    expect(fieldDicts).toContain(getFieldDict('Is Your Power Level Over 9000? 💪'));
    expect(fieldDicts).toContain(getFieldDict('Can You Defeat Enemies In One Punch? 👊'));
    expect(fieldDicts).toContain(getFieldDict('Will You Ever Let Me Down? ☕️'));
    expect(fieldDicts).toContain(getFieldDict('Eject 📼'));
    expect(fieldDicts).toContain(getFieldDict('Submit 📝'));
    expect(fieldDicts).toContain(getFieldDict('Play ▶️'));
    expect(fieldDicts).toContain(getFieldDict('Launch 🚀'));
    expect(fieldDicts).toContain(getFieldDict('Historical Figures 🐺'));
    expect(fieldDicts).toContain(getFieldDict('Which Are Planets? 🌎'));
    expect(fieldDicts).toContain(getFieldDict('Choose A Gundam 🤖'));
  });

  // Need to also run this test with assets/pdfs/with_xfa_fields.pdf as it has "partial/50%" APs for checkboxes (is only missing the /Off APs)
  it(`does not override existing appearance streams for check boxes and radio groups if they already exist`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();

    // Get fields
    const cb1 = form.getCheckBox('Are You A Fairy? 🌿');
    const cb2 = form.getCheckBox('Is Your Power Level Over 9000? 💪');
    const cb3 = form.getCheckBox('Can You Defeat Enemies In One Punch? 👊');
    const cb4 = form.getCheckBox('Will You Ever Let Me Down? ☕️');
    const rg1 = form.getRadioGroup('Historical Figures 🐺');

    // Assert preconditions
    expect(cb1.isChecked()).toBe(true);
    expect(cb2.isChecked()).toBe(false);
    expect(cb3.isChecked()).toBe(true);
    expect(cb4.isChecked()).toBe(false);
    expect(rg1.getSelected()).toEqual('Marcus Aurelius 🏛️');

    // Collect all existing appearance streams
    const fields = [cb1, cb2, cb3, cb4, rg1];
    const widgets = flatten(fields.map((f) => f.acroField.getWidgets()));
    const originalAps = flatten(widgets.map(getApRefs));

    // (1) Run appearance update
    form.updateFieldAppearances();

    // (1) Make sure no new appearance streams were created
    expect(flatten(widgets.map(getApRefs))).toEqual(originalAps);

    // (2) Flip check box values
    cb1.uncheck();
    cb2.check();
    cb3.uncheck();
    cb4.check();

    // (2) un appearance update
    form.updateFieldAppearances();

    // (2) Make sure no new appearance streams were created
    expect(flatten(widgets.map(getApRefs))).toEqual(originalAps);

    // (3) Change radio group value
    rg1.select('Alexander Hamilton 🇺🇸');

    // (3) Run appearance update
    form.updateFieldAppearances();

    // (3) Make sure a new appearance stream was created
    expect(flatten(widgets.map(getApRefs))).not.toEqual(originalAps);
  });

  it(`creates appearance streams for widgets that do not have any`, async () => {
    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage();

    const form = pdfDoc.getForm();

    const btn = form.createButton('a.button.field');
    const cb = form.createCheckBox('a.checkbox.field');
    const dd = form.createDropdown('a.dropdown.field');
    const ol = form.createOptionList('a.optionlist.field');
    const tf = form.createTextField('a.text.field');

    // Skipping Radio Groups for this test as they _must_ have APs or else the
    // value represented by each radio button is undefined.
    //   const rg = form.createRadioGroup('a.radiogroup.field');

    btn.addToPage('foo', page);
    cb.addToPage(page);
    dd.addToPage(page);
    ol.addToPage(page);
    tf.addToPage(page);
    // rg.addOptionToPage('bar', page);

    const widgets = getWidgets(pdfDoc);

    expect(widgets.length).toBe(5);

    const aps = () => widgets.filter((w) => w.has(PDFName.of('AP'))).length;

    expect(aps()).toBe(5);

    widgets.forEach((w) => w.delete(PDFName.of('AP')));

    expect(aps()).toBe(0);

    form.updateFieldAppearances();

    expect(aps()).toBe(5);
  });

  it(`removes XFA entries when it is accessed`, async () => {
    const pdfDoc = await PDFDocument.load(xfaPdfBytes);
    const acroForm = pdfDoc.catalog.getOrCreateAcroForm();
    expect(acroForm.dict.has(PDFName.of('XFA'))).toBe(true);
    expect(pdfDoc.getForm()).toBeInstanceOf(PDFForm);
    expect(acroForm.dict.has(PDFName.of('XFA'))).toBe(false);
  });

  it(`is only created if it is accessed`, async () => {
    const pdfDoc = await PDFDocument.create();
    expect(pdfDoc.catalog.getAcroForm()).toBe(undefined);
    expect(pdfDoc.getForm()).toBeInstanceOf(PDFForm);
    expect(pdfDoc.catalog.getAcroForm()).toBeInstanceOf(PDFAcroForm);
  });

  it(`does not update appearance streams if "updateFieldAppearances" is true, but no fields are dirty`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);

    const widgets = getWidgets(pdfDoc);
    expect(widgets.length).toBe(24);

    const aps = () => widgets.filter((w) => w.has(PDFName.of('AP'))).length;
    expect(aps()).toBe(24);

    widgets.forEach((w) => w.delete(PDFName.of('AP')));
    expect(aps()).toBe(0);

    await pdfDoc.save({ updateFieldAppearances: true });
    expect(aps()).toBe(0);
  });

  it(`does not update appearance streams if "updateFieldAppearances" is false, even if fields are dirty`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);

    const widgets = getWidgets(pdfDoc);
    expect(widgets.length).toBe(24);

    const aps = () => widgets.filter((w) => w.has(PDFName.of('AP'))).length;
    expect(aps()).toBe(24);

    widgets.forEach((w) => w.delete(PDFName.of('AP')));
    expect(aps()).toBe(0);

    const form = pdfDoc.getForm();
    form.getFields().forEach((f) => form.markFieldAsDirty(f.ref));

    await pdfDoc.save({ updateFieldAppearances: false });
    expect(aps()).toBe(0);
  });

  it(`does update appearance streams if "updateFieldAppearances" is true, and fields are dirty`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);

    const widgets = getWidgets(pdfDoc);
    expect(widgets.length).toBe(24);

    const aps = () => widgets.filter((w) => w.has(PDFName.of('AP'))).length;
    expect(aps()).toBe(24);

    widgets.forEach((w) => w.delete(PDFName.of('AP')));
    expect(aps()).toBe(0);

    const form = pdfDoc.getForm();
    form.getFields().forEach((f) => form.markFieldAsDirty(f.ref));

    await pdfDoc.save({ updateFieldAppearances: true });
    expect(aps()).toBe(20);
  });

  it.only(`does not throw errors for PDFSignature fields`, async () => {
    const pdfDoc = await PDFDocument.load(signaturePdfBytes);

    const widgets = getWidgets(pdfDoc);
    expect(widgets.length).toBe(1);

    const form = pdfDoc.getForm();

    expect(() => form.updateFieldAppearances()).not.toThrow();

    expect(
      pdfDoc.save({ updateFieldAppearances: true }),
    ).resolves.toBeInstanceOf(Uint8Array);
  });

  it.only(`it cleans references of removed fields`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    let refs = getRefs(pdfDoc);

    const cb = form.getCheckBox('Will You Ever Let Me Down? ☕️');
    const rg = form.getRadioGroup('Historical Figures 🐺');

    expect(refs.includes(cb.ref)).toBe(true);
    expect(refs.includes(rg.ref)).toBe(true);

    form.removeField(cb);
    form.removeField(rg);

    refs = getRefs(pdfDoc);
    
    expect(refs.includes(cb.ref)).toBe(false);
    expect(refs.includes(rg.ref)).toBe(false);
  });

  // TODO: Add method to remove APs and use `NeedsAppearances`? How would this
  //       work with RadioGroups? Just set the APs to `null`but keep the keys?
});
