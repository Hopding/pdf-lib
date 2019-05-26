import { PDFContext, PDFName, PDFPageTree, PDFRef } from 'src/index';

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
    const kidsRef = PDFRef.of(1);
    const countRef = PDFRef.of(2);
    const pageTree = PDFPageTree.withContextAndKidsAndCount(
      context,
      kidsRef,
      countRef,
    );

    expect(pageTree).toBeInstanceOf(PDFPageTree);
    expect(pageTree.get(PDFName.of('Type'))).toBe(PDFName.of('Pages'));
    expect(pageTree.get(PDFName.of('Kids'))).toBe(kidsRef);
    expect(pageTree.get(PDFName.of('Count'))).toBe(countRef);
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

    const pageTree = PDFPageTree.withContextAndKidsAndCount(
      context,
      kidsRef,
      countRef,
      parentRef,
    );

    expect(pageTree.Parent()).toBe(parent);
    expect(pageTree.Kids()).toBe(kids);
    expect(pageTree.Count()).toBe(count);
  });

  it(`returns its Parent, Kids, and Count entry values when they are direct objects`, () => {
    const context = PDFContext.create();

    const kids = context.obj([]);

    const count = context.obj(0);

    const pageTree = PDFPageTree.withContextAndKidsAndCount(
      context,
      kids,
      count,
    );

    expect(pageTree.Parent()).toBeUndefined();
    expect(pageTree.Kids()).toBe(kids);
    expect(pageTree.Count()).toBe(count);
  });

  it(`can be ascended`, () => {
    const context = PDFContext.create();

    const kidsRef1 = PDFRef.of(1);
    const kidsRef2 = PDFRef.of(2);
    const kidsRef3 = PDFRef.of(3);

    const countRef1 = PDFRef.of(4);
    const countRef2 = PDFRef.of(5);
    const countRef3 = PDFRef.of(6);

    const pageTree1 = PDFPageTree.withContextAndKidsAndCount(
      context,
      kidsRef1,
      countRef1,
    );
    const pageTree1Ref = context.register(pageTree1);

    const pageTree2 = PDFPageTree.withContextAndKidsAndCount(
      context,
      kidsRef2,
      countRef2,
      pageTree1Ref,
    );
    const pageTree2Ref = context.register(pageTree2);

    const pageTree3 = PDFPageTree.withContextAndKidsAndCount(
      context,
      kidsRef3,
      countRef3,
      pageTree2Ref,
    );

    const visitations: PDFPageTree[] = [];
    pageTree3.ascend((node) => {
      visitations.push(node);
    });

    expect(visitations).toEqual([pageTree3, pageTree2, pageTree1]);
  });
});
