import fs from 'fs';
import { TreeNode } from '../../../src/core/structures/PDFPageTree';
import {
  PDFArray,
  PDFContext,
  PDFName,
  PDFNumber,
  PDFPageLeaf,
  PDFPageTree,
  PDFRef,
  PDFDocument,
} from '../../../src/index';

const withNullEntryPdfBytes = fs.readFileSync(
  'assets/pdfs/with_null_parent_entry.pdf',
);

const pageUtils = () => {
  const context = PDFContext.create();

  const pageTree = (parent?: PDFRef): [PDFRef, PDFPageTree] => {
    const tree = PDFPageTree.withContext(context, parent);
    const ref = context.register(tree);
    return [ref, tree];
  };

  const pageLeaf = (parent: PDFRef): [PDFRef, PDFPageLeaf] => {
    const leaf = PDFPageLeaf.withContextAndParent(context, parent);
    const ref = context.register(leaf);
    return [ref, leaf];
  };

  return { context, pageTree, pageLeaf };
};

const pushTreeNodes = (tree: PDFPageTree, ...nodes: PDFRef[]) => {
  nodes.forEach((n) => tree.pushTreeNode(n));
};

const pushLeafNodes = (tree: PDFPageTree, ...nodes: PDFRef[]) => {
  nodes.forEach((n) => tree.pushLeafNode(n));
};

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
    expect(pageTree.lookup(PDFName.of('Count'), PDFNumber).asNumber()).toBe(0);
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
    const { pageTree } = pageUtils();

    const [lvl1Tree1Ref, lvl1Tree1] = pageTree();
    const [lvl2Tree1Ref, lvl2Tree1] = pageTree(lvl1Tree1Ref);
    const [, lvl3Tree1] = pageTree(lvl2Tree1Ref);

    const visitations: PDFPageTree[] = [];
    lvl3Tree1.ascend((node) => {
      visitations.push(node);
    });

    expect(visitations).toEqual([lvl3Tree1, lvl2Tree1, lvl1Tree1]);
  });

  it(`can perform a Post-Order traversal`, () => {
    const { pageTree, pageLeaf } = pageUtils();

    const [rootPageTreeRef, rootPageTree] = pageTree();
    const [leftPageTreeRef, leftPageTree] = pageTree(rootPageTreeRef);
    const [rightPageTreeRef, rightPageTree] = pageTree(rootPageTreeRef);

    const [leafRef1, leaf1] = pageLeaf(leftPageTreeRef);
    const [leafRef2, leaf2] = pageLeaf(leftPageTreeRef);
    const [leafRef3, leaf3] = pageLeaf(rootPageTreeRef);
    const [leafRef4, leaf4] = pageLeaf(rightPageTreeRef);
    const [leafRef5, leaf5] = pageLeaf(rootPageTreeRef);

    pushTreeNodes(rootPageTree, leftPageTreeRef);
    pushLeafNodes(leftPageTree, leafRef1);
    pushLeafNodes(leftPageTree, leafRef2);
    pushLeafNodes(rootPageTree, leafRef3);
    pushTreeNodes(rootPageTree, rightPageTreeRef);
    pushLeafNodes(rightPageTree, leafRef4);
    pushLeafNodes(rootPageTree, leafRef5);

    const visitations: [TreeNode, PDFRef][] = [];
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
    it(`can insert leaf nodes into the middle of the second layer of a page tree`, () => {
      const { context, pageTree, pageLeaf } = pageUtils();

      const [lvl1Tree1Ref, lvl1Tree1] = pageTree();
      const [lvl2Tree1Ref, lvl2Tree1] = pageTree(lvl1Tree1Ref);
      const [lvl3Tree1Ref, lvl3Tree1] = pageTree(lvl2Tree1Ref);
      const [lvl4Tree1Ref, lvl4Tree1] = pageTree(lvl3Tree1Ref);

      const [leafRef1] = pageLeaf(lvl1Tree1Ref);
      const [leafRef2] = pageLeaf(lvl2Tree1Ref);
      const [leafRef3] = pageLeaf(lvl4Tree1Ref);
      const [leafRef4] = pageLeaf(lvl1Tree1Ref);

      pushLeafNodes(lvl1Tree1, leafRef1);
      pushTreeNodes(lvl1Tree1, lvl2Tree1Ref);
      pushLeafNodes(lvl1Tree1, leafRef4);

      pushLeafNodes(lvl2Tree1, leafRef2);
      pushTreeNodes(lvl2Tree1, lvl3Tree1Ref);

      pushTreeNodes(lvl3Tree1, lvl4Tree1Ref);

      pushLeafNodes(lvl4Tree1, leafRef3);

      expect(lvl1Tree1.Count().asNumber()).toBe(4);
      expect(lvl2Tree1.Count().asNumber()).toBe(2);
      expect(lvl3Tree1.Count().asNumber()).toBe(1);
      expect(lvl4Tree1.Count().asNumber()).toBe(1);
      expect(lvl2Tree1.Kids().get(1)).toBe(lvl3Tree1Ref);

      const newLeaf = PDFPageLeaf.withContextAndParent(context, lvl2Tree1Ref);
      const newLeafRef = context.register(newLeaf);
      const insertionRef = lvl1Tree1.insertLeafNode(newLeafRef, 2);

      expect(lvl1Tree1.Count().asNumber()).toBe(5);
      expect(lvl2Tree1.Count().asNumber()).toBe(3);
      expect(lvl3Tree1.Count().asNumber()).toBe(1);
      expect(lvl4Tree1.Count().asNumber()).toBe(1);

      expect(insertionRef).toBe(lvl2Tree1Ref);
      expect(lvl2Tree1.Kids().get(1)).toBe(newLeafRef);
      expect(lvl2Tree1.Kids().get(2)).toBe(lvl3Tree1Ref);
    });

    it(`can insert leaf nodes towards the end of the second layer of a page tree`, () => {
      const { context, pageTree, pageLeaf } = pageUtils();

      const [lvl1Tree1Ref, lvl1Tree1] = pageTree();
      const [lvl2Tree1Ref, lvl2Tree1] = pageTree(lvl1Tree1Ref);
      const [lvl3Tree1Ref, lvl3Tree1] = pageTree(lvl2Tree1Ref);

      const [leafRef1] = pageLeaf(lvl1Tree1Ref);
      const [leafRef2] = pageLeaf(lvl2Tree1Ref);
      const [leafRef3] = pageLeaf(lvl3Tree1Ref);
      const [leafRef4] = pageLeaf(lvl3Tree1Ref);
      const [leafRef5] = pageLeaf(lvl2Tree1Ref);
      const [leafRef6] = pageLeaf(lvl1Tree1Ref);

      pushLeafNodes(lvl1Tree1, leafRef1);
      pushTreeNodes(lvl1Tree1, lvl2Tree1Ref);
      pushLeafNodes(lvl1Tree1, leafRef6);

      pushLeafNodes(lvl2Tree1, leafRef2);
      pushTreeNodes(lvl2Tree1, lvl3Tree1Ref);
      pushLeafNodes(lvl2Tree1, leafRef5);

      pushLeafNodes(lvl3Tree1, leafRef3, leafRef4);

      expect(lvl1Tree1.Count().asNumber()).toBe(6);
      expect(lvl2Tree1.Count().asNumber()).toBe(4);
      expect(lvl3Tree1.Count().asNumber()).toBe(2);
      expect(lvl2Tree1.Kids().get(2)).toBe(leafRef5);

      const newLeaf = PDFPageLeaf.withContextAndParent(context, lvl2Tree1Ref);
      const newLeafRef = context.register(newLeaf);
      const insertionRef = lvl1Tree1.insertLeafNode(newLeafRef, 4);

      expect(lvl1Tree1.Count().asNumber()).toBe(7);
      expect(lvl2Tree1.Count().asNumber()).toBe(5);
      expect(lvl3Tree1.Count().asNumber()).toBe(2);

      expect(insertionRef).toBe(lvl2Tree1Ref);
      expect(lvl2Tree1.Kids().get(2)).toBe(newLeafRef);
      expect(lvl2Tree1.Kids().get(3)).toBe(leafRef5);
    });

    it(`can insert leaf nodes at the end of a page tree`, () => {
      const { context, pageTree, pageLeaf } = pageUtils();

      const [lvl1Tree1Ref, lvl1Tree1] = pageTree();

      const [leafRef1] = pageLeaf(lvl1Tree1Ref);
      const [leafRef2] = pageLeaf(lvl1Tree1Ref);
      const [leafRef3] = pageLeaf(lvl1Tree1Ref);

      pushLeafNodes(lvl1Tree1, leafRef1, leafRef2, leafRef3);

      expect(lvl1Tree1.Count().asNumber()).toBe(3);
      expect(lvl1Tree1.Kids().get(2)).toBe(leafRef3);
      expect(lvl1Tree1.Kids().get(3)).toBe(undefined);

      const newLeaf = PDFPageLeaf.withContextAndParent(context, lvl1Tree1Ref);
      const newLeafRef = context.register(newLeaf);
      const insertionRef = lvl1Tree1.insertLeafNode(newLeafRef, 3);

      expect(lvl1Tree1.Count().asNumber()).toBe(4);

      expect(insertionRef).toBe(undefined);
      expect(lvl1Tree1.Kids().get(2)).toBe(leafRef3);
      expect(lvl1Tree1.Kids().get(3)).toBe(newLeafRef);
    });

    it(`returns the correct ref when inserting more than two levels deep`, () => {
      const { context, pageTree, pageLeaf } = pageUtils();

      const [lvl1Tree1Ref, lvl1Tree1] = pageTree();
      const [lvl2Tree1Ref, lvl2Tree1] = pageTree(lvl1Tree1Ref);
      const [lvl3Tree1Ref, lvl3Tree1] = pageTree(lvl2Tree1Ref);

      const [leafRef1] = pageLeaf(lvl3Tree1Ref);
      const [leafRef2] = pageLeaf(lvl3Tree1Ref);

      pushTreeNodes(lvl1Tree1, lvl2Tree1Ref);
      pushTreeNodes(lvl2Tree1, lvl3Tree1Ref);
      pushLeafNodes(lvl3Tree1, leafRef1, leafRef2);

      expect(lvl1Tree1.Count().asNumber()).toBe(2);
      expect(lvl3Tree1.Kids().get(0)).toBe(leafRef1);
      expect(lvl3Tree1.Kids().get(1)).toBe(leafRef2);

      const newLeaf = PDFPageLeaf.withContextAndParent(context, lvl1Tree1Ref);
      const newLeafRef = context.register(newLeaf);
      const insertionRef = lvl1Tree1.insertLeafNode(newLeafRef, 1);

      expect(lvl1Tree1.Count().asNumber()).toBe(3);

      expect(insertionRef).toBe(lvl3Tree1Ref);
      expect(lvl3Tree1.Kids().get(0)).toBe(leafRef1);
      expect(lvl3Tree1.Kids().get(1)).toBe(newLeafRef);
      expect(lvl3Tree1.Kids().get(2)).toBe(leafRef2);
    });

    it(`throws an error when inserting past the end of a tree`, () => {
      const { context, pageTree, pageLeaf } = pageUtils();

      const [lvl1Tree1Ref, lvl1Tree1] = pageTree();

      const [leafRef1] = pageLeaf(lvl1Tree1Ref);
      const [leafRef2] = pageLeaf(lvl1Tree1Ref);
      const [leafRef3] = pageLeaf(lvl1Tree1Ref);

      pushLeafNodes(lvl1Tree1, leafRef1, leafRef2, leafRef3);

      const newLeaf = PDFPageLeaf.withContextAndParent(context, lvl1Tree1Ref);
      const newLeafRef = context.register(newLeaf);
      expect(() => lvl1Tree1.insertLeafNode(newLeafRef, 4)).toThrow();
    });
  });

  describe(`leaf node removal`, () => {
    it(`can remove leaf nodes from the end of the second layer of a page tree`, () => {
      const { pageTree, pageLeaf } = pageUtils();

      const [lvl1Tree1Ref, lvl1Tree1] = pageTree();
      const [lvl2Tree1Ref, lvl2Tree1] = pageTree(lvl1Tree1Ref);
      const [lvl3Tree1Ref, lvl3Tree1] = pageTree(lvl2Tree1Ref);

      const [leafRef1] = pageLeaf(lvl1Tree1Ref);
      const [leafRef2] = pageLeaf(lvl2Tree1Ref);
      const [leafRef3] = pageLeaf(lvl3Tree1Ref);
      const [leafRef4] = pageLeaf(lvl3Tree1Ref);
      const [leafRef5] = pageLeaf(lvl2Tree1Ref);
      const [leafRef6] = pageLeaf(lvl1Tree1Ref);

      pushLeafNodes(lvl1Tree1, leafRef1);
      pushTreeNodes(lvl1Tree1, lvl2Tree1Ref);
      pushLeafNodes(lvl1Tree1, leafRef6);

      pushLeafNodes(lvl2Tree1, leafRef2);
      pushTreeNodes(lvl2Tree1, lvl3Tree1Ref);
      pushLeafNodes(lvl2Tree1, leafRef5);

      pushLeafNodes(lvl3Tree1, leafRef3, leafRef4);

      expect(lvl1Tree1.Count().asNumber()).toBe(6);
      expect(lvl2Tree1.Count().asNumber()).toBe(4);
      expect(lvl3Tree1.Count().asNumber()).toBe(2);
      expect(lvl2Tree1.Kids().get(1)).toBe(lvl3Tree1Ref);
      expect(lvl2Tree1.Kids().get(2)).toBe(leafRef5);

      lvl1Tree1.removeLeafNode(4);

      expect(lvl1Tree1.Count().asNumber()).toBe(5);
      expect(lvl2Tree1.Count().asNumber()).toBe(3);
      expect(lvl3Tree1.Count().asNumber()).toBe(2);

      expect(lvl2Tree1.Kids().get(1)).toBe(lvl3Tree1Ref);
      expect(lvl2Tree1.Kids().get(2)).toBe(undefined);
    });

    it(`can remove leaf nodes from a parent node that is the last child of another node`, () => {
      const { pageTree, pageLeaf } = pageUtils();

      const [lvl1Tree1Ref, lvl1Tree1] = pageTree();
      const [lvl2Tree1Ref, lvl2Tree1] = pageTree(lvl1Tree1Ref);
      const [lvl3Tree1Ref, lvl3Tree1] = pageTree(lvl2Tree1Ref);
      const [lvl4Tree1Ref, lvl4Tree1] = pageTree(lvl3Tree1Ref);

      const [leafRef1] = pageLeaf(lvl1Tree1Ref);
      const [] = pageLeaf(lvl2Tree1Ref);
      const [leafRef3] = pageLeaf(lvl4Tree1Ref);
      const [leafRef4] = pageLeaf(lvl1Tree1Ref);

      pushLeafNodes(lvl1Tree1, leafRef1);
      pushTreeNodes(lvl1Tree1, lvl2Tree1Ref);
      pushLeafNodes(lvl1Tree1, leafRef4);

      pushLeafNodes(lvl2Tree1, leafRef1);
      pushTreeNodes(lvl2Tree1, lvl3Tree1Ref);

      pushTreeNodes(lvl3Tree1, lvl4Tree1Ref);

      pushLeafNodes(lvl4Tree1, leafRef3);

      expect(lvl1Tree1.Count().asNumber()).toBe(4);
      expect(lvl2Tree1.Count().asNumber()).toBe(2);
      expect(lvl3Tree1.Count().asNumber()).toBe(1);
      expect(lvl4Tree1.Count().asNumber()).toBe(1);
      expect(lvl2Tree1.Kids().get(1)).toBe(lvl3Tree1Ref);
      expect(lvl4Tree1.Kids().get(0)).toBe(leafRef3);

      lvl1Tree1.removeLeafNode(2, false);

      expect(lvl1Tree1.Count().asNumber()).toBe(3);
      expect(lvl2Tree1.Count().asNumber()).toBe(1);
      expect(lvl3Tree1.Count().asNumber()).toBe(0);
      expect(lvl4Tree1.Count().asNumber()).toBe(0);

      expect(lvl2Tree1.Kids().get(1)).toBe(lvl3Tree1Ref);
      expect(lvl4Tree1.Kids().get(0)).toBe(undefined);
    });

    it(`can remove leaf nodes from the end of a page tree`, () => {
      const { pageTree, pageLeaf } = pageUtils();

      const [lvl1Tree1Ref, lvl1Tree1] = pageTree();

      const [leafRef1] = pageLeaf(lvl1Tree1Ref);
      const [leafRef2] = pageLeaf(lvl1Tree1Ref);
      const [leafRef3] = pageLeaf(lvl1Tree1Ref);
      pushLeafNodes(lvl1Tree1, leafRef1, leafRef2, leafRef3);

      expect(lvl1Tree1.Count().asNumber()).toBe(3);
      expect(lvl1Tree1.Kids().get(1)).toBe(leafRef2);
      expect(lvl1Tree1.Kids().get(2)).toBe(leafRef3);

      lvl1Tree1.removeLeafNode(2);

      expect(lvl1Tree1.Count().asNumber()).toBe(2);
      expect(lvl1Tree1.Kids().get(1)).toBe(leafRef2);
      expect(lvl1Tree1.Kids().get(2)).toBe(undefined);
    });

    it(`throws an error when removing past the end of a tree`, () => {
      const buildTree = () => {
        const { pageTree, pageLeaf } = pageUtils();

        const [lvl1Tree1Ref, lvl1Tree1] = pageTree();

        const [leafRef1] = pageLeaf(lvl1Tree1Ref);
        const [leafRef2] = pageLeaf(lvl1Tree1Ref);
        const [leafRef3] = pageLeaf(lvl1Tree1Ref);
        pushLeafNodes(lvl1Tree1, leafRef1, leafRef2, leafRef3);

        return lvl1Tree1;
      };

      expect(() => buildTree().removeLeafNode(0)).not.toThrow();
      expect(() => buildTree().removeLeafNode(1)).not.toThrow();
      expect(() => buildTree().removeLeafNode(2)).not.toThrow();

      expect(() => buildTree().removeLeafNode(3)).toThrow(
        'Invalid targetIndex specified: targetIndex=3 must be less than Count=3',
      );
      expect(() => buildTree().removeLeafNode(4)).toThrow(
        'Invalid targetIndex specified: targetIndex=4 must be less than Count=3',
      );
    });

    it(`does not throw an error when at the end of a hierarchical tree`, () => {
      const buildTree = () => {
        const { pageTree, pageLeaf } = pageUtils();

        const [lvl1Tree1Ref, lvl1Tree1] = pageTree();

        const [lvl2Tree1Ref, lvl2Tree1] = pageTree(lvl1Tree1Ref);
        const [lvl2Tree2Ref, lvl2Tree2] = pageTree(lvl1Tree1Ref);
        pushTreeNodes(lvl1Tree1, lvl2Tree1Ref, lvl2Tree2Ref);

        const [lvl3Tree1Ref, lvl3Tree1] = pageTree(lvl2Tree1Ref);
        const [lvl3Tree2Ref, lvl3Tree2] = pageTree(lvl2Tree1Ref);
        const [lvl3Tree3Ref, lvl3Tree3] = pageTree(lvl2Tree2Ref);
        const [lvl3Tree4Ref, lvl3Tree4] = pageTree(lvl2Tree2Ref);
        pushTreeNodes(lvl2Tree1, lvl3Tree1Ref, lvl3Tree2Ref);
        pushTreeNodes(lvl2Tree2, lvl3Tree3Ref, lvl3Tree4Ref);

        const [leafRef1] = pageLeaf(lvl3Tree1Ref);
        const [leafRef2] = pageLeaf(lvl3Tree1Ref);
        const [leafRef3] = pageLeaf(lvl3Tree2Ref);
        const [leafRef4] = pageLeaf(lvl3Tree2Ref);
        const [leafRef5] = pageLeaf(lvl3Tree3Ref);
        const [leafRef6] = pageLeaf(lvl3Tree3Ref);
        const [leafRef7] = pageLeaf(lvl3Tree4Ref);
        const [leafRef8] = pageLeaf(lvl3Tree4Ref);
        pushLeafNodes(lvl3Tree1, leafRef1, leafRef2);
        pushLeafNodes(lvl3Tree2, leafRef3, leafRef4);
        pushLeafNodes(lvl3Tree3, leafRef5, leafRef6);
        pushLeafNodes(lvl3Tree4, leafRef7, leafRef8);

        return lvl1Tree1;
      };

      expect(() => buildTree().removeLeafNode(0)).not.toThrow();
      expect(() => buildTree().removeLeafNode(1)).not.toThrow();
      expect(() => buildTree().removeLeafNode(2)).not.toThrow();
      expect(() => buildTree().removeLeafNode(3)).not.toThrow();
      expect(() => buildTree().removeLeafNode(4)).not.toThrow();
      expect(() => buildTree().removeLeafNode(5)).not.toThrow();
      expect(() => buildTree().removeLeafNode(6)).not.toThrow();
      expect(() => buildTree().removeLeafNode(7)).not.toThrow();

      expect(() => buildTree().removeLeafNode(8)).toThrow(
        'Invalid targetIndex specified: targetIndex=8 must be less than Count=8',
      );
      expect(() => buildTree().removeLeafNode(9)).toThrow(
        'Invalid targetIndex specified: targetIndex=9 must be less than Count=8',
      );
    });

    it(`throws an error when the page tree has no kids`, () => {
      const buildTree = () => {
        const { pageTree } = pageUtils();
        const [, lvl1Tree1] = pageTree();
        return lvl1Tree1;
      };

      expect(() => buildTree().removeLeafNode(0)).toThrow(
        'Invalid targetIndex specified: targetIndex=0 must be less than Count=0',
      );
      expect(() => buildTree().removeLeafNode(1)).toThrow(
        'Invalid targetIndex specified: targetIndex=1 must be less than Count=0',
      );
    });

    it(`throws an error when the page tree is invalid`, () => {
      const buildTree = () => {
        const { pageTree } = pageUtils();
        const [, lvl1Tree1] = pageTree();
        return lvl1Tree1;
      };

      const tree = buildTree();
      tree.set(PDFName.of('Count'), PDFNumber.of(21));

      expect(() => tree.removeLeafNode(0)).toThrow(
        `Failed to removeLeafNode at targetIndex=0 due to corrupt page tree: It is likely that one or more 'Count' entries are invalid`,
      );
      expect(() => tree.removeLeafNode(1)).toThrow(
        `Failed to removeLeafNode at targetIndex=1 due to corrupt page tree: It is likely that one or more 'Count' entries are invalid`,
      );
    });

    it(`removes tree nodes that have 0 children after a leaf node is removed`, () => {
      const { pageTree, pageLeaf } = pageUtils();

      const [tree1Ref, tree1] = pageTree();
      const [tree2Ref, tree2] = pageTree(tree1Ref);
      const [tree3Ref, tree3] = pageTree(tree1Ref);
      const [tree4Ref, tree4] = pageTree(tree1Ref);
      const [tree5Ref, tree5] = pageTree(tree3Ref);

      const [leafRef1] = pageLeaf(tree2Ref);
      const [leafRef2] = pageLeaf(tree4Ref);
      const [leafRef3] = pageLeaf(tree5Ref);
      const [leafRef4] = pageLeaf(tree5Ref);

      pushTreeNodes(tree1, tree2Ref, tree3Ref, tree4Ref);
      pushTreeNodes(tree3, tree5Ref);

      pushLeafNodes(tree2, leafRef1);
      pushLeafNodes(tree4, leafRef2);
      pushLeafNodes(tree5, leafRef3, leafRef4);

      expect(tree1.Kids().size()).toBe(3);
      expect(tree1.Kids().get(0)).toBe(tree2Ref);
      expect(tree1.Kids().get(1)).toBe(tree3Ref);
      expect(tree1.Kids().get(2)).toBe(tree4Ref);

      expect(tree3.Kids().size()).toBe(1);
      expect(tree3.Kids().get(0)).toBe(tree5Ref);

      tree1.removeLeafNode(1);

      expect(tree1.Kids().size()).toBe(3);
      expect(tree1.Kids().get(0)).toBe(tree2Ref);
      expect(tree1.Kids().get(1)).toBe(tree3Ref);
      expect(tree1.Kids().get(2)).toBe(tree4Ref);

      expect(tree3.Kids().size()).toBe(1);
      expect(tree3.Kids().get(0)).toBe(tree5Ref);

      tree1.removeLeafNode(1);

      expect(tree1.Kids().size()).toBe(2);
      expect(tree1.Kids().get(0)).toBe(tree2Ref);
      expect(tree1.Kids().get(1)).toBe(tree4Ref);
    });
  });

  it(`can be ascended when a "/Parent null" entry exists on a node`, async () => {
    const pdfDoc = await PDFDocument.load(withNullEntryPdfBytes);
    const pages = pdfDoc.getPages();
    const parent = pages[0].node.Parent();
    expect(parent).toBeInstanceOf(PDFPageTree);

    let ascentions = 0;
    const handleAscend = () => {
      ascentions += 1;
    };
    expect(() => parent?.ascend(handleAscend)).not.toThrow();
    expect(ascentions).toBe(1);
  });
});
