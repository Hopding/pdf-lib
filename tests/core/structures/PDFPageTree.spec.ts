import { TreeNode } from 'src/core/structures/PDFPageTree';
import {
  PDFArray,
  PDFContext,
  PDFName,
  PDFNumber,
  PDFPageLeaf,
  PDFPageTree,
  PDFRef,
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

  it(`can perform a Post-Order traversal`, () => {
    const context = PDFContext.create();

    const rootPageTree = PDFPageTree.withContext(context);
    const rootPageTreeRef = context.register(rootPageTree);

    const leftPageTree = PDFPageTree.withContext(context, rootPageTreeRef);
    const leftPageTreeRef = context.register(leftPageTree);

    const rightPageTree = PDFPageTree.withContext(context, rootPageTreeRef);
    const rightPageTreeRef = context.register(rightPageTree);

    const leaf1 = PDFPageLeaf.withContextAndParent(context, leftPageTreeRef);
    const leaf2 = PDFPageLeaf.withContextAndParent(context, leftPageTreeRef);
    const leaf3 = PDFPageLeaf.withContextAndParent(context, rootPageTreeRef);
    const leaf4 = PDFPageLeaf.withContextAndParent(context, rightPageTreeRef);
    const leaf5 = PDFPageLeaf.withContextAndParent(context, rootPageTreeRef);

    const leafRef1 = context.register(leaf1);
    const leafRef2 = context.register(leaf2);
    const leafRef3 = context.register(leaf3);
    const leafRef4 = context.register(leaf4);
    const leafRef5 = context.register(leaf5);

    rootPageTree.pushTreeNode(leftPageTreeRef);
    leftPageTree.pushLeafNode(leafRef1);
    leftPageTree.pushLeafNode(leafRef2);
    rootPageTree.pushLeafNode(leafRef3);
    rootPageTree.pushTreeNode(rightPageTreeRef);
    rightPageTree.pushLeafNode(leafRef4);
    rootPageTree.pushLeafNode(leafRef5);

    const visitations: Array<[TreeNode, PDFRef]> = [];
    rootPageTree.traverse((node, ref) => {
      visitations.push([node, ref]);
    });

    expect(visitations).toEqual([
      [leaf1, leafRef1],
      [leaf2, leafRef2],
      [leftPageTree, leftPageTreeRef],
      [leaf3, leafRef3],
      [leaf4, leafRef4],
      [rightPageTree, rightPageTreeRef],
      [leaf5, leafRef5],
    ]);
  });

  describe(`leaf node insertion`, () => {
    it(`can insert leaf nodes into the middle of the second layer of the page tree`, () => {
      const context = PDFContext.create();

      const pageTree1 = PDFPageTree.withContext(context);
      const pageTreeRef1 = context.register(pageTree1);

      const pageTree2 = PDFPageTree.withContext(context, pageTreeRef1);
      const pageTreeRef2 = context.register(pageTree2);

      const pageTree3 = PDFPageTree.withContext(context, pageTreeRef2);
      const pageTreeRef3 = context.register(pageTree3);

      const pageTree4 = PDFPageTree.withContext(context, pageTreeRef3);
      const pageTreeRef4 = context.register(pageTree4);

      const leaf1 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef1 = context.register(leaf1);

      const leaf2 = PDFPageLeaf.withContextAndParent(context, pageTreeRef2);
      const leafRef2 = context.register(leaf2);

      const leaf3 = PDFPageLeaf.withContextAndParent(context, pageTreeRef4);
      const leafRef3 = context.register(leaf3);

      const leaf4 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef4 = context.register(leaf4);

      pageTree1.pushLeafNode(leafRef1);
      pageTree1.pushTreeNode(pageTreeRef2);
      pageTree1.pushLeafNode(leafRef4);

      pageTree2.pushLeafNode(leafRef2);
      pageTree2.pushTreeNode(pageTreeRef3);

      pageTree3.pushTreeNode(pageTreeRef4);

      pageTree4.pushLeafNode(leafRef3);

      expect(pageTree1.Count().value()).toBe(4);
      expect(pageTree2.Count().value()).toBe(2);
      expect(pageTree3.Count().value()).toBe(1);
      expect(pageTree4.Count().value()).toBe(1);
      expect(pageTree2.Kids().get(1)).toBe(pageTreeRef3);

      const newLeaf = PDFPageLeaf.withContextAndParent(context, pageTreeRef2);
      const newLeafRef = context.register(newLeaf);
      const insertionRef = pageTree1.insertLeafNode(newLeafRef, 2);

      expect(pageTree1.Count().value()).toBe(5);
      expect(pageTree2.Count().value()).toBe(3);
      expect(pageTree3.Count().value()).toBe(1);
      expect(pageTree4.Count().value()).toBe(1);

      expect(insertionRef).toBe(pageTreeRef2);
      expect(pageTree2.Kids().get(1)).toBe(newLeafRef);
      expect(pageTree2.Kids().get(2)).toBe(pageTreeRef3);
    });

    it(`can insert leaf nodes towards the end of the second layer of the page tree`, () => {
      const context = PDFContext.create();

      const pageTree1 = PDFPageTree.withContext(context);
      const pageTreeRef1 = context.register(pageTree1);

      const pageTree2 = PDFPageTree.withContext(context, pageTreeRef1);
      const pageTreeRef2 = context.register(pageTree2);

      const pageTree3 = PDFPageTree.withContext(context, pageTreeRef2);
      const pageTreeRef3 = context.register(pageTree3);

      const leaf1 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef1 = context.register(leaf1);

      const leaf2 = PDFPageLeaf.withContextAndParent(context, pageTreeRef2);
      const leafRef2 = context.register(leaf2);

      const leaf3 = PDFPageLeaf.withContextAndParent(context, pageTreeRef3);
      const leafRef3 = context.register(leaf3);

      const leaf4 = PDFPageLeaf.withContextAndParent(context, pageTreeRef3);
      const leafRef4 = context.register(leaf4);

      const leaf5 = PDFPageLeaf.withContextAndParent(context, pageTreeRef2);
      const leafRef5 = context.register(leaf5);

      const leaf6 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef6 = context.register(leaf6);

      pageTree1.pushLeafNode(leafRef1);
      pageTree1.pushTreeNode(pageTreeRef2);
      pageTree1.pushLeafNode(leafRef6);

      pageTree2.pushLeafNode(leafRef2);
      pageTree2.pushTreeNode(pageTreeRef3);
      pageTree2.pushLeafNode(leafRef5);

      pageTree3.pushLeafNode(leafRef3);
      pageTree3.pushLeafNode(leafRef4);

      expect(pageTree1.Count().value()).toBe(6);
      expect(pageTree2.Count().value()).toBe(4);
      expect(pageTree3.Count().value()).toBe(2);
      expect(pageTree2.Kids().get(2)).toBe(leafRef5);

      const newLeaf = PDFPageLeaf.withContextAndParent(context, pageTreeRef2);
      const newLeafRef = context.register(newLeaf);
      const insertionRef = pageTree1.insertLeafNode(newLeafRef, 4);

      expect(pageTree1.Count().value()).toBe(7);
      expect(pageTree2.Count().value()).toBe(5);
      expect(pageTree3.Count().value()).toBe(2);

      expect(insertionRef).toBe(pageTreeRef2);
      expect(pageTree2.Kids().get(2)).toBe(newLeafRef);
      expect(pageTree2.Kids().get(3)).toBe(leafRef5);
    });

    it(`can insert leaf nodes at the end of the page tree`, () => {
      const context = PDFContext.create();

      const pageTree1 = PDFPageTree.withContext(context);
      const pageTreeRef1 = context.register(pageTree1);

      const leaf1 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef1 = context.register(leaf1);

      const leaf2 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef2 = context.register(leaf2);

      const leaf3 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef3 = context.register(leaf3);

      pageTree1.pushLeafNode(leafRef1);
      pageTree1.pushLeafNode(leafRef2);
      pageTree1.pushLeafNode(leafRef3);

      expect(pageTree1.Count().value()).toBe(3);
      expect(pageTree1.Kids().get(2)).toBe(leafRef3);
      expect(pageTree1.Kids().get(3)).toBe(undefined);

      const newLeaf = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const newLeafRef = context.register(newLeaf);
      const insertionRef = pageTree1.insertLeafNode(newLeafRef, 3);

      expect(pageTree1.Count().value()).toBe(4);

      expect(insertionRef).toBe(undefined);
      expect(pageTree1.Kids().get(2)).toBe(leafRef3);
      expect(pageTree1.Kids().get(3)).toBe(newLeafRef);
    });

    it(`returns the correct ref when inserting more than two levels deep`, () => {
      const context = PDFContext.create();

      const pageTree1 = PDFPageTree.withContext(context);
      const pageTreeRef1 = context.register(pageTree1);

      const pageTree2 = PDFPageTree.withContext(context, pageTreeRef1);
      const pageTreeRef2 = context.register(pageTree2);

      const pageTree3 = PDFPageTree.withContext(context, pageTreeRef2);
      const pageTreeRef3 = context.register(pageTree3);

      const leaf1 = PDFPageLeaf.withContextAndParent(context, pageTreeRef3);
      const leafRef1 = context.register(leaf1);

      const leaf2 = PDFPageLeaf.withContextAndParent(context, pageTreeRef3);
      const leafRef2 = context.register(leaf2);

      pageTree1.pushTreeNode(pageTreeRef2);
      pageTree2.pushTreeNode(pageTreeRef3);
      pageTree3.pushLeafNode(leafRef1);
      pageTree3.pushLeafNode(leafRef2);

      expect(pageTree1.Count().value()).toBe(2);
      expect(pageTree3.Kids().get(0)).toBe(leafRef1);
      expect(pageTree3.Kids().get(1)).toBe(leafRef2);

      const newLeaf = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const newLeafRef = context.register(newLeaf);
      const insertionRef = pageTree1.insertLeafNode(newLeafRef, 1);

      expect(pageTree1.Count().value()).toBe(3);

      expect(insertionRef).toBe(pageTreeRef3);
      expect(pageTree3.Kids().get(0)).toBe(leafRef1);
      expect(pageTree3.Kids().get(1)).toBe(newLeafRef);
      expect(pageTree3.Kids().get(2)).toBe(leafRef2);
    });

    it(`throws an error when inserting past the end of the tree`, () => {
      const context = PDFContext.create();

      const pageTree1 = PDFPageTree.withContext(context);
      const pageTreeRef1 = context.register(pageTree1);

      const leaf1 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef1 = context.register(leaf1);

      const leaf2 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef2 = context.register(leaf2);

      const leaf3 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef3 = context.register(leaf3);

      pageTree1.pushLeafNode(leafRef1);
      pageTree1.pushLeafNode(leafRef2);
      pageTree1.pushLeafNode(leafRef3);

      const newLeaf = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const newLeafRef = context.register(newLeaf);
      expect(() => pageTree1.insertLeafNode(newLeafRef, 4)).toThrow();
    });
  });

  describe(`leaf node removal`, () => {
    it(`can remove leaf nodes from the end of the second layer of the page tree`, () => {
      const context = PDFContext.create();

      const pageTree1 = PDFPageTree.withContext(context);
      const pageTreeRef1 = context.register(pageTree1);

      const pageTree2 = PDFPageTree.withContext(context, pageTreeRef1);
      const pageTreeRef2 = context.register(pageTree2);

      const pageTree3 = PDFPageTree.withContext(context, pageTreeRef2);
      const pageTreeRef3 = context.register(pageTree3);

      const leaf1 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef1 = context.register(leaf1);

      const leaf2 = PDFPageLeaf.withContextAndParent(context, pageTreeRef2);
      const leafRef2 = context.register(leaf2);

      const leaf3 = PDFPageLeaf.withContextAndParent(context, pageTreeRef3);
      const leafRef3 = context.register(leaf3);

      const leaf4 = PDFPageLeaf.withContextAndParent(context, pageTreeRef3);
      const leafRef4 = context.register(leaf4);

      const leaf5 = PDFPageLeaf.withContextAndParent(context, pageTreeRef2);
      const leafRef5 = context.register(leaf5);

      const leaf6 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef6 = context.register(leaf6);

      pageTree1.pushLeafNode(leafRef1);
      pageTree1.pushTreeNode(pageTreeRef2);
      pageTree1.pushLeafNode(leafRef6);

      pageTree2.pushLeafNode(leafRef2);
      pageTree2.pushTreeNode(pageTreeRef3);
      pageTree2.pushLeafNode(leafRef5);

      pageTree3.pushLeafNode(leafRef3);
      pageTree3.pushLeafNode(leafRef4);

      expect(pageTree1.Count().value()).toBe(6);
      expect(pageTree2.Count().value()).toBe(4);
      expect(pageTree3.Count().value()).toBe(2);
      expect(pageTree2.Kids().get(1)).toBe(pageTreeRef3);
      expect(pageTree2.Kids().get(2)).toBe(leafRef5);

      pageTree1.removeLeafNode(4);

      expect(pageTree1.Count().value()).toBe(5);
      expect(pageTree2.Count().value()).toBe(3);
      expect(pageTree3.Count().value()).toBe(2);

      expect(pageTree2.Kids().get(1)).toBe(pageTreeRef3);
      expect(pageTree2.Kids().get(2)).toBe(undefined);
    });

    it(`can remove leaf nodes from a parent node that is the last child of another node`, () => {
      const context = PDFContext.create();

      const pageTree1 = PDFPageTree.withContext(context);
      const pageTreeRef1 = context.register(pageTree1);

      const pageTree2 = PDFPageTree.withContext(context, pageTreeRef1);
      const pageTreeRef2 = context.register(pageTree2);

      const pageTree3 = PDFPageTree.withContext(context, pageTreeRef2);
      const pageTreeRef3 = context.register(pageTree3);

      const pageTree4 = PDFPageTree.withContext(context, pageTreeRef3);
      const pageTreeRef4 = context.register(pageTree4);

      const leaf1 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef1 = context.register(leaf1);

      const leaf2 = PDFPageLeaf.withContextAndParent(context, pageTreeRef2);
      const leafRef2 = context.register(leaf2);

      const leaf3 = PDFPageLeaf.withContextAndParent(context, pageTreeRef4);
      const leafRef3 = context.register(leaf3);

      const leaf4 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef4 = context.register(leaf4);

      pageTree1.pushLeafNode(leafRef1);
      pageTree1.pushTreeNode(pageTreeRef2);
      pageTree1.pushLeafNode(leafRef4);

      pageTree2.pushLeafNode(leafRef2);
      pageTree2.pushTreeNode(pageTreeRef3);

      pageTree3.pushTreeNode(pageTreeRef4);

      pageTree4.pushLeafNode(leafRef3);

      expect(pageTree1.Count().value()).toBe(4);
      expect(pageTree2.Count().value()).toBe(2);
      expect(pageTree3.Count().value()).toBe(1);
      expect(pageTree4.Count().value()).toBe(1);
      expect(pageTree2.Kids().get(1)).toBe(pageTreeRef3);
      expect(pageTree4.Kids().get(0)).toBe(leafRef3);

      pageTree1.removeLeafNode(2);

      expect(pageTree1.Count().value()).toBe(3);
      expect(pageTree2.Count().value()).toBe(1);
      expect(pageTree3.Count().value()).toBe(0);
      expect(pageTree4.Count().value()).toBe(0);

      expect(pageTree2.Kids().get(1)).toBe(pageTreeRef3);
      expect(pageTree4.Kids().get(0)).toBe(undefined);
    });

    it(`can remove leaf nodes from the end of the page tree`, () => {
      const context = PDFContext.create();

      const pageTree1 = PDFPageTree.withContext(context);
      const pageTreeRef1 = context.register(pageTree1);

      const leaf1 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef1 = context.register(leaf1);

      const leaf2 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef2 = context.register(leaf2);

      const leaf3 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef3 = context.register(leaf3);

      pageTree1.pushLeafNode(leafRef1);
      pageTree1.pushLeafNode(leafRef2);
      pageTree1.pushLeafNode(leafRef3);

      expect(pageTree1.Count().value()).toBe(3);
      expect(pageTree1.Kids().get(1)).toBe(leafRef2);
      expect(pageTree1.Kids().get(2)).toBe(leafRef3);

      pageTree1.removeLeafNode(2);

      expect(pageTree1.Count().value()).toBe(2);
      expect(pageTree1.Kids().get(1)).toBe(leafRef2);
      expect(pageTree1.Kids().get(2)).toBe(undefined);
    });

    it(`throws an error when removing past the end of the tree`, () => {
      const context = PDFContext.create();

      const pageTree1 = PDFPageTree.withContext(context);
      const pageTreeRef1 = context.register(pageTree1);

      const leaf1 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef1 = context.register(leaf1);

      const leaf2 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef2 = context.register(leaf2);

      const leaf3 = PDFPageLeaf.withContextAndParent(context, pageTreeRef1);
      const leafRef3 = context.register(leaf3);

      pageTree1.pushLeafNode(leafRef1);
      pageTree1.pushLeafNode(leafRef2);
      pageTree1.pushLeafNode(leafRef3);

      expect(() => pageTree1.removeLeafNode(3)).toThrow();
    });
  });
});
