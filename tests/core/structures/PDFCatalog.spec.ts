import { PDFCatalog, PDFContext, PDFDict, PDFName, PDFRef } from 'src/index';

describe(`PDFCatalog`, () => {
  it(`can be constructed directly from a Map and PDFContext`, () => {
    const context = PDFContext.create();
    const dict = new Map();
    const catalog = PDFCatalog.fromMapWithContext(dict, context);

    expect(catalog).toBeInstanceOf(PDFCatalog);
    expect(catalog.get(PDFName.of('Type'))).toBeUndefined();
    expect(catalog.get(PDFName.of('Pages'))).toBeUndefined();
  });

  it(`is constructed with the correct Type and entries`, () => {
    const context = PDFContext.create();
    const pagesRef = PDFRef.of(21);
    const catalog = PDFCatalog.withContextAndPages(context, pagesRef);

    expect(catalog).toBeInstanceOf(PDFCatalog);
    expect(catalog.get(PDFName.of('Type'))).toBe(PDFName.of('Catalog'));
    expect(catalog.get(PDFName.of('Pages'))).toBe(pagesRef);
  });

  it(`returns its Pages entry value when it's a reference`, () => {
    const context = PDFContext.create();
    const pages = PDFDict.withContext(context);
    const pagesRef = context.register(pages);
    const catalog = PDFCatalog.withContextAndPages(context, pagesRef);

    expect(catalog.Pages()).toBe(pages);
  });

  it(`returns its Pages entry value when it's a direct object`, () => {
    const context = PDFContext.create();
    const pages = PDFDict.withContext(context);
    const catalog = PDFCatalog.withContextAndPages(context, pages);

    expect(catalog.Pages()).toBe(pages);
  });
});
