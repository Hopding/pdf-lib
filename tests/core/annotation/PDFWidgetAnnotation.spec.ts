import {
  PDFWidgetAnnotation,
  PDFContext,
  PDFString,
  PDFHexString,
  PDFName,
  PDFNull,
} from '../../../src/index';

describe(`PDFWidgetAnnotation`, () => {
  it(`returns undefined for missing (DAs)`, () => {
    const context = PDFContext.create();

    const parentRef = context.nextRef();
    const widget = PDFWidgetAnnotation.create(context, parentRef);
    widget.dict.set(PDFName.of('DA'), PDFNull);

    expect(widget.getDefaultAppearance()).toBe(undefined);
  });

  it(`returns normal direct appearance strings (DAs)`, () => {
    const context = PDFContext.create();

    const parentRef = context.nextRef();
    const widget = PDFWidgetAnnotation.create(context, parentRef);
    widget.dict.set(PDFName.of('DA'), PDFString.of('/ZaDb 10 Tf 0 g'));

    expect(widget.getDefaultAppearance()).toBe('/ZaDb 10 Tf 0 g');
  });

  it(`returns hexadecimal (non-standard) direct appearance strings (DAs)`, () => {
    const context = PDFContext.create();

    const parentRef = context.nextRef();
    const widget = PDFWidgetAnnotation.create(context, parentRef);
    widget.dict.set(PDFName.of('DA'), PDFHexString.fromText('/ZaDb 10 Tf 0 g'));

    expect(widget.getDefaultAppearance()).toBe('/ZaDb 10 Tf 0 g');
  });
});
