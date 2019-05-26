import {
  PDFArray,
  PDFContext,
  PDFName,
  PDFNumber,
  PDFPageTree,
} from 'src/index';

describe(`PDFPageTree`, () => {
  it(`can be constructed directly from a Map and PDFContext`, () => {
    const context = PDFContext.create();
    const dict = new Map();
    const pageTree = PDFPageTree.fromMapWithContext(dict, context);

    expect(pageTree).toBeInstanceOf(PDFPageTree);
    expect(pageTree.get(PDFName.of('Type'))).toBeUndefined();
    expect(pageTree.get(PDFName.of('Kids'))).toBeUndefined();
    expect(pageTree.get(PDFName.of('Count'))).toBeUndefined();
    expect(pageTree.get(PDFName.of('Parent'))).toBeUndefined();
  });

  it(`is constructed with the correct Type and entries`, () => {
    const context = PDFContext.create();
    const pageTree = PDFPageTree.withContext(context);

    expect(pageTree).toBeInstanceOf(PDFPageTree);
    expect(pageTree.get(PDFName.of('Type'))).toBe(PDFName.of('Pages'));
    expect(pageTree.get(PDFName.of('Kids'))).toBeInstanceOf(PDFArray);
    expect(pageTree.lookup(PDFName.of('Kids'), PDFArray).size()).toBe(0);
    expect(pageTree.get(PDFName.of('Count'))).toBeInstanceOf(PDFNumber);
    expect(pageTree.lookup(PDFName.of('Count'), PDFNumber).value()).toBe(0);
    expect(pageTree.get(PDFName.of('Parent'))).toBeUndefined();
  });

  it(`returns its Parent, Kids, and Count entry values when they are references`, () => {
    const context = PDFContext.create();

    const parent = context.obj({});
    const parentRef = context.register(parent);

    const kids = context.obj([]);
    const kidsRef = context.register(kids);

    const count = context.obj(0);
    const countRef = context.register(count);

    const pageTree = PDFPageTree.withContext(context, parentRef);
    pageTree.set(PDFName.of('Kids'), kidsRef);
    pageTree.set(PDFName.of('Count'), countRef);

    expect(pageTree.Parent()).toBe(parent);
    expect(pageTree.Kids()).toBe(kids);
    expect(pageTree.Count()).toBe(count);
  });

  it(`returns its Parent, Kids, and Count entry values when they are direct objects`, () => {
    const context = PDFContext.create();

    const kids = context.obj([]);

    const count = context.obj(0);

    const pageTree = PDFPageTree.withContext(context);
    pageTree.set(PDFName.of('Kids'), kids);
    pageTree.set(PDFName.of('Count'), count);

    expect(pageTree.Parent()).toBeUndefined();
    expect(pageTree.Kids()).toBe(kids);
    expect(pageTree.Count()).toBe(count);
  });

  it(`can be ascended`, () => {
    const context = PDFContext.create();

    const pageTree1 = PDFPageTree.withContext(context);
    const pageTree1Ref = context.register(pageTree1);

    const pageTree2 = PDFPageTree.withContext(context, pageTree1Ref);
    const pageTree2Ref = context.register(pageTree2);

    const pageTree3 = PDFPageTree.withContext(context, pageTree2Ref);

    const visitations: PDFPageTree[] = [];
    pageTree3.ascend((node) => {
      visitations.push(node);
    });

    expect(visitations).toEqual([pageTree3, pageTree2, pageTree1]);
  });
});
