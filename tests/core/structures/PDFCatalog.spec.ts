import {
  PDFCatalog,
  PDFContext,
  PDFDict,
  PDFName,
  PDFPageLeaf,
  PDFPageTree,
  PDFRef,
} from '../../../src/index';

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
    const pages = PDFPageTree.withContext(context);
    const catalog = PDFCatalog.withContextAndPages(context, pages);

    expect(catalog.Pages()).toBe(pages);
  });

  it(`can insert leaf nodes`, () => {
    const context = PDFContext.create();

    const pageTree1 = PDFPageTree.withContext(context);
    const pageTreeRef1 = context.register(pageTree1);

    const catalog = PDFCatalog.withContextAndPages(context, pageTreeRef1);

    const leaf1 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
    const leafRef1 = context.register(leaf1);

    const leaf2 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
    const leafRef2 = context.register(leaf2);

    pageTree1.pushLeafNode(leafRef1);
    pageTree1.pushLeafNode(leafRef2);

    expect(pageTree1.Count().asNumber()).toBe(2);
    expect(pageTree1.Kids().get(1)).toBe(leafRef2);
    expect(pageTree1.Kids().get(2)).toBe(undefined);

    const newLeaf = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
    const newLeafRef = context.register(newLeaf);
    const insertionRef = catalog.insertLeafNode(newLeafRef, 2);

    expect(pageTree1.Count().asNumber()).toBe(3);

    expect(insertionRef).toBe(pageTreeRef1);
    expect(pageTree1.Kids().get(1)).toBe(leafRef2);
    expect(pageTree1.Kids().get(2)).toBe(newLeafRef);
  });

  it(`can remove leaf nodes`, () => {
    const context = PDFContext.create();

    const pageTree1 = PDFPageTree.withContext(context);
    const pageTreeRef1 = context.register(pageTree1);

    const catalog = PDFCatalog.withContextAndPages(context, pageTreeRef1);

    const leaf1 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
    const leafRef1 = context.register(leaf1);

    const leaf2 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
    const leafRef2 = context.register(leaf2);

    pageTree1.pushLeafNode(leafRef1);
    pageTree1.pushLeafNode(leafRef2);

    expect(pageTree1.Count().asNumber()).toBe(2);
    expect(pageTree1.Kids().get(0)).toBe(leafRef1);
    expect(pageTree1.Kids().get(1)).toBe(leafRef2);

    catalog.removeLeafNode(1);

    expect(pageTree1.Count().asNumber()).toBe(1);
    expect(pageTree1.Kids().get(0)).toBe(leafRef1);
    expect(pageTree1.Kids().get(1)).toBe(undefined);
  });
});
