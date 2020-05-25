import PDFArray from 'src/core/objects/PDFArray';
import PDFDict, { DictMap } from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import PDFPageLeaf from 'src/core/structures/PDFPageLeaf';
import { InvalidTargetIndexError, CorruptPageTreeError } from 'src/core/errors';

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
    this.insertLeafKid(Kids.size(), leafRef);
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
    const Count = this.Count().asNumber();

    if (targetIndex > Count) {
      throw new InvalidTargetIndexError(targetIndex, Count);
    }

    let leafsRemainingUntilTarget = targetIndex;
    for (let idx = 0, len = Kids.size(); idx < len; idx++) {
      if (leafsRemainingUntilTarget === 0) {
        // Insert page and return
        this.insertLeafKid(idx, leafRef);
        return undefined;
      }

      const kidRef = Kids.get(idx) as PDFRef;
      const kid = this.context.lookup(kidRef);

      if (kid instanceof PDFPageTree) {
        if (kid.Count().asNumber() > leafsRemainingUntilTarget) {
          // Dig in
          return (
            kid.insertLeafNode(leafRef, leafsRemainingUntilTarget) || kidRef
          );
        } else {
          // Move on
          leafsRemainingUntilTarget -= kid.Count().asNumber();
        }
      }

      if (kid instanceof PDFPageLeaf) {
        // Move on
        leafsRemainingUntilTarget -= 1;
      }
    }

    if (leafsRemainingUntilTarget === 0) {
      // Insert page at the end and return
      this.insertLeafKid(Kids.size(), leafRef);
      return undefined;
    }

    // Should never get here if `targetIndex` is valid
    throw new CorruptPageTreeError(targetIndex, 'insertLeafNode');
  }

  /**
   * Removes the leaf node at the specified index (zero-based) from this page
   * tree. Also decrements the `Count` of each page tree in the hierarchy to
   * account for the removed page.
   *
   * If `prune` is true, then intermediate tree nodes will be removed from the
   * tree if they contain 0 children after the leaf node is removed.
   */
  removeLeafNode(targetIndex: number, prune = true): void {
    const Kids = this.Kids();
    const Count = this.Count().asNumber();

    if (targetIndex >= Count) {
      throw new InvalidTargetIndexError(targetIndex, Count);
    }

    let leafsRemainingUntilTarget = targetIndex;
    for (let idx = 0, len = Kids.size(); idx < len; idx++) {
      const kidRef = Kids.get(idx) as PDFRef;
      const kid = this.context.lookup(kidRef);

      if (kid instanceof PDFPageTree) {
        if (kid.Count().asNumber() > leafsRemainingUntilTarget) {
          // Dig in
          kid.removeLeafNode(leafsRemainingUntilTarget, prune);
          if (prune && kid.Kids().size() === 0) Kids.remove(idx);
          return;
        } else {
          // Move on
          leafsRemainingUntilTarget -= kid.Count().asNumber();
        }
      }

      if (kid instanceof PDFPageLeaf) {
        if (leafsRemainingUntilTarget === 0) {
          // Remove page and return
          this.removeKid(idx);
          return;
        } else {
          // Move on
          leafsRemainingUntilTarget -= 1;
        }
      }
    }

    // Should never get here if `targetIndex` is valid
    throw new CorruptPageTreeError(targetIndex, 'removeLeafNode');
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

  private insertLeafKid(kidIdx: number, leafRef: PDFRef): void {
    const Kids = this.Kids();

    this.ascend((node) => {
      const newCount = node.Count().asNumber() + 1;
      node.set(PDFName.of('Count'), PDFNumber.of(newCount));
    });

    Kids.insert(kidIdx, leafRef);
  }

  private removeKid(kidIdx: number): void {
    const Kids = this.Kids();

    const kid = Kids.lookup(kidIdx);
    if (kid instanceof PDFPageLeaf) {
      this.ascend((node) => {
        const newCount = node.Count().asNumber() - 1;
        node.set(PDFName.of('Count'), PDFNumber.of(newCount));
      });
    }

    Kids.remove(kidIdx);
  }
}

export default PDFPageTree;
