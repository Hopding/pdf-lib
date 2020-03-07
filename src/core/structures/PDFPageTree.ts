import PDFArray from 'src/core/objects/PDFArray';
import PDFDict, { DictMap } from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import PDFPageLeaf from 'src/core/structures/PDFPageLeaf';

export type TreeNode = PDFPageTree | PDFPageLeaf;

class PDFPageTree extends PDFDict {
  static withContext = (context: PDFContext, parent?: PDFRef) => {
    const dict = new Map();
    dict.set(PDFName.of('Type'), PDFName.of('Pages'));
    dict.set(PDFName.of('Kids'), context.obj([]));
    dict.set(PDFName.of('Count'), context.obj(0));
    if (parent) dict.set(PDFName.of('Parent'), parent);
    return new PDFPageTree(dict, context);
  };

  static fromMapWithContext = (map: DictMap, context: PDFContext) =>
    new PDFPageTree(map, context);

  Parent(): PDFPageTree | undefined {
    return this.lookup(PDFName.of('Parent')) as PDFPageTree | undefined;
  }

  Kids(): PDFArray {
    return this.lookup(PDFName.of('Kids'), PDFArray);
  }

  Count(): PDFNumber {
    return this.lookup(PDFName.of('Count'), PDFNumber);
  }

  pushTreeNode(treeRef: PDFRef): void {
    const Kids = this.Kids();
    Kids.push(treeRef);
  }

  pushLeafNode(leafRef: PDFRef): void {
    const Kids = this.Kids();
    Kids.push(leafRef);
    this.ascend((node) => {
      const Count = node.Count();
      node.set(PDFName.of('Count'), PDFNumber.of(Count.value() + 1));
    });
  }

  /**
   * Inserts the given ref as a leaf node of this page tree at the specified
   * index (zero-based). Also increments the `Count` of each page tree in the
   * hierarchy to accomodate the new page.
   *
   * Returns the ref of the PDFPageTree node into which `leafRef` was inserted,
   * or `undefined` if it was inserted into the root node (the PDFPageTree upon
   * which the method was first called).
   */
  insertLeafNode(leafRef: PDFRef, targetIndex: number): PDFRef | undefined {
    const Kids = this.Kids();
    const kidSize = Kids.size();

    let kidIdx = 0;
    let pageIdx = 0;
    while (pageIdx < targetIndex) {
      if (kidIdx >= kidSize) {
        throw new Error(`Index out of bounds: ${kidIdx}/${kidSize}`);
      }

      const kidRef = Kids.get(kidIdx++) as PDFRef;
      const kid = this.context.lookup(kidRef) as TreeNode;

      if (kid instanceof PDFPageTree) {
        const kidCount = kid.Count().value();
        if (pageIdx + kidCount > targetIndex) {
          return kid.insertLeafNode(leafRef, targetIndex - pageIdx) || kidRef;
        } else {
          pageIdx += kidCount;
        }
      } else {
        pageIdx += 1;
      }
    }

    Kids.insert(kidIdx, leafRef);
    this.ascend((node) => {
      const Count = node.Count();
      node.set(PDFName.of('Count'), PDFNumber.of(Count.value() + 1));
    });

    return undefined;
  }

  /**
   * Removes the leaf node at the specified index (zero-based) from this page
   * tree. Also decrements the `Count` of each page tree in the hierarchy to
   * account for the removed page.
   */
  removeLeafNode(targetIndex: number): void {
    const Kids = this.Kids();
    const kidSize = Kids.size();

    let kidIdx = 0;
    let pageIdx = 0;
    while (pageIdx < targetIndex) {
      if (kidIdx >= kidSize) {
        throw new Error(`Index out of bounds: ${kidIdx}/${kidSize - 1} (a)`);
      }

      const kidRef = Kids.get(kidIdx++) as PDFRef;
      const kid = this.context.lookup(kidRef) as TreeNode;

      if (kid instanceof PDFPageTree) {
        const kidCount = kid.Count().value();
        if (pageIdx + kidCount > targetIndex) {
          kid.removeLeafNode(targetIndex - pageIdx);
          return;
        } else {
          pageIdx += kidCount;
        }
      } else {
        pageIdx += 1;
      }
    }

    if (kidIdx >= kidSize) {
      throw new Error(`Index out of bounds: ${kidIdx}/${kidSize - 1} (b)`);
    }

    const target = Kids.lookup(kidIdx);
    if (target instanceof PDFPageTree) {
      target.removeLeafNode(0);
    } else {
      Kids.remove(kidIdx);
      this.ascend((node) => {
        const Count = node.Count();
        node.set(PDFName.of('Count'), PDFNumber.of(Count.value() - 1));
      });
    }
  }

  ascend(visitor: (node: PDFPageTree) => any): void {
    visitor(this);
    const Parent = this.Parent();
    if (Parent) Parent.ascend(visitor);
  }

  /** Performs a Post-Order traversal of this page tree */
  traverse(visitor: (node: TreeNode, ref: PDFRef) => any): void {
    const Kids = this.Kids();
    for (let idx = 0, len = Kids.size(); idx < len; idx++) {
      const kidRef = Kids.get(idx) as PDFRef;
      const kid = this.context.lookup(kidRef) as TreeNode;
      if (kid instanceof PDFPageTree) kid.traverse(visitor);
      visitor(kid, kidRef);
    }
  }
}

export default PDFPageTree;
